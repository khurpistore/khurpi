from fastapi import FastAPI, APIRouter, HTTPException, Depends
from fastapi.responses import StreamingResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
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
    price: float
    growth_days: int
    active: bool = True
    created_at: str

class ProductCreate(BaseModel):
    name: str
    image: str
    benefit: str
    price: float
    growth_days: int
    active: bool = True

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    image: Optional[str] = None
    benefit: Optional[str] = None
    price: Optional[float] = None
    growth_days: Optional[int] = None
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
    total_price: float
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
    
    subscription_doc = {
        "id": str(uuid.uuid4()),
        "user_id": user_id,
        "frequency": sub_data.frequency,
        "delivery_day": sub_data.delivery_day,
        "start_date": sub_data.start_date,
        "status": "active",
        "tray_count": sub_data.tray_count,
        "total_price": sub_data.total_price,
        "next_delivery_date": sub_data.start_date,
        "skipped_deliveries": [],
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.subscriptions.insert_one(subscription_doc)
    
    for item in sub_data.items:
        item_doc = {
            "id": str(uuid.uuid4()),
            "subscription_id": subscription_doc["id"],
            "product_id": item.product_id,
            "quantity": item.quantity,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.subscription_items.insert_one(item_doc)
    
    payment_doc = {
        "id": str(uuid.uuid4()),
        "subscription_id": subscription_doc["id"],
        "user_id": user_id,
        "amount": sub_data.total_price,
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

@api_router.put("/users/{user_id}/address")
async def update_user_address(user_id: str, address: str):
    result = await db.users.update_one({"id": user_id}, {"$set": {"address": address}})
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    
    user = await db.users.find_one({"id": user_id}, {"_id": 0})
    user.pop("password", None)
    return User(**user)

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