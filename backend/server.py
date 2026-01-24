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

# Default Subscription Plans with discounts
DEFAULT_SUBSCRIPTION_PLANS = [
    {"id": "weekly", "name": "Weekly (1x/week)", "frequency": "weekly", "deliveries_per_week": 1, "discount": 5, "description": "Perfect for trying out"},
    {"id": "twice_weekly", "name": "Twice Weekly (2x/week)", "frequency": "twice_weekly", "deliveries_per_week": 2, "discount": 10, "description": "Most popular choice"},
    {"id": "six_days", "name": "Daily (6 days/week)", "frequency": "six_days", "deliveries_per_week": 6, "discount": 25, "description": "Best value - Maximum freshness"}
]

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
    address_line: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    is_default: bool = False
    created_at: str

class AddressCreate(BaseModel):
    address_line: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    is_default: bool = False

class AddressUpdate(BaseModel):
    address_line: Optional[str] = None
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
    start_date: str
    status: str = "active"
    tray_count: int
    subtotal: float = 0
    discount_percent: float = 0
    discount_amount: float = 0
    delivery_fee: float = 0
    total_price: float
    address_id: Optional[str] = None
    next_delivery_date: Optional[str] = None
    skipped_deliveries: List[str] = []
    created_at: str

class SubscriptionCreate(BaseModel):
    frequency: str
    delivery_day: str
    start_date: str
    tray_count: int
    items: List[SubscriptionItem]
    total_price: float
    plan_id: Optional[str] = None
    address_id: Optional[str] = None

class SubscriptionUpdate(BaseModel):
    status: Optional[str] = None
    frequency: Optional[str] = None
    delivery_day: Optional[str] = None
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
    
    subscription_doc = {
        "id": str(uuid.uuid4()),
        "user_id": user_id,
        "frequency": sub_data.frequency,
        "delivery_day": sub_data.delivery_day,
        "start_date": sub_data.start_date,
        "status": "active",
        "tray_count": sub_data.tray_count,
        "subtotal": subtotal,
        "discount_percent": discount_percent,
        "discount_amount": discount_amount,
        "delivery_fee": delivery_fee,
        "total_price": final_total,
        "address_id": selected_address.get("id") if selected_address else None,
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

@api_router.get("/admin/settings/all")
async def get_all_admin_settings():
    """Get all settings for admin panel"""
    shop = await get_shop_config()
    delivery = await get_delivery_pricing()
    plans = await get_subscription_plans()
    
    return {
        "shop_config": shop,
        "delivery_pricing": delivery,
        "subscription_plans": plans
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
        "address_line": address_data.address_line,
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