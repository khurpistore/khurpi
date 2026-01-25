from fastapi import FastAPI, APIRouter, HTTPException, Depends
from fastapi.responses import StreamingResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import math
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
from datetime import datetime, timezone, timedelta
import io
import csv
from passlib.context import CryptContext

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Shop Configuration - Default values (can be overridden from DB)
SHOP_CONFIG = {
    "name": "Khurpi Microgreens",
    "address": "E-312, ACE City, Noida Extension, 201306",
    "latitude": 28.5672,  # ACE City Noida Extension coordinates
    "longitude": 77.4538,
    "phone": "+91 98765 43210",
    "email": "hello@khurpi.com"
}

# Default Delivery Pricing (distance in km)
DEFAULT_DELIVERY_PRICING = [
    {"max_distance": 1, "fee": 0, "label": "Free Delivery"},
    {"max_distance": 5, "fee": 50, "label": "₹50 Delivery"},
    {"max_distance": 10, "fee": 100, "label": "₹100 Delivery"},
    {"max_distance": 999, "fee": 150, "label": "₹150 Delivery"}  # All other NOIDA locations
]

# Default Subscription Plans (Monthly billing)
DEFAULT_SUBSCRIPTION_PLANS = [
    {"id": "once_week", "name": "Once a Week", "frequency": "once_week", "deliveries_per_week": 1, "discount": 0, "trays_per_month": 4, "description": "Perfect for trying out"},
    {"id": "twice_week", "name": "Twice a Week", "frequency": "twice_week", "deliveries_per_week": 2, "discount": 10, "trays_per_month": 8, "description": "Most popular choice"},
    {"id": "four_days_week", "name": "4 Days a Week", "frequency": "four_days_week", "deliveries_per_week": 4, "discount": 50, "trays_per_month": 16, "description": "Best value - Maximum freshness"}
]

# Default Referral Program Settings
DEFAULT_REFERRAL_SETTINGS = {
    "is_active": True,
    "customer_commission_rate": 10,  # % commission customers earn
    "referee_discount_percent": 10,  # % discount for new users using referral code
    "max_referee_discount": 100,     # Max ₹ discount for referred user
    "min_order_amount": 0,           # Minimum order amount for referral to apply
    "first_order_only": True,        # Referral discount only on first order
    "allow_self_referral": False     # Prevent users from using their own code
}

async def get_referral_settings():
    """Get referral program settings from DB or return defaults"""
    settings = await db.settings.find_one({"type": "referral_settings"}, {"_id": 0})
    if settings and settings.get("data"):
        return {**DEFAULT_REFERRAL_SETTINGS, **settings["data"]}
    return DEFAULT_REFERRAL_SETTINGS

def calculate_distance(lat1, lon1, lat2, lon2):
    """Calculate distance between two coordinates using Haversine formula"""
    R = 6371  # Earth's radius in kilometers
    
    lat1_rad = math.radians(lat1)
    lat2_rad = math.radians(lat2)
    delta_lat = math.radians(lat2 - lat1)
    delta_lon = math.radians(lon2 - lon1)
    
    a = math.sin(delta_lat/2)**2 + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(delta_lon/2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
    
    return R * c

async def get_shop_config():
    """Get shop configuration from DB or return defaults"""
    config = await db.settings.find_one({"type": "shop_config"}, {"_id": 0})
    if config:
        return config.get("data", SHOP_CONFIG)
    return SHOP_CONFIG

async def get_delivery_pricing():
    """Get delivery pricing from DB or return defaults"""
    pricing = await db.settings.find_one({"type": "delivery_pricing"}, {"_id": 0})
    if pricing:
        return pricing.get("data", DEFAULT_DELIVERY_PRICING)
    return DEFAULT_DELIVERY_PRICING

async def get_subscription_plans():
    """Get subscription plans from DB or return defaults"""
    plans = await db.settings.find_one({"type": "subscription_plans"}, {"_id": 0})
    if plans:
        return plans.get("data", DEFAULT_SUBSCRIPTION_PLANS)
    return DEFAULT_SUBSCRIPTION_PLANS

async def calculate_delivery_fee(customer_lat, customer_lon):
    """Calculate delivery fee based on distance from shop"""
    shop = await get_shop_config()
    pricing = await get_delivery_pricing()
    
    distance = calculate_distance(
        shop["latitude"], shop["longitude"],
        customer_lat, customer_lon
    )
    
    for tier in sorted(pricing, key=lambda x: x["max_distance"]):
        if distance <= tier["max_distance"]:
            return {
                "distance": round(distance, 2),
                "fee": tier["fee"],
                "label": tier["label"]
            }
    
    # Default to highest tier
    return {
        "distance": round(distance, 2),
        "fee": pricing[-1]["fee"],
        "label": pricing[-1]["label"]
    }

class Address(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    user_id: str
    name: Optional[str] = None
    address_line: str
    address_line_1: Optional[str] = None
    address_line_2: Optional[str] = None
    area: Optional[str] = None
    city: Optional[str] = "NOIDA"
    pincode: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    is_default: bool = False
    created_at: str

class AddressCreate(BaseModel):
    name: Optional[str] = None
    address_line: str
    address_line_1: Optional[str] = None
    address_line_2: Optional[str] = None
    area: Optional[str] = None
    city: Optional[str] = "NOIDA"
    pincode: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    is_default: bool = False

class AddressUpdate(BaseModel):
    name: Optional[str] = None
    address_line: Optional[str] = None
    address_line_1: Optional[str] = None
    address_line_2: Optional[str] = None
    area: Optional[str] = None
    city: Optional[str] = "NOIDA"
    pincode: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    is_default: Optional[bool] = None

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    phone: str
    name: str
    address: Optional[str] = None
    role: str = "customer"
    created_at: str

class UserCreate(BaseModel):
    phone: str
    name: str
    password: str

class UserLogin(BaseModel):
    phone: str
    password: str

class Product(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    name: str
    image: str
    benefit: str
    nutrients: Optional[str] = None
    price: float
    growth_days: int
    stock: int = 100
    active: bool = True
    created_at: str

class ProductCreate(BaseModel):
    name: str
    image: str
    benefit: str
    nutrients: Optional[str] = None
    price: float
    growth_days: int
    stock: int = 100
    active: bool = True

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    image: Optional[str] = None
    benefit: Optional[str] = None
    nutrients: Optional[str] = None
    price: Optional[float] = None
    growth_days: Optional[int] = None
    stock: Optional[int] = None
    active: Optional[bool] = None

class SubscriptionItem(BaseModel):
    product_id: str
    quantity: int

class Subscription(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    user_id: str
    frequency: str
    delivery_day: str
    delivery_days: Optional[List[str]] = None  # Array of selected days
    start_date: str
    status: str = "active"
    tray_count: int
    subtotal: float = 0
    discount_percent: float = 0
    discount_amount: float = 0
    delivery_fee: float = 0
    coupon_code: Optional[str] = None
    coupon_discount: float = 0
    total_price: float
    address_id: Optional[str] = None
    payment_method: str = "cod"
    payment_status: str = "pending"
    next_delivery_date: Optional[str] = None
    skipped_deliveries: List[str] = []
    created_at: str

class SubscriptionCreate(BaseModel):
    frequency: str
    delivery_day: str
    delivery_days: Optional[List[str]] = None  # Array of selected days (e.g., ["Monday", "Wednesday"])
    start_date: str
    tray_count: int
    items: List[SubscriptionItem]
    total_price: float
    plan_id: Optional[str] = None
    address_id: Optional[str] = None
    coupon_code: Optional[str] = None
    coupon_discount: float = 0
    referral_code: Optional[str] = None
    payment_method: str = "cod"

class SubscriptionUpdate(BaseModel):
    status: Optional[str] = None
    frequency: Optional[str] = None
    delivery_day: Optional[str] = None
    delivery_days: Optional[List[str]] = None
    tray_count: Optional[int] = None
    next_delivery_date: Optional[str] = None

class UserUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    role: Optional[str] = None

class DeliveryUpdate(BaseModel):
    status: Optional[str] = None
    delivery_date: Optional[str] = None

class PaymentUpdate(BaseModel):
    status: Optional[str] = None

class SubscriptionItemsUpdate(BaseModel):
    items: List[SubscriptionItem]
    total_price: float

class Delivery(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    subscription_id: str
    delivery_date: str
    status: str = "scheduled"
    created_at: str

class Payment(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    subscription_id: str
    user_id: str
    amount: float
    status: str = "success"
    payment_date: str
    created_at: str

class PaymentCreate(BaseModel):
    subscription_id: str
    amount: float

class OrderItem(BaseModel):
    product_id: str
    quantity: int
    price: float

class Order(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    user_id: str
    address_id: str
    items: List[OrderItem]
    subtotal: float
    delivery_fee: float = 0
    delivery_distance: Optional[float] = None
    total: float
    status: str = "pending"
    order_type: str = "one_time"
    created_at: str

class OrderCreate(BaseModel):
    user_id: str
    address_id: str
    items: List[OrderItem]
    subtotal: float
    delivery_fee: float = 0
    total: float
    order_type: str = "one_time"

@api_router.post("/auth/signup", response_model=User)
async def signup(user_data: UserCreate):
    existing = await db.users.find_one({"phone": user_data.phone}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=400, detail="Phone already registered")
    
    from datetime import datetime
    import uuid
    
    hashed_password = pwd_context.hash(user_data.password)
    
    user_doc = {
        "id": str(uuid.uuid4()),
        "phone": user_data.phone,
        "name": user_data.name,
        "password": hashed_password,
        "address": None,
        "role": "customer",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.users.insert_one(user_doc)
    user_doc.pop("password")
    return User(**user_doc)

@api_router.post("/auth/login", response_model=User)
async def login(login_data: UserLogin):
    user = await db.users.find_one({"phone": login_data.phone}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if not pwd_context.verify(login_data.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    user.pop("password")
    return User(**user)

@api_router.post("/admin/login")
async def admin_login(username: str, password: str):
    if username == "admin" and password == "admin":
        return {"success": True, "role": "admin", "name": "Admin"}
    raise HTTPException(status_code=401, detail="Invalid admin credentials")

@api_router.get("/products", response_model=List[Product])
async def get_products(active_only: bool = True):
    query = {"active": True} if active_only else {}
    products = await db.products.find(query, {"_id": 0}).to_list(100)
    return products

@api_router.post("/products/check-availability")
async def check_product_availability(items: List[SubscriptionItem], start_date: str):
    from datetime import datetime
    
    earliest_date = datetime.now(timezone.utc).date()
    requested_date = datetime.fromisoformat(start_date).date()
    
    availability = []
    
    for item in items:
        product = await db.products.find_one({"id": item.product_id}, {"_id": 0})
        if not product:
            continue
        
        stock = product.get("stock", 0)
        is_available = stock >= item.quantity
        
        if not is_available:
            earliest_available = earliest_date + timedelta(days=product["growth_days"])
            availability.append({
                "product_id": item.product_id,
                "product_name": product["name"],
                "available": False,
                "current_stock": stock,
                "requested": item.quantity,
                "earliest_date": earliest_available.isoformat(),
                "grow_days": product["growth_days"]
            })
        else:
            availability.append({
                "product_id": item.product_id,
                "product_name": product["name"],
                "available": True,
                "current_stock": stock,
                "requested": item.quantity
            })
    
    return {"items": availability, "all_available": all(item["available"] for item in availability)}

@api_router.get("/products/{product_id}", response_model=Product)
async def get_product(product_id: str):
    product = await db.products.find_one({"id": product_id}, {"_id": 0})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return Product(**product)

@api_router.post("/products", response_model=Product)
async def create_product(product_data: ProductCreate):
    import uuid
    from datetime import datetime
    
    product_doc = {
        "id": str(uuid.uuid4()),
        **product_data.model_dump(),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.products.insert_one(product_doc)
    return Product(**product_doc)

@api_router.put("/products/{product_id}", response_model=Product)
async def update_product(product_id: str, product_data: ProductUpdate):
    update_data = {k: v for k, v in product_data.model_dump().items() if v is not None}
    
    if not update_data:
        raise HTTPException(status_code=400, detail="No data to update")
    
    result = await db.products.update_one({"id": product_id}, {"$set": update_data})
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    
    product = await db.products.find_one({"id": product_id}, {"_id": 0})
    return Product(**product)

@api_router.delete("/products/{product_id}")
async def delete_product(product_id: str):
    result = await db.products.delete_one({"id": product_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"success": True}

@api_router.post("/subscriptions", response_model=Subscription)
async def create_subscription(sub_data: SubscriptionCreate, user_id: str):
    import uuid
    from datetime import datetime
    
    # Get user
    user = await db.users.find_one({"id": user_id}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=400, detail="User not found")
    
    # Check for addresses in the addresses collection
    addresses = await db.addresses.find({"user_id": user_id}, {"_id": 0}).to_list(100)
    
    # Also check legacy user.address field
    has_address = len(addresses) > 0 or user.get("address")
    
    if not has_address:
        raise HTTPException(status_code=400, detail="Please add a delivery address in your profile first")
    
    # Get the selected address or default address
    selected_address = None
    if sub_data.address_id:
        selected_address = next((a for a in addresses if a.get("id") == sub_data.address_id), None)
    
    if not selected_address:
        # Fall back to default address or first address
        selected_address = next((a for a in addresses if a.get("is_default")), None)
        if not selected_address and addresses:
            selected_address = addresses[0]
    
    # Check NOIDA validation
    address_to_check = selected_address.get("address_line", "") if selected_address else user.get("address", "")
    if "NOIDA" not in address_to_check.upper():
        raise HTTPException(
            status_code=400, 
            detail="Sorry, we currently deliver only in NOIDA area. Please update your address."
        )
    
    # Calculate delivery fee based on address location
    delivery_fee = 0
    delivery_distance = 0
    if selected_address and selected_address.get("latitude") and selected_address.get("longitude"):
        delivery_info = await calculate_delivery_fee(selected_address["latitude"], selected_address["longitude"])
        delivery_fee = delivery_info["fee"]
        delivery_distance = delivery_info.get("distance", 0)
    
    # Get subscription plan discount
    plans = await get_subscription_plans()
    selected_plan = None
    if sub_data.plan_id:
        selected_plan = next((p for p in plans if p.get("id") == sub_data.plan_id), None)
    if not selected_plan:
        # Try to match by frequency
        selected_plan = next((p for p in plans if p.get("frequency") == sub_data.frequency), None)
    
    discount_percent = selected_plan.get("discount", 0) if selected_plan else 0
    
    # Calculate subtotal from products
    subtotal = 0
    for item in sub_data.items:
        product = await db.products.find_one({"id": item.product_id}, {"_id": 0})
        if product:
            subtotal += product["price"] * item.quantity
    
    # Calculate discount amount
    discount_amount = (subtotal * discount_percent) / 100
    
    # Calculate final total
    final_total = subtotal - discount_amount + delivery_fee
    
    # Check stock availability and calculate earliest delivery date for ALL products
    today = datetime.now(timezone.utc).date()
    requested_date = datetime.fromisoformat(sub_data.start_date).date()
    
    earliest_available_date = today
    out_of_stock_products = []
    low_stock_products = []
    
    for item in sub_data.items:
        product = await db.products.find_one({"id": item.product_id}, {"_id": 0})
        if not product:
            raise HTTPException(status_code=404, detail=f"Product not found")
        
        stock = product.get("stock", 0)
        
        # Check if out of stock
        if stock < item.quantity:
            grow_date = today + timedelta(days=product["growth_days"])
            # Track the latest date needed for any out-of-stock product
            if grow_date > earliest_available_date:
                earliest_available_date = grow_date
            
            out_of_stock_products.append({
                "name": product["name"],
                "requested": item.quantity,
                "available": stock,
                "needed": item.quantity - stock,
                "grow_days": product["growth_days"],
                "available_date": grow_date.isoformat()
            })
        elif stock < 10:
            low_stock_products.append({
                "name": product["name"],
                "stock": stock
            })
    
    # If any products are out of stock, enforce earliest available date
    if out_of_stock_products:
        if requested_date < earliest_available_date:
            # Build detailed error message
            products_list = ", ".join([f"{p['name']} (needs {p['grow_days']} days)" for p in out_of_stock_products])
            raise HTTPException(
                status_code=400,
                detail=f"Some products are out of stock: {products_list}. Earliest delivery date for all products: {earliest_available_date.isoformat()}. Please select a start date on or after this date."
            )
    
    # Apply coupon discount
    coupon_discount = sub_data.coupon_discount or 0
    
    # Calculate final total including coupon
    final_total = subtotal - discount_amount + delivery_fee - coupon_discount
    final_total = max(0, final_total)  # Ensure non-negative
    
    # Update coupon usage if coupon was applied
    if sub_data.coupon_code:
        await db.coupons.update_one(
            {"code": sub_data.coupon_code.upper()},
            {"$inc": {"times_used": 1}}
        )
    
    subscription_doc = {
        "id": str(uuid.uuid4()),
        "user_id": user_id,
        "frequency": sub_data.frequency,
        "delivery_day": sub_data.delivery_day,
        "delivery_days": sub_data.delivery_days or [sub_data.delivery_day],  # Store array of selected days
        "start_date": sub_data.start_date,
        "status": "active",
        "tray_count": sub_data.tray_count,
        "subtotal": subtotal,
        "discount_percent": discount_percent,
        "discount_amount": discount_amount,
        "delivery_fee": delivery_fee,
        "coupon_code": sub_data.coupon_code,
        "coupon_discount": coupon_discount,
        "total_price": final_total,
        "address_id": selected_address.get("id") if selected_address else None,
        "payment_method": sub_data.payment_method,
        "payment_status": "pending" if sub_data.payment_method == "cod" else "paid",
        "next_delivery_date": sub_data.start_date,
        "skipped_deliveries": [],
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.subscriptions.insert_one(subscription_doc)
    
    # Deduct stock and create subscription items
    for item in sub_data.items:
        item_doc = {
            "id": str(uuid.uuid4()),
            "subscription_id": subscription_doc["id"],
            "product_id": item.product_id,
            "quantity": item.quantity,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.subscription_items.insert_one(item_doc)
        
        # Deduct stock
        await db.products.update_one(
            {"id": item.product_id},
            {"$inc": {"stock": -item.quantity}}
        )
    
    payment_doc = {
        "id": str(uuid.uuid4()),
        "subscription_id": subscription_doc["id"],
        "user_id": user_id,
        "amount": final_total,
        "status": "success",
        "payment_date": datetime.now(timezone.utc).isoformat(),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.payments.insert_one(payment_doc)
    
    delivery_doc = {
        "id": str(uuid.uuid4()),
        "subscription_id": subscription_doc["id"],
        "delivery_date": sub_data.start_date,
        "status": "scheduled",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.deliveries.insert_one(delivery_doc)
    
    return Subscription(**subscription_doc)

@api_router.get("/subscriptions", response_model=List[Subscription])
async def get_subscriptions(user_id: Optional[str] = None):
    query = {"user_id": user_id} if user_id else {}
    subscriptions = await db.subscriptions.find(query, {"_id": 0}).to_list(100)
    return subscriptions

@api_router.get("/subscriptions/{subscription_id}", response_model=Subscription)
async def get_subscription(subscription_id: str):
    subscription = await db.subscriptions.find_one({"id": subscription_id}, {"_id": 0})
    if not subscription:
        raise HTTPException(status_code=404, detail="Subscription not found")
    return Subscription(**subscription)

@api_router.put("/subscriptions/{subscription_id}", response_model=Subscription)
async def update_subscription(subscription_id: str, sub_data: SubscriptionUpdate):
    subscription = await db.subscriptions.find_one({"id": subscription_id}, {"_id": 0})
    if not subscription:
        raise HTTPException(status_code=404, detail="Subscription not found")
    
    if sub_data.status == "paused" and subscription.get("next_delivery_date"):
        delivery_date = datetime.fromisoformat(subscription["next_delivery_date"]).replace(tzinfo=timezone.utc)
        cutoff_time = delivery_date - timedelta(hours=24)
        if datetime.now(timezone.utc) >= cutoff_time:
            raise HTTPException(status_code=400, detail="Cannot pause within 24 hours of next delivery")
    
    update_data = {k: v for k, v in sub_data.model_dump().items() if v is not None}
    
    if not update_data:
        raise HTTPException(status_code=400, detail="No data to update")
    
    result = await db.subscriptions.update_one({"id": subscription_id}, {"$set": update_data})
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Subscription not found")
    
    subscription = await db.subscriptions.find_one({"id": subscription_id}, {"_id": 0})
    return Subscription(**subscription)

@api_router.post("/subscriptions/{subscription_id}/skip")
async def skip_next_delivery(subscription_id: str):
    import uuid
    subscription = await db.subscriptions.find_one({"id": subscription_id}, {"_id": 0})
    if not subscription:
        raise HTTPException(status_code=404, detail="Subscription not found")
    
    if not subscription.get("next_delivery_date"):
        raise HTTPException(status_code=400, detail="No upcoming delivery to skip")
    
    delivery_date = datetime.fromisoformat(subscription["next_delivery_date"]).replace(tzinfo=timezone.utc)
    cutoff_time = delivery_date - timedelta(hours=24)
    
    if datetime.now(timezone.utc) >= cutoff_time:
        raise HTTPException(status_code=400, detail="Cannot skip within 24 hours of delivery")
    
    skipped_deliveries = subscription.get("skipped_deliveries", [])
    skipped_deliveries.append(subscription["next_delivery_date"])
    
    await db.deliveries.update_one(
        {"subscription_id": subscription_id, "delivery_date": subscription["next_delivery_date"]},
        {"$set": {"status": "skipped"}}
    )
    
    next_date = calculate_next_delivery(subscription["next_delivery_date"], subscription["frequency"])
    
    await db.subscriptions.update_one(
        {"id": subscription_id},
        {"$set": {"skipped_deliveries": skipped_deliveries, "next_delivery_date": next_date}}
    )
    
    new_delivery = {
        "id": str(uuid.uuid4()),
        "subscription_id": subscription_id,
        "delivery_date": next_date,
        "status": "scheduled",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.deliveries.insert_one(new_delivery)
    
    return {"success": True, "next_delivery_date": next_date}

@api_router.put("/subscriptions/{subscription_id}/items")
async def update_subscription_items(subscription_id: str, update_data: SubscriptionItemsUpdate):
    subscription = await db.subscriptions.find_one({"id": subscription_id}, {"_id": 0})
    if not subscription:
        raise HTTPException(status_code=404, detail="Subscription not found")
    
    await db.subscription_items.delete_many({"subscription_id": subscription_id})
    
    import uuid
    for item in update_data.items:
        item_doc = {
            "id": str(uuid.uuid4()),
            "subscription_id": subscription_id,
            "product_id": item.product_id,
            "quantity": item.quantity,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.subscription_items.insert_one(item_doc)
    
    await db.subscriptions.update_one(
        {"id": subscription_id},
        {"$set": {"total_price": update_data.total_price, "tray_count": sum(i.quantity for i in update_data.items)}}
    )
    
    return {"success": True}

def calculate_next_delivery(current_date: str, frequency: str) -> str:
    current = datetime.fromisoformat(current_date).replace(tzinfo=timezone.utc)
    
    if frequency == "weekly":
        next_date = current + timedelta(days=7)
    elif frequency == "bi-weekly":
        next_date = current + timedelta(days=14)
    elif frequency == "monthly":
        next_date = current + timedelta(days=30)
    else:
        next_date = current + timedelta(days=7)
    
    return next_date.date().isoformat()

@api_router.get("/subscriptions/{subscription_id}/items")
async def get_subscription_items(subscription_id: str):
    items = await db.subscription_items.find({"subscription_id": subscription_id}, {"_id": 0}).to_list(100)
    
    result = []
    for item in items:
        product = await db.products.find_one({"id": item["product_id"]}, {"_id": 0})
        if product:
            result.append({
                **item,
                "product": product
            })
    
    return result

@api_router.get("/deliveries")
async def get_deliveries(subscription_id: Optional[str] = None, user_id: Optional[str] = None):
    if subscription_id:
        deliveries = await db.deliveries.find({"subscription_id": subscription_id}, {"_id": 0}).to_list(100)
    elif user_id:
        subscriptions = await db.subscriptions.find({"user_id": user_id}, {"_id": 0}).to_list(100)
        sub_ids = [s["id"] for s in subscriptions]
        deliveries = await db.deliveries.find({"subscription_id": {"$in": sub_ids}}, {"_id": 0}).to_list(100)
    else:
        deliveries = await db.deliveries.find({}, {"_id": 0}).to_list(100)
    
    return deliveries

@api_router.get("/payments")
async def get_payments(user_id: Optional[str] = None, subscription_id: Optional[str] = None):
    query = {}
    if user_id:
        query["user_id"] = user_id
    if subscription_id:
        query["subscription_id"] = subscription_id
    
    payments = await db.payments.find(query, {"_id": 0}).to_list(100)
    return payments

@api_router.get("/admin/dashboard")
async def get_admin_dashboard():
    total_subscriptions = await db.subscriptions.count_documents({})
    active_subscriptions = await db.subscriptions.count_documents({"status": "active"})
    
    today = datetime.now(timezone.utc).date().isoformat()
    today_deliveries = await db.deliveries.count_documents({"delivery_date": today, "status": "scheduled"})
    
    payments = await db.payments.find({"status": "success"}, {"_id": 0}).to_list(1000)
    total_revenue = sum(p["amount"] for p in payments)
    
    return {
        "total_subscriptions": total_subscriptions,
        "active_subscriptions": active_subscriptions,
        "today_deliveries": today_deliveries,
        "total_revenue": total_revenue
    }

@api_router.get("/admin/subscriptions")
async def get_all_subscriptions_admin():
    subscriptions = await db.subscriptions.find({}, {"_id": 0}).to_list(1000)
    
    result = []
    for sub in subscriptions:
        user = await db.users.find_one({"id": sub["user_id"]}, {"_id": 0})
        items = await db.subscription_items.find({"subscription_id": sub["id"]}, {"_id": 0}).to_list(100)
        
        result.append({
            **sub,
            "user": user,
            "items_count": len(items)
        })
    
    return result

@api_router.get("/admin/deliveries/today")
async def get_today_deliveries():
    today = datetime.now(timezone.utc).date().isoformat()
    deliveries = await db.deliveries.find({"delivery_date": today}, {"_id": 0}).to_list(100)
    
    result = []
    for delivery in deliveries:
        subscription = await db.subscriptions.find_one({"id": delivery["subscription_id"]}, {"_id": 0})
        if subscription:
            user = await db.users.find_one({"id": subscription["user_id"]}, {"_id": 0})
            items = await db.subscription_items.find({"subscription_id": subscription["id"]}, {"_id": 0}).to_list(100)
            
            product_details = []
            for item in items:
                product = await db.products.find_one({"id": item["product_id"]}, {"_id": 0})
                if product:
                    product_details.append({
                        "name": product["name"],
                        "quantity": item["quantity"]
                    })
            
            result.append({
                **delivery,
                "subscription": subscription,
                "user": user,
                "products": product_details
            })
    
    return result

@api_router.get("/admin/deliveries/export")
async def export_deliveries():
    today = datetime.now(timezone.utc).date().isoformat()
    deliveries = await db.deliveries.find({"delivery_date": today}, {"_id": 0}).to_list(100)
    
    csv_data = []
    csv_data.append(["Delivery ID", "Customer Name", "Phone", "Address", "Products", "Status"])
    
    for delivery in deliveries:
        subscription = await db.subscriptions.find_one({"id": delivery["subscription_id"]}, {"_id": 0})
        if subscription:
            user = await db.users.find_one({"id": subscription["user_id"]}, {"_id": 0})
            items = await db.subscription_items.find({"subscription_id": subscription["id"]}, {"_id": 0}).to_list(100)
            
            products_str = ""
            for item in items:
                product = await db.products.find_one({"id": item["product_id"]}, {"_id": 0})
                if product:
                    products_str += f"{product['name']} x{item['quantity']}, "
            
            csv_data.append([
                delivery["id"],
                user.get("name", "N/A") if user else "N/A",
                user.get("phone", "N/A") if user else "N/A",
                user.get("address", "N/A") if user else "N/A",
                products_str.rstrip(", "),
                delivery["status"]
            ])
    
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerows(csv_data)
    output.seek(0)
    
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=deliveries_{today}.csv"}
    )

@api_router.get("/admin/inventory")
async def get_inventory_planning():
    active_subscriptions = await db.subscriptions.find({"status": "active"}, {"_id": 0}).to_list(1000)
    
    product_demand = {}
    
    for sub in active_subscriptions:
        items = await db.subscription_items.find({"subscription_id": sub["id"]}, {"_id": 0}).to_list(100)
        
        for item in items:
            product = await db.products.find_one({"id": item["product_id"]}, {"_id": 0})
            if product:
                product_name = product["name"]
                if product_name not in product_demand:
                    product_demand[product_name] = {
                        "product_id": product["id"],
                        "name": product_name,
                        "growth_days": product["growth_days"],
                        "weekly_demand": 0,
                        "bi_weekly_demand": 0,
                        "monthly_demand": 0,
                        "total_trays": 0
                    }
                
                quantity = item["quantity"]
                if sub["frequency"] == "weekly":
                    product_demand[product_name]["weekly_demand"] += quantity
                elif sub["frequency"] == "bi-weekly":
                    product_demand[product_name]["bi_weekly_demand"] += quantity
                elif sub["frequency"] == "monthly":
                    product_demand[product_name]["monthly_demand"] += quantity
                
                product_demand[product_name]["total_trays"] += quantity
    
    return list(product_demand.values())

# Orders API (for single purchases)
@api_router.post("/orders", response_model=Order)
async def create_order(order_data: OrderCreate):
    import uuid
    
    # Verify user exists
    user = await db.users.find_one({"id": order_data.user_id}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Verify address exists
    address = await db.addresses.find_one({"id": order_data.address_id, "user_id": order_data.user_id}, {"_id": 0})
    if not address:
        raise HTTPException(status_code=404, detail="Address not found")
    
    # Calculate delivery fee based on address location
    delivery_info = {"fee": 0, "distance": 0}
    if address.get("latitude") and address.get("longitude"):
        delivery_info = await calculate_delivery_fee(address["latitude"], address["longitude"])
    
    # Create order
    order_doc = {
        "id": str(uuid.uuid4()),
        "user_id": order_data.user_id,
        "address_id": order_data.address_id,
        "items": [item.model_dump() for item in order_data.items],
        "subtotal": order_data.subtotal,
        "delivery_fee": delivery_info["fee"],
        "delivery_distance": delivery_info.get("distance", 0),
        "total": order_data.subtotal + delivery_info["fee"],
        "status": "confirmed",  # Auto-confirm for COD
        "order_type": order_data.order_type,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.orders.insert_one(order_doc)
    
    # Create a payment record (mocked as COD)
    payment_doc = {
        "id": str(uuid.uuid4()),
        "subscription_id": order_doc["id"],  # Using order_id as reference
        "user_id": order_data.user_id,
        "amount": order_doc["total"],
        "status": "pending",  # COD - pending until delivery
        "payment_date": datetime.now(timezone.utc).isoformat(),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.payments.insert_one(payment_doc)
    
    return Order(**order_doc)

@api_router.get("/orders")
async def get_user_orders(user_id: str):
    orders = await db.orders.find({"user_id": user_id}, {"_id": 0}).sort("created_at", -1).to_list(100)
    
    # Enrich with product details
    for order in orders:
        enriched_items = []
        for item in order.get("items", []):
            product = await db.products.find_one({"id": item["product_id"]}, {"_id": 0})
            enriched_items.append({
                **item,
                "product": product
            })
        order["items"] = enriched_items
        
        # Get address
        address = await db.addresses.find_one({"id": order.get("address_id")}, {"_id": 0})
        order["address"] = address
    
    return orders

@api_router.get("/orders/{order_id}")
async def get_order(order_id: str):
    order = await db.orders.find_one({"id": order_id}, {"_id": 0})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    # Enrich with product details
    enriched_items = []
    for item in order.get("items", []):
        product = await db.products.find_one({"id": item["product_id"]}, {"_id": 0})
        enriched_items.append({
            **item,
            "product": product
        })
    order["items"] = enriched_items
    
    # Get address
    address = await db.addresses.find_one({"id": order.get("address_id")}, {"_id": 0})
    order["address"] = address
    
    return order

# Settings & Configuration APIs
@api_router.get("/settings/shop")
async def get_shop_settings():
    """Get shop configuration"""
    config = await get_shop_config()
    return config

@api_router.get("/settings/delivery-pricing")
async def get_delivery_pricing_settings():
    """Get delivery pricing tiers"""
    pricing = await get_delivery_pricing()
    return pricing

@api_router.get("/settings/subscription-plans")
async def get_subscription_plans_settings():
    """Get subscription plans with discounts"""
    plans = await get_subscription_plans()
    return plans

@api_router.post("/settings/calculate-delivery-fee")
async def calculate_delivery_fee_api(lat: float, lon: float):
    """Calculate delivery fee for a given location"""
    result = await calculate_delivery_fee(lat, lon)
    return result

# Admin Settings Management
@api_router.put("/admin/settings/shop")
async def update_shop_settings(data: dict):
    """Update shop configuration"""
    await db.settings.update_one(
        {"type": "shop_config"},
        {"$set": {"type": "shop_config", "data": data}},
        upsert=True
    )
    return {"success": True, "data": data}

@api_router.put("/admin/settings/delivery-pricing")
async def update_delivery_pricing(data: List[dict]):
    """Update delivery pricing tiers"""
    # Validate data
    for tier in data:
        if "max_distance" not in tier or "fee" not in tier or "label" not in tier:
            raise HTTPException(status_code=400, detail="Each tier must have max_distance, fee, and label")
    
    await db.settings.update_one(
        {"type": "delivery_pricing"},
        {"$set": {"type": "delivery_pricing", "data": data}},
        upsert=True
    )
    return {"success": True, "data": data}

@api_router.put("/admin/settings/subscription-plans")
async def update_subscription_plans(data: List[dict]):
    """Update subscription plans"""
    # Validate data
    for plan in data:
        required_fields = ["id", "name", "frequency", "deliveries_per_week", "discount"]
        for field in required_fields:
            if field not in plan:
                raise HTTPException(status_code=400, detail=f"Each plan must have {field}")
    
    await db.settings.update_one(
        {"type": "subscription_plans"},
        {"$set": {"type": "subscription_plans", "data": data}},
        upsert=True
    )
    return {"success": True, "data": data}

# Page Content Management (Privacy Policy, Terms of Service)
@api_router.get("/settings/pages/{page_slug}")
async def get_page_content(page_slug: str):
    """Get page content by slug (privacy-policy, terms-of-service)"""
    page = await db.pages.find_one({"slug": page_slug}, {"_id": 0})
    if page:
        return page
    return {"slug": page_slug, "content": "", "last_updated": None}

@api_router.put("/admin/settings/pages/{page_slug}")
async def update_page_content(page_slug: str, data: dict):
    """Update page content (admin only)"""
    await db.pages.update_one(
        {"slug": page_slug},
        {"$set": {
            "slug": page_slug,
            "content": data.get("content", ""),
            "last_updated": datetime.now(timezone.utc).isoformat()
        }},
        upsert=True
    )
    return {"success": True, "slug": page_slug}

@api_router.get("/admin/settings/pages")
async def get_all_pages():
    """Get all page contents for admin"""
    pages = await db.pages.find({}, {"_id": 0}).to_list(100)
    return pages

@api_router.get("/admin/settings/all")
async def get_all_admin_settings():
    """Get all settings for admin panel"""
    shop = await get_shop_config()
    delivery = await get_delivery_pricing()
    plans = await get_subscription_plans()
    pages = await db.pages.find({}, {"_id": 0}).to_list(100)
    
    return {
        "shop_config": shop,
        "delivery_pricing": delivery,
        "subscription_plans": plans,
        "pages": pages
    }

@api_router.put("/users/{user_id}/address")
async def update_user_address(user_id: str, address: str):
    result = await db.users.update_one({"id": user_id}, {"$set": {"address": address}})
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    
    user = await db.users.find_one({"id": user_id}, {"_id": 0})
    user.pop("password", None)
    return User(**user)

# Multiple Address Management APIs
@api_router.get("/users/{user_id}/addresses", response_model=List[Address])
async def get_user_addresses(user_id: str):
    addresses = await db.addresses.find({"user_id": user_id}, {"_id": 0}).to_list(100)
    return addresses

@api_router.post("/users/{user_id}/addresses", response_model=Address)
async def add_user_address(user_id: str, address_data: AddressCreate):
    import uuid
    
    # Validate NOIDA
    if "NOIDA" not in address_data.address_line.upper():
        raise HTTPException(status_code=400, detail="We currently deliver only in NOIDA area")
    
    # If this is the first address or marked as default, update other addresses
    if address_data.is_default:
        await db.addresses.update_many(
            {"user_id": user_id},
            {"$set": {"is_default": False}}
        )
    
    # Check if this is the first address
    existing_count = await db.addresses.count_documents({"user_id": user_id})
    
    address_doc = {
        "id": str(uuid.uuid4()),
        "user_id": user_id,
        "name": address_data.name,
        "address_line": address_data.address_line,
        "address_line_1": address_data.address_line_1,
        "address_line_2": address_data.address_line_2,
        "area": address_data.area,
        "city": address_data.city or "NOIDA",
        "pincode": address_data.pincode,
        "latitude": address_data.latitude,
        "longitude": address_data.longitude,
        "is_default": address_data.is_default or existing_count == 0,  # First address is always default
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.addresses.insert_one(address_doc)
    
    # Also update the user's main address field if this is default
    if address_doc["is_default"]:
        await db.users.update_one({"id": user_id}, {"$set": {"address": address_data.address_line}})
    
    return Address(**address_doc)

@api_router.put("/users/{user_id}/addresses/{address_id}", response_model=Address)
async def update_user_address_by_id(user_id: str, address_id: str, address_data: AddressUpdate):
    address = await db.addresses.find_one({"id": address_id, "user_id": user_id}, {"_id": 0})
    if not address:
        raise HTTPException(status_code=404, detail="Address not found")
    
    update_data = {k: v for k, v in address_data.model_dump().items() if v is not None}
    
    if not update_data:
        raise HTTPException(status_code=400, detail="No data to update")
    
    # Validate NOIDA if address_line is being updated
    if "address_line" in update_data and "NOIDA" not in update_data["address_line"].upper():
        raise HTTPException(status_code=400, detail="We currently deliver only in NOIDA area")
    
    # If setting as default, unset others
    if update_data.get("is_default"):
        await db.addresses.update_many(
            {"user_id": user_id, "id": {"$ne": address_id}},
            {"$set": {"is_default": False}}
        )
    
    await db.addresses.update_one({"id": address_id}, {"$set": update_data})
    
    updated_address = await db.addresses.find_one({"id": address_id}, {"_id": 0})
    
    # Update user's main address if this is default
    if updated_address.get("is_default"):
        await db.users.update_one({"id": user_id}, {"$set": {"address": updated_address["address_line"]}})
    
    return Address(**updated_address)

@api_router.delete("/users/{user_id}/addresses/{address_id}")
async def delete_user_address(user_id: str, address_id: str):
    address = await db.addresses.find_one({"id": address_id, "user_id": user_id}, {"_id": 0})
    if not address:
        raise HTTPException(status_code=404, detail="Address not found")
    
    was_default = address.get("is_default", False)
    
    result = await db.addresses.delete_one({"id": address_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Address not found")
    
    # If deleted address was default, make another one default
    if was_default:
        remaining = await db.addresses.find_one({"user_id": user_id}, {"_id": 0})
        if remaining:
            await db.addresses.update_one({"id": remaining["id"]}, {"$set": {"is_default": True}})
            await db.users.update_one({"id": user_id}, {"$set": {"address": remaining["address_line"]}})
        else:
            await db.users.update_one({"id": user_id}, {"$set": {"address": None}})
    
    return {"success": True}

@api_router.put("/users/{user_id}/addresses/{address_id}/set-default")
async def set_default_address(user_id: str, address_id: str):
    address = await db.addresses.find_one({"id": address_id, "user_id": user_id}, {"_id": 0})
    if not address:
        raise HTTPException(status_code=404, detail="Address not found")
    
    # Unset all other defaults
    await db.addresses.update_many({"user_id": user_id}, {"$set": {"is_default": False}})
    
    # Set this one as default
    await db.addresses.update_one({"id": address_id}, {"$set": {"is_default": True}})
    
    # Update user's main address
    await db.users.update_one({"id": user_id}, {"$set": {"address": address["address_line"]}})
    
    return {"success": True}

@api_router.get("/admin/users")
async def get_all_users():
    users = await db.users.find({}, {"_id": 0}).to_list(1000)
    for user in users:
        user.pop("password", None)
    return users

@api_router.put("/admin/users/{user_id}")
async def admin_update_user(user_id: str, user_data: UserUpdate):
    update_data = {k: v for k, v in user_data.model_dump().items() if v is not None}
    
    if not update_data:
        raise HTTPException(status_code=400, detail="No data to update")
    
    result = await db.users.update_one({"id": user_id}, {"$set": update_data})
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    
    user = await db.users.find_one({"id": user_id}, {"_id": 0})
    user.pop("password", None)
    return User(**user)

@api_router.delete("/admin/users/{user_id}")
async def admin_delete_user(user_id: str):
    result = await db.users.delete_one({"id": user_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    return {"success": True}

@api_router.put("/admin/subscriptions/{subscription_id}")
async def admin_update_subscription(subscription_id: str, sub_data: SubscriptionUpdate):
    update_data = {k: v for k, v in sub_data.model_dump().items() if v is not None}
    
    if not update_data:
        raise HTTPException(status_code=400, detail="No data to update")
    
    result = await db.subscriptions.update_one({"id": subscription_id}, {"$set": update_data})
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Subscription not found")
    
    subscription = await db.subscriptions.find_one({"id": subscription_id}, {"_id": 0})
    return Subscription(**subscription)

@api_router.delete("/admin/subscriptions/{subscription_id}")
async def admin_delete_subscription(subscription_id: str):
    await db.subscription_items.delete_many({"subscription_id": subscription_id})
    await db.deliveries.delete_many({"subscription_id": subscription_id})
    result = await db.subscriptions.delete_one({"id": subscription_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Subscription not found")
    return {"success": True}

@api_router.put("/admin/deliveries/{delivery_id}")
async def admin_update_delivery(delivery_id: str, delivery_data: DeliveryUpdate):
    update_data = {k: v for k, v in delivery_data.model_dump().items() if v is not None}
    
    if not update_data:
        raise HTTPException(status_code=400, detail="No data to update")
    
    result = await db.deliveries.update_one({"id": delivery_id}, {"$set": update_data})
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Delivery not found")
    
    delivery = await db.deliveries.find_one({"id": delivery_id}, {"_id": 0})
    return delivery

@api_router.get("/admin/payments")
async def get_all_payments_admin():
    payments = await db.payments.find({}, {"_id": 0}).to_list(1000)
    
    result = []
    for payment in payments:
        user = await db.users.find_one({"id": payment["user_id"]}, {"_id": 0})
        subscription = await db.subscriptions.find_one({"id": payment["subscription_id"]}, {"_id": 0})
        
        result.append({
            **payment,
            "user": user,
            "subscription": subscription
        })
    
    return result

@api_router.put("/admin/payments/{payment_id}")
async def admin_update_payment(payment_id: str, payment_data: PaymentUpdate):
    update_data = {k: v for k, v in payment_data.model_dump().items() if v is not None}
    
    if not update_data:
        raise HTTPException(status_code=400, detail="No data to update")
    
    result = await db.payments.update_one({"id": payment_id}, {"$set": update_data})
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Payment not found")
    
    payment = await db.payments.find_one({"id": payment_id}, {"_id": 0})
    return payment

@api_router.get("/admin/stats/recent")
async def get_recent_activities():
    recent_subscriptions = await db.subscriptions.find({}, {"_id": 0}).sort("created_at", -1).limit(5).to_list(5)
    recent_payments = await db.payments.find({}, {"_id": 0}).sort("created_at", -1).limit(5).to_list(5)
    
    for sub in recent_subscriptions:
        user = await db.users.find_one({"id": sub["user_id"]}, {"_id": 0})
        sub["user"] = user
    
    for payment in recent_payments:
        user = await db.users.find_one({"id": payment["user_id"]}, {"_id": 0})
        payment["user"] = user
    
    return {
        "recent_subscriptions": recent_subscriptions,
        "recent_payments": recent_payments
    }

# ============ COUPON MANAGEMENT APIs ============

class CouponCreate(BaseModel):
    code: str
    discount_type: str = "percentage"  # percentage or fixed
    discount_value: float
    min_order_amount: float = 0
    max_discount: Optional[float] = None
    usage_limit: Optional[int] = None
    valid_from: Optional[str] = None
    valid_until: Optional[str] = None
    is_active: bool = True
    description: Optional[str] = None

class CouponUpdate(BaseModel):
    code: Optional[str] = None
    discount_type: Optional[str] = None
    discount_value: Optional[float] = None
    min_order_amount: Optional[float] = None
    max_discount: Optional[float] = None
    usage_limit: Optional[int] = None
    valid_from: Optional[str] = None
    valid_until: Optional[str] = None
    is_active: Optional[bool] = None
    description: Optional[str] = None

@api_router.get("/admin/coupons")
async def get_all_coupons():
    coupons = await db.coupons.find({}, {"_id": 0}).to_list(1000)
    return coupons

@api_router.post("/admin/coupons")
async def create_coupon(coupon_data: CouponCreate):
    import uuid
    
    # Check if code already exists
    existing = await db.coupons.find_one({"code": coupon_data.code.upper()}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=400, detail="Coupon code already exists")
    
    coupon_doc = {
        "id": str(uuid.uuid4()),
        "code": coupon_data.code.upper(),
        "discount_type": coupon_data.discount_type,
        "discount_value": coupon_data.discount_value,
        "min_order_amount": coupon_data.min_order_amount,
        "max_discount": coupon_data.max_discount,
        "usage_limit": coupon_data.usage_limit,
        "times_used": 0,
        "valid_from": coupon_data.valid_from,
        "valid_until": coupon_data.valid_until,
        "is_active": coupon_data.is_active,
        "description": coupon_data.description,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.coupons.insert_one(coupon_doc)
    return coupon_doc

@api_router.put("/admin/coupons/{coupon_id}")
async def update_coupon(coupon_id: str, coupon_data: CouponUpdate):
    update_data = {k: v for k, v in coupon_data.model_dump().items() if v is not None}
    
    if "code" in update_data:
        update_data["code"] = update_data["code"].upper()
    
    if not update_data:
        raise HTTPException(status_code=400, detail="No data to update")
    
    result = await db.coupons.update_one({"id": coupon_id}, {"$set": update_data})
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Coupon not found")
    
    coupon = await db.coupons.find_one({"id": coupon_id}, {"_id": 0})
    return coupon

@api_router.delete("/admin/coupons/{coupon_id}")
async def delete_coupon(coupon_id: str):
    result = await db.coupons.delete_one({"id": coupon_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Coupon not found")
    return {"success": True}

@api_router.post("/coupons/validate")
async def validate_coupon(code: str, order_amount: float):
    coupon = await db.coupons.find_one({"code": code.upper(), "is_active": True}, {"_id": 0})
    
    if not coupon:
        raise HTTPException(status_code=404, detail="Invalid or expired coupon code")
    
    # Check validity dates
    now = datetime.now(timezone.utc).isoformat()
    if coupon.get("valid_from") and coupon["valid_from"] > now:
        raise HTTPException(status_code=400, detail="Coupon is not yet active")
    if coupon.get("valid_until") and coupon["valid_until"] < now:
        raise HTTPException(status_code=400, detail="Coupon has expired")
    
    # Check usage limit
    if coupon.get("usage_limit") and coupon.get("times_used", 0) >= coupon["usage_limit"]:
        raise HTTPException(status_code=400, detail="Coupon usage limit reached")
    
    # Check minimum order
    if order_amount < coupon.get("min_order_amount", 0):
        raise HTTPException(status_code=400, detail=f"Minimum order amount is ₹{coupon['min_order_amount']}")
    
    # Calculate discount
    if coupon["discount_type"] == "percentage":
        discount = (order_amount * coupon["discount_value"]) / 100
        if coupon.get("max_discount"):
            discount = min(discount, coupon["max_discount"])
    else:
        discount = coupon["discount_value"]
    
    return {
        "valid": True,
        "code": coupon["code"],
        "discount": discount,
        "discount_type": coupon["discount_type"],
        "discount_value": coupon["discount_value"]
    }

# Unified discount code validation - checks both coupons and referral codes
@api_router.post("/discount/validate")
async def validate_discount_code(code: str, order_amount: float):
    code_upper = code.upper().strip()
    
    # First check if it's a coupon
    coupon = await db.coupons.find_one({"code": code_upper, "is_active": True}, {"_id": 0})
    
    if coupon:
        # Validate coupon
        now = datetime.now(timezone.utc).isoformat()
        if coupon.get("valid_from") and coupon["valid_from"] > now:
            raise HTTPException(status_code=400, detail="Code is not yet active")
        if coupon.get("valid_until") and coupon["valid_until"] < now:
            raise HTTPException(status_code=400, detail="Code has expired")
        if coupon.get("usage_limit") and coupon.get("times_used", 0) >= coupon["usage_limit"]:
            raise HTTPException(status_code=400, detail="Code usage limit reached")
        if order_amount < coupon.get("min_order_amount", 0):
            raise HTTPException(status_code=400, detail=f"Minimum order amount is ₹{coupon['min_order_amount']}")
        
        # Calculate discount
        if coupon["discount_type"] == "percentage":
            discount = (order_amount * coupon["discount_value"]) / 100
            if coupon.get("max_discount"):
                discount = min(discount, coupon["max_discount"])
        else:
            discount = coupon["discount_value"]
        
        return {
            "valid": True,
            "type": "coupon",
            "code": coupon["code"],
            "discount": round(discount, 2),
            "discount_type": coupon["discount_type"],
            "discount_value": coupon["discount_value"],
            "description": coupon.get("description", "Coupon discount applied"),
            "message": f"Coupon applied! You save ₹{discount:.2f}"
        }
    
    # Check if it's a referral code
    referrer = await db.referrers.find_one({"referral_code": code_upper, "is_active": True}, {"_id": 0})
    
    if referrer:
        # Get referral program settings
        ref_settings = await get_referral_settings()
        
        # Check if referral program is active
        if not ref_settings.get("is_active", True):
            raise HTTPException(status_code=400, detail="Referral program is currently inactive")
        
        # Check minimum order amount
        min_order = ref_settings.get("min_order_amount", 0)
        if order_amount < min_order:
            raise HTTPException(status_code=400, detail=f"Minimum order amount for referral is ₹{min_order}")
        
        # Calculate discount using configured values
        customer_discount_percent = ref_settings.get("referee_discount_percent", 10)
        customer_discount = (order_amount * customer_discount_percent) / 100
        max_referral_discount = ref_settings.get("max_referee_discount", 100)
        customer_discount = min(customer_discount, max_referral_discount)
        
        return {
            "valid": True,
            "type": "referral",
            "code": referrer["referral_code"],
            "discount": round(customer_discount, 2),
            "discount_type": "percentage",
            "discount_value": customer_discount_percent,
            "referrer_id": referrer["id"],
            "referrer_name": referrer["name"],
            "referrer_commission_rate": referrer["commission_rate"],
            "description": f"Referred by {referrer['name']}",
            "message": f"Referral code applied! You save ₹{customer_discount:.2f} and {referrer['name']} earns commission"
        }
    
    raise HTTPException(status_code=404, detail="Invalid discount code")

# ============ REFERRAL MANAGEMENT APIs ============

class ReferrerCreate(BaseModel):
    name: str
    phone: str
    email: Optional[str] = None
    commission_rate: float = 10
    referral_code: str
    is_active: bool = True

class ReferrerUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    commission_rate: Optional[float] = None
    referral_code: Optional[str] = None
    is_active: Optional[bool] = None

@api_router.get("/admin/referrers")
async def get_all_referrers():
    referrers = await db.referrers.find({}, {"_id": 0}).to_list(1000)
    
    # Calculate stats for each referrer
    for referrer in referrers:
        referrals = await db.referrals.find({"referrer_id": referrer["id"]}, {"_id": 0}).to_list(1000)
        referrer["total_referrals"] = len(referrals)
        referrer["total_earned"] = sum(r.get("commission_amount", 0) for r in referrals)
        referrer["pending_amount"] = sum(r.get("commission_amount", 0) for r in referrals if not r.get("is_paid"))
    
    return referrers

@api_router.get("/admin/referral-stats")
async def get_referral_stats():
    referrers = await db.referrers.find({}, {"_id": 0}).to_list(1000)
    referrals = await db.referrals.find({}, {"_id": 0}).to_list(10000)
    
    total_commission = sum(r.get("commission_amount", 0) for r in referrals)
    pending_commission = sum(r.get("commission_amount", 0) for r in referrals if not r.get("is_paid"))
    
    return {
        "total_referrers": len(referrers),
        "total_referrals": len(referrals),
        "total_commission": total_commission,
        "pending_commission": pending_commission
    }

@api_router.post("/admin/referrers")
async def create_referrer(referrer_data: ReferrerCreate):
    import uuid
    
    # Check if code already exists
    existing = await db.referrers.find_one({"referral_code": referrer_data.referral_code.upper()}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=400, detail="Referral code already exists")
    
    # Check if phone already registered
    existing_phone = await db.referrers.find_one({"phone": referrer_data.phone}, {"_id": 0})
    if existing_phone:
        raise HTTPException(status_code=400, detail="Phone number already registered as referrer")
    
    referrer_doc = {
        "id": str(uuid.uuid4()),
        "name": referrer_data.name,
        "phone": referrer_data.phone,
        "email": referrer_data.email,
        "commission_rate": referrer_data.commission_rate,
        "referral_code": referrer_data.referral_code.upper(),
        "is_active": referrer_data.is_active,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.referrers.insert_one(referrer_doc)
    return referrer_doc

@api_router.put("/admin/referrers/{referrer_id}")
async def update_referrer(referrer_id: str, referrer_data: ReferrerUpdate):
    update_data = {k: v for k, v in referrer_data.model_dump().items() if v is not None}
    
    if "referral_code" in update_data:
        update_data["referral_code"] = update_data["referral_code"].upper()
    
    if not update_data:
        raise HTTPException(status_code=400, detail="No data to update")
    
    result = await db.referrers.update_one({"id": referrer_id}, {"$set": update_data})
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Referrer not found")
    
    referrer = await db.referrers.find_one({"id": referrer_id}, {"_id": 0})
    return referrer

@api_router.delete("/admin/referrers/{referrer_id}")
async def delete_referrer(referrer_id: str):
    # Delete referral history
    await db.referrals.delete_many({"referrer_id": referrer_id})
    
    result = await db.referrers.delete_one({"id": referrer_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Referrer not found")
    return {"success": True}

@api_router.post("/admin/referrers/{referrer_id}/pay-commission")
async def pay_referrer_commission(referrer_id: str):
    # Mark all pending referrals as paid
    result = await db.referrals.update_many(
        {"referrer_id": referrer_id, "is_paid": False},
        {"$set": {"is_paid": True, "paid_at": datetime.now(timezone.utc).isoformat()}}
    )
    
    return {"success": True, "referrals_paid": result.modified_count}

@api_router.post("/referrals/apply")
async def apply_referral_code(code: str, user_id: str, order_id: str, order_amount: float):
    import uuid
    
    referrer = await db.referrers.find_one({"referral_code": code.upper(), "is_active": True}, {"_id": 0})
    
    if not referrer:
        raise HTTPException(status_code=404, detail="Invalid referral code")
    
    # Check if user already used a referral
    existing = await db.referrals.find_one({"referred_user_id": user_id}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=400, detail="You have already used a referral code")
    
    commission_amount = (order_amount * referrer["commission_rate"]) / 100
    
    referral_doc = {
        "id": str(uuid.uuid4()),
        "referrer_id": referrer["id"],
        "referred_user_id": user_id,
        "order_id": order_id,
        "order_amount": order_amount,
        "commission_amount": commission_amount,
        "is_paid": False,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.referrals.insert_one(referral_doc)
    
    return {
        "success": True,
        "referrer_name": referrer["name"],
        "commission_earned": commission_amount
    }

# ============ CUSTOMER REFERRAL APIs ============

@api_router.get("/user/{user_id}/referral")
async def get_user_referral(user_id: str):
    """Get customer's own referral code and stats"""
    # Check if user has a referral code (stored in referrers collection with user_id link)
    referrer = await db.referrers.find_one({"user_id": user_id}, {"_id": 0})
    
    if not referrer:
        raise HTTPException(status_code=404, detail="No referral code found")
    
    # Calculate stats
    referrals = await db.referrals.find({"referrer_id": referrer["id"]}, {"_id": 0}).to_list(1000)
    total_referrals = len(referrals)
    total_earned = sum(r.get("commission_amount", 0) for r in referrals)
    pending_amount = sum(r.get("commission_amount", 0) for r in referrals if not r.get("is_paid"))
    
    return {
        "referral_code": referrer["referral_code"],
        "commission_rate": referrer["commission_rate"],
        "total_referrals": total_referrals,
        "total_earned": total_earned,
        "pending_amount": pending_amount,
        "is_active": referrer["is_active"],
        "created_at": referrer["created_at"]
    }

@api_router.post("/user/{user_id}/referral/generate")
async def generate_user_referral(user_id: str):
    """Generate a referral code for a customer"""
    import uuid
    import random
    import string
    
    # Get referral settings
    ref_settings = await get_referral_settings()
    
    # Check if referral program is active
    if not ref_settings.get("is_active", True):
        raise HTTPException(status_code=400, detail="Referral program is currently inactive")
    
    # Get user details
    user = await db.users.find_one({"id": user_id}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Check if user already has a referral code
    existing = await db.referrers.find_one({"user_id": user_id}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=400, detail="You already have a referral code")
    
    # Generate unique referral code based on user's name
    name_prefix = ''.join(c for c in user.get("name", "USER")[:4].upper() if c.isalpha())
    if len(name_prefix) < 3:
        name_prefix = "REF"
    
    # Add random suffix
    suffix = ''.join(random.choices(string.ascii_uppercase + string.digits, k=4))
    referral_code = f"{name_prefix}{suffix}"
    
    # Ensure uniqueness
    while await db.referrers.find_one({"referral_code": referral_code}):
        suffix = ''.join(random.choices(string.ascii_uppercase + string.digits, k=4))
        referral_code = f"{name_prefix}{suffix}"
    
    # Get commission rate from settings
    commission_rate = ref_settings.get("customer_commission_rate", 10)
    
    # Create referrer entry linked to user
    referrer_doc = {
        "id": str(uuid.uuid4()),
        "user_id": user_id,
        "name": user.get("name", "Customer"),
        "phone": user.get("phone", ""),
        "email": user.get("email"),
        "commission_rate": commission_rate,
        "referral_code": referral_code,
        "is_active": True,
        "is_customer": True,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.referrers.insert_one(referrer_doc)
    
    return {
        "referral_code": referral_code,
        "commission_rate": 10,
        "total_referrals": 0,
        "total_earned": 0,
        "pending_amount": 0,
        "is_active": True,
        "created_at": referrer_doc["created_at"],
        "message": "Referral code generated successfully!"
    }

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()