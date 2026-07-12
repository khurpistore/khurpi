from fastapi import FastAPI, APIRouter, HTTPException, Depends, Header, Request
from fastapi.responses import JSONResponse
from fastapi.responses import HTMLResponse
import secrets
from fastapi.responses import StreamingResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import math
import uuid
import hmac
import hashlib
import random
import requests
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
from datetime import datetime, timezone, timedelta
import io
import csv
from passlib.context import CryptContext
import razorpay
import jwt

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# JWT Configuration
JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'khurpi-fresh-secret-key-2026-secure')
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24 * 30  # 30 days

def create_jwt_token(user_id: str, phone: str, role: str = "customer") -> str:
    """Create a JWT token for the user"""
    payload = {
        "user_id": user_id,
        "phone": phone,
        "role": role,
        "exp": datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS),
        "iat": datetime.now(timezone.utc)
    }
    return jwt.encode(payload, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)

def decode_jwt_token(token: str) -> dict:
    """Decode and validate a JWT token"""
    try:
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
        return {"valid": True, "payload": payload}
    except jwt.ExpiredSignatureError:
        return {"valid": False, "error": "Token has expired"}
    except jwt.InvalidTokenError as e:
        return {"valid": False, "error": str(e)}

# FastAPI dependency to extract user_id from JWT token
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

security = HTTPBearer(auto_error=False)

async def get_current_user_id(credentials: HTTPAuthorizationCredentials = Depends(security)) -> str:
    """Extract user_id from JWT token in Authorization header"""
    if credentials is None:
        raise HTTPException(status_code=401, detail="Authorization header missing")
    
    token = credentials.credentials
    result = decode_jwt_token(token)
    
    if not result["valid"]:
        raise HTTPException(status_code=401, detail=result.get("error", "Invalid token"))
    
    user_id = result["payload"].get("user_id")
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid token: user_id missing")
    
    return user_id

async def get_optional_user_id(credentials: HTTPAuthorizationCredentials = Depends(security)) -> Optional[str]:
    """Extract user_id from JWT token, returns None if not authenticated"""
    if credentials is None:
        return None
    
    token = credentials.credentials
    result = decode_jwt_token(token)
    
    if not result["valid"]:
        return None
    
    return result["payload"].get("user_id")

async def get_current_vendor_id(credentials: HTTPAuthorizationCredentials = Depends(security)) -> str:
    """Extract user_id from JWT token and ensure the user is a vendor (checked against DB)."""
    if credentials is None:
        raise HTTPException(status_code=401, detail="Authorization header missing")

    result = decode_jwt_token(credentials.credentials)
    if not result["valid"]:
        raise HTTPException(status_code=401, detail=result.get("error", "Invalid token"))

    user_id = result["payload"].get("user_id")
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid token: user_id missing")

    user = await db.users.find_one({"id": user_id}, {"_id": 0, "role": 1})
    if not user or user.get("role") != "vendor":
        raise HTTPException(status_code=403, detail="Vendor access required")

    return user_id


# Environment Mode
ENV = os.environ.get('ENV', 'development')
IS_PRODUCTION = ENV == 'production'

# MongoDB Configuration from .env
mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
db_name = os.environ.get('DB_NAME', 'khurpi_test')

# Log environment info on startup
logging.info(f"Environment: {ENV}")
logging.info(f"Database: {db_name}")
logging.info(f"Production Mode: {IS_PRODUCTION}")

client = AsyncIOMotorClient(mongo_url)
db = client[db_name]

# Razorpay client initialization
razorpay_key_id = os.environ.get('RAZORPAY_KEY_ID', '')
razorpay_key_secret = os.environ.get('RAZORPAY_KEY_SECRET', '')
razorpay_test_mode = os.environ.get('RAZORPAY_TEST_MODE', 'true').lower() == 'true'
admin_username = os.environ.get('ADMIN_USERNAME', 'admin')
admin_password = os.environ.get('ADMIN_PASSWORD', 'admin')

# Initialize Razorpay client (skip if in test mode without valid credentials)
razorpay_client = None
if razorpay_key_id and razorpay_key_secret:
    try:
        razorpay_client = razorpay.Client(auth=(razorpay_key_id, razorpay_key_secret))
        logging.info(f"Razorpay initialized - Test Mode: {razorpay_test_mode}")
    except Exception as e:
        logging.warning(f"Razorpay client initialization failed: {e}")

# MSG91 Configuration
MSG91_AUTH_KEY = os.environ.get('MSG91_AUTH_KEY', '')

app = FastAPI()
api_router = APIRouter(prefix="/api")

# ==========================================
# ADMIN AUTH MIDDLEWARE (Security)
# ==========================================
def _extract_admin_payload(request: Request):
    auth = request.headers.get("Authorization", "")
    if not auth.startswith("Bearer "):
        return None
    result = decode_jwt_token(auth[7:])
    if result.get("valid") and result["payload"].get("role") == "admin":
        return result["payload"]
    return None

@app.middleware("http")
async def admin_auth_middleware(request: Request, call_next):
    path = request.url.path
    method = request.method
    protected = False
    if method != "OPTIONS":
        if path.startswith("/api/admin/") and path != "/api/admin/login":
            protected = True
        elif method == "POST" and path == "/api/products":
            protected = True
        elif method in ("PUT", "DELETE") and path.startswith("/api/products/"):
            protected = True
    if protected and _extract_admin_payload(request) is None:
        return JSONResponse(status_code=401, content={"detail": "Admin authentication required"})
    return await call_next(request)

# ==========================================
# MULTI-PROJECT (MULTI-TENANCY) SUPPORT
# ==========================================
DEFAULT_PROJECT_ID = "default"

# Collections whose documents belong to a specific project
PROJECT_SCOPED_COLLECTIONS = [
    "products", "categories", "subcategories", "orders", "coupons", "banners", "spin_prizes",
    "users", "subscriptions", "deliveries", "payments"
]

async def get_project_id(x_project_id: Optional[str] = Header(None)) -> str:
    """Resolve the active project id from the X-Project-Id header (defaults to the primary project)."""
    return x_project_id or DEFAULT_PROJECT_ID

def scoped_filter(project_id: str, base: dict = None) -> dict:
    """Build a project-scoped Mongo filter. For the default project, legacy documents
    that predate multi-tenancy (missing project_id) are also included."""
    q = dict(base) if base else {}
    if project_id == DEFAULT_PROJECT_ID:
        q["$or"] = [{"project_id": DEFAULT_PROJECT_ID}, {"project_id": {"$exists": False}}]
    else:
        q["project_id"] = project_id
    return q

class ProjectCreate(BaseModel):
    name: str
    description: Optional[str] = ""
    logo: Optional[str] = ""
    color: Optional[str] = "#16a34a"

class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    logo: Optional[str] = None
    color: Optional[str] = None
    active: Optional[bool] = None

@api_router.get("/admin/projects")
async def list_projects():
    """List all projects (super admin)."""
    projects = await db.projects.find({}, {"_id": 0}).sort("created_at", 1).to_list(200)
    return projects

@api_router.post("/admin/projects")
async def create_project_endpoint(project: ProjectCreate):
    """Create a new project (super admin)."""
    doc = {
        "id": str(uuid.uuid4()),
        "name": project.name,
        "slug": project.name.lower().replace(" ", "-"),
        "description": project.description or "",
        "logo": project.logo or "",
        "color": project.color or "#16a34a",
        "active": True,
        "is_default": False,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.projects.insert_one(doc)
    doc.pop("_id", None)
    return doc

@api_router.put("/admin/projects/{project_id}")
async def update_project_endpoint(project_id: str, project: ProjectUpdate):
    update_data = {k: v for k, v in project.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No data to update")
    result = await db.projects.update_one({"id": project_id}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Project not found")
    updated = await db.projects.find_one({"id": project_id}, {"_id": 0})
    return updated

@api_router.delete("/admin/projects/{project_id}")
async def delete_project_endpoint(project_id: str):
    proj = await db.projects.find_one({"id": project_id}, {"_id": 0})
    if not proj:
        raise HTTPException(status_code=404, detail="Project not found")
    if proj.get("is_default") or project_id == DEFAULT_PROJECT_ID:
        raise HTTPException(status_code=400, detail="Cannot delete the default project")
    for col in PROJECT_SCOPED_COLLECTIONS:
        await db[col].delete_many({"project_id": project_id})
    await db.projects.delete_one({"id": project_id})
    return {"success": True}

@app.on_event("startup")
async def init_projects():
    """Ensure a default project exists and backfill project_id on legacy documents."""
    existing = await db.projects.find_one({"id": DEFAULT_PROJECT_ID})
    if not existing:
        await db.projects.insert_one({
            "id": DEFAULT_PROJECT_ID,
            "name": "Khurpi",
            "slug": "khurpi",
            "description": "Primary store",
            "logo": "",
            "color": "#16a34a",
            "active": True,
            "is_default": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        })
    for col in PROJECT_SCOPED_COLLECTIONS:
        await db[col].update_many(
            {"project_id": {"$exists": False}},
            {"$set": {"project_id": DEFAULT_PROJECT_ID}}
        )
        try:
            await db[col].create_index("project_id")
        except Exception:
            pass

# Health check endpoint for Kubernetes deployment
@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "khurpi-backend"}

# Also add health check under /api prefix for production routing
@app.get("/api/health")
async def api_health_check():
    return {"status": "healthy", "service": "khurpi-backend"}

# Environment info endpoint (useful for debugging)
@app.get("/api/env-info")
async def get_env_info():
    """Get current environment configuration (non-sensitive)"""
    return {
        "environment": ENV,
        "is_production": IS_PRODUCTION,
        "database": db_name,
        "razorpay_test_mode": razorpay_test_mode,
        "razorpay_configured": bool(razorpay_client)
    }

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
        data = pricing.get("data", DEFAULT_DELIVERY_PRICING)
        # Handle both formats: direct list or {"tiers": [...]}
        if isinstance(data, dict) and "tiers" in data:
            return data["tiers"]
        return data
    return DEFAULT_DELIVERY_PRICING

async def get_subscription_plans():
    """Get subscription plans from DB or return defaults"""
    plans = await db.settings.find_one({"type": "subscription_plans"}, {"_id": 0})
    if plans:
        return plans.get("data", DEFAULT_SUBSCRIPTION_PLANS)
    return DEFAULT_SUBSCRIPTION_PLANS

async def calculate_delivery_fee(customer_lat, customer_lon):
    """Calculate delivery fee based on distance from shop - NOW FREE FOR ALL"""
    shop = await get_shop_config()
    
    distance = calculate_distance(
        shop["latitude"], shop["longitude"],
        customer_lat, customer_lon
    )
    
    # FREE delivery on all orders
    return {
        "distance": round(distance, 2),
        "fee": 0,
        "label": "FREE Delivery"
    }

class Address(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    user_id: str
    name: Optional[str] = None
    phone: Optional[str] = None
    address_line: str
    address_line_1: Optional[str] = None
    address_line_2: Optional[str] = None
    landmark: Optional[str] = None
    area: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    pincode: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    address_type: Optional[str] = "home"  # home, office, other
    label: Optional[str] = None  # custom user-defined title
    is_default: bool = False
    created_at: str
    updated_at: Optional[str] = None

class AddressCreate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    address_line: str
    address_line_1: Optional[str] = None
    address_line_2: Optional[str] = None
    landmark: Optional[str] = None
    area: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    pincode: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    address_type: Optional[str] = "home"
    label: Optional[str] = None
    is_default: bool = False

class AddressUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    address_line: Optional[str] = None
    address_line_1: Optional[str] = None
    address_line_2: Optional[str] = None
    landmark: Optional[str] = None
    area: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    pincode: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    address_type: Optional[str] = None
    label: Optional[str] = None
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
    image_url: Optional[str] = None  # Flutter app compatibility field
    images: List[str] = []  # Multiple product images (gallery). First is primary.
    benefit: str
    nutrients: Optional[str] = None
    price: float
    mrp: Optional[float] = None  # Maximum Retail Price (strike-through). price = selling price
    wholesale_price: Optional[float] = 0  # Wholesale price per unit
    # Category
    category_id: Optional[str] = None
    category_name: Optional[str] = None
    # Unit configuration
    unit: str = "kg"  # kg, g, piece, dozen
    unit_value: float = 1  # e.g., 1 for 1kg, 500 for 500g
    price_per: str = "kg"  # Price is per kg/piece/etc.
    min_quantity: float = 0.25  # Minimum order quantity (e.g., 250g = 0.25kg)
    step_quantity: float = 0.25  # Increment step
    # Stock
    stock_quantity: float = 0  # Available stock in base unit
    low_stock_threshold: float = 5  # Alert when below this
    # Legacy fields (kept for compatibility)
    growth_days: int = 0
    weight: int = 100  # Weight in grams - represents available stock quantity
    pack_size: str = "1 kg"  # Display string
    active: bool = True
    # Stock availability status
    stock_status: str = "in_stock"  # in_stock, growing, out_of_stock, low_stock
    ready_in_days: Optional[int] = None  # For "growing" status - days until ready
    availability_date: Optional[str] = None  # ISO date string when product will be available
    seeds_available: bool = True  # Whether seeds are available for growing
    # Freshness
    harvest_date: Optional[str] = None  # When was it harvested
    shelf_life_days: int = 7  # How long it stays fresh
    # Display
    featured: bool = False  # Show in featured section
    display_order: int = 0
    created_at: str
    updated_at: Optional[str] = None

class ProductCreate(BaseModel):
    name: str
    image: str
    images: Optional[List[str]] = None
    benefit: str
    nutrients: Optional[str] = None
    price: float
    mrp: Optional[float] = None
    wholesale_price: Optional[float] = 0
    # Category
    category_id: Optional[str] = None
    # Unit configuration
    unit: str = "kg"
    unit_value: float = 1
    price_per: str = "kg"
    min_quantity: float = 0.25
    step_quantity: float = 0.25
    # Stock
    stock_quantity: float = 0
    low_stock_threshold: float = 5
    # Legacy fields
    growth_days: int = 0
    weight: int = 100
    pack_size: str = "1 kg"
    active: bool = True
    stock_status: str = "in_stock"
    ready_in_days: Optional[int] = None
    availability_date: Optional[str] = None
    seeds_available: bool = True
    # Freshness
    harvest_date: Optional[str] = None
    shelf_life_days: int = 7
    # Display
    featured: bool = False
    display_order: int = 0

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    image: Optional[str] = None
    images: Optional[List[str]] = None
    benefit: Optional[str] = None
    nutrients: Optional[str] = None
    price: Optional[float] = None
    mrp: Optional[float] = None
    wholesale_price: Optional[float] = None
    # Category
    category_id: Optional[str] = None
    # Unit configuration
    unit: Optional[str] = None
    unit_value: Optional[float] = None
    price_per: Optional[str] = None
    min_quantity: Optional[float] = None
    step_quantity: Optional[float] = None
    # Stock
    stock_quantity: Optional[float] = None
    low_stock_threshold: Optional[float] = None
    # Legacy fields
    growth_days: Optional[int] = None
    weight: Optional[int] = None
    pack_size: Optional[str] = None
    active: Optional[bool] = None
    stock_status: Optional[str] = None
    ready_in_days: Optional[int] = None
    availability_date: Optional[str] = None
    seeds_available: Optional[bool] = None
    # Freshness
    harvest_date: Optional[str] = None
    shelf_life_days: Optional[int] = None
    # Display
    featured: Optional[bool] = None
    display_order: Optional[int] = None

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
    subtotal: float = 0  # Monthly subtotal before any discount
    # Plan discount (e.g., 10% for twice_week)
    discount_percent: float = 0
    discount_amount: float = 0
    # Bulk discount (order-value based, e.g., 20% off for orders > ₹4000)
    bulk_discount_percent: float = 0
    bulk_discount_amount: float = 0
    bulk_discount_min_order_value: Optional[float] = None
    delivery_fee: float = 0
    coupon_code: Optional[str] = None
    coupon_discount: float = 0
    total_price: float  # Final monthly amount paid (after all discounts)
    address_id: Optional[str] = None
    payment_method: str = "razorpay"
    payment_status: str = "pending"
    payment_id: Optional[str] = None
    razorpay_order_id: Optional[str] = None
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
    total_price: float  # Final monthly amount paid (after all discounts)
    subtotal: Optional[float] = None  # Monthly subtotal before bulk discount
    # Plan discount
    plan_discount: Optional[float] = 0
    discount_amount: Optional[float] = 0
    # Bulk discount (order-value based)
    bulk_discount_percent: Optional[float] = 0
    bulk_discount_amount: Optional[float] = 0
    bulk_discount_min_order_value: Optional[float] = None
    plan_id: Optional[str] = None
    address_id: Optional[str] = None
    coupon_code: Optional[str] = None
    coupon_discount: float = 0
    referral_code: Optional[str] = None
    payment_method: str = "razorpay"
    payment_id: Optional[str] = None
    razorpay_order_id: Optional[str] = None
    payment_status: str = "pending"
    delivery_fee: Optional[float] = 0
    monthly_delivery_fee: Optional[float] = 0

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

class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str

class AdminResetPasswordRequest(BaseModel):
    new_password: str

class DeliveryUpdate(BaseModel):
    status: Optional[str] = None
    delivery_date: Optional[str] = None
    delivery_time: Optional[str] = None
    notes: Optional[str] = None

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
    delivery_time: Optional[str] = None
    status: str = "scheduled"
    notes: Optional[str] = None
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
    product_name: Optional[str] = None
    unit: Optional[str] = None

class SubscriptionItemInOrder(BaseModel):
    product_id: str
    quantity: int
    price: float

class SubscriptionInOrder(BaseModel):
    frequency: str
    delivery_days: List[str]
    start_date: str
    items: List[SubscriptionItemInOrder]
    subtotal: float  # Monthly subtotal before discount
    total_price: float  # Monthly paid amount after discount
    bulk_discount_percent: float = 0
    bulk_discount_amount: float = 0
    next_delivery_date: Optional[str] = None

class Order(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    user_id: str
    address_id: str
    delivery_address: Optional[dict] = None  # Snapshot of address at order time
    # One-time items
    one_time_items: Optional[List[OrderItem]] = None
    # Subscription in this order
    subscription: Optional[SubscriptionInOrder] = None
    # Legacy field for backward compatibility
    items: Optional[List[OrderItem]] = None
    subtotal: float
    delivery_fee: float = 0
    delivery_distance: Optional[float] = None
    # Automatic order-value based discount
    discount_type: Optional[str] = None  # "bulk_discount" for order-value based
    discount_percent: float = 0
    discount_amount: float = 0
    discount_min_order_value: Optional[float] = None  # Min order value for this discount
    # Coupon discount
    coupon_code: Optional[str] = None
    coupon_discount: float = 0
    total: float
    status: str = "pending"
    order_type: str = "one_time"  # "one_time", "subscription", "mixed"
    order_source: str = "online"  # "online", "phone", "whatsapp", "walk_in"
    order_notes: Optional[str] = None  # Admin notes for offline orders
    payment_id: Optional[str] = None
    razorpay_order_id: Optional[str] = None
    payment_status: str = "pending"
    estimated_delivery_date: Optional[str] = None
    created_at: str
    cancel_reason: Optional[str] = None
    cancelled_at: Optional[str] = None
    return_status: Optional[str] = None
    return_reason: Optional[str] = None
    return_requested_at: Optional[str] = None
    refund_status: Optional[str] = None
    refund_amount: Optional[float] = None
    refund_id: Optional[str] = None
    refunded_at: Optional[str] = None

class OrderCreate(BaseModel):
    user_id: str
    address_id: str
    # One-time items
    one_time_items: Optional[List[OrderItem]] = None
    # Subscription data
    subscription: Optional[dict] = None
    # Legacy field
    items: Optional[List[OrderItem]] = None
    subtotal: float
    delivery_fee: float = 0
    # Automatic order-value based discount
    discount_type: Optional[str] = None  # "bulk_discount" for order-value based
    discount_percent: float = 0
    discount_amount: float = 0
    discount_min_order_value: Optional[float] = None
    # Coupon discount
    coupon_code: Optional[str] = None
    coupon_discount: float = 0
    total: float
    order_type: str = "one_time"  # "one_time", "subscription", "mixed"
    payment_id: Optional[str] = None
    razorpay_order_id: Optional[str] = None
    payment_status: str = "pending"


# Expense/Expenditure Models
class ExpenseCreate(BaseModel):
    item_type: str  # seeds, lights, fans, racks, trays, cocopeat, h2o2, other, digital_app, stickers, pamphlet, marketing
    item_name: str
    description: Optional[str] = None
    vendor_name: str
    vendor_location: Optional[str] = None
    vendor_phone: Optional[str] = None
    quantity: Optional[int] = 1
    unit_price: float
    total_price: float
    paid_status: str = "pending"  # pending, partial, paid
    paid_amount: Optional[float] = 0
    payment_method: Optional[str] = None  # cash, upi, bank_transfer, card
    order_date: str
    delivery_date: Optional[str] = None
    invoice_number: Optional[str] = None
    notes: Optional[str] = None

class ExpenseUpdate(BaseModel):
    item_type: Optional[str] = None
    item_name: Optional[str] = None
    description: Optional[str] = None
    vendor_name: Optional[str] = None
    vendor_location: Optional[str] = None
    vendor_phone: Optional[str] = None
    quantity: Optional[int] = None
    unit_price: Optional[float] = None
    total_price: Optional[float] = None
    paid_status: Optional[str] = None
    paid_amount: Optional[float] = None
    payment_method: Optional[str] = None
    order_date: Optional[str] = None
    delivery_date: Optional[str] = None
    invoice_number: Optional[str] = None
    notes: Optional[str] = None

class ExpenseTypeCreate(BaseModel):
    name: str
    label: str
    description: Optional[str] = None

# Cost Calculator Models
class OneTimePurchase(BaseModel):
    id: Optional[str] = None
    name: str
    category: str  # racks, lights, fans, trays, sensors, equipment, other
    purchase_cost: float
    purchase_date: str
    useful_life_months: int = 36  # Default 3 years
    salvage_value: float = 0
    notes: Optional[str] = None

class MonthlyFixedCost(BaseModel):
    id: Optional[str] = None
    name: str
    category: str  # rent, electricity, water, internet, insurance, salary, other
    monthly_amount: float
    notes: Optional[str] = None

class ProductionCostItem(BaseModel):
    id: Optional[str] = None
    name: str
    category: str  # seeds, soil, labor, packaging, consumables, other
    cost_per_unit: float
    unit: str  # per_tray, per_kg, per_hour, per_piece
    notes: Optional[str] = None

class ProductCostConfig(BaseModel):
    product_id: str
    product_name: str
    trays_per_batch: int = 1
    growth_days: int = 7
    yield_grams_per_tray: float = 100
    seed_cost_per_tray: float = 0
    soil_cost_per_tray: float = 0
    labor_hours_per_batch: float = 0.5
    labor_rate_per_hour: float = 100
    packaging_cost_per_unit: float = 0
    other_variable_costs: float = 0
    notes: Optional[str] = None

# Analytics Models
class AnalyticsEvent(BaseModel):
    event_type: str  # page_view, click, add_to_cart, checkout, purchase, etc.
    page: Optional[str] = None
    page_url: Optional[str] = None
    page_title: Optional[str] = None
    user_id: Optional[str] = None
    session_id: str
    visitor_id: Optional[str] = None
    timestamp: Optional[str] = None
    # Location data
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    accuracy: Optional[float] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None
    pincode: Optional[str] = None
    # Device info
    device_type: Optional[str] = None
    browser: Optional[str] = None
    browser_version: Optional[str] = None
    os: Optional[str] = None
    screen_width: Optional[int] = None
    screen_height: Optional[int] = None
    # Event specific data
    product_id: Optional[str] = None
    product_name: Optional[str] = None
    category: Optional[str] = None
    value: Optional[float] = None
    metadata: Optional[dict] = None
    # Marketing attribution (extracted from metadata for indexing)
    traffic_source: Optional[str] = None
    traffic_medium: Optional[str] = None
    traffic_channel: Optional[str] = None
    utm_source: Optional[str] = None
    utm_medium: Optional[str] = None
    utm_campaign: Optional[str] = None
    utm_term: Optional[str] = None
    utm_content: Optional[str] = None
    referrer: Optional[str] = None
    landing_page: Optional[str] = None

# Order Discount Tiers Model
class DiscountTier(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: Optional[str] = None
    min_order_value: float  # Minimum order value to qualify
    discount_percent: float  # Discount percentage
    active: bool = True
    created_at: Optional[str] = None

class DiscountTierCreate(BaseModel):
    min_order_value: float
    discount_percent: float
    active: bool = True

# ==========================================
# STORE CONFIGURATION MODELS
# ==========================================

class StoreSettings(BaseModel):
    """Store-wide settings configurable by admin"""
    model_config = ConfigDict(extra="ignore")
    id: str = "store_settings"
    store_name: str = "Khurpi"
    tagline: str = "Fresh from Farm to Your Table"
    description: str = "Fresh vegetables, fruits and groceries delivered to your doorstep"
    logo_url: Optional[str] = None
    phone: str = ""
    email: str = ""
    address: str = ""
    gstin: str = ""
    gst_rate: float = 0
    # Delivery Configuration
    instant_delivery_enabled: bool = True
    instant_delivery_fee: float = 30
    instant_delivery_time_minutes: int = 60
    slotted_delivery_enabled: bool = True
    subscription_enabled: bool = True
    # Minimum order values
    min_order_value: float = 0
    min_order_for_free_delivery: float = 500
    default_delivery_fee: float = 30
    # Operating hours
    opening_time: str = "07:00"
    closing_time: str = "21:00"
    # Product display
    default_unit: str = "kg"  # kg, g, piece, dozen
    show_stock_quantity: bool = True
    # Order status workflow (configurable by admin, used by vendors)
    order_statuses: List[str] = ["pending", "confirmed", "preparing", "out_for_delivery", "delivered", "cancelled"]
    # Theme colors (for dynamic UI)
    primary_color: str = "#16a34a"
    secondary_color: str = "#22c55e"
    updated_at: Optional[str] = None

class StoreSettingsUpdate(BaseModel):
    store_name: Optional[str] = None
    gstin: Optional[str] = None
    gst_rate: Optional[float] = None
    tagline: Optional[str] = None
    description: Optional[str] = None
    logo_url: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    instant_delivery_enabled: Optional[bool] = None
    instant_delivery_fee: Optional[float] = None
    instant_delivery_time_minutes: Optional[int] = None
    slotted_delivery_enabled: Optional[bool] = None
    subscription_enabled: Optional[bool] = None
    min_order_value: Optional[float] = None
    min_order_for_free_delivery: Optional[float] = None
    default_delivery_fee: Optional[float] = None
    opening_time: Optional[str] = None
    closing_time: Optional[str] = None
    default_unit: Optional[str] = None
    show_stock_quantity: Optional[bool] = None
    order_statuses: Optional[List[str]] = None
    primary_color: Optional[str] = None
    secondary_color: Optional[str] = None
    support_phone: Optional[str] = None
    support_email: Optional[str] = None
    support_whatsapp: Optional[str] = None

# ==========================================
# CATEGORY MODELS
# ==========================================

class Category(BaseModel):
    """Product category for organizing products"""
    model_config = ConfigDict(extra="ignore")
    id: str
    name: str
    slug: str  # URL-friendly name
    description: Optional[str] = None
    image: Optional[str] = None
    icon: Optional[str] = None  # Icon name (e.g., "carrot", "apple")
    parent_id: Optional[str] = None  # For subcategories
    display_order: int = 0
    active: bool = True
    show_on_home: bool = False  # Show on homepage
    created_at: str
    updated_at: Optional[str] = None

class CategoryCreate(BaseModel):
    name: str
    slug: Optional[str] = None  # Auto-generated if not provided
    description: Optional[str] = None
    image: Optional[str] = None
    icon: Optional[str] = None
    parent_id: Optional[str] = None
    display_order: int = 0
    active: bool = True
    show_on_home: bool = False

class CategoryUpdate(BaseModel):
    name: Optional[str] = None
    slug: Optional[str] = None
    description: Optional[str] = None
    image: Optional[str] = None
    icon: Optional[str] = None
    parent_id: Optional[str] = None
    display_order: Optional[int] = None
    active: Optional[bool] = None
    show_on_home: Optional[bool] = None

# ==========================================
# DELIVERY SLOT MODELS
# ==========================================

class DeliverySlot(BaseModel):
    """Configurable delivery time slots"""
    model_config = ConfigDict(extra="ignore")
    id: str
    name: str  # e.g., "Morning", "Afternoon", "Evening"
    start_time: str  # e.g., "07:00"
    end_time: str  # e.g., "10:00"
    display_text: str  # e.g., "7:00 AM - 10:00 AM"
    max_orders: int = 50  # Maximum orders per slot
    delivery_fee: float = 0  # Additional fee for this slot (0 = no extra)
    active: bool = True
    display_order: int = 0
    # Days when this slot is available (empty = all days)
    available_days: List[str] = []  # ["Monday", "Tuesday", ...] or empty for all
    # Cutoff time - how many hours before slot start to stop accepting orders
    cutoff_hours: int = 2
    created_at: str
    updated_at: Optional[str] = None

class DeliverySlotCreate(BaseModel):
    name: str
    start_time: str
    end_time: str
    display_text: Optional[str] = None
    max_orders: int = 50
    delivery_fee: float = 0
    active: bool = True
    display_order: int = 0
    available_days: List[str] = []
    cutoff_hours: int = 2

class DeliverySlotUpdate(BaseModel):
    name: Optional[str] = None
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    display_text: Optional[str] = None
    max_orders: Optional[int] = None
    delivery_fee: Optional[float] = None
    active: Optional[bool] = None
    display_order: Optional[int] = None
    available_days: Optional[List[str]] = None
    cutoff_hours: Optional[int] = None

class SlotAvailability(BaseModel):
    """Check slot availability for a specific date"""
    slot_id: str
    date: str  # ISO date string
    available: bool
    orders_count: int
    max_orders: int
    remaining_capacity: int

# ==========================================
# PRODUCT UNIT MODELS
# ==========================================

class ProductUnit(BaseModel):
    """Configurable product units (kg, g, piece, etc.)"""
    model_config = ConfigDict(extra="ignore")
    id: str
    name: str  # e.g., "Kilogram", "Gram", "Piece"
    short_name: str  # e.g., "kg", "g", "pc"
    conversion_to_grams: float  # e.g., 1000 for kg, 1 for g, 0 for piece
    is_weight_based: bool = True  # False for piece, dozen, etc.
    active: bool = True
    display_order: int = 0

class ProductUnitCreate(BaseModel):
    name: str
    short_name: str
    conversion_to_grams: float = 1
    is_weight_based: bool = True
    active: bool = True
    display_order: int = 0

# ==========================================
# BLOCKED DATES MODEL (for holidays, etc.)
# ==========================================

class BlockedDate(BaseModel):
    """Dates when delivery is not available"""
    model_config = ConfigDict(extra="ignore")
    id: str
    date: str  # ISO date string
    reason: str  # e.g., "Diwali Holiday", "Maintenance"
    block_all_slots: bool = True  # If false, can specify which slots to block
    blocked_slot_ids: List[str] = []  # Specific slots to block (if block_all_slots is False)
    created_at: str

class BlockedDateCreate(BaseModel):
    date: str
    reason: str
    block_all_slots: bool = True
    blocked_slot_ids: List[str] = []

@api_router.post("/analytics/track")
async def track_analytics_event(event: AnalyticsEvent):
    """Track an analytics event with advanced data"""
    # Extract marketing data from metadata if not provided at top level
    metadata = event.metadata or {}
    traffic_source = event.traffic_source or metadata.get("traffic_source", "direct")
    traffic_medium = event.traffic_medium or metadata.get("traffic_medium", "none")
    traffic_channel = event.traffic_channel or metadata.get("traffic_channel", "direct")
    utm_source = event.utm_source or metadata.get("utm_source")
    utm_medium = event.utm_medium or metadata.get("utm_medium")
    utm_campaign = event.utm_campaign or metadata.get("utm_campaign")
    utm_term = event.utm_term or metadata.get("utm_term")
    utm_content = event.utm_content or metadata.get("utm_content")
    referrer = event.referrer or metadata.get("referrer", "direct")
    landing_page = event.landing_page or metadata.get("landing_page")
    
    event_doc = {
        "id": str(uuid.uuid4()),
        "event_type": event.event_type,
        "page": event.page,
        "page_url": event.page_url,
        "page_title": event.page_title,
        "user_id": event.user_id,
        "session_id": event.session_id,
        "visitor_id": event.visitor_id,
        "timestamp": event.timestamp or datetime.now(timezone.utc).isoformat(),
        "location": {
            "latitude": event.latitude,
            "longitude": event.longitude,
            "accuracy": event.accuracy,
            "city": event.city,
            "state": event.state,
            "country": event.country,
            "pincode": event.pincode
        },
        "device": {
            "type": event.device_type,
            "browser": event.browser,
            "browser_version": event.browser_version,
            "os": event.os,
            "screen_width": event.screen_width,
            "screen_height": event.screen_height
        },
        "event_data": {
            "product_id": event.product_id,
            "product_name": event.product_name,
            "category": event.category,
            "value": event.value
        },
        "marketing": {
            "traffic_source": traffic_source,
            "traffic_medium": traffic_medium,
            "traffic_channel": traffic_channel,
            "utm_source": utm_source,
            "utm_medium": utm_medium,
            "utm_campaign": utm_campaign,
            "utm_term": utm_term,
            "utm_content": utm_content,
            "referrer": referrer,
            "landing_page": landing_page,
            "gclid": metadata.get("gclid"),
            "fbclid": metadata.get("fbclid"),
            "msclkid": metadata.get("msclkid"),
            "ref": metadata.get("ref"),
            "affiliate": metadata.get("affiliate")
        },
        "metadata": metadata,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.analytics.insert_one(event_doc)
    return {"status": "tracked", "event_id": event_doc["id"]}

@api_router.get("/admin/analytics/summary")
async def get_analytics_summary(days: int = 30):
    """Get analytics summary for admin dashboard"""
    from_date = datetime.now(timezone.utc) - timedelta(days=days)
    from_date_str = from_date.isoformat()
    
    # Get all events in the time range
    events = await db.analytics.find(
        {"created_at": {"$gte": from_date_str}},
        {"_id": 0}
    ).to_list(10000)
    
    # Calculate summary statistics
    total_events = len(events)
    unique_sessions = len(set(e.get("session_id") for e in events if e.get("session_id")))
    unique_users = len(set(e.get("user_id") for e in events if e.get("user_id")))
    
    # Event type breakdown
    event_types = {}
    for e in events:
        et = e.get("event_type", "unknown")
        event_types[et] = event_types.get(et, 0) + 1
    
    # Page views breakdown
    page_views = {}
    for e in events:
        if e.get("event_type") == "page_view" and e.get("page"):
            page = e["page"]
            page_views[page] = page_views.get(page, 0) + 1
    
    # Device breakdown
    devices = {"mobile": 0, "desktop": 0, "tablet": 0, "unknown": 0}
    for e in events:
        device = e.get("device", {}).get("type", "unknown") or "unknown"
        devices[device] = devices.get(device, 0) + 1
    
    # Browser breakdown
    browsers = {}
    for e in events:
        browser = e.get("device", {}).get("browser", "unknown") or "unknown"
        browsers[browser] = browsers.get(browser, 0) + 1
    
    # Location breakdown (cities)
    cities = {}
    for e in events:
        city = e.get("location", {}).get("city", "unknown") or "unknown"
        if city != "unknown":
            cities[city] = cities.get(city, 0) + 1
    
    # Daily activity
    daily_activity = {}
    for e in events:
        date = e.get("created_at", "")[:10]  # Get YYYY-MM-DD
        if date:
            daily_activity[date] = daily_activity.get(date, 0) + 1
    
    # Top products viewed/added to cart
    product_interactions = {}
    for e in events:
        if e.get("event_type") in ["product_view", "add_to_cart"] and e.get("event_data", {}).get("product_name"):
            prod = e["event_data"]["product_name"]
            product_interactions[prod] = product_interactions.get(prod, 0) + 1
    
    # Conversion funnel
    funnel = {
        "page_views": event_types.get("page_view", 0),
        "product_views": event_types.get("product_view", 0),
        "add_to_cart": event_types.get("add_to_cart", 0),
        "checkout_started": event_types.get("checkout_started", 0),
        "purchase": event_types.get("purchase", 0)
    }
    
    return {
        "summary": {
            "total_events": total_events,
            "unique_sessions": unique_sessions,
            "unique_users": unique_users,
            "period_days": days
        },
        "event_types": event_types,
        "page_views": dict(sorted(page_views.items(), key=lambda x: x[1], reverse=True)[:20]),
        "devices": devices,
        "browsers": dict(sorted(browsers.items(), key=lambda x: x[1], reverse=True)[:10]),
        "cities": dict(sorted(cities.items(), key=lambda x: x[1], reverse=True)[:20]),
        "daily_activity": dict(sorted(daily_activity.items())),
        "product_interactions": dict(sorted(product_interactions.items(), key=lambda x: x[1], reverse=True)[:20]),
        "conversion_funnel": funnel
    }

@api_router.get("/admin/analytics/events")
async def get_analytics_events(
    limit: int = 100,
    event_type: Optional[str] = None,
    user_id: Optional[str] = None
):
    """Get recent analytics events"""
    query = {}
    if event_type:
        query["event_type"] = event_type
    if user_id:
        query["user_id"] = user_id
    
    events = await db.analytics.find(query, {"_id": 0}).sort("created_at", -1).to_list(limit)
    return events

@api_router.get("/admin/analytics/locations")
async def get_analytics_locations():
    """Get location data with coordinates for map visualization"""
    events = await db.analytics.find(
        {"location.latitude": {"$ne": None}},
        {"_id": 0, "location": 1, "user_id": 1, "event_type": 1, "created_at": 1}
    ).sort("created_at", -1).to_list(500)
    
    # Aggregate by location
    locations = {}
    for e in events:
        loc = e.get("location", {})
        if loc.get("latitude") and loc.get("longitude"):
            key = f"{loc['latitude']:.4f},{loc['longitude']:.4f}"
            if key not in locations:
                locations[key] = {
                    "latitude": loc["latitude"],
                    "longitude": loc["longitude"],
                    "city": loc.get("city"),
                    "count": 0,
                    "users": set()
                }
            locations[key]["count"] += 1
            if e.get("user_id"):
                locations[key]["users"].add(e["user_id"])
    
    # Convert to list
    result = []
    for loc in locations.values():
        result.append({
            "latitude": loc["latitude"],
            "longitude": loc["longitude"],
            "city": loc["city"],
            "event_count": loc["count"],
            "unique_users": len(loc["users"])
        })
    
    return result

@api_router.get("/admin/analytics/user-journeys")
async def get_user_journeys(limit: int = 50):
    """Get user journey patterns"""
    # Get sessions with multiple events
    pipeline = [
        {"$group": {
            "_id": "$session_id",
            "events": {"$push": {"event_type": "$event_type", "page": "$page", "timestamp": "$timestamp"}},
            "user_id": {"$first": "$user_id"},
            "visitor_id": {"$first": "$visitor_id"},
            "event_count": {"$sum": 1},
            "first_event": {"$min": "$timestamp"},
            "last_event": {"$max": "$timestamp"}
        }},
        {"$match": {"event_count": {"$gte": 3}}},
        {"$sort": {"last_event": -1}},
        {"$limit": limit}
    ]
    
    journeys = await db.analytics.aggregate(pipeline).to_list(limit)
    
    result = []
    for j in journeys:
        events = sorted(j.get("events", []), key=lambda x: x.get("timestamp", ""))
        result.append({
            "session_id": j["_id"],
            "user_id": j.get("user_id"),
            "visitor_id": j.get("visitor_id"),
            "event_count": j["event_count"],
            "duration_seconds": 0,  # Would need to calculate from timestamps
            "pages_visited": list(set(e.get("page") for e in events if e.get("page"))),
            "events": events[:20]  # Limit events returned
        })
    
    return result

@api_router.get("/admin/analytics/location-funnel")
async def get_location_funnel(days: int = 30):
    """Get location-wise funnel data including anonymous users"""
    start_date = (datetime.now(timezone.utc) - timedelta(days=days)).isoformat()
    
    # Aggregate events by location (city, state, country)
    pipeline = [
        {"$match": {
            "created_at": {"$gte": start_date},
            "location.city": {"$exists": True, "$nin": ["Unknown", None, ""]}
        }},
        {"$group": {
            "_id": {
                "city": "$location.city",
                "state": "$location.state",
                "country": "$location.country"
            },
            "latitude": {"$first": "$location.latitude"},
            "longitude": {"$first": "$location.longitude"},
            "total_events": {"$sum": 1},
            "unique_visitors": {"$addToSet": "$visitor_id"},
            "unique_sessions": {"$addToSet": "$session_id"},
            "logged_in_users": {"$addToSet": {"$cond": [{"$ne": ["$user_id", None]}, "$user_id", "$$REMOVE"]}},
            "page_views": {"$sum": {"$cond": [{"$eq": ["$event_type", "page_view"]}, 1, 0]}},
            "product_views": {"$sum": {"$cond": [{"$eq": ["$event_type", "product_view"]}, 1, 0]}},
            "add_to_cart": {"$sum": {"$cond": [{"$eq": ["$event_type", "add_to_cart"]}, 1, 0]}},
            "checkout_started": {"$sum": {"$cond": [{"$eq": ["$event_type", "checkout_started"]}, 1, 0]}},
            "purchases": {"$sum": {"$cond": [{"$eq": ["$event_type", "purchase"]}, 1, 0]}},
            # Track anonymous events (no user_id)
            "anonymous_page_views": {"$sum": {"$cond": [
                {"$and": [{"$eq": ["$event_type", "page_view"]}, {"$eq": ["$user_id", None]}]}, 1, 0
            ]}},
            "anonymous_cart_adds": {"$sum": {"$cond": [
                {"$and": [{"$eq": ["$event_type", "add_to_cart"]}, {"$eq": ["$user_id", None]}]}, 1, 0
            ]}}
        }},
        {"$project": {
            "_id": 0,
            "city": "$_id.city",
            "state": "$_id.state",
            "country": "$_id.country",
            "latitude": 1,
            "longitude": 1,
            "total_events": 1,
            "unique_visitors": {"$size": "$unique_visitors"},
            "unique_sessions": {"$size": "$unique_sessions"},
            "logged_in_users": {"$size": "$logged_in_users"},
            "anonymous_visitors": {"$subtract": [{"$size": "$unique_visitors"}, {"$size": "$logged_in_users"}]},
            "page_views": 1,
            "product_views": 1,
            "add_to_cart": 1,
            "checkout_started": 1,
            "purchases": 1,
            "anonymous_page_views": 1,
            "anonymous_cart_adds": 1
        }},
        {"$sort": {"total_events": -1}},
        {"$limit": 100}
    ]
    
    locations = await db.analytics.aggregate(pipeline).to_list(100)
    return locations

@api_router.get("/admin/analytics/realtime")
async def get_realtime_analytics():
    """Get real-time analytics (last 30 minutes)"""
    from_time = datetime.now(timezone.utc) - timedelta(minutes=30)
    from_time_str = from_time.isoformat()
    
    events = await db.analytics.find(
        {"created_at": {"$gte": from_time_str}},
        {"_id": 0}
    ).to_list(1000)
    
    active_sessions = set(e.get("session_id") for e in events)
    active_users = set(e.get("user_id") for e in events if e.get("user_id"))
    
    # Events by minute
    events_by_minute = {}
    for e in events:
        minute = e.get("created_at", "")[:16]  # YYYY-MM-DDTHH:MM
        events_by_minute[minute] = events_by_minute.get(minute, 0) + 1
    
    # Current pages
    page_sessions = {}
    for e in events:
        if e.get("event_type") == "page_view":
            page = e.get("page", "unknown")
            page_sessions[page] = page_sessions.get(page, set())
            page_sessions[page].add(e.get("session_id"))
    
    current_pages = {page: len(sessions) for page, sessions in page_sessions.items()}
    
    return {
        "active_sessions": len(active_sessions),
        "active_users": len(active_users),
        "events_last_30_min": len(events),
        "events_by_minute": dict(sorted(events_by_minute.items())),
        "current_pages": dict(sorted(current_pages.items(), key=lambda x: x[1], reverse=True)[:10])
    }

@api_router.get("/admin/analytics/errors")
async def get_analytics_errors(days: int = 7):
    """Get error analytics"""
    from_date = datetime.now(timezone.utc) - timedelta(days=days)
    from_date_str = from_date.isoformat()
    
    errors = await db.analytics.find(
        {
            "event_type": {"$in": ["error", "api_error"]},
            "created_at": {"$gte": from_date_str}
        },
        {"_id": 0}
    ).sort("created_at", -1).to_list(500)
    
    # Group by error type/message
    error_groups = {}
    for e in errors:
        error_msg = e.get("metadata", {}).get("error_message", "Unknown")
        error_type = e.get("metadata", {}).get("error_type", e.get("event_type"))
        key = f"{error_type}:{error_msg[:50]}"
        if key not in error_groups:
            error_groups[key] = {
                "error_type": error_type,
                "message": error_msg,
                "count": 0,
                "first_seen": e.get("created_at"),
                "last_seen": e.get("created_at"),
                "affected_pages": set(),
                "affected_users": set()
            }
        error_groups[key]["count"] += 1
        error_groups[key]["last_seen"] = e.get("created_at")
        if e.get("page"):
            error_groups[key]["affected_pages"].add(e["page"])
        if e.get("user_id"):
            error_groups[key]["affected_users"].add(e["user_id"])
    
    # Convert to list
    result = []
    for key, data in error_groups.items():
        result.append({
            "error_type": data["error_type"],
            "message": data["message"],
            "count": data["count"],
            "first_seen": data["first_seen"],
            "last_seen": data["last_seen"],
            "affected_pages": list(data["affected_pages"]),
            "affected_users_count": len(data["affected_users"])
        })
    
    return sorted(result, key=lambda x: x["count"], reverse=True)

@api_router.get("/admin/analytics/engagement")
async def get_engagement_analytics(days: int = 30):
    """Get user engagement analytics"""
    from_date = datetime.now(timezone.utc) - timedelta(days=days)
    from_date_str = from_date.isoformat()
    
    events = await db.analytics.find(
        {"created_at": {"$gte": from_date_str}},
        {"_id": 0, "session_id": 1, "visitor_id": 1, "event_type": 1, "metadata": 1, "created_at": 1}
    ).to_list(10000)
    
    # Calculate metrics
    sessions = {}
    visitors = {}
    
    for e in events:
        sid = e.get("session_id")
        vid = e.get("visitor_id")
        
        if sid:
            if sid not in sessions:
                sessions[sid] = {"events": 0, "pages": set(), "has_purchase": False}
            sessions[sid]["events"] += 1
            if e.get("event_type") == "page_view":
                sessions[sid]["pages"].add(e.get("metadata", {}).get("page_name", "unknown"))
            if e.get("event_type") == "purchase":
                sessions[sid]["has_purchase"] = True
        
        if vid:
            if vid not in visitors:
                visitors[vid] = {"sessions": set(), "is_returning": False}
            visitors[vid]["sessions"].add(sid)
            if e.get("metadata", {}).get("is_new_visitor") == False:
                visitors[vid]["is_returning"] = True
    
    # Calculate averages
    total_sessions = len(sessions)
    avg_events_per_session = sum(s["events"] for s in sessions.values()) / max(total_sessions, 1)
    avg_pages_per_session = sum(len(s["pages"]) for s in sessions.values()) / max(total_sessions, 1)
    bounce_rate = sum(1 for s in sessions.values() if s["events"] <= 1) / max(total_sessions, 1) * 100
    conversion_rate = sum(1 for s in sessions.values() if s["has_purchase"]) / max(total_sessions, 1) * 100
    
    returning_visitors = sum(1 for v in visitors.values() if v["is_returning"])
    new_visitors = len(visitors) - returning_visitors
    
    return {
        "total_sessions": total_sessions,
        "total_visitors": len(visitors),
        "new_visitors": new_visitors,
        "returning_visitors": returning_visitors,
        "returning_visitor_rate": returning_visitors / max(len(visitors), 1) * 100,
        "avg_events_per_session": round(avg_events_per_session, 2),
        "avg_pages_per_session": round(avg_pages_per_session, 2),
        "bounce_rate": round(bounce_rate, 2),
        "conversion_rate": round(conversion_rate, 2)
    }

@api_router.get("/admin/analytics/utm")
async def get_utm_analytics(days: int = 30):
    """Get UTM campaign analytics"""
    from_date = datetime.now(timezone.utc) - timedelta(days=days)
    from_date_str = from_date.isoformat()
    
    # Query events with marketing data
    events = await db.analytics.find(
        {"created_at": {"$gte": from_date_str}},
        {"_id": 0, "session_id": 1, "metadata": 1, "marketing": 1, "event_type": 1}
    ).to_list(10000)
    
    # Group by campaign
    campaigns = {}
    for e in events:
        # Try to get from marketing object first, fallback to metadata
        marketing = e.get("marketing", {})
        meta = e.get("metadata", {})
        
        source = marketing.get("utm_source") or meta.get("utm_source")
        medium = marketing.get("utm_medium") or meta.get("utm_medium")
        campaign = marketing.get("utm_campaign") or meta.get("utm_campaign")
        
        # Skip if no UTM source
        if not source:
            continue
            
        key = f"{source}/{medium or 'none'}/{campaign or 'none'}"
        
        if key not in campaigns:
            campaigns[key] = {
                "source": source,
                "medium": medium or "none",
                "campaign": campaign or "none",
                "sessions": set(),
                "page_views": 0,
                "conversions": 0
            }
        
        campaigns[key]["sessions"].add(e.get("session_id"))
        if e.get("event_type") == "page_view":
            campaigns[key]["page_views"] += 1
        if e.get("event_type") == "purchase":
            campaigns[key]["conversions"] += 1
    
    result = []
    for data in campaigns.values():
        result.append({
            "source": data["source"],
            "medium": data["medium"],
            "campaign": data["campaign"],
            "sessions": len(data["sessions"]),
            "page_views": data["page_views"],
            "conversions": data["conversions"],
            "conversion_rate": data["conversions"] / max(len(data["sessions"]), 1) * 100
        })
    
    return sorted(result, key=lambda x: x["sessions"], reverse=True)

@api_router.get("/admin/analytics/traffic-sources")
async def get_traffic_sources(days: int = 30):
    """Get traffic sources breakdown (social, search, direct, referral)"""
    from_date = datetime.now(timezone.utc) - timedelta(days=days)
    from_date_str = from_date.isoformat()
    
    events = await db.analytics.find(
        {"created_at": {"$gte": from_date_str}},
        {"_id": 0, "session_id": 1, "marketing": 1, "metadata": 1, "event_type": 1}
    ).to_list(10000)
    
    # Group by traffic source
    sources = {}
    channels = {}
    
    for e in events:
        marketing = e.get("marketing", {})
        meta = e.get("metadata", {})
        
        source = marketing.get("traffic_source") or meta.get("traffic_source", "direct")
        channel = marketing.get("traffic_channel") or meta.get("traffic_channel", "direct")
        session_id = e.get("session_id")
        event_type = e.get("event_type")
        
        # Aggregate by source
        if source not in sources:
            sources[source] = {"sessions": set(), "events": 0, "conversions": 0, "add_to_cart": 0}
        sources[source]["sessions"].add(session_id)
        sources[source]["events"] += 1
        if event_type == "purchase":
            sources[source]["conversions"] += 1
        if event_type == "add_to_cart":
            sources[source]["add_to_cart"] += 1
            
        # Aggregate by channel
        if channel not in channels:
            channels[channel] = {"sessions": set(), "events": 0, "conversions": 0}
        channels[channel]["sessions"].add(session_id)
        channels[channel]["events"] += 1
        if event_type == "purchase":
            channels[channel]["conversions"] += 1
    
    # Format results
    sources_list = []
    for name, data in sources.items():
        session_count = len(data["sessions"])
        sources_list.append({
            "source": name,
            "sessions": session_count,
            "events": data["events"],
            "conversions": data["conversions"],
            "add_to_cart": data["add_to_cart"],
            "conversion_rate": (data["conversions"] / max(session_count, 1)) * 100
        })
    
    channels_list = []
    for name, data in channels.items():
        session_count = len(data["sessions"])
        channels_list.append({
            "channel": name,
            "sessions": session_count,
            "events": data["events"],
            "conversions": data["conversions"],
            "conversion_rate": (data["conversions"] / max(session_count, 1)) * 100
        })
    
    return {
        "sources": sorted(sources_list, key=lambda x: x["sessions"], reverse=True),
        "channels": sorted(channels_list, key=lambda x: x["sessions"], reverse=True)
    }

@api_router.post("/auth/signup")
async def signup(user_data: UserCreate):
    # Allow same phone to have different roles (customer vs delivery_boy)
    existing = await db.users.find_one({"phone": user_data.phone, "role": "customer"}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=400, detail="Phone already registered as customer")
    
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
    user_doc.pop("password", None)
    user_doc.pop("_id", None)
    
    # Generate JWT token
    token = create_jwt_token(user_doc["id"], user_doc["phone"], "customer")
    
    return {"token": token, "user": user_doc}

# Register endpoint (alias for signup - Flutter compatibility)
class RegisterRequest(BaseModel):
    phone: str
    password: str
    name: Optional[str] = None
    email: Optional[str] = None

@api_router.post("/auth/register")
async def register(data: RegisterRequest):
    """Register a new user (Flutter app compatibility)"""
    # Check if user already exists
    existing = await db.users.find_one({"phone": data.phone, "role": "customer"}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=400, detail="Phone already registered")
    
    hashed_password = pwd_context.hash(data.password)
    
    user_doc = {
        "id": str(uuid.uuid4()),
        "phone": data.phone,
        "name": data.name or f"User_{data.phone[-4:]}",
        "email": data.email,
        "password": hashed_password,
        "address": None,
        "role": "customer",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.users.insert_one(user_doc)
    user_doc.pop("password", None)
    user_doc.pop("_id", None)
    
    # Generate JWT token
    token = create_jwt_token(user_doc["id"], user_doc["phone"], "customer")
    
    return {"token": token, "user": user_doc}

@api_router.post("/auth/login")
async def login(login_data: UserLogin):
    # Login for customers and vendors (not delivery boys or admin)
    user = await db.users.find_one({"phone": login_data.phone, "role": {"$in": ["customer", "vendor"]}}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if not pwd_context.verify(login_data.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    user.pop("password", None)
    
    # Generate JWT token
    token = create_jwt_token(user["id"], user["phone"], user.get("role", "customer"))
    
    return {"token": token, "user": user}

# ============ Password Change & Reset ============

@api_router.post("/auth/change-password")
async def change_password(user_id: str, data: ChangePasswordRequest):
    """Allow user to change their own password"""
    user = await db.users.find_one({"id": user_id}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Verify current password
    if not pwd_context.verify(data.current_password, user["password"]):
        raise HTTPException(status_code=400, detail="Current password is incorrect")
    
    # Validate new password
    if len(data.new_password) < 6:
        raise HTTPException(status_code=400, detail="New password must be at least 6 characters")
    
    # Hash and update password
    hashed_password = pwd_context.hash(data.new_password)
    await db.users.update_one({"id": user_id}, {"$set": {"password": hashed_password}})
    
    return {"success": True, "message": "Password changed successfully"}

@api_router.post("/admin/users/{user_id}/reset-password")
async def admin_reset_password(user_id: str, data: AdminResetPasswordRequest):
    """Allow admin to reset any user's password"""
    user = await db.users.find_one({"id": user_id}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Validate new password
    if len(data.new_password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")
    
    # Hash and update password
    hashed_password = pwd_context.hash(data.new_password)
    await db.users.update_one({"id": user_id}, {"$set": {"password": hashed_password}})
    
    return {"success": True, "message": f"Password reset successfully for {user['name']}"}

class AdminLoginRequest(BaseModel):
    username: str
    password: str

@api_router.post("/admin/login")
async def admin_login(data: AdminLoginRequest):
    if secrets.compare_digest(data.username, admin_username) and secrets.compare_digest(data.password, admin_password):
        token = create_jwt_token("admin", admin_username, "admin")
        return {"success": True, "role": "admin", "name": "Admin", "id": "admin", "token": token}
    raise HTTPException(status_code=401, detail="Invalid admin credentials")

@api_router.post("/admin/clear-database")
async def clear_database(username: str, password: str, confirm: str):
    """Clear all user data from database (admin only) - keeps products and settings"""
    # Verify admin credentials
    if username != admin_username or password != admin_password:
        raise HTTPException(status_code=401, detail="Invalid admin credentials")
    
    # Require confirmation
    if confirm != "CLEAR_ALL_DATA":
        raise HTTPException(status_code=400, detail="Please provide confirm='CLEAR_ALL_DATA' to proceed")
    
    collections_to_clear = [
        "users",
        "subscriptions", 
        "subscription_items",
        "orders",
        "order_items",
        "deliveries",
        "payments",
        "addresses",
        "coupons",
        "referrers",
        "otps"
    ]
    
    results = {}
    for col_name in collections_to_clear:
        result = await db[col_name].delete_many({})
        results[col_name] = result.deleted_count
    
    return {
        "success": True,
        "message": "Database cleared successfully",
        "deleted": results,
        "kept": ["products", "settings"]
    }

@api_router.post("/admin/seed-database")
async def seed_database(username: str, password: str):
    """Seed production database with initial products and settings (admin only)"""
    # Verify admin credentials
    if username != admin_username or password != admin_password:
        raise HTTPException(status_code=401, detail="Invalid admin credentials")
    
    # All 23 Products Data - matches Product model schema
    initial_products = [
        {"id": str(uuid.uuid4()), "name": "Turnip Microgreens", "benefit": "High in vitamin C, calcium, and potassium. Supports bone health and immune function.", "nutrients": "Vitamins: A, C, K | Minerals: Calcium, Iron, Potassium | Antioxidants: Beta-carotene", "price": 180.0, "growth_days": 8, "stock": 50, "active": True, "image": "https://images.unsplash.com/photo-1647613233056-fc9918256a8d?crop=entropy&cs=srgb&fm=jpg&q=85", "created_at": datetime.now(timezone.utc).isoformat()},
        {"id": str(uuid.uuid4()), "name": "Basil Microgreens", "benefit": "Rich in antioxidants and anti-inflammatory compounds. Aids digestion and reduces stress.", "nutrients": "Vitamins: A, C, K | Minerals: Calcium, Iron, Magnesium | Essential oils: Eugenol, Linalool", "price": 190.0, "growth_days": 12, "stock": 50, "active": True, "image": "https://images.unsplash.com/photo-1653076446136-705337f5d2a1?crop=entropy&cs=srgb&fm=jpg&q=85", "created_at": datetime.now(timezone.utc).isoformat()},
        {"id": str(uuid.uuid4()), "name": "Green Pea Shoot Microgreens", "benefit": "Excellent source of plant protein and fiber. Supports heart health and blood sugar control.", "nutrients": "Vitamins: A, C, K, Folate | Minerals: Iron, Zinc | Protein: 7g per 100g", "price": 150.0, "growth_days": 10, "stock": 50, "active": True, "image": "https://images.unsplash.com/photo-1633133451255-5e7b18ba768a?crop=entropy&cs=srgb&fm=jpg&q=85", "created_at": datetime.now(timezone.utc).isoformat()},
        {"id": str(uuid.uuid4()), "name": "Oats Microgreens", "benefit": "Contains beta-glucan fiber for cholesterol reduction. Supports digestive and heart health.", "nutrients": "Vitamins: B-complex, E | Minerals: Manganese, Phosphorus | Fiber: Soluble and Insoluble", "price": 150.0, "growth_days": 9, "stock": 50, "active": True, "image": "https://images.unsplash.com/photo-1647613233075-e0d5546b0f22?crop=entropy&cs=srgb&fm=jpg&q=85", "created_at": datetime.now(timezone.utc).isoformat()},
        {"id": str(uuid.uuid4()), "name": "Sweet Corn Microgreens", "benefit": "High in lutein and zeaxanthin for eye health. Natural sweetness with low calories.", "nutrients": "Vitamins: A, B, C | Minerals: Magnesium, Potassium | Carotenoids: Lutein, Zeaxanthin", "price": 160.0, "growth_days": 10, "stock": 50, "active": True, "image": "https://images.unsplash.com/photo-1647613233056-fc9918256a8d?crop=entropy&cs=srgb&fm=jpg&q=85", "created_at": datetime.now(timezone.utc).isoformat()},
        {"id": str(uuid.uuid4()), "name": "Cabbage Microgreens", "benefit": "Contains sulforaphane for cancer prevention. Supports liver detoxification and gut health.", "nutrients": "Vitamins: C, K, B6 | Minerals: Calcium, Potassium | Compounds: Sulforaphane, Indoles", "price": 180.0, "growth_days": 11, "stock": 50, "active": True, "image": "https://images.unsplash.com/photo-1653076446136-705337f5d2a1?crop=entropy&cs=srgb&fm=jpg&q=85", "created_at": datetime.now(timezone.utc).isoformat()},
        {"id": str(uuid.uuid4()), "name": "Cauliflower Microgreens", "benefit": "Anti-inflammatory properties. Rich in choline for brain health and cognitive function.", "nutrients": "Vitamins: C, K, B9 | Minerals: Manganese, Potassium | Choline: 45mg per 100g", "price": 200.0, "growth_days": 11, "stock": 50, "active": True, "image": "https://images.unsplash.com/photo-1633133451255-5e7b18ba768a?crop=entropy&cs=srgb&fm=jpg&q=85", "created_at": datetime.now(timezone.utc).isoformat()},
        {"id": str(uuid.uuid4()), "name": "Pak Choi Microgreens", "benefit": "Powerhouse of vitamins. Supports bone health, immunity, and cardiovascular function.", "nutrients": "Vitamins: A, C, K | Minerals: Calcium, Iron, Folate | Antioxidants: Beta-carotene", "price": 165.0, "growth_days": 10, "stock": 50, "active": True, "image": "https://images.unsplash.com/photo-1647613233075-e0d5546b0f22?crop=entropy&cs=srgb&fm=jpg&q=85", "created_at": datetime.now(timezone.utc).isoformat()},
        {"id": str(uuid.uuid4()), "name": "Red Amaranthus Microgreens", "benefit": "High in protein and lysine. Supports muscle growth and reduces inflammation.", "nutrients": "Vitamins: A, C, K, E | Minerals: Iron, Calcium, Magnesium | Protein: 9g per 100g", "price": 190.0, "growth_days": 9, "stock": 50, "active": True, "image": "https://images.unsplash.com/photo-1647613233056-fc9918256a8d?crop=entropy&cs=srgb&fm=jpg&q=85", "created_at": datetime.now(timezone.utc).isoformat()},
        {"id": str(uuid.uuid4()), "name": "Alfalfa Microgreens", "benefit": "Complete source of vitamins and minerals. Detoxifies liver and reduces cholesterol.", "nutrients": "Vitamins: K, C, A, B-complex | Minerals: Calcium, Iron, Zinc | Chlorophyll: High", "price": 160.0, "growth_days": 8, "stock": 50, "active": True, "image": "https://images.unsplash.com/photo-1653076446136-705337f5d2a1?crop=entropy&cs=srgb&fm=jpg&q=85", "created_at": datetime.now(timezone.utc).isoformat()},
        {"id": str(uuid.uuid4()), "name": "Radish Microgreens", "benefit": "Spicy flavor with high vitamin C. Supports digestion and liver detoxification.", "nutrients": "Vitamins: C, A, K | Minerals: Calcium, Iron | Enzymes: Myrosinase", "price": 150.0, "growth_days": 7, "stock": 50, "active": True, "image": "https://images.unsplash.com/photo-1633133451255-5e7b18ba768a?crop=entropy&cs=srgb&fm=jpg&q=85", "created_at": datetime.now(timezone.utc).isoformat()},
        {"id": str(uuid.uuid4()), "name": "Clover Microgreens", "benefit": "Isoflavones for hormonal balance. Supports heart health and bone density.", "nutrients": "Vitamins: C, K, A | Minerals: Calcium, Magnesium | Isoflavones: Genistein, Daidzein", "price": 150.0, "growth_days": 9, "stock": 50, "active": True, "image": "https://images.unsplash.com/photo-1647613233075-e0d5546b0f22?crop=entropy&cs=srgb&fm=jpg&q=85", "created_at": datetime.now(timezone.utc).isoformat()},
        {"id": str(uuid.uuid4()), "name": "Beet Root Microgreens", "benefit": "Natural nitrates for blood pressure control. Improves athletic performance and stamina.", "nutrients": "Vitamins: A, C, K | Minerals: Iron, Potassium, Magnesium | Nitrates: 250mg per 100g", "price": 180.0, "growth_days": 10, "stock": 50, "active": True, "image": "https://images.unsplash.com/photo-1647613233056-fc9918256a8d?crop=entropy&cs=srgb&fm=jpg&q=85", "created_at": datetime.now(timezone.utc).isoformat()},
        {"id": str(uuid.uuid4()), "name": "Fenugreek Microgreens", "benefit": "Regulates blood sugar and cholesterol. Supports lactation and digestive health.", "nutrients": "Vitamins: A, C, K | Minerals: Iron, Calcium | Fiber: 3g per 100g", "price": 150.0, "growth_days": 8, "stock": 50, "active": True, "image": "https://images.unsplash.com/photo-1653076446136-705337f5d2a1?crop=entropy&cs=srgb&fm=jpg&q=85", "created_at": datetime.now(timezone.utc).isoformat()},
        {"id": str(uuid.uuid4()), "name": "Kohlrabi Purple Microgreens", "benefit": "Rich in anthocyanins. Anti-inflammatory and supports immune system health.", "nutrients": "Vitamins: C, B6, K | Minerals: Potassium, Copper | Anthocyanins: High", "price": 190.0, "growth_days": 9, "stock": 50, "active": True, "image": "https://images.unsplash.com/photo-1633133451255-5e7b18ba768a?crop=entropy&cs=srgb&fm=jpg&q=85", "created_at": datetime.now(timezone.utc).isoformat()},
        {"id": str(uuid.uuid4()), "name": "Kale Purple Microgreens", "benefit": "Superfood with highest antioxidant content. Supports eye, bone, and heart health.", "nutrients": "Vitamins: A, C, K (1000% DV) | Minerals: Calcium, Iron | Antioxidants: Quercetin, Kaempferol", "price": 200.0, "growth_days": 12, "stock": 50, "active": True, "image": "https://images.unsplash.com/photo-1647613233075-e0d5546b0f22?crop=entropy&cs=srgb&fm=jpg&q=85", "created_at": datetime.now(timezone.utc).isoformat()},
        {"id": str(uuid.uuid4()), "name": "Red Carrot Microgreens", "benefit": "Beta-carotene for vision and skin health. Powerful antioxidant properties.", "nutrients": "Vitamins: A (300% DV), C, K | Minerals: Potassium | Carotenoids: Alpha & Beta-carotene", "price": 190.0, "growth_days": 10, "stock": 50, "active": True, "image": "https://images.unsplash.com/photo-1647613233056-fc9918256a8d?crop=entropy&cs=srgb&fm=jpg&q=85", "created_at": datetime.now(timezone.utc).isoformat()},
        {"id": str(uuid.uuid4()), "name": "Spinach / Palak Microgreens", "benefit": "Iron-rich for energy and blood health. Supports muscle function and cognitive health.", "nutrients": "Vitamins: A, C, K, Folate | Minerals: Iron, Calcium, Magnesium | Nitrates: High", "price": 150.0, "growth_days": 9, "stock": 50, "active": True, "image": "https://images.unsplash.com/photo-1653076446136-705337f5d2a1?crop=entropy&cs=srgb&fm=jpg&q=85", "created_at": datetime.now(timezone.utc).isoformat()},
        {"id": str(uuid.uuid4()), "name": "Red Radish Microgreens", "benefit": "Anthocyanin-rich with peppery flavor. Supports liver detox and anti-aging.", "nutrients": "Vitamins: C, A, K, E | Minerals: Calcium, Iron | Anthocyanins: High", "price": 180.0, "growth_days": 8, "stock": 50, "active": True, "image": "https://images.unsplash.com/photo-1633133451255-5e7b18ba768a?crop=entropy&cs=srgb&fm=jpg&q=85", "created_at": datetime.now(timezone.utc).isoformat()},
        {"id": str(uuid.uuid4()), "name": "Pink Radish Microgreens", "benefit": "Mild flavor with beautiful color. Supports digestion and cardiovascular health.", "nutrients": "Vitamins: C, K, Folate | Minerals: Potassium, Calcium | Flavonoids: High", "price": 190.0, "growth_days": 8, "stock": 50, "active": True, "image": "https://images.unsplash.com/photo-1647613233075-e0d5546b0f22?crop=entropy&cs=srgb&fm=jpg&q=85", "created_at": datetime.now(timezone.utc).isoformat()},
        {"id": str(uuid.uuid4()), "name": "Red Spinach Microgreens", "benefit": "Higher antioxidants than green spinach. Supports blood health and reduces oxidative stress.", "nutrients": "Vitamins: A, C, E, K | Minerals: Iron, Calcium | Betalains: Anti-inflammatory compounds", "price": 195.0, "growth_days": 10, "stock": 50, "active": True, "image": "https://images.unsplash.com/photo-1647613233056-fc9918256a8d?crop=entropy&cs=srgb&fm=jpg&q=85", "created_at": datetime.now(timezone.utc).isoformat()},
        {"id": str(uuid.uuid4()), "name": "Broccoli Microgreens", "benefit": "50x more sulforaphane than mature broccoli. Powerful cancer-fighting properties.", "nutrients": "Vitamins: C, K, A | Minerals: Calcium, Iron | Sulforaphane: 100mg per 100g", "price": 200.0, "growth_days": 11, "stock": 50, "active": True, "image": "https://images.unsplash.com/photo-1653076446136-705337f5d2a1?crop=entropy&cs=srgb&fm=jpg&q=85", "created_at": datetime.now(timezone.utc).isoformat()},
        {"id": str(uuid.uuid4()), "name": "Sunflower Microgreens", "benefit": "Complete protein source with nutty flavor. Rich in vitamins E and selenium for skin health.", "nutrients": "Vitamins: E (200% DV), B-complex | Minerals: Selenium, Zinc, Iron | Protein: 6g per 100g", "price": 160.0, "growth_days": 10, "stock": 50, "active": True, "image": "https://images.unsplash.com/photo-1633133451255-5e7b18ba768a?crop=entropy&cs=srgb&fm=jpg&q=85", "created_at": datetime.now(timezone.utc).isoformat()},
    ]
    
    # Initial Settings Data
    initial_settings = [
        {
            "type": "shop_config",
            "data": {
                "address": "E-312, ACE City, Noida Extension, 201306",
                "latitude": 28.5672,
                "longitude": 77.4538,
                "phone": "+91 9876543210",
                "email": "hello@khurpistore.in",
                "delivery_radius_km": 15,
                "free_delivery_threshold": 1000
            }
        },
        {
            "type": "delivery_pricing",
            "data": {
                "tiers": [
                    {"min_distance": 0, "max_distance": 1, "fee": 0, "label": "Free Delivery"},
                    {"min_distance": 1, "max_distance": 3, "fee": 30, "label": "Nearby"},
                    {"min_distance": 3, "max_distance": 5, "fee": 50, "label": "Standard"},
                    {"min_distance": 5, "max_distance": 10, "fee": 80, "label": "Extended"},
                    {"min_distance": 10, "max_distance": 15, "fee": 120, "label": "Far"}
                ]
            }
        },
        {
            "type": "subscription_plans",
            "data": [
                {"id": "once_week", "name": "Once a Week", "frequency": "once_week", "deliveries_per_week": 1, "discount": 0, "description": "Perfect for trying out"},
                {"id": "twice_week", "name": "Twice a Week", "frequency": "twice_week", "deliveries_per_week": 2, "discount": 10, "description": "Most popular choice"},
                {"id": "four_days_week", "name": "4 Days a Week", "frequency": "four_days_week", "deliveries_per_week": 4, "discount": 50, "description": "Best value - Maximum freshness"}
            ]
        },
        {
            "type": "privacy_policy",
            "data": {
                "title": "Privacy Policy",
                "last_updated": datetime.now(timezone.utc).isoformat(),
                "content": """# Privacy Policy

**Last Updated: January 2026**

At Khurpi Microgreens, we are committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information.

## Information We Collect

### Personal Information
- **Contact Details:** Name, phone number, email address
- **Delivery Address:** Complete address with location coordinates for accurate delivery
- **Payment Information:** Transaction details processed securely through Razorpay

### Usage Information
- Order history and preferences
- Device information and IP address for security purposes

## How We Use Your Information

1. **Order Processing:** To fulfill your orders and manage deliveries
2. **Communication:** Order updates, delivery notifications, and promotional offers (with consent)
3. **Improvement:** To enhance our products and services
4. **Security:** To prevent fraud and ensure safe transactions

## Data Security

- All payment transactions are encrypted and processed through Razorpay
- We use industry-standard security measures to protect your data
- Access to personal information is restricted to authorized personnel only

## Your Rights

- **Access:** Request a copy of your personal data
- **Correction:** Update inaccurate information
- **Deletion:** Request removal of your data (subject to legal requirements)
- **Opt-out:** Unsubscribe from marketing communications

## Contact Us

For privacy-related queries, contact us at:
- **Email:** hello@khurpistore.in
- **Phone:** +91 9876543210

## Changes to This Policy

We may update this policy periodically. Significant changes will be communicated via email or app notification."""
            }
        },
        {
            "type": "terms_conditions",
            "data": {
                "title": "Terms and Conditions",
                "last_updated": datetime.now(timezone.utc).isoformat(),
                "content": """# Terms and Conditions

**Last Updated: January 2026**

Welcome to Khurpi Microgreens. By using our website and services, you agree to these terms.

## 1. Products and Orders

### Product Quality
- All microgreens are freshly grown and harvested before delivery
- Product images are representative; actual appearance may vary slightly
- Pack sizes are clearly mentioned (e.g., 80g pack)

### Ordering
- Orders are subject to availability
- Prices are in Indian Rupees (INR) and inclusive of applicable taxes
- We reserve the right to refuse or cancel orders

## 2. Delivery Policy

### Delivery Area
- We deliver **Pan India**
- Delivery fees may vary based on location
- Subscription orders include **FREE delivery**

### Delivery Schedule
- Same-day delivery for orders placed before 10 AM
- Standard delivery within 24-48 hours
- Subscription deliveries on selected days

### Delivery Issues
- Contact us immediately if you don't receive your order
- We are not responsible for delays due to incorrect address or unavailability

## 3. Payment Terms

### Payment Methods
- All payments are processed securely through **Razorpay**
- We accept UPI, Credit/Debit Cards, Net Banking, and Wallets
- Cash on Delivery is **not available**

### Subscription Payments
- Monthly billing cycle
- Auto-renewal unless cancelled
- Cancel anytime from your profile

## 4. User Responsibilities

- Provide accurate delivery information
- Ensure someone is available to receive orders
- Report issues promptly

## 5. Contact Information

**Khurpi Microgreens**
- Email: hello@khurpistore.in
- Phone: +91 9876543210
- Address: E-312, ACE City, Noida Extension, 201306

## 6. Changes to Terms

We may modify these terms at any time. Continued use of our services constitutes acceptance of updated terms."""
            }
        },
        {
            "type": "shipping_policy",
            "data": {
                "title": "Shipping Policy",
                "last_updated": datetime.now(timezone.utc).isoformat(),
                "content": """# Shipping Policy

**Last Updated: January 2026**

At Khurpi Microgreens, we are committed to delivering fresh, healthy microgreens right to your doorstep.

## Delivery Areas

### Currently Serving
- **Pan India Delivery**
- All major cities and towns
- Remote areas may have extended delivery times

## Delivery Charges

### Single Orders
| Distance from Store | Delivery Fee |
|---------------------|--------------|
| 0-1 km | FREE |
| 1-3 km | ₹30 |
| 3-5 km | ₹50 |
| 5-10 km | ₹80 |
| 10-15 km | ₹120 |

### Subscription Orders
- **FREE Delivery** on all subscription plans
- No minimum order value required

## Delivery Schedule

### Order Timings
- Orders placed before **10:00 AM** - Same day delivery
- Orders placed after **10:00 AM** - Next day delivery

### Delivery Days
- **Monday to Saturday**: 8:00 AM - 8:00 PM
- **Sunday**: No deliveries

### Subscription Deliveries
- Delivered on your selected days
- Morning deliveries (8:00 AM - 12:00 PM)
- You'll receive a notification before delivery

## Packaging

- **Eco-friendly packaging** to maintain freshness
- Sealed containers to preserve nutrients
- Temperature-controlled delivery bags
- Recyclable materials used

## Delivery Process

1. **Order Confirmation**: You'll receive an SMS/notification
2. **Dispatch Notification**: When your order leaves our facility
3. **Delivery**: Our delivery partner will contact you
4. **Completion**: Confirm receipt of fresh products

## Important Notes

### Address Accuracy
- Please ensure your delivery address is accurate
- Include landmarks for easy location
- Provide correct phone number for delivery updates

### Recipient Availability
- Someone must be available to receive the order
- Fresh microgreens cannot be left unattended
- Rescheduling available if you're unavailable

### Quality Guarantee
- Products are checked before dispatch
- Report any issues within 2 hours of delivery
- Photos required for quality complaints

## Contact for Delivery Issues

If you face any delivery-related issues:
- **WhatsApp**: +91 9971818259
- **Email**: khurpi.store@gmail.com
- **Response Time**: Within 1 hour during business hours"""
            }
        },
        {
            "type": "cancellation_refund",
            "data": {
                "title": "Cancellations and Refunds",
                "last_updated": datetime.now(timezone.utc).isoformat(),
                "content": """# Cancellations and Refunds Policy

**Last Updated: January 2026**

We want you to be completely satisfied with your Khurpi Microgreens purchase.

## Order Cancellation

### Single Orders

#### Before Dispatch
- **Full refund** if cancelled before order is dispatched
- Cancel from your Orders page or contact us
- Refund processed within 24 hours

#### After Dispatch
- Orders cannot be cancelled once dispatched
- Fresh products are perishable and prepared specifically for you
- Contact us for exceptional circumstances

### Subscription Cancellation

#### How to Cancel
1. Go to **My Subscriptions** in your profile
2. Click on the subscription you want to cancel
3. Select **Cancel Subscription**
4. Confirm cancellation

#### Cancellation Terms
- Cancel anytime without penalty
- Cancellation effective from **next billing cycle**
- Current cycle deliveries will be completed
- No partial refunds for current cycle

#### Pause Option
- Instead of cancelling, you can **pause** your subscription
- Pause for up to 4 weeks
- Resume anytime from your profile

## Refund Policy

### Eligible for Refund

✅ **Quality Issues**
- Damaged or wilted microgreens
- Wrong product delivered
- Missing items from order
- Contaminated products

✅ **Delivery Issues**
- Order not delivered
- Significant delay (more than 24 hours)
- Delivered to wrong address (our error)

### Not Eligible for Refund

❌ **Customer Reasons**
- Change of mind after delivery
- Ordered wrong product
- Not available to receive delivery
- Incorrect address provided by customer

❌ **After Time Limit**
- Complaints raised after 2 hours of delivery
- Products already consumed
- No photo evidence provided

## How to Request Refund

### Step 1: Report Issue
- Contact us within **2 hours** of delivery
- WhatsApp: +91 9971818259
- Email: khurpi.store@gmail.com

### Step 2: Provide Details
- Order ID
- Description of issue
- Clear photos of the problem
- Photos of packaging (if relevant)

### Step 3: Verification
- Our team will review within 2 hours
- We may ask for additional information
- Decision communicated via WhatsApp/Email

### Step 4: Resolution
- **Replacement**: Fresh delivery at no extra cost
- **Refund**: Processed to original payment method
- **Store Credit**: For future purchases

## Refund Timeline

| Payment Method | Refund Time |
|----------------|-------------|
| UPI | 24-48 hours |
| Credit/Debit Card | 5-7 business days |
| Net Banking | 5-7 business days |
| Wallet | 24-48 hours |

## Subscription Refunds

### Monthly Billing
- No refunds for partially used subscription months
- Unused deliveries cannot be carried forward
- Credit may be offered for service issues

### Prepaid Plans
- Pro-rata refund for cancelled prepaid subscriptions
- Calculated based on deliveries completed
- Processing time: 7-10 business days

## Contact Us

For any cancellation or refund queries:

- **WhatsApp** (Fastest): +91 9971818259
- **Email**: khurpi.store@gmail.com
- **Response Time**: Within 1 hour (9 AM - 8 PM)

## Our Commitment

We stand behind the quality of our microgreens. If you're not satisfied, we'll make it right - whether through replacement or refund. Your trust is our priority."""
            }
        }
    ]
    
    results = {"products": 0, "settings": 0}
    
    # Clear and insert products
    await db.products.delete_many({})
    if initial_products:
        await db.products.insert_many(initial_products)
        results["products"] = len(initial_products)
    
    # Clear and insert settings
    await db.settings.delete_many({})
    if initial_settings:
        await db.settings.insert_many(initial_settings)
        results["settings"] = len(initial_settings)
    
    return {
        "success": True,
        "message": "Database seeded successfully",
        "inserted": results
    }

# ============ Delivery Boy Management ============

class DeliveryBoyCreate(BaseModel):
    name: str
    phone: str
    password: str

class DeliveryBoyLogin(BaseModel):
    phone: str
    password: str

@api_router.post("/delivery-boy/login")
async def delivery_boy_login(data: DeliveryBoyLogin):
    """Login for delivery boys"""
    user = await db.users.find_one({"phone": data.phone, "role": "delivery_boy"}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if not pwd_context.verify(data.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    user.pop("password", None)
    return {"success": True, "user": user}

@api_router.get("/delivery-boy/deliveries")
async def get_delivery_boy_deliveries(delivery_boy_id: str):
    """Get today's deliveries for delivery boy"""
    today = datetime.now(timezone.utc).date().isoformat()
    deliveries = await db.deliveries.find({"delivery_date": today}, {"_id": 0}).to_list(500)
    
    result = []
    for delivery in deliveries:
        subscription = await db.subscriptions.find_one({"id": delivery["subscription_id"]}, {"_id": 0})
        if subscription:
            user = await db.users.find_one({"id": subscription["user_id"]}, {"_id": 0})
            items = await db.subscription_items.find({"subscription_id": subscription["id"]}, {"_id": 0}).to_list(100)
            
            # Get address
            address = None
            if subscription.get("address_id"):
                address = await db.addresses.find_one({"id": subscription["address_id"]}, {"_id": 0})
            
            product_details = []
            for item in items:
                product = await db.products.find_one({"id": item["product_id"]}, {"_id": 0})
                if product:
                    product_details.append({
                        "name": product["name"],
                        "quantity": item["quantity"]
                    })
            
            # Format address
            delivery_address = "No address"
            if address:
                parts = [address.get("address_line_1", ""), address.get("address_line_2", ""), 
                        address.get("area", ""), address.get("city", "")]
                delivery_address = ", ".join([p for p in parts if p])
                if address.get("pincode"):
                    delivery_address += f" - {address['pincode']}"
            elif user and user.get("address"):
                delivery_address = user["address"]
            
            result.append({
                "id": delivery["id"],
                "status": delivery["status"],
                "customer_name": user["name"] if user else "Unknown",
                "customer_phone": user["phone"] if user else "N/A",
                "delivery_address": delivery_address,
                "products": product_details,
                "subscription_status": subscription.get("status", "active"),
                "is_skipped": today in subscription.get("skipped_deliveries", [])
            })
    
    # Sort: scheduled first, then delivered, then others
    status_order = {"scheduled": 0, "delivered": 1, "skipped": 2, "failed": 3, "cancelled": 4}
    result.sort(key=lambda x: status_order.get(x["status"], 5))
    
    return result

@api_router.put("/delivery-boy/deliveries/{delivery_id}")
async def update_delivery_status_by_delivery_boy(delivery_id: str, status: str):
    """Update delivery status by delivery boy"""
    valid_statuses = ["delivered", "failed", "skipped"]
    if status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Status must be one of: {', '.join(valid_statuses)}")
    
    result = await db.deliveries.update_one({"id": delivery_id}, {"$set": {"status": status}})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Delivery not found")
    
    return {"success": True, "message": f"Delivery marked as {status}"}

@api_router.post("/admin/delivery-boys")
async def create_delivery_boy(data: DeliveryBoyCreate):
    """Create a new delivery boy (admin only) - same phone can be customer and delivery boy"""
    # Allow same phone to have different roles (customer vs delivery_boy)
    existing = await db.users.find_one({"phone": data.phone, "role": "delivery_boy"}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=400, detail="Phone number already registered as delivery boy")
    
    hashed_password = pwd_context.hash(data.password)
    
    user_doc = {
        "id": str(uuid.uuid4()),
        "phone": data.phone,
        "name": data.name,
        "password": hashed_password,
        "address": None,
        "role": "delivery_boy",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.users.insert_one(user_doc)
    # Return without _id and password
    return {k: v for k, v in user_doc.items() if k not in ['_id', 'password']}

@api_router.get("/admin/delivery-boys")
async def get_all_delivery_boys():
    """Get all delivery boys (admin only)"""
    delivery_boys = await db.users.find({"role": "delivery_boy"}, {"_id": 0, "password": 0}).to_list(100)
    return delivery_boys

@api_router.delete("/admin/delivery-boys/{user_id}")
async def delete_delivery_boy(user_id: str):
    """Delete a delivery boy (admin only)"""
    result = await db.users.delete_one({"id": user_id, "role": "delivery_boy"})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Delivery boy not found")
    return {"success": True}

# ============ OTP Authentication with MSG91 ============

class OTPSendRequest(BaseModel):
    phone: str

class OTPVerifyRequest(BaseModel):
    phone: str
    otp: str
    name: Optional[str] = None

# Default whitelisted phone numbers for testing
DEFAULT_WHITELISTED_PHONES = ["9971818259"]

async def get_whitelisted_phones():
    """Get whitelisted phones from DB or use defaults"""
    settings = await db.settings.find_one({"type": "otp_whitelist"}, {"_id": 0})
    if settings and settings.get("phones"):
        return settings["phones"]
    return DEFAULT_WHITELISTED_PHONES

@api_router.post("/auth/send-otp")
async def send_otp(data: OTPSendRequest):
    """Send OTP via MSG91"""
    phone = data.phone.strip()
    
    # Validate phone number (Indian format)
    if not phone.isdigit() or len(phone) != 10:
        raise HTTPException(status_code=400, detail="Invalid phone number. Enter 10-digit mobile number.")
    
    # Check if phone is whitelisted
    whitelisted_phones = await get_whitelisted_phones()
    is_whitelisted = phone in whitelisted_phones
    
    # Generate 6-digit OTP
    otp = str(random.randint(100000, 999999))
    
    # Store OTP in database with expiry (5 minutes)
    otp_doc = {
        "phone": phone,
        "otp": otp,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "expires_at": (datetime.now(timezone.utc) + timedelta(minutes=5)).isoformat(),
        "verified": False
    }
    
    # Remove any existing OTPs for this phone
    await db.otps.delete_many({"phone": phone})
    await db.otps.insert_one(otp_doc)
    
    # Send OTP via MSG91
    if MSG91_AUTH_KEY:
        try:
            # MSG91 SendOTP API endpoint
            url = "https://control.msg91.com/api/v5/otp"
            
            headers = {
                "authkey": MSG91_AUTH_KEY,
                "Content-Type": "application/json"
            }
            
            payload = {
                "mobile": f"91{phone}",
                "otp": otp,
                "otp_length": 6,
                "otp_expiry": 5
            }
            
            response = requests.post(url, json=payload, headers=headers)
            result = response.json()
            
            logging.info(f"MSG91 response for {phone}: {result}")
            
            if result.get("type") == "success":
                logging.info(f"OTP sent successfully to {phone}: {otp}")
                
                # For whitelisted numbers, always show OTP
                if is_whitelisted:
                    return {
                        "success": True, 
                        "message": f"OTP sent to +91 {phone}",
                        "debug_otp": otp,
                        "whitelisted": True
                    }
                
                # For non-whitelisted, show OTP in test mode until DLT configured
                return {
                    "success": True, 
                    "message": "OTP sent to your phone",
                    "debug_otp": otp  # TODO: Remove in production after MSG91 DLT setup
                }
            else:
                logging.error(f"MSG91 error: {result}")
                return {"success": True, "message": "OTP sent (test mode)", "debug_otp": otp}
        except Exception as e:
            logging.error(f"MSG91 exception: {e}")
            return {"success": True, "message": "OTP sent (test mode)", "debug_otp": otp}
    else:
        # No MSG91 key - return OTP for testing
        logging.info(f"Test mode OTP for {phone}: {otp}")
        return {"success": True, "message": "OTP sent (test mode)", "debug_otp": otp}

@api_router.post("/auth/verify-otp")
async def verify_otp(data: OTPVerifyRequest):
    """Verify OTP and login/signup user (for customers only)"""
    phone = data.phone.strip()
    otp = data.otp.strip()
    
    # Find OTP record
    otp_record = await db.otps.find_one({"phone": phone, "verified": False}, {"_id": 0})
    
    if not otp_record:
        raise HTTPException(status_code=400, detail="No OTP request found. Please request a new OTP.")
    
    # Check expiry
    expires_at = datetime.fromisoformat(otp_record["expires_at"])
    if datetime.now(timezone.utc) > expires_at:
        await db.otps.delete_one({"phone": phone})
        raise HTTPException(status_code=400, detail="OTP expired. Please request a new OTP.")
    
    # Verify OTP
    if otp_record["otp"] != otp:
        raise HTTPException(status_code=400, detail="Invalid OTP. Please try again.")
    
    # Mark OTP as verified and delete it
    await db.otps.delete_one({"phone": phone})
    
    # Check if customer user exists (same phone can be delivery boy separately)
    user = await db.users.find_one({"phone": phone, "role": "customer"}, {"_id": 0})
    
    if user:
        # Existing customer - login
        user.pop("password", None)
        return {"success": True, "user": user, "is_new_user": False}
    else:
        # New customer - create account
        user_name = data.name or f"User{phone[-4:]}"
        
        user_doc = {
            "id": str(uuid.uuid4()),
            "phone": phone,
            "name": user_name,
            "password": pwd_context.hash(str(uuid.uuid4())),  # Random password
            "address": None,
            "role": "customer",
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        
        await db.users.insert_one(user_doc)
        user_doc.pop("password", None)
        
        return {"success": True, "user": user_doc, "is_new_user": True}

@api_router.post("/auth/resend-otp")
async def resend_otp(data: OTPSendRequest):
    """Resend OTP - same as send_otp"""
    return await send_otp(data)

# MSG91 verified OTP endpoint (called after MSG91 widget verification)
class MSG91VerifiedRequest(BaseModel):
    phone: str
    name: Optional[str] = None
    access_token: Optional[str] = None  # MSG91 access token for server verification

# MSG91 Configuration
MSG91_AUTH_KEY = os.environ.get("MSG91_AUTH_KEY", "490446Ty29Y53gM69764e27P1")

async def verify_msg91_access_token(access_token: str) -> dict:
    """Verify MSG91 access token on server side"""
    import httpx
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://api.msg91.com/api/v5/widget/verifyAccessToken",
                json={"access_token": access_token},
                headers={
                    "authkey": MSG91_AUTH_KEY,
                    "content-type": "application/json"
                },
                timeout=10.0
            )
            
            if response.status_code == 200:
                data = response.json()
                return {"verified": True, "data": data}
            else:
                return {"verified": False, "error": response.text}
    except Exception as e:
        logging.error(f"MSG91 token verification error: {e}")
        return {"verified": False, "error": str(e)}

@api_router.post("/auth/otp-verified")
async def otp_verified_login(data: MSG91VerifiedRequest):
    """
    Handle login after MSG91 OTP verification.
    Optionally verifies access token server-side.
    Creates user if not exists, returns user data with JWT token.
    """
    phone = data.phone.strip()
    
    # Server-side verification of MSG91 access token (if provided)
    if data.access_token:
        verification = await verify_msg91_access_token(data.access_token)
        if not verification.get("verified"):
            logging.warning(f"MSG91 token verification failed for {phone}: {verification.get('error')}")
            # Continue anyway for now - client already verified
    
    # Check if user exists
    user = await db.users.find_one({"phone": phone}, {"_id": 0, "password": 0})
    
    if user:
        # Existing user - generate JWT token and return
        token = create_jwt_token(user["id"], user["phone"], user.get("role", "customer"))
        return {"success": True, "user": user, "token": token, "is_new_user": False}
    
    # New user - check if name provided
    if not data.name or not data.name.strip():
        return {"success": True, "is_new_user": True, "message": "Please provide your name"}
    
    # Create new user
    user_doc = {
        "id": str(uuid.uuid4()),
        "phone": phone,
        "name": data.name.strip(),
        "password": pwd_context.hash(str(uuid.uuid4())),  # Random password for OTP users
        "address": None,
        "city": None,
        "pincode": None,
        "role": "customer",
        "verified": True,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.users.insert_one(user_doc)
    user_doc.pop("password", None)
    user_doc.pop("_id", None)
    
    # Generate JWT token for new user
    token = create_jwt_token(user_doc["id"], user_doc["phone"], "customer")
    
    return {"success": True, "user": user_doc, "token": token, "is_new_user": True}

# ============ Razorpay Payment Integration ============

class PaymentOrderRequest(BaseModel):
    amount: float  # Amount in rupees
    receipt: str
    notes: Optional[dict] = None

class PaymentVerifyRequest(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str

@api_router.post("/payments/create-order")
async def create_razorpay_order(data: PaymentOrderRequest):
    """Create a Razorpay order for payment"""
    
    # Test mode - return mock order for testing
    if razorpay_test_mode:
        import random
        mock_order_id = f"order_test_{random.randint(100000, 999999)}"
        return {
            "success": True,
            "order_id": mock_order_id,
            "amount": int(data.amount * 100),
            "currency": "INR",
            "key_id": razorpay_key_id or "rzp_test_mock",
            "test_mode": True
        }
    
    if not razorpay_client:
        raise HTTPException(status_code=500, detail="Payment gateway not configured")
    
    try:
        # Amount in paise (1 INR = 100 paise)
        amount_in_paise = int(data.amount * 100)
        
        order_data = {
            "amount": amount_in_paise,
            "currency": "INR",
            "receipt": data.receipt,
            "notes": data.notes or {}
        }
        
        order = razorpay_client.order.create(data=order_data)
        
        return {
            "success": True,
            "order_id": order["id"],
            "amount": order["amount"],
            "currency": order["currency"],
            "key_id": razorpay_key_id,
            "test_mode": False
        }
    except Exception as e:
        logging.error(f"Razorpay order creation failed: {e}")
        raise HTTPException(status_code=500, detail=f"Payment order creation failed: {str(e)}")

@api_router.post("/payments/verify")
async def verify_razorpay_payment(data: PaymentVerifyRequest):
    """Verify Razorpay payment signature"""
    
    # Test mode - auto-verify for testing
    if razorpay_test_mode:
        # Store mock payment record
        payment_doc = {
            "id": str(uuid.uuid4()),
            "razorpay_order_id": data.razorpay_order_id,
            "razorpay_payment_id": data.razorpay_payment_id,
            "status": "captured",
            "verified_at": datetime.now(timezone.utc).isoformat(),
            "test_mode": True
        }
        await db.payments.insert_one(payment_doc)
        return {"success": True, "verified": True, "test_mode": True}
    
    if not razorpay_client:
        raise HTTPException(status_code=500, detail="Payment gateway not configured")
    
    try:
        # Verify signature
        params_dict = {
            'razorpay_order_id': data.razorpay_order_id,
            'razorpay_payment_id': data.razorpay_payment_id,
            'razorpay_signature': data.razorpay_signature
        }
        
        razorpay_client.utility.verify_payment_signature(params_dict)
        
        # Store payment record
        payment_doc = {
            "id": str(uuid.uuid4()),
            "razorpay_order_id": data.razorpay_order_id,
            "razorpay_payment_id": data.razorpay_payment_id,
            "status": "captured",
            "verified_at": datetime.now(timezone.utc).isoformat()
        }
        
        await db.payments.insert_one(payment_doc)
        
        return {"success": True, "message": "Payment verified successfully"}
    except razorpay.errors.SignatureVerificationError:
        raise HTTPException(status_code=400, detail="Payment verification failed. Invalid signature.")
    except Exception as e:
        logging.error(f"Payment verification error: {e}")
        raise HTTPException(status_code=500, detail=f"Payment verification failed: {str(e)}")

@api_router.get("/payments/config")
async def get_payment_config():
    """Get Razorpay public key for frontend"""
    return {
        "key_id": razorpay_key_id,
        "currency": "INR"
    }

@api_router.get("/products", response_model=List[Product])
async def get_products(active_only: bool = True, project_id: str = Depends(get_project_id)):
    query = {"active": True} if active_only else {}
    query["project_id"] = project_id
    products = await db.products.find(query, {"_id": 0}).to_list(200)
    
    # Build category lookup for resolving names
    categories = await db.categories.find({"project_id": project_id}, {"_id": 0, "id": 1, "name": 1}).to_list(100)
    category_map = {c["id"]: c["name"] for c in categories}
    
    # Auto-sync: Update stock_status to out_of_stock for products with weight=0
    for product in products:
        if product.get("weight", 0) <= 0 and product.get("stock_status") != "out_of_stock":
            await db.products.update_one(
                {"id": product["id"]},
                {"$set": {"stock_status": "out_of_stock", "weight": 0}}
            )
            product["stock_status"] = "out_of_stock"
            product["weight"] = 0
        
        # Resolve category name
        if product.get("category_id"):
            product["category_name"] = category_map.get(product["category_id"])
        
        # Map 'image' to 'image_url' for Flutter app compatibility
        if product.get("image") and not product.get("image_url"):
            product["image_url"] = product["image"]
        if not product.get("images"):
            _primary = product.get("image_url") or product.get("image")
            product["images"] = [_primary] if _primary else []
    
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
    # Map 'image' to 'image_url' for Flutter app compatibility
    if product.get("image") and not product.get("image_url"):
        product["image_url"] = product["image"]
    if not product.get("images"):
        primary = product.get("image_url") or product.get("image")
        product["images"] = [primary] if primary else []
    return Product(**product)

@api_router.post("/products", response_model=Product)
async def create_product(product_data: ProductCreate, project_id: str = Depends(get_project_id)):
    import uuid
    from datetime import datetime
    
    product_doc = {
        "id": str(uuid.uuid4()),
        **product_data.model_dump(),
        "project_id": project_id,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.products.insert_one(product_doc)
    return Product(**product_doc)

@api_router.put("/products/{product_id}", response_model=Product)
async def update_product(product_id: str, product_data: ProductUpdate):
    update_data = product_data.model_dump(exclude_unset=True)
    
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
    
    # Subscriptions get FREE delivery - only calculate for reference/display
    delivery_fee = 0  # FREE for all subscriptions
    delivery_distance = 0
    would_be_delivery_fee = 0  # What would have been charged for single orders
    if selected_address and selected_address.get("latitude") and selected_address.get("longitude"):
        delivery_info = await calculate_delivery_fee(selected_address["latitude"], selected_address["longitude"])
        would_be_delivery_fee = delivery_info["fee"]  # Store for savings display
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
    
    # Calculate subtotal from products using weight-based pricing
    subtotal = 0
    for item in sub_data.items:
        product = await db.products.find_one({"id": item.product_id}, {"_id": 0})
        if product:
            # Price is per 100gm, quantity is in grams
            subtotal += (product["price"] / 100) * item.quantity
    
    # Calculate discount amount
    discount_amount = (subtotal * discount_percent) / 100
    
    # Calculate final total
    final_total = subtotal - discount_amount + delivery_fee
    
    # Check stock availability based on stock_status and weight
    # For subscriptions, we allow "growing" products as they will be available by delivery date
    today = datetime.now(timezone.utc).date()
    requested_date = datetime.fromisoformat(sub_data.start_date).date()
    
    out_of_stock_products = []
    
    for item in sub_data.items:
        product = await db.products.find_one({"id": item.product_id}, {"_id": 0})
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")
        
        stock_status = product.get("stock_status", "in_stock")
        available_weight = product.get("weight", 5000)  # Weight represents available stock in grams
        
        # Only block if product is out_of_stock or requested quantity exceeds available weight
        if stock_status == "out_of_stock":
            out_of_stock_products.append({
                "name": product["name"],
                "reason": "Out of stock"
            })
        elif item.quantity > available_weight:
            out_of_stock_products.append({
                "name": product["name"],
                "reason": f"Only {available_weight}gm available, requested {item.quantity}gm"
            })
    
    # If any products are truly out of stock, reject the order
    if out_of_stock_products:
        products_list = ", ".join([f"{p['name']} ({p['reason']})" for p in out_of_stock_products])
        raise HTTPException(
            status_code=400,
            detail=f"Cannot create subscription: {products_list}"
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
        # Use subtotal from frontend if provided (monthly total before bulk discount)
        "subtotal": sub_data.subtotal if sub_data.subtotal else subtotal,
        "discount_percent": discount_percent,
        "discount_amount": discount_amount,
        # Bulk discount fields (order-value based)
        "bulk_discount_percent": sub_data.bulk_discount_percent or 0,
        "bulk_discount_amount": sub_data.bulk_discount_amount or 0,
        "bulk_discount_min_order_value": sub_data.bulk_discount_min_order_value,
        "delivery_fee": delivery_fee,
        "coupon_code": sub_data.coupon_code,
        "coupon_discount": coupon_discount,
        # Use the frontend's total_price which includes bulk discount
        "total_price": sub_data.total_price,
        "address_id": selected_address.get("id") if selected_address else None,
        "payment_method": sub_data.payment_method or "razorpay",
        "payment_status": sub_data.payment_status or "pending",
        "payment_id": sub_data.payment_id,
        "razorpay_order_id": sub_data.razorpay_order_id,
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
    
    payment_status = "completed" if sub_data.payment_status == "paid" else "pending"
    payment_doc = {
        "id": str(uuid.uuid4()),
        "subscription_id": subscription_doc["id"],
        "user_id": user_id,
        "amount": sub_data.total_price,  # Use the actual paid amount
        "status": payment_status,
        "payment_id": sub_data.payment_id,
        "razorpay_order_id": sub_data.razorpay_order_id,
        "payment_method": "razorpay" if sub_data.payment_id else "pending",
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

@api_router.get("/subscriptions")
async def get_subscriptions(user_id: Optional[str] = None):
    query = {"user_id": user_id} if user_id else {}
    subscriptions = await db.subscriptions.find(query, {"_id": 0}).to_list(100)
    
    # Enrich subscriptions with items and product details
    result = []
    for sub in subscriptions:
        items = await db.subscription_items.find({"subscription_id": sub["id"]}, {"_id": 0}).to_list(100)
        
        # Get product details for each item
        enriched_items = []
        for item in items:
            product = await db.products.find_one({"id": item["product_id"]}, {"_id": 0})
            if product:
                enriched_items.append({
                    **item,
                    "product": {
                        "id": product["id"],
                        "name": product["name"],
                        "image": product.get("image", ""),
                        "price": product["price"],
                        "stock_status": product.get("stock_status", "in_stock")
                    }
                })
        
        sub["items"] = enriched_items
        
        # Fetch address details if address_id exists
        if sub.get("address_id"):
            address = await db.addresses.find_one({"id": sub["address_id"]}, {"_id": 0})
            if address:
                sub["address"] = address
        
        result.append(sub)
    
    return result

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
        deliveries = await db.deliveries.find({"subscription_id": subscription_id}, {"_id": 0}).sort("delivery_date", 1).to_list(100)
    elif user_id:
        # Get subscriptions from both collections
        subscriptions = await db.subscriptions.find({"user_id": user_id}, {"_id": 0}).to_list(100)
        orders_with_subs = await db.orders.find({"user_id": user_id, "subscription": {"$exists": True}}, {"_id": 0}).to_list(100)
        
        sub_ids = [s["id"] for s in subscriptions]
        sub_ids.extend([o["id"] for o in orders_with_subs])
        
        deliveries = await db.deliveries.find({"subscription_id": {"$in": sub_ids}}, {"_id": 0}).sort("delivery_date", 1).to_list(100)
    else:
        deliveries = await db.deliveries.find({}, {"_id": 0}).sort("delivery_date", 1).to_list(100)
    
    return deliveries

@api_router.get("/subscriptions/{subscription_id}/deliveries")
async def get_user_subscription_deliveries(subscription_id: str):
    """Get deliveries for a subscription (user-facing endpoint)"""
    # Get existing deliveries from database
    existing_deliveries = await db.deliveries.find(
        {"subscription_id": subscription_id}, 
        {"_id": 0}
    ).sort("delivery_date", 1).to_list(100)
    
    # Get subscription info
    subscription = await db.subscriptions.find_one({"id": subscription_id}, {"_id": 0})
    
    if not subscription:
        # Check if it's an order-based subscription
        order = await db.orders.find_one({"id": subscription_id, "subscription": {"$exists": True}}, {"_id": 0})
        if order:
            subscription = {
                "id": order["id"],
                "frequency": order["subscription"].get("frequency"),
                "delivery_days": order["subscription"].get("delivery_days"),
                "start_date": order["subscription"].get("start_date"),
                "next_delivery_date": order["subscription"].get("next_delivery_date"),
                "status": order["subscription"].get("status", "active")
            }
    
    if not subscription:
        return existing_deliveries
    
    # Calculate deliveries per month based on actual delivery days
    delivery_days = subscription.get("delivery_days", [])
    valid_delivery_days = [d for d in delivery_days if d != "Sunday"]
    total_deliveries = len(valid_delivery_days) * 4  # 4 weeks per month
    
    # Fallback to frequency-based calculation if no delivery days
    if total_deliveries == 0:
        frequency = subscription.get("frequency", "once_week")
        deliveries_per_month_map = {
            "once_week": 4,
            "twice_week": 8,
            "four_days_week": 16,
            "daily": 24
        }
        total_deliveries = deliveries_per_month_map.get(frequency, 4)
    
    # Generate delivery dates based on frequency
    delivery_days = subscription.get("delivery_days", [])
    start_date_str = subscription.get("start_date") or subscription.get("next_delivery_date")
    
    if not start_date_str or not delivery_days:
        return existing_deliveries
    
    try:
        start_date = datetime.fromisoformat(start_date_str.replace('Z', '+00:00')).date() if 'T' in start_date_str else datetime.strptime(start_date_str, "%Y-%m-%d").date()
    except:
        return existing_deliveries
    
    day_map = {"Monday": 0, "Tuesday": 1, "Wednesday": 2, "Thursday": 3, "Friday": 4, "Saturday": 5, "Sunday": 6}
    selected_days = [day_map.get(d) for d in delivery_days if d in day_map]
    
    if not selected_days:
        return existing_deliveries
    
    today = datetime.now(timezone.utc).date()
    current_date = max(start_date, today - timedelta(days=30))  # Include 30 days of history
    generated_dates = []
    
    # Generate exactly the number of deliveries for the month
    while len(generated_dates) < total_deliveries:
        if current_date.weekday() in selected_days and current_date.weekday() != 6:
            date_str = current_date.isoformat()
            existing = next((d for d in existing_deliveries if d.get("delivery_date") == date_str), None)
            if existing:
                generated_dates.append(existing)
            else:
                status = "scheduled"
                if subscription.get("status") == "paused":
                    status = "paused"
                elif subscription.get("status") in ["cancelled", "expired"]:
                    status = "cancelled"
                elif current_date < today:
                    status = "delivered"
                    
                generated_dates.append({
                    "id": f"gen-{subscription_id}-{date_str}",
                    "subscription_id": subscription_id,
                    "delivery_date": date_str,
                    "delivery_time": None,
                    "status": status,
                    "notes": None
                })
        current_date += timedelta(days=1)
    
    return sorted(generated_dates, key=lambda x: x.get("delivery_date", ""))

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
async def get_admin_dashboard(project_id: str = Depends(get_project_id)):
    total_subscriptions = await db.subscriptions.count_documents(scoped_filter(project_id))
    active_subscriptions = await db.subscriptions.count_documents(scoped_filter(project_id, {"status": "active"}))
    
    today = datetime.now(timezone.utc).date().isoformat()
    today_deliveries = await db.deliveries.count_documents(scoped_filter(project_id, {"delivery_date": today, "status": "scheduled"}))
    
    payments = await db.payments.find(scoped_filter(project_id, {"status": "success"}), {"_id": 0}).to_list(1000)
    total_revenue = sum(p["amount"] for p in payments)
    
    return {
        "total_subscriptions": total_subscriptions,
        "active_subscriptions": active_subscriptions,
        "today_deliveries": today_deliveries,
        "total_revenue": total_revenue
    }

@api_router.post("/subscriptions/{subscription_id}/renew")
async def renew_subscription_customer(subscription_id: str, renewal_data: dict = {}):
    """Renew an expired subscription (customer-facing endpoint)"""
    # Get the subscription
    subscription = await db.subscriptions.find_one({"id": subscription_id}, {"_id": 0})
    
    if not subscription:
        # Check if it's an order-based subscription
        order = await db.orders.find_one({"id": subscription_id, "subscription": {"$exists": True}}, {"_id": 0})
        if order:
            subscription = {
                "id": order["id"],
                "user_id": order["user_id"],
                "frequency": order["subscription"].get("frequency"),
                "delivery_days": order["subscription"].get("delivery_days"),
                "start_date": order["subscription"].get("start_date"),
                "status": order["subscription"].get("status", "active"),
                "is_order_based": True
            }
    
    if not subscription:
        raise HTTPException(status_code=404, detail="Subscription not found")
    
    # Only allow renewal if subscription is expired
    if subscription.get("status") not in ["expired", "cancelled"]:
        raise HTTPException(status_code=400, detail="Only expired or cancelled subscriptions can be renewed")
    
    # Get the new start date from renewal data or use tomorrow
    new_start_date = renewal_data.get("new_start_date")
    if not new_start_date:
        new_start_date = (datetime.now(timezone.utc) + timedelta(days=1)).strftime("%Y-%m-%d")
    
    # Get count of completed deliveries
    existing_deliveries = await db.deliveries.find(
        {"subscription_id": subscription_id, "status": "delivered"}, 
        {"_id": 0}
    ).to_list(100)
    
    # Update the subscription
    update_data = {
        "status": "active",
        "start_date": new_start_date,
        "next_delivery_date": new_start_date,
        "renewed_at": datetime.now(timezone.utc).isoformat(),
        "renewal_count": (subscription.get("renewal_count", 0) or 0) + 1
    }
    
    if subscription.get("is_order_based"):
        # Update order-based subscription
        await db.orders.update_one(
            {"id": subscription_id},
            {"$set": {
                "subscription.status": "active",
                "subscription.start_date": new_start_date,
                "subscription.next_delivery_date": new_start_date,
                "subscription.renewed_at": update_data["renewed_at"],
                "subscription.renewal_count": update_data["renewal_count"]
            }}
        )
    else:
        # Update standalone subscription
        await db.subscriptions.update_one(
            {"id": subscription_id},
            {"$set": update_data}
        )
    
    return {
        "success": True,
        "message": f"Subscription renewed successfully! Your new deliveries start from {new_start_date}.",
        "new_start_date": new_start_date,
        "previous_deliveries_preserved": len(existing_deliveries)
    }

@api_router.get("/admin/subscriptions")
async def get_all_subscriptions_admin():
    # Get subscriptions from both collections: standalone subscriptions and orders with subscriptions
    subscriptions = await db.subscriptions.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    
    # Also get subscriptions from orders (order_type = 'subscription' or 'mixed')
    orders_with_subs = await db.orders.find(
        {"subscription": {"$exists": True, "$ne": None}},
        {"_id": 0}
    ).sort("created_at", -1).to_list(1000)
    
    result = []
    
    # Process standalone subscriptions
    for sub in subscriptions:
        user = await db.users.find_one({"id": sub["user_id"]}, {"_id": 0})
        items = await db.subscription_items.find({"subscription_id": sub["id"]}, {"_id": 0}).to_list(100)
        
        # Enrich items with product details
        enriched_items = []
        per_delivery_total = 0
        for item in items:
            product = await db.products.find_one({"id": item["product_id"]}, {"_id": 0})
            if product:
                per_delivery_total += product["price"] * item["quantity"]
                enriched_items.append({
                    **item,
                    "product": product,
                    "price": product["price"]
                })
        
        # Determine deliveries per week based on frequency
        frequency = sub.get("frequency", "once_week")
        deliveries_per_week = 1
        discount_percent = 0
        if frequency == "once_week":
            deliveries_per_week = 1
            discount_percent = 0
        elif frequency == "twice_week":
            deliveries_per_week = 2
            discount_percent = 10
        elif frequency == "four_days_week":
            deliveries_per_week = 4
            discount_percent = 50
        
        # Monthly calculation
        monthly_subtotal = per_delivery_total * deliveries_per_week * 4
        discount_amount = (monthly_subtotal * discount_percent) / 100
        delivery_fee = sub.get("delivery_fee", 0) * deliveries_per_week * 4
        monthly_total = monthly_subtotal - discount_amount + delivery_fee
        
        # Get address
        address = await db.addresses.find_one({"id": sub.get("address_id")}, {"_id": 0}) if sub.get("address_id") else None
        
        result.append({
            **sub,
            "user": user,
            "items": enriched_items,
            "items_count": len(enriched_items),
            "per_delivery_total": per_delivery_total,
            "monthly_subtotal": monthly_subtotal,
            "discount_percent": discount_percent,
            "discount_amount": discount_amount,
            "monthly_delivery_fee": delivery_fee,
            "monthly_total": round(monthly_total, 2),
            "address": address,
            "source": "subscription"
        })
    
    # Process subscriptions from orders
    for order in orders_with_subs:
        user = await db.users.find_one({"id": order["user_id"]}, {"_id": 0})
        sub = order.get("subscription", {})
        
        # Enrich subscription items with product details
        enriched_items = []
        for item in sub.get("items", []):
            product = await db.products.find_one({"id": item.get("product_id")}, {"_id": 0})
            enriched_items.append({
                **item,
                "product": product
            })
        
        address = order.get("delivery_address") or order.get("address")
        if not address and order.get("address_id"):
            address = await db.addresses.find_one({"id": order["address_id"]}, {"_id": 0})
        
        result.append({
            "id": order["id"],
            "user_id": order["user_id"],
            "user": user,
            "frequency": sub.get("frequency"),
            "delivery_days": sub.get("delivery_days"),
            "delivery_day": sub.get("delivery_days", [None])[0] if sub.get("delivery_days") else None,
            "start_date": sub.get("start_date"),
            "next_delivery_date": sub.get("next_delivery_date"),
            "items": enriched_items,
            "items_count": len(enriched_items),
            "subtotal": sub.get("subtotal", 0),
            "total_price": sub.get("total_price", 0),
            "monthly_total": sub.get("total_price", 0),
            "bulk_discount_percent": sub.get("bulk_discount_percent", 0),
            "bulk_discount_amount": sub.get("bulk_discount_amount", 0),
            "status": sub.get("status", "active"),
            "address": address,
            "created_at": order.get("created_at"),
            "tray_count": sum(item.get("quantity", 100) for item in sub.get("items", [])),
            "source": "order"
        })
    
    # Sort all by created_at descending
    result.sort(key=lambda x: x.get("created_at", ""), reverse=True)
    
    return result

@api_router.get("/admin/deliveries/today")
async def get_today_deliveries():
    today = datetime.now(timezone.utc).date().isoformat()
    
    # Get deliveries from the deliveries collection
    deliveries = await db.deliveries.find({"delivery_date": today}, {"_id": 0}).to_list(100)
    
    result = []
    processed_sub_ids = set()
    
    # Process deliveries from deliveries collection
    for delivery in deliveries:
        sub_id = delivery["subscription_id"]
        processed_sub_ids.add(sub_id)
        
        # First try standalone subscriptions
        subscription = await db.subscriptions.find_one({"id": sub_id}, {"_id": 0})
        
        if subscription:
            user = await db.users.find_one({"id": subscription["user_id"]}, {"_id": 0})
            items = await db.subscription_items.find({"subscription_id": subscription["id"]}, {"_id": 0}).to_list(100)
            
            # Get address details if available
            address = None
            if subscription.get("address_id"):
                address = await db.addresses.find_one({"id": subscription["address_id"]}, {"_id": 0})
            
            product_details = []
            total_items = 0
            total_weight = 0
            for item in items:
                product = await db.products.find_one({"id": item["product_id"]}, {"_id": 0})
                if product:
                    # Weight is typically the quantity in grams for microgreens
                    item_weight = item.get("weight") or item.get("quantity", 100)
                    product_details.append({
                        "name": product["name"],
                        "quantity": item["quantity"],
                        "weight": item_weight,
                        "price": product["price"],
                        "image": product.get("image", "")
                    })
                    total_items += item["quantity"]
                    total_weight += item_weight
            
            # Format address for display
            delivery_address = "No address"
            if address:
                parts = [address.get("address_line_1", ""), address.get("address_line_2", ""), 
                        address.get("area", ""), address.get("city", "")]
                delivery_address = ", ".join([p for p in parts if p])
                if address.get("pincode"):
                    delivery_address += f" - {address['pincode']}"
            elif user and user.get("address"):
                delivery_address = user["address"]
            
            result.append({
                **delivery,
                "subscription": subscription,
                "subscription_status": subscription.get("status", "active"),
                "subscription_frequency": subscription.get("frequency", ""),
                "delivery_days": subscription.get("delivery_days", []),
                "skipped_deliveries": subscription.get("skipped_deliveries", []),
                "is_skipped": today in subscription.get("skipped_deliveries", []),
                "user": user,
                "delivery_address": delivery_address,
                "products": product_details,
                "total_items": total_items,
                "total_weight": total_weight,
                "monthly_total": subscription.get("total_price", 0)
            })
        else:
            # Try to find in orders (order-based subscriptions)
            order = await db.orders.find_one({"id": sub_id, "subscription": {"$exists": True}}, {"_id": 0})
            if order:
                sub_data = order.get("subscription", {})
                user = await db.users.find_one({"id": order["user_id"]}, {"_id": 0})
                
                # Get address
                address = order.get("address") or order.get("delivery_address")
                if not address and order.get("address_id"):
                    address = await db.addresses.find_one({"id": order["address_id"]}, {"_id": 0})
                
                # Format address
                delivery_address = "No address"
                if isinstance(address, dict):
                    parts = [address.get("address_line", ""), address.get("area", ""), address.get("city", "")]
                    delivery_address = ", ".join([p for p in parts if p])
                    if address.get("pincode"):
                        delivery_address += f" - {address['pincode']}"
                elif isinstance(address, str):
                    delivery_address = address
                
                # Get products from subscription items
                product_details = []
                total_items = 0
                total_weight = 0
                for item in sub_data.get("items", []):
                    product = await db.products.find_one({"id": item.get("product_id")}, {"_id": 0})
                    if product:
                        # Weight is typically the quantity in grams for microgreens
                        item_weight = item.get("weight") or item.get("quantity", 100)
                        product_details.append({
                            "name": product["name"],
                            "quantity": item.get("quantity", 100),
                            "weight": item_weight,
                            "price": product["price"],
                            "image": product.get("image", "")
                        })
                        total_items += item.get("quantity", 100)
                        total_weight += item_weight
                
                result.append({
                    **delivery,
                    "subscription": sub_data,
                    "subscription_status": sub_data.get("status", "active"),
                    "subscription_frequency": sub_data.get("frequency", ""),
                    "delivery_days": sub_data.get("delivery_days", []),
                    "skipped_deliveries": sub_data.get("skipped_deliveries", []),
                    "is_skipped": today in sub_data.get("skipped_deliveries", []),
                    "user": user,
                    "delivery_address": delivery_address,
                    "products": product_details,
                    "total_weight": total_weight,
                    "total_items": total_items,
                    "monthly_total": sub_data.get("total_price", 0)
                })
    
    # Sort: scheduled first, then by user name
    result.sort(key=lambda x: (0 if x["status"] == "scheduled" else 1, x["user"]["name"] if x.get("user") else ""))
    
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

# Helper function to calculate estimated delivery date (next day, skipping Sunday)
def calculate_estimated_delivery_date(items=None, products_cache=None):
    """Calculate estimated delivery date based on product stock status.
    For 'growing' products, use availability_date + 1 day.
    For 'in_stock' products, use next day delivery.
    Returns the latest delivery date among all items.
    """
    from datetime import timedelta
    today = datetime.now(timezone.utc)
    
    # Default: next day delivery (skip Sunday)
    default_delivery = today + timedelta(days=1)
    if default_delivery.weekday() == 6:  # Sunday
        default_delivery = default_delivery + timedelta(days=1)
    
    if not items or not products_cache:
        return default_delivery.strftime("%Y-%m-%d")
    
    latest_delivery = default_delivery
    
    for item in items:
        product_id = item.get("product_id") if isinstance(item, dict) else item.product_id
        product = products_cache.get(product_id)
        
        if product and product.get("stock_status") == "growing":
            # Growing product - check availability_date
            avail_date = product.get("availability_date")
            if avail_date:
                try:
                    avail = datetime.fromisoformat(avail_date.replace('Z', '+00:00'))
                    # Delivery is 1 day after availability
                    product_delivery = avail + timedelta(days=1)
                except:
                    # Fallback: use ready_in_days or default 7 days
                    ready_days = product.get("ready_in_days") or product.get("growth_days") or 7
                    product_delivery = today + timedelta(days=ready_days + 1)
            else:
                # Use ready_in_days or default 7 days
                ready_days = product.get("ready_in_days") or product.get("growth_days") or 7
                product_delivery = today + timedelta(days=ready_days + 1)
            
            # Skip Sunday
            if product_delivery.weekday() == 6:
                product_delivery = product_delivery + timedelta(days=1)
            
            if product_delivery > latest_delivery:
                latest_delivery = product_delivery
    
    return latest_delivery.strftime("%Y-%m-%d")

# Orders API (for single purchases)
@api_router.post("/orders", response_model=Order)
async def create_order(order_data: OrderCreate, project_id: str = Depends(get_project_id)):
    import uuid
    
    # Verify user exists
    user = await db.users.find_one({"id": order_data.user_id}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Verify address exists
    address = await db.addresses.find_one({"id": order_data.address_id, "user_id": order_data.user_id}, {"_id": 0})
    if not address:
        raise HTTPException(status_code=404, detail="Address not found")
    
    # Use the delivery fee from frontend if provided, otherwise calculate
    delivery_fee = order_data.delivery_fee
    delivery_distance = 0
    
    if address.get("latitude") and address.get("longitude"):
        delivery_info = await calculate_delivery_fee(address["latitude"], address["longitude"])
        delivery_distance = delivery_info.get("distance", 0)
    
    # Determine order status based on payment
    order_status = "confirmed" if order_data.payment_status == "paid" else "pending"
    
    # Get all items for delivery date calculation
    all_items = []
    
    # Fetch all product details first (for price snapshot and delivery calculation)
    products_cache = {}
    
    # Collect all product IDs
    all_product_ids = set()
    if order_data.one_time_items:
        for item in order_data.one_time_items:
            all_product_ids.add(item.product_id)
    if order_data.items and not order_data.one_time_items:
        for item in order_data.items:
            all_product_ids.add(item.product_id)
    if order_data.subscription and order_data.subscription.get("items"):
        for item in order_data.subscription["items"]:
            if item.get("product_id"):
                all_product_ids.add(item["product_id"])
    
    # Fetch all products
    for product_id in all_product_ids:
        product = await db.products.find_one({"id": product_id}, {"_id": 0})
        if product:
            products_cache[product_id] = product
    
    # Handle one_time_items - store price_at_order for each item
    one_time_items_data = None
    if order_data.one_time_items:
        one_time_items_data = []
        for item in order_data.one_time_items:
            item_dict = item.model_dump()
            product = products_cache.get(item.product_id)
            if product:
                # Store the price at the time of order
                item_dict["price_at_order"] = product.get("price", 0)
                item_dict["product_name_at_order"] = product.get("name", "")
            one_time_items_data.append(item_dict)
        all_items.extend(one_time_items_data)
    
    # Handle legacy items field
    if order_data.items and not order_data.one_time_items:
        one_time_items_data = []
        for item in order_data.items:
            item_dict = item.model_dump()
            product = products_cache.get(item.product_id)
            if product:
                item_dict["price_at_order"] = product.get("price", 0)
                item_dict["product_name_at_order"] = product.get("name", "")
            one_time_items_data.append(item_dict)
        all_items.extend(one_time_items_data)
    
    # Handle subscription items - also store price_at_order
    subscription_data = None
    if order_data.subscription:
        subscription_data = order_data.subscription.copy() if isinstance(order_data.subscription, dict) else order_data.subscription
        if subscription_data.get("items"):
            updated_sub_items = []
            for item in subscription_data["items"]:
                item_copy = item.copy() if isinstance(item, dict) else item
                product = products_cache.get(item.get("product_id"))
                if product:
                    item_copy["price_at_order"] = product.get("price", 0)
                    item_copy["product_name_at_order"] = product.get("name", "")
                updated_sub_items.append(item_copy)
            subscription_data["items"] = updated_sub_items
            all_items.extend(updated_sub_items)
    
    # Calculate estimated delivery date based on product stock status
    estimated_delivery = calculate_estimated_delivery_date(
        items=all_items,
        products_cache=products_cache
    ) if all_items else None
    
    # Determine order type
    has_one_time = bool(one_time_items_data)
    has_subscription = bool(subscription_data)
    if has_one_time and has_subscription:
        order_type = "mixed"
    elif has_subscription:
        order_type = "subscription"
    else:
        order_type = "one_time"
    
    # Create order with address snapshot
    order_doc = {
        "id": str(uuid.uuid4()),
        "project_id": project_id,
        "user_id": order_data.user_id,
        "address_id": order_data.address_id,
        "delivery_address": {
            "name": address.get("name"),
            "address_line": address.get("address_line"),
            "city": address.get("city"),
            "state": address.get("state"),
            "pincode": address.get("pincode"),
            "phone": address.get("phone"),
            "latitude": address.get("latitude"),
            "longitude": address.get("longitude"),
            "receiver_name": address.get("receiver_name")
        },
        # One-time items
        "one_time_items": one_time_items_data,
        # Subscription data
        "subscription": subscription_data,
        # Legacy items field for backward compatibility
        "items": one_time_items_data,
        "subtotal": order_data.subtotal,
        "delivery_fee": delivery_fee,
        "delivery_distance": delivery_distance,
        # Automatic order-value based discount
        "discount_type": order_data.discount_type,
        "discount_percent": order_data.discount_percent or 0,
        "discount_amount": order_data.discount_amount or 0,
        "discount_min_order_value": order_data.discount_min_order_value,
        # Coupon discount
        "coupon_code": order_data.coupon_code,
        "coupon_discount": order_data.coupon_discount or 0,
        "total": order_data.total,
        "status": order_status,
        "order_type": order_type,
        "payment_id": order_data.payment_id,
        "razorpay_order_id": order_data.razorpay_order_id,
        "payment_status": order_data.payment_status,
        "estimated_delivery_date": estimated_delivery,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.orders.insert_one(order_doc)
    
    # Update product stock (weight) for one-time items
    if one_time_items_data:
        for item in one_time_items_data:
            product_id = item.get("product_id")
            quantity = item.get("quantity", 0)  # quantity is in grams
            if product_id and quantity > 0:
                # Decrement the weight (available stock) by the ordered quantity
                result = await db.products.find_one_and_update(
                    {"id": product_id},
                    {"$inc": {"weight": -quantity}},
                    return_document=True,
                    projection={"_id": 0, "weight": 1}
                )
                # If weight is now 0 or less, update stock_status to out_of_stock
                if result and result.get("weight", 0) <= 0:
                    await db.products.update_one(
                        {"id": product_id},
                        {"$set": {"weight": 0, "stock_status": "out_of_stock"}}
                    )
    
    # Update coupon usage if used
    if order_data.coupon_code:
        await db.coupons.update_one(
            {"code": order_data.coupon_code.upper()},
            {"$inc": {"times_used": 1}}
        )
    
    # Create a payment record
    payment_status = "success" if order_data.payment_status == "paid" else "pending"
    payment_doc = {
        "id": str(uuid.uuid4()),
        "order_id": order_doc["id"],
        "user_id": order_data.user_id,
        "amount": order_doc["total"],
        "status": payment_status,
        "payment_id": order_data.payment_id,
        "razorpay_order_id": order_data.razorpay_order_id,
        "payment_method": "razorpay" if order_data.payment_id else "pending",
        "payment_date": datetime.now(timezone.utc).isoformat(),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.payments.insert_one(payment_doc)
    
    return Order(**order_doc)

@api_router.get("/orders/my-orders")
async def get_my_orders(user_id: str = Depends(get_current_user_id)):
    """Get orders for the authenticated user using JWT token"""
    orders = await db.orders.find({"user_id": user_id}, {"_id": 0}).sort("created_at", -1).to_list(100)
    
    # Enrich with product details
    for order in orders:
        # Enrich one_time_items
        if order.get("one_time_items"):
            enriched_items = []
            for item in order.get("one_time_items", []):
                product = await db.products.find_one({"id": item["product_id"]}, {"_id": 0})
                enriched_items.append({
                    **item,
                    "product": product
                })
            order["one_time_items"] = enriched_items
        
        # Enrich subscription items
        if order.get("subscription") and order["subscription"].get("items"):
            enriched_sub_items = []
            for item in order["subscription"]["items"]:
                product = await db.products.find_one({"id": item["product_id"]}, {"_id": 0})
                enriched_sub_items.append({
                    **item,
                    "product": product
                })
            order["subscription"]["items"] = enriched_sub_items
        
        # Enrich legacy items field
        if order.get("items"):
            enriched_items = []
            for item in order.get("items", []):
                product = await db.products.find_one({"id": item["product_id"]}, {"_id": 0})
                enriched_items.append({
                    **item,
                    "product": product
                })
            order["items"] = enriched_items
        
        # Use stored delivery_address (snapshot) if available, otherwise fetch current address
        if order.get("delivery_address"):
            order["address"] = order["delivery_address"]
        else:
            address = await db.addresses.find_one({"id": order.get("address_id")}, {"_id": 0})
            order["address"] = address
    
    return orders

@api_router.get("/orders")
async def get_user_orders(user_id: str):
    orders = await db.orders.find({"user_id": user_id}, {"_id": 0}).sort("created_at", -1).to_list(100)
    
    # Enrich with product details
    for order in orders:
        # Enrich one_time_items
        if order.get("one_time_items"):
            enriched_items = []
            for item in order.get("one_time_items", []):
                product = await db.products.find_one({"id": item["product_id"]}, {"_id": 0})
                enriched_items.append({
                    **item,
                    "product": product
                })
            order["one_time_items"] = enriched_items
        
        # Enrich subscription items
        if order.get("subscription") and order["subscription"].get("items"):
            enriched_sub_items = []
            for item in order["subscription"]["items"]:
                product = await db.products.find_one({"id": item["product_id"]}, {"_id": 0})
                enriched_sub_items.append({
                    **item,
                    "product": product
                })
            order["subscription"]["items"] = enriched_sub_items
        
        # Enrich legacy items field
        if order.get("items"):
            enriched_items = []
            for item in order.get("items", []):
                product = await db.products.find_one({"id": item["product_id"]}, {"_id": 0})
                enriched_items.append({
                    **item,
                    "product": product
                })
            order["items"] = enriched_items
        
        # Use stored delivery_address (snapshot) if available, otherwise fetch current address
        if order.get("delivery_address"):
            order["address"] = order["delivery_address"]
        else:
            address = await db.addresses.find_one({"id": order.get("address_id")}, {"_id": 0})
            order["address"] = address
    
    return orders

@api_router.get("/orders/{order_id}")
async def get_order(order_id: str):
    order = await db.orders.find_one({"id": order_id}, {"_id": 0})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    # Enrich one_time_items with product details
    if order.get("one_time_items"):
        enriched_items = []
        for item in order.get("one_time_items", []):
            product = await db.products.find_one({"id": item["product_id"]}, {"_id": 0})
            enriched_items.append({
                **item,
                "product": product
            })
        order["one_time_items"] = enriched_items
    
    # Enrich subscription items with product details
    if order.get("subscription") and order["subscription"].get("items"):
        enriched_sub_items = []
        for item in order["subscription"]["items"]:
            product = await db.products.find_one({"id": item["product_id"]}, {"_id": 0})
            enriched_sub_items.append({
                **item,
                "product": product
            })
        order["subscription"]["items"] = enriched_sub_items
    
    # Enrich legacy items field with product details
    if order.get("items"):
        enriched_items = []
        for item in order.get("items", []):
            product = await db.products.find_one({"id": item["product_id"]}, {"_id": 0})
            enriched_items.append({
                **item,
                "product": product
            })
        order["items"] = enriched_items
    
    # Use stored delivery_address (snapshot) if available, otherwise fetch current address
    if order.get("delivery_address"):
        order["address"] = order["delivery_address"]
    else:
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

# Page Content Management (Privacy Policy, Terms & Conditions)
@api_router.get("/pages/privacy-policy")
async def get_privacy_policy():
    """Get privacy policy content (public)"""
    setting = await db.settings.find_one({"type": "privacy_policy"}, {"_id": 0})
    if setting and setting.get("data"):
        return setting["data"]
    return {"title": "Privacy Policy", "content": "", "last_updated": None}

@api_router.get("/pages/terms-conditions")
async def get_terms_conditions():
    """Get terms and conditions content (public)"""
    setting = await db.settings.find_one({"type": "terms_conditions"}, {"_id": 0})
    if setting and setting.get("data"):
        return setting["data"]
    return {"title": "Terms and Conditions", "content": "", "last_updated": None}

@api_router.put("/admin/pages/privacy-policy")
async def update_privacy_policy(data: dict):
    """Update privacy policy (admin only)"""
    update_data = {
        "title": data.get("title", "Privacy Policy"),
        "content": data.get("content", ""),
        "last_updated": datetime.now(timezone.utc).isoformat()
    }
    await db.settings.update_one(
        {"type": "privacy_policy"},
        {"$set": {"type": "privacy_policy", "data": update_data}},
        upsert=True
    )
    return {"success": True, "data": update_data}

@api_router.put("/admin/pages/terms-conditions")
async def update_terms_conditions(data: dict):
    """Update terms and conditions (admin only)"""
    update_data = {
        "title": data.get("title", "Terms and Conditions"),
        "content": data.get("content", ""),
        "last_updated": datetime.now(timezone.utc).isoformat()
    }
    await db.settings.update_one(
        {"type": "terms_conditions"},
        {"$set": {"type": "terms_conditions", "data": update_data}},
        upsert=True
    )
    return {"success": True, "data": update_data}

@api_router.get("/pages/shipping-policy")
async def get_shipping_policy():
    """Get shipping policy content (public)"""
    setting = await db.settings.find_one({"type": "shipping_policy"}, {"_id": 0})
    if setting and setting.get("data"):
        return setting["data"]
    return {"title": "Shipping Policy", "content": "", "last_updated": None}

@api_router.put("/admin/pages/shipping-policy")
async def update_shipping_policy(data: dict):
    """Update shipping policy (admin only)"""
    update_data = {
        "title": data.get("title", "Shipping Policy"),
        "content": data.get("content", ""),
        "last_updated": datetime.now(timezone.utc).isoformat()
    }
    await db.settings.update_one(
        {"type": "shipping_policy"},
        {"$set": {"type": "shipping_policy", "data": update_data}},
        upsert=True
    )
    return {"success": True, "data": update_data}

@api_router.get("/pages/cancellation-refund")
async def get_cancellation_refund():
    """Get cancellation and refund policy content (public)"""
    setting = await db.settings.find_one({"type": "cancellation_refund"}, {"_id": 0})
    if setting and setting.get("data"):
        return setting["data"]
    return {"title": "Cancellations and Refunds", "content": "", "last_updated": None}

@api_router.put("/admin/pages/cancellation-refund")
async def update_cancellation_refund(data: dict):
    """Update cancellation and refund policy (admin only)"""
    update_data = {
        "title": data.get("title", "Cancellations and Refunds"),
        "content": data.get("content", ""),
        "last_updated": datetime.now(timezone.utc).isoformat()
    }
    await db.settings.update_one(
        {"type": "cancellation_refund"},
        {"$set": {"type": "cancellation_refund", "data": update_data}},
        upsert=True
    )
    return {"success": True, "data": update_data}

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

# Referral Program Settings
@api_router.get("/settings/referral-program")
async def get_referral_program_settings():
    """Get referral program settings (public)"""
    settings = await get_referral_settings()
    # Return only public-facing info
    return {
        "is_active": settings.get("is_active", True),
        "referee_discount_percent": settings.get("referee_discount_percent", 10),
        "max_referee_discount": settings.get("max_referee_discount", 100),
        "customer_commission_rate": settings.get("customer_commission_rate", 10)
    }

@api_router.get("/admin/settings/referral-program")
async def get_admin_referral_settings():
    """Get all referral program settings (admin)"""
    return await get_referral_settings()

@api_router.put("/admin/settings/referral-program")
async def update_referral_settings(data: dict):
    """Update referral program settings"""
    await db.settings.update_one(
        {"type": "referral_settings"},
        {"$set": {"type": "referral_settings", "data": data}},
        upsert=True
    )
    return {"success": True, "data": data}

# OTP Whitelist Management
@api_router.get("/admin/settings/otp-whitelist")
async def get_otp_whitelist():
    """Get whitelisted phone numbers for OTP testing"""
    phones = await get_whitelisted_phones()
    return {"phones": phones}

@api_router.put("/admin/settings/otp-whitelist")
async def update_otp_whitelist(data: dict):
    """Update whitelisted phone numbers"""
    phones = data.get("phones", [])
    # Validate all phones are 10 digits
    phones = [p.strip() for p in phones if p.strip().isdigit() and len(p.strip()) == 10]
    
    await db.settings.update_one(
        {"type": "otp_whitelist"},
        {"$set": {"type": "otp_whitelist", "phones": phones}},
        upsert=True
    )
    return {"success": True, "phones": phones}

@api_router.get("/admin/settings/all")
async def get_all_admin_settings():
    """Get all settings for admin panel"""
    shop = await get_shop_config()
    delivery = await get_delivery_pricing()
    plans = await get_subscription_plans()
    pages = await db.pages.find({}, {"_id": 0}).to_list(100)
    referral = await get_referral_settings()
    otp_whitelist = await get_whitelisted_phones()
    
    return {
        "shop_config": shop,
        "delivery_pricing": delivery,
        "subscription_plans": plans,
        "pages": pages,
        "referral_settings": referral,
        "otp_whitelist": otp_whitelist
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

@api_router.get("/addresses/{address_id}")
async def get_address(address_id: str):
    address = await db.addresses.find_one({"id": address_id}, {"_id": 0})
    if not address:
        raise HTTPException(status_code=404, detail="Address not found")
    return address

@api_router.post("/users/{user_id}/addresses", response_model=Address)
async def add_user_address(user_id: str, address_data: AddressCreate):
    import uuid
    
    # If this is the first address or marked as default, update other addresses
    if address_data.is_default:
        await db.addresses.update_many(
            {"user_id": user_id},
            {"$set": {"is_default": False}}
        )
    
    # Check if this is the first address
    existing_count = await db.addresses.count_documents({"user_id": user_id})
    
    now = datetime.now(timezone.utc).isoformat()
    address_doc = {
        "id": str(uuid.uuid4()),
        "user_id": user_id,
        "name": address_data.name,
        "phone": address_data.phone,
        "address_line": address_data.address_line,
        "address_line_1": address_data.address_line_1,
        "address_line_2": address_data.address_line_2,
        "landmark": address_data.landmark,
        "area": address_data.area,
        "city": address_data.city,
        "state": address_data.state,
        "pincode": address_data.pincode,
        "latitude": address_data.latitude,
        "longitude": address_data.longitude,
        "address_type": address_data.address_type or "home",
        "label": address_data.label,
        "is_default": address_data.is_default or existing_count == 0,  # First address is always default
        "created_at": now,
        "updated_at": now
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
    
    # If setting as default, unset others
    if update_data.get("is_default"):
        await db.addresses.update_many(
            {"user_id": user_id, "id": {"$ne": address_id}},
            {"$set": {"is_default": False}}
        )
    
    # Always update the updated_at timestamp
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    
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

# ============ USER CART SYNC ============

class CartItem(BaseModel):
    product_id: str
    product: Optional[dict] = None  # Product details
    quantity: int = 100  # grams

class CartSubscription(BaseModel):
    frequency: str
    delivery_days: List[str]
    items: List[dict]
    address_id: Optional[str] = None
    tray_count: Optional[int] = None

class CartData(BaseModel):
    items: List[CartItem] = []
    subscription: Optional[CartSubscription] = None
    updated_at: Optional[str] = None

@api_router.get("/users/{user_id}/cart")
async def get_user_cart(user_id: str):
    """Get user's synced cart"""
    cart = await db.carts.find_one({"user_id": user_id}, {"_id": 0})
    if not cart:
        return {"user_id": user_id, "items": [], "subscription": None, "updated_at": None}
    return cart

@api_router.put("/users/{user_id}/cart")
async def save_user_cart(user_id: str, cart_data: CartData):
    """Save/update user's cart"""
    cart_doc = {
        "user_id": user_id,
        "items": [item.model_dump() for item in cart_data.items],
        "subscription": cart_data.subscription.model_dump() if cart_data.subscription else None,
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    # Upsert - create if doesn't exist, update if exists
    await db.carts.update_one(
        {"user_id": user_id},
        {"$set": cart_doc},
        upsert=True
    )
    
    # Remove _id before returning
    cart_doc.pop("_id", None)
    return cart_doc

@api_router.delete("/users/{user_id}/cart")
async def clear_user_cart(user_id: str):
    """Clear user's cart after successful checkout"""
    await db.carts.delete_one({"user_id": user_id})
    return {"success": True}

@api_router.get("/admin/users/{user_id}/cart")
async def admin_get_user_cart(user_id: str):
    """Admin endpoint to view user's cart"""
    cart = await db.carts.find_one({"user_id": user_id}, {"_id": 0})
    if not cart:
        return {"user_id": user_id, "items": [], "subscription": None, "updated_at": None}
    
    # Enrich items with product details if not present
    enriched_items = []
    for item in cart.get("items", []):
        if not item.get("product") and item.get("product_id"):
            product = await db.products.find_one({"id": item["product_id"]}, {"_id": 0})
            item["product"] = product
        enriched_items.append(item)
    
    cart["items"] = enriched_items
    return cart

@api_router.get("/admin/users")
async def get_all_users(project_id: str = Depends(get_project_id)):
    users = await db.users.find(scoped_filter(project_id), {"_id": 0}).to_list(1000)
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

@api_router.put("/admin/users/{user_id}/wholesale-access")
async def update_user_wholesale_access(user_id: str, access_data: dict):
    """Enable or disable wholesale price visibility for a user"""
    wholesale_enabled = access_data.get("wholesale_enabled", False)
    
    result = await db.users.update_one(
        {"id": user_id},
        {"$set": {"wholesale_enabled": wholesale_enabled}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {"success": True, "wholesale_enabled": wholesale_enabled}

@api_router.get("/admin/users/{user_id}/wholesale-access")
async def get_user_wholesale_access(user_id: str):
    """Get wholesale price visibility status for a user"""
    user = await db.users.find_one({"id": user_id}, {"_id": 0, "wholesale_enabled": 1})
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {"wholesale_enabled": user.get("wholesale_enabled", False)}

@api_router.put("/admin/subscriptions/{subscription_id}")
async def admin_update_subscription(subscription_id: str, sub_data: SubscriptionUpdate):
    update_data = {k: v for k, v in sub_data.model_dump().items() if v is not None}
    
    if not update_data:
        raise HTTPException(status_code=400, detail="No data to update")
    
    # First try to update in standalone subscriptions collection
    result = await db.subscriptions.update_one({"id": subscription_id}, {"$set": update_data})
    
    if result.matched_count > 0:
        subscription = await db.subscriptions.find_one({"id": subscription_id}, {"_id": 0})
        return Subscription(**subscription)
    
    # If not found in subscriptions, try to update embedded subscription in orders
    # For order-embedded subscriptions, the subscription_id is the order_id
    # Map subscription fields to order/subscription fields
    order_update = {}
    sub_update = {}
    
    for key, value in update_data.items():
        if key == "status":
            # Update the subscription status in the embedded subscription object
            sub_update["subscription.status"] = value
        elif key in ["frequency", "delivery_day", "delivery_days", "next_delivery_date"]:
            sub_update[f"subscription.{key}"] = value
    
    if sub_update:
        order_result = await db.orders.update_one(
            {"id": subscription_id, "subscription": {"$exists": True}},
            {"$set": sub_update}
        )
        
        if order_result.matched_count > 0:
            order = await db.orders.find_one({"id": subscription_id}, {"_id": 0})
            # Return the subscription data from the order
            sub = order.get("subscription", {})
            return {
                "id": order["id"],
                "user_id": order["user_id"],
                "frequency": sub.get("frequency"),
                "delivery_days": sub.get("delivery_days"),
                "delivery_day": sub.get("delivery_days", [None])[0] if sub.get("delivery_days") else None,
                "start_date": sub.get("start_date"),
                "next_delivery_date": sub.get("next_delivery_date"),
                "status": sub.get("status", "active"),
                "created_at": order.get("created_at"),
                "tray_count": sum(item.get("quantity", 100) for item in sub.get("items", []))
            }
    
    raise HTTPException(status_code=404, detail="Subscription not found")

@api_router.post("/admin/subscriptions/{subscription_id}/renew")
async def renew_subscription(subscription_id: str, renewal_data: dict):
    """Renew an expired subscription with new delivery dates while preserving history"""
    # Get the subscription
    subscription = await db.subscriptions.find_one({"id": subscription_id}, {"_id": 0})
    
    if not subscription:
        # Check if it's an order-based subscription
        order = await db.orders.find_one({"id": subscription_id, "subscription": {"$exists": True}}, {"_id": 0})
        if order:
            subscription = {
                "id": order["id"],
                "user_id": order["user_id"],
                "frequency": order["subscription"].get("frequency"),
                "delivery_days": order["subscription"].get("delivery_days"),
                "start_date": order["subscription"].get("start_date"),
                "status": order["subscription"].get("status", "active"),
                "is_order_based": True
            }
    
    if not subscription:
        raise HTTPException(status_code=404, detail="Subscription not found")
    
    # Get the new start date from renewal data or use today
    new_start_date = renewal_data.get("new_start_date")
    if not new_start_date:
        # Default to tomorrow
        new_start_date = (datetime.now(timezone.utc) + timedelta(days=1)).strftime("%Y-%m-%d")
    
    # Calculate how many deliveries were completed in the previous cycle
    existing_deliveries = await db.deliveries.find(
        {"subscription_id": subscription_id, "status": "delivered"}, 
        {"_id": 0}
    ).to_list(100)
    
    # Update the subscription
    update_data = {
        "status": "active",
        "start_date": new_start_date,
        "next_delivery_date": new_start_date,
        "renewed_at": datetime.now(timezone.utc).isoformat(),
        "renewal_count": (subscription.get("renewal_count", 0) or 0) + 1,
        "previous_deliveries_count": len(existing_deliveries)
    }
    
    # Optionally update delivery days if provided
    if renewal_data.get("delivery_days"):
        update_data["delivery_days"] = renewal_data["delivery_days"]
    
    if subscription.get("is_order_based"):
        # Update order-based subscription
        await db.orders.update_one(
            {"id": subscription_id},
            {"$set": {
                "subscription.status": "active",
                "subscription.start_date": new_start_date,
                "subscription.next_delivery_date": new_start_date,
                "subscription.renewed_at": update_data["renewed_at"],
                "subscription.renewal_count": update_data["renewal_count"]
            }}
        )
    else:
        # Update standalone subscription
        await db.subscriptions.update_one(
            {"id": subscription_id},
            {"$set": update_data}
        )
    
    # Return updated subscription
    updated = await db.subscriptions.find_one({"id": subscription_id}, {"_id": 0})
    if not updated:
        order = await db.orders.find_one({"id": subscription_id}, {"_id": 0})
        if order:
            return {
                "id": order["id"],
                "status": "active",
                "start_date": new_start_date,
                "message": f"Subscription renewed. Previous {len(existing_deliveries)} deliveries preserved.",
                "previous_deliveries_count": len(existing_deliveries)
            }
    
    return {
        **updated,
        "message": f"Subscription renewed. Previous {len(existing_deliveries)} deliveries preserved.",
        "previous_deliveries_count": len(existing_deliveries)
    }

@api_router.delete("/admin/subscriptions/{subscription_id}")
async def admin_delete_subscription(subscription_id: str):
    await db.subscription_items.delete_many({"subscription_id": subscription_id})
    await db.deliveries.delete_many({"subscription_id": subscription_id})
    result = await db.subscriptions.delete_one({"id": subscription_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Subscription not found")
    return {"success": True}

@api_router.get("/admin/subscriptions/{subscription_id}/deliveries")
async def get_subscription_deliveries(subscription_id: str):
    """Get all deliveries for a subscription (from both deliveries collection and generated schedule)"""
    # Get existing deliveries from database
    existing_deliveries = await db.deliveries.find(
        {"subscription_id": subscription_id}, 
        {"_id": 0}
    ).sort("delivery_date", 1).to_list(100)
    
    # Create a map of existing deliveries by date for quick lookup
    existing_by_date = {d.get("delivery_date"): d for d in existing_deliveries}
    
    # Get subscription info to generate future deliveries
    subscription = await db.subscriptions.find_one({"id": subscription_id}, {"_id": 0})
    
    if not subscription:
        # Check if it's an order-based subscription
        order = await db.orders.find_one({"id": subscription_id, "subscription": {"$exists": True}}, {"_id": 0})
        if order:
            subscription = {
                "id": order["id"],
                "frequency": order["subscription"].get("frequency"),
                "delivery_days": order["subscription"].get("delivery_days"),
                "start_date": order["subscription"].get("start_date"),
                "next_delivery_date": order["subscription"].get("next_delivery_date"),
                "status": order["subscription"].get("status", "active")
            }
    
    if not subscription:
        return {"deliveries": existing_deliveries, "total_deliveries_per_month": 0, "frequency": None}
    
    # Get frequency from subscription
    frequency = subscription.get("frequency", "once_week")
    
    # Calculate deliveries per month based on actual delivery days (more accurate than frequency)
    delivery_days = subscription.get("delivery_days", [])
    # Filter out Sunday from delivery days
    valid_delivery_days = [d for d in delivery_days if d != "Sunday"]
    total_deliveries_per_month = len(valid_delivery_days) * 4  # 4 weeks per month
    
    # Fallback to frequency-based calculation if no delivery days specified
    if total_deliveries_per_month == 0:
        deliveries_per_month_map = {
            "once_week": 4,
            "twice_week": 8,
            "four_days_week": 16,
            "daily": 24
        }
        total_deliveries_per_month = deliveries_per_month_map.get(frequency, 4)
    
    # Generate delivery dates based on frequency
    delivery_days = subscription.get("delivery_days", [])
    start_date_str = subscription.get("start_date") or subscription.get("next_delivery_date")
    
    if not start_date_str or not delivery_days:
        return {"deliveries": existing_deliveries, "total_deliveries_per_month": total_deliveries_per_month, "frequency": frequency}
    
    # Parse start date
    try:
        start_date = datetime.fromisoformat(start_date_str.replace('Z', '+00:00')).date() if 'T' in start_date_str else datetime.strptime(start_date_str, "%Y-%m-%d").date()
    except:
        return {"deliveries": existing_deliveries, "total_deliveries_per_month": total_deliveries_per_month, "frequency": frequency}
    
    # Map day names to weekday numbers
    day_map = {"Monday": 0, "Tuesday": 1, "Wednesday": 2, "Thursday": 3, "Friday": 4, "Saturday": 5, "Sunday": 6}
    selected_days = [day_map.get(d) for d in delivery_days if d in day_map]
    
    if not selected_days:
        return {"deliveries": existing_deliveries, "total_deliveries_per_month": total_deliveries_per_month, "frequency": frequency}
    
    # Get all past deliveries that are already saved (from previous cycles)
    # These are preserved even after renewal
    past_saved_deliveries = [d for d in existing_deliveries if d.get("status") == "delivered"]
    
    # Generate exactly the number of deliveries for the CURRENT month/cycle starting from subscription start_date
    today = datetime.now(timezone.utc).date()
    current_date = start_date  # Start from subscription start date
    generated_dates = []
    
    while len(generated_dates) < total_deliveries_per_month:
        if current_date.weekday() in selected_days and current_date.weekday() != 6:  # Skip Sundays
            date_str = current_date.isoformat()
            # Check if this date already has a delivery record in database
            existing = existing_by_date.get(date_str)
            if existing:
                # Use the actual saved delivery record (preserves status like "delivered")
                generated_dates.append(existing)
            else:
                # Generate a placeholder delivery for dates without saved records
                status = "scheduled"
                if subscription.get("status") == "paused":
                    status = "paused"
                elif subscription.get("status") in ["cancelled", "expired"]:
                    status = "cancelled"
                elif current_date < today:
                    # Past date without a record - mark as scheduled (not auto-delivered)
                    status = "scheduled"
                    
                generated_dates.append({
                    "id": f"gen-{subscription_id}-{date_str}",
                    "subscription_id": subscription_id,
                    "delivery_date": date_str,
                    "delivery_time": None,
                    "status": status,
                    "notes": None,
                    "is_generated": True
                })
        current_date += timedelta(days=1)
    
    # Combine past saved deliveries (from previous cycles) with current cycle deliveries
    # Filter out duplicates - past deliveries that are already in generated_dates
    current_dates_set = {d.get("delivery_date") for d in generated_dates}
    past_deliveries_to_add = [d for d in past_saved_deliveries if d.get("delivery_date") not in current_dates_set]
    
    # Final list: past delivered + current cycle
    all_deliveries = past_deliveries_to_add + generated_dates
    # Sort by date
    all_deliveries.sort(key=lambda x: x.get("delivery_date", ""))
    
    # Count delivered in current cycle only (for expiry check)
    current_cycle_delivered = sum(1 for d in generated_dates if d.get("status") == "delivered")
    total_delivered = sum(1 for d in all_deliveries if d.get("status") == "delivered")
    
    # Check if all deliveries in CURRENT CYCLE are completed - if so, mark subscription as expired
    if current_cycle_delivered >= total_deliveries_per_month and subscription.get("status") == "active":
        # Auto-expire the subscription
        await db.subscriptions.update_one(
            {"id": subscription_id},
            {"$set": {"status": "expired"}}
        )
        # Also update in orders if it's embedded
        await db.orders.update_one(
            {"id": subscription_id, "subscription": {"$exists": True}},
            {"$set": {"subscription.status": "expired"}}
        )
    
    return {
        "deliveries": all_deliveries,
        "total_deliveries_per_month": total_deliveries_per_month,
        "frequency": frequency,
        "delivered_count": total_delivered,
        "current_cycle_delivered": current_cycle_delivered,
        "past_deliveries_count": len(past_deliveries_to_add)
    }

@api_router.post("/admin/subscriptions/{subscription_id}/deliveries")
async def create_subscription_delivery(subscription_id: str, delivery_data: dict):
    """Create or update a delivery for a subscription"""
    delivery_date = delivery_data.get("delivery_date")
    if not delivery_date:
        raise HTTPException(status_code=400, detail="delivery_date is required")
    
    # Check if delivery already exists
    existing = await db.deliveries.find_one({
        "subscription_id": subscription_id,
        "delivery_date": delivery_date
    }, {"_id": 0})
    
    if existing:
        # Update existing delivery
        update_data = {
            "delivery_time": delivery_data.get("delivery_time"),
            "status": delivery_data.get("status", existing.get("status", "scheduled")),
            "notes": delivery_data.get("notes")
        }
        await db.deliveries.update_one(
            {"id": existing["id"]},
            {"$set": {k: v for k, v in update_data.items() if v is not None}}
        )
        delivery = await db.deliveries.find_one({"id": existing["id"]}, {"_id": 0})
        return delivery
    else:
        # Create new delivery
        delivery_id = str(uuid.uuid4())
        new_delivery = {
            "id": delivery_id,
            "subscription_id": subscription_id,
            "delivery_date": delivery_date,
            "delivery_time": delivery_data.get("delivery_time"),
            "status": delivery_data.get("status", "scheduled"),
            "notes": delivery_data.get("notes"),
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.deliveries.insert_one(new_delivery)
        new_delivery.pop("_id", None)
        return new_delivery

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
    payments = await db.payments.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    
    result = []
    for payment in payments:
        user = await db.users.find_one({"id": payment.get("user_id")}, {"_id": 0}) if payment.get("user_id") else None
        subscription = None
        order = None
        
        # Check for subscription_id or order_id
        if payment.get("subscription_id"):
            subscription = await db.subscriptions.find_one({"id": payment["subscription_id"]}, {"_id": 0})
        if payment.get("order_id"):
            order_doc = await db.orders.find_one({"id": payment["order_id"]}, {"_id": 0})
            if order_doc:
                # Calculate total_amount if not set
                subtotal = order_doc.get("subtotal", 0)
                discount_amount = order_doc.get("discount_amount", 0)
                coupon_discount = order_doc.get("coupon_discount", 0)
                delivery_fee = order_doc.get("delivery_fee", 0)
                total_amount = order_doc.get("total_amount") or (subtotal - discount_amount - coupon_discount + delivery_fee)
                order = {**order_doc, "total_amount": total_amount}
        
        result.append({
            **payment,
            "user": user,
            "subscription": subscription,
            "order": order
        })
    
    return result

class OrderCancelRequest(BaseModel):
    user_id: Optional[str] = None
    reason: Optional[str] = ""

class OrderReturnRequest(BaseModel):
    user_id: Optional[str] = None
    reason: Optional[str] = ""

class RefundRequest(BaseModel):
    amount: Optional[float] = None

async def _process_razorpay_refund(order):
    """Attempt an online refund via Razorpay. Returns (refund_id, ok)."""
    payment_id = order.get("payment_id")
    if razorpay_client and payment_id and order.get("payment_status") == "paid":
        try:
            amount_paise = int(round(float(order.get("total", 0)) * 100))
            rf = razorpay_client.payment.refund(payment_id, {"amount": amount_paise})
            return rf.get("id"), True
        except Exception:
            return None, False
    return None, False

CANCELLABLE_STATUSES = {"pending", "confirmed", "preparing"}

@api_router.post("/orders/{order_id}/cancel")
async def cancel_order(order_id: str, data: OrderCancelRequest):
    order = await db.orders.find_one({"id": order_id}, {"_id": 0})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    if data.user_id and order.get("user_id") != data.user_id:
        raise HTTPException(status_code=403, detail="Not your order")
    if order.get("status") == "cancelled":
        raise HTTPException(status_code=400, detail="Order already cancelled")
    if order.get("status") not in CANCELLABLE_STATUSES:
        raise HTTPException(status_code=400, detail="This order can no longer be cancelled")
    update = {
        "status": "cancelled",
        "cancel_reason": data.reason or "",
        "cancelled_at": datetime.now(timezone.utc).isoformat(),
    }
    refund_id, ok = await _process_razorpay_refund(order)
    if order.get("payment_status") == "paid":
        update["refund_status"] = "refunded" if ok else "pending"
        update["refund_amount"] = order.get("total", 0)
        if refund_id:
            update["refund_id"] = refund_id
            update["refunded_at"] = datetime.now(timezone.utc).isoformat()
    await db.orders.update_one({"id": order_id}, {"$set": update})
    return {"success": True, **update}

@api_router.post("/orders/{order_id}/return")
async def request_return(order_id: str, data: OrderReturnRequest):
    order = await db.orders.find_one({"id": order_id}, {"_id": 0})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    if data.user_id and order.get("user_id") != data.user_id:
        raise HTTPException(status_code=403, detail="Not your order")
    if order.get("status") != "delivered":
        raise HTTPException(status_code=400, detail="Only delivered orders can be returned")
    if order.get("return_status"):
        raise HTTPException(status_code=400, detail="Return already requested for this order")
    update = {
        "return_status": "requested",
        "return_reason": data.reason or "",
        "return_requested_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.orders.update_one({"id": order_id}, {"$set": update})
    return {"success": True, **update}

@api_router.get("/orders/{order_id}/invoice")
async def get_order_invoice(order_id: str):
    order = await db.orders.find_one({"id": order_id}, {"_id": 0})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    settings = await db.store_settings.find_one({"id": "store_settings"}, {"_id": 0}) or {}
    user = await db.users.find_one({"id": order.get("user_id")}, {"_id": 0}) or {}
    addr = order.get("address") or {}
    items = order.get("one_time_items") or order.get("items") or []
    if not items and order.get("subscription"):
        items = order["subscription"].get("items", [])
    total = float(order.get("total", 0) or 0)
    gst_rate = float(settings.get("gst_rate", 0) or 0)
    tax = round(total - total / (1 + gst_rate / 100), 2) if gst_rate > 0 else 0.0
    taxable = round(total - tax, 2)
    cgst = sgst = round(tax / 2, 2)
    rows = ""
    for it in items:
        name = it.get("product_name") or it.get("name") or "Item"
        qty = it.get("quantity", 1)
        price = it.get("price", 0)
        rows += f"<tr><td>{name}</td><td style='text-align:center'>{qty}</td><td style='text-align:right'>Rs.{price}</td><td style='text-align:right'>Rs.{round(qty*price,2)}</td></tr>"
    gst_rows = ""
    if gst_rate > 0:
        gst_rows = (f"<tr><td class='right'>CGST ({gst_rate/2}%)</td><td class='right'>Rs.{cgst}</td></tr>"
                    f"<tr><td class='right'>SGST ({gst_rate/2}%)</td><td class='right'>Rs.{sgst}</td></tr>")
    gstin_line = f"<div class='muted'>GSTIN: {settings.get('gstin')}</div>" if settings.get('gstin') else ''
    html = f"""<!doctype html><html><head><meta charset='utf-8'><title>Invoice {order_id[:8]}</title>
<style>body{{font-family:Arial,sans-serif;color:#111;max-width:800px;margin:24px auto;padding:0 16px}}
h1{{color:#16a34a;margin:0}} table{{width:100%;border-collapse:collapse;margin-top:16px}}
th,td{{border:1px solid #ddd;padding:8px;font-size:14px}} th{{background:#f3f4f6;text-align:left}}
.totals td{{border:none}} .muted{{color:#666;font-size:13px}} .right{{text-align:right}}
@media print{{.noprint{{display:none}}}}</style></head><body>
<div style='display:flex;justify-content:space-between;align-items:flex-start'>
<div><h1>{settings.get('store_name','Khurpi')}</h1>
<div class='muted'>{settings.get('address','')}</div>
<div class='muted'>{settings.get('phone','')} {settings.get('email','')}</div>{gstin_line}</div>
<div class='right'><h2>TAX INVOICE</h2>
<div class='muted'>Invoice #: {order_id[:8].upper()}</div>
<div class='muted'>Date: {str(order.get('created_at',''))[:10]}</div></div></div><hr/>
<div><strong>Bill To:</strong> {addr.get('receiver_name') or addr.get('name') or user.get('name','Customer')}<br/>
<span class='muted'>{addr.get('address_line','')}, {addr.get('city','')} {addr.get('pincode','')}</span><br/>
<span class='muted'>{addr.get('phone') or user.get('phone','')}</span></div>
<table><thead><tr><th>Item</th><th style='text-align:center'>Qty</th><th class='right'>Rate</th><th class='right'>Amount</th></tr></thead>
<tbody>{rows}</tbody></table>
<table class='totals' style='margin-top:12px'>
<tr><td class='right'>Taxable Value</td><td class='right' style='width:160px'>Rs.{taxable}</td></tr>
{gst_rows}
<tr><td class='right'><strong>Total (incl. GST)</strong></td><td class='right'><strong>Rs.{total}</strong></td></tr></table>
<p class='muted'>Payment: {order.get('payment_method','-')} | Status: {order.get('payment_status','-')}</p>
<p class='muted'>This is a computer-generated tax invoice.</p>
<button class='noprint' onclick='window.print()' style='padding:10px 16px;background:#16a34a;color:#fff;border:none;border-radius:8px;cursor:pointer'>Print / Save PDF</button>
</body></html>"""
    return HTMLResponse(content=html)

@api_router.get("/admin/returns")
async def get_returns_and_cancellations(project_id: str = Depends(get_project_id)):
    """Orders needing attention: return requests, pending refunds, cancellations."""
    scope = {"project_id": project_id} if project_id != DEFAULT_PROJECT_ID else {"$or": [{"project_id": DEFAULT_PROJECT_ID}, {"project_id": {"$exists": False}}]}
    status_cond = {"$or": [
        {"return_status": {"$ne": None}},
        {"refund_status": {"$in": ["pending", "refunded"]}},
        {"status": "cancelled"},
    ]}
    orders = await db.orders.find({"$and": [scope, status_cond]}, {"_id": 0}).sort("created_at", -1).to_list(500)
    return orders

@api_router.post("/admin/orders/{order_id}/refund")
async def process_refund(order_id: str, data: RefundRequest):
    order = await db.orders.find_one({"id": order_id}, {"_id": 0})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    refund_id, ok = await _process_razorpay_refund(order)
    amount = data.amount if data.amount is not None else order.get("total", 0)
    update = {
        "refund_status": "refunded",
        "refund_amount": amount,
        "refunded_at": datetime.now(timezone.utc).isoformat(),
    }
    if refund_id:
        update["refund_id"] = refund_id
    if order.get("return_status") == "requested":
        update["return_status"] = "refunded"
    await db.orders.update_one({"id": order_id}, {"$set": update})
    return {"success": True, "online_refund": ok, **update}

@api_router.get("/admin/orders")
async def get_all_orders_admin(project_id: str = Depends(get_project_id)):
    """Get all orders for admin panel"""
    try:
        orders = await db.orders.find({"project_id": project_id}, {"_id": 0}).sort("created_at", -1).to_list(1000)
        
        if not orders:
            return []
        
        # Batch fetch all users and products for better performance
        user_ids = list(set(o.get("user_id") for o in orders if o.get("user_id")))
        product_ids = set()
        
        for order in orders:
            for item in (order.get("items") or []):
                if item and item.get("product_id"):
                    product_ids.add(item.get("product_id"))
            for item in (order.get("one_time_items") or []):
                if item and item.get("product_id"):
                    product_ids.add(item.get("product_id"))
            sub = order.get("subscription")
            if sub and isinstance(sub, dict) and sub.get("items"):
                for item in (sub.get("items") or []):
                    if item and item.get("product_id"):
                        product_ids.add(item.get("product_id"))
        
        # Batch fetch users
        users_map = {}
        if user_ids:
            users = await db.users.find({"id": {"$in": user_ids}}, {"_id": 0}).to_list(len(user_ids))
            users_map = {u["id"]: u for u in users if u.get("id")}
        
        # Batch fetch products
        products_map = {}
        if product_ids:
            products = await db.products.find({"id": {"$in": list(product_ids)}}, {"_id": 0}).to_list(len(product_ids))
            products_map = {p["id"]: p for p in products if p.get("id")}
        
        result = []
        for order in orders:
            try:
                user = users_map.get(order.get("user_id"))
                
                # Use stored delivery_address (snapshot) if available
                address = order.get("delivery_address")
                if not address and order.get("address_id"):
                    address = await db.addresses.find_one({"id": order.get("address_id")}, {"_id": 0})
                
                # Enrich items with product details
                enriched_items = []
                for item in (order.get("items") or []):
                    if item:
                        product = products_map.get(item.get("product_id"))
                        enriched_items.append({**item, "product": product})
                
                # Enrich one_time_items with product details
                enriched_one_time = []
                for item in (order.get("one_time_items") or []):
                    if item:
                        product = products_map.get(item.get("product_id"))
                        enriched_one_time.append({**item, "product": product})
                
                # Enrich subscription items with product details
                sub_data = order.get("subscription")
                enriched_subscription = None
                if sub_data and isinstance(sub_data, dict):
                    enriched_subscription = {**sub_data}
                    if sub_data.get("items"):
                        enriched_sub_items = []
                        for item in (sub_data.get("items") or []):
                            if item:
                                product = products_map.get(item.get("product_id"))
                                enriched_sub_items.append({**item, "product": product})
                        enriched_subscription["items"] = enriched_sub_items
                
                # Calculate total_amount if not set
                subtotal = order.get("subtotal") or 0
                discount_amount = order.get("discount_amount") or 0
                coupon_discount = order.get("coupon_discount") or 0
                delivery_fee = order.get("delivery_fee") or 0
                total_amount = order.get("total_amount") or (subtotal - discount_amount - coupon_discount + delivery_fee)
                
                result.append({
                    **order,
                    "user": user,
                    "address": address,
                    "items": enriched_items,
                    "one_time_items": enriched_one_time,
                    "subscription": enriched_subscription,
                    "total_amount": total_amount
                })
            except Exception as order_error:
                logging.error(f"Error processing order {order.get('id')}: {order_error}")
                # Still include the order but with minimal enrichment
                result.append({
                    **order,
                    "user": None,
                    "address": order.get("delivery_address"),
                    "total_amount": order.get("total") or order.get("subtotal") or 0
                })
        
        return result
    except Exception as e:
        logging.error(f"Error fetching admin orders: {e}")
        import traceback
        logging.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Failed to fetch orders: {str(e)}")


@api_router.get("/admin/orders/debug")
async def debug_orders():
    """Debug endpoint to check orders data"""
    try:
        orders_count = await db.orders.count_documents({})
        users_count = await db.users.count_documents({})
        products_count = await db.products.count_documents({})
        
        # Get first order to check structure
        sample_order = await db.orders.find_one({}, {"_id": 0})
        
        return {
            "status": "ok",
            "orders_count": orders_count,
            "users_count": users_count,
            "products_count": products_count,
            "sample_order_keys": list(sample_order.keys()) if sample_order else [],
            "sample_order_id": sample_order.get("id") if sample_order else None,
            "has_items": bool(sample_order.get("items")) if sample_order else False,
            "has_one_time_items": bool(sample_order.get("one_time_items")) if sample_order else False,
            "has_subscription": bool(sample_order.get("subscription")) if sample_order else False
        }
    except Exception as e:
        import traceback
        return {
            "status": "error",
            "error": str(e),
            "traceback": traceback.format_exc()
        }


class OrderStatusUpdate(BaseModel):
    status: str

@api_router.put("/admin/orders/{order_id}/status")
async def update_order_status(order_id: str, status_data: OrderStatusUpdate):
    """Update order status"""
    status = status_data.status
    valid_statuses = ["pending", "confirmed", "preparing", "out_for_delivery", "delivered", "cancelled"]
    if status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {valid_statuses}")
    
    result = await db.orders.update_one(
        {"id": order_id},
        {"$set": {"status": status}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Order not found")
    
    order = await db.orders.find_one({"id": order_id}, {"_id": 0})
    return order

# ==========================================
# VENDOR ENDPOINTS (role == "vendor")
# ==========================================

class VendorOrderStatusUpdate(BaseModel):
    status: str

class VendorProductUpdate(BaseModel):
    price: Optional[float] = None
    mrp: Optional[float] = None
    stock_quantity: Optional[int] = None

async def _get_order_statuses(project_id: str) -> List[str]:
    settings = await db.store_settings.find_one({"id": "store_settings"}, {"_id": 0}) or {}
    statuses = settings.get("order_statuses")
    if statuses and isinstance(statuses, list) and len(statuses) > 0:
        return statuses
    return ["pending", "confirmed", "preparing", "out_for_delivery", "delivered", "cancelled"]

@api_router.get("/vendor/order-statuses")
async def vendor_get_order_statuses(
    vendor_id: str = Depends(get_current_vendor_id),
    project_id: str = Depends(get_project_id),
):
    """Return the configurable order status workflow for vendors to pick from."""
    return {"statuses": await _get_order_statuses(project_id)}

@api_router.get("/vendor/orders")
async def vendor_get_orders(
    vendor_id: str = Depends(get_current_vendor_id),
    project_id: str = Depends(get_project_id),
):
    """Return a simplified list of all customer orders for the vendor to manage."""
    orders = await db.orders.find(scoped_filter(project_id), {"_id": 0}).sort("created_at", -1).to_list(1000)
    if not orders:
        return []

    user_ids = list({o.get("user_id") for o in orders if o.get("user_id")})
    users_map = {}
    if user_ids:
        users = await db.users.find({"id": {"$in": user_ids}}, {"_id": 0, "id": 1, "name": 1, "phone": 1}).to_list(len(user_ids))
        users_map = {u["id"]: u for u in users if u.get("id")}

    result = []
    for order in orders:
        user = users_map.get(order.get("user_id")) or {}
        addr = order.get("delivery_address") or {}
        address_text = addr.get("formatted_address") or addr.get("address") or ""

        items = []
        for item in ((order.get("items") or []) + (order.get("one_time_items") or [])):
            if not item:
                continue
            items.append({
                "product_name": item.get("product_name") or "Item",
                "quantity": item.get("quantity"),
                "unit": item.get("unit"),
                "price": item.get("price"),
            })

        result.append({
            "id": order.get("id"),
            "customer_name": user.get("name") or "Customer",
            "customer_phone": user.get("phone") or "",
            "address": address_text,
            "items": items,
            "total": order.get("total") or order.get("total_amount") or order.get("subtotal") or 0,
            "status": order.get("status") or "pending",
            "payment_status": order.get("payment_status") or "pending",
            "order_source": order.get("order_source") or "online",
            "created_at": order.get("created_at"),
        })
    return result

@api_router.put("/vendor/orders/{order_id}/status")
async def vendor_update_order_status(
    order_id: str,
    data: VendorOrderStatusUpdate,
    vendor_id: str = Depends(get_current_vendor_id),
    project_id: str = Depends(get_project_id),
):
    """Vendor updates an order's status (visible to the customer)."""
    valid_statuses = await _get_order_statuses(project_id)
    if data.status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {valid_statuses}")

    result = await db.orders.update_one({"id": order_id}, {"$set": {"status": data.status}})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Order not found")

    return {"success": True, "id": order_id, "status": data.status}

@api_router.get("/vendor/products")
async def vendor_get_products(
    vendor_id: str = Depends(get_current_vendor_id),
    project_id: str = Depends(get_project_id),
):
    """Return products with the fields a vendor can manage: photo, name, mrp, price, stock."""
    products = await db.products.find(scoped_filter(project_id), {"_id": 0}).sort("name", 1).to_list(2000)
    result = []
    for p in products:
        images = p.get("images") or []
        image = images[0] if images else p.get("image_url")
        result.append({
            "id": p.get("id"),
            "name": p.get("name"),
            "image_url": image,
            "mrp": p.get("mrp"),
            "price": p.get("price"),
            "stock_quantity": p.get("stock_quantity", 0),
            "unit": p.get("unit"),
            "stock_status": p.get("stock_status"),
        })
    return result

@api_router.put("/vendor/products/{product_id}")
async def vendor_update_product(
    product_id: str,
    data: VendorProductUpdate,
    vendor_id: str = Depends(get_current_vendor_id),
):
    """Vendor updates only selling price, MRP and stock quantity of a product."""
    update_data = {k: v for k, v in data.model_dump(exclude_unset=True).items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No data to update")

    result = await db.products.update_one({"id": product_id}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")

    product = await db.products.find_one({"id": product_id}, {"_id": 0})
    return {
        "id": product.get("id"),
        "name": product.get("name"),
        "mrp": product.get("mrp"),
        "price": product.get("price"),
        "stock_quantity": product.get("stock_quantity", 0),
    }


# ============ ADMIN CREATE ORDER (Phone/WhatsApp Orders) ============

class AdminOrderItemCreate(BaseModel):
    product_id: str
    quantity: int = 100  # grams

class AdminOrderCreate(BaseModel):
    # Customer info - either existing or new
    customer_phone: str
    customer_name: Optional[str] = None  # Required if new customer
    customer_email: Optional[str] = None
    # Address - either existing address_id or new address data
    address_id: Optional[str] = None
    new_address: Optional[dict] = None  # For creating new address
    # Order items
    items: List[AdminOrderItemCreate]
    # Order details
    order_source: str = "phone"  # "phone", "whatsapp", "walk_in"
    order_notes: Optional[str] = None
    # Payment
    payment_status: str = "pending"  # "pending", "paid"
    # Discounts
    apply_auto_discount: bool = True
    coupon_code: Optional[str] = None

@api_router.post("/admin/orders/create")
async def admin_create_order(order_data: AdminOrderCreate):
    """Create order on behalf of customer (for phone/WhatsApp orders)"""
    import uuid
    
    # Step 1: Find or create customer
    user = await db.users.find_one({"phone": order_data.customer_phone}, {"_id": 0})
    
    if not user:
        # Create new customer
        if not order_data.customer_name:
            raise HTTPException(status_code=400, detail="Customer name required for new customers")
        
        user_id = str(uuid.uuid4())
        user = {
            "id": user_id,
            "phone": order_data.customer_phone,
            "name": order_data.customer_name,
            "email": order_data.customer_email,
            "role": "user",
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.users.insert_one(user)
    else:
        user_id = user["id"]
        # Update existing customer's name/email if provided
        update_fields = {}
        if order_data.customer_name and order_data.customer_name != user.get("name"):
            update_fields["name"] = order_data.customer_name
        if order_data.customer_email and order_data.customer_email != user.get("email"):
            update_fields["email"] = order_data.customer_email
        
        if update_fields:
            await db.users.update_one({"id": user_id}, {"$set": update_fields})
            user = {**user, **update_fields}
    
    user_id = user["id"]
    
    # Step 2: Get or create address
    address = None
    address_id = None
    
    if order_data.address_id:
        address = await db.addresses.find_one({"id": order_data.address_id}, {"_id": 0})
        if not address:
            raise HTTPException(status_code=404, detail="Address not found")
        address_id = order_data.address_id
    elif order_data.new_address:
        # Create new address for customer
        address_id = str(uuid.uuid4())
        address = {
            "id": address_id,
            "user_id": user_id,
            "name": order_data.new_address.get("name", order_data.customer_name),
            "phone": order_data.new_address.get("phone", order_data.customer_phone),
            "address_line": order_data.new_address.get("address_line", ""),
            "address_line_1": order_data.new_address.get("address_line_1", ""),
            "address_line_2": order_data.new_address.get("address_line_2", ""),
            "area": order_data.new_address.get("area", ""),
            "city": order_data.new_address.get("city", ""),
            "state": order_data.new_address.get("state", ""),
            "pincode": order_data.new_address.get("pincode", ""),
            "latitude": order_data.new_address.get("latitude"),
            "longitude": order_data.new_address.get("longitude"),
            "is_default": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        # Set all other addresses as non-default
        await db.addresses.update_many({"user_id": user_id}, {"$set": {"is_default": False}})
        await db.addresses.insert_one(address)
    else:
        # Try to get default address
        address = await db.addresses.find_one({"user_id": user_id, "is_default": True}, {"_id": 0})
        if not address:
            address = await db.addresses.find_one({"user_id": user_id}, {"_id": 0})
        if not address:
            raise HTTPException(status_code=400, detail="No address provided and customer has no saved addresses")
        address_id = address["id"]
    
    # Step 3: Build order items with product details
    order_items = []
    subtotal = 0
    products_cache = {}
    
    for item in order_data.items:
        product = await db.products.find_one({"id": item.product_id}, {"_id": 0})
        if not product:
            raise HTTPException(status_code=404, detail=f"Product {item.product_id} not found")
        
        products_cache[item.product_id] = product
        price_per_100g = product.get("price", 0)
        item_total = (item.quantity / 100) * price_per_100g
        
        order_items.append({
            "product_id": item.product_id,
            "product": {
                "id": product["id"],
                "name": product["name"],
                "price": product["price"],
                "image": product.get("image")
            },
            "quantity": item.quantity,
            "price": price_per_100g,
            "price_at_order": price_per_100g,  # Store price at order time
            "product_name_at_order": product["name"],
            "total": item_total
        })
        subtotal += item_total
    
    # Step 4: Calculate discounts
    discount_percent = 0
    discount_amount = 0
    discount_type = None
    discount_min_order_value = None
    
    if order_data.apply_auto_discount:
        # Get automatic discount tiers
        discount_tiers = await db.discount_tiers.find({"is_active": True}, {"_id": 0}).to_list(100)
        discount_tiers.sort(key=lambda x: x.get("min_order_value", 0), reverse=True)
        
        for tier in discount_tiers:
            if subtotal >= tier.get("min_order_value", 0):
                discount_percent = tier.get("discount_percent", 0)
                discount_amount = (subtotal * discount_percent) / 100
                discount_type = "bulk_discount"
                discount_min_order_value = tier.get("min_order_value")
                break
    
    # Apply coupon if provided
    coupon_discount = 0
    coupon_code = None
    if order_data.coupon_code:
        coupon = await db.coupons.find_one({"code": order_data.coupon_code.upper(), "is_active": True}, {"_id": 0})
        if coupon:
            if coupon.get("discount_type") == "percentage":
                coupon_discount = (subtotal * coupon.get("discount_value", 0)) / 100
                if coupon.get("max_discount"):
                    coupon_discount = min(coupon_discount, coupon.get("max_discount"))
            else:
                coupon_discount = coupon.get("discount_value", 0)
            coupon_code = order_data.coupon_code.upper()
    
    # Calculate total
    total = subtotal - discount_amount - coupon_discount
    if total < 0:
        total = 0
    
    # Step 5: Calculate delivery date
    estimated_delivery = calculate_estimated_delivery_date(
        items=[{"product_id": item["product_id"]} for item in order_items],
        products_cache=products_cache
    ) if order_items else None
    
    # Step 6: Create order
    order_status = "confirmed" if order_data.payment_status == "paid" else "pending"
    
    order_doc = {
        "id": str(uuid.uuid4()),
        "user_id": user_id,
        "address_id": address_id,
        "delivery_address": {
            "name": address.get("name"),
            "address_line": address.get("address_line"),
            "city": address.get("city"),
            "state": address.get("state"),
            "pincode": address.get("pincode"),
            "phone": address.get("phone"),
            "latitude": address.get("latitude"),
            "longitude": address.get("longitude"),
        },
        "one_time_items": order_items,
        "items": order_items,  # Legacy field
        "subtotal": subtotal,
        "delivery_fee": 0,  # Free delivery
        "discount_type": discount_type,
        "discount_percent": discount_percent,
        "discount_amount": discount_amount,
        "discount_min_order_value": discount_min_order_value,
        "coupon_code": coupon_code,
        "coupon_discount": coupon_discount,
        "total": total,
        "status": order_status,
        "order_type": "one_time",
        "order_source": order_data.order_source,
        "order_notes": order_data.order_notes,
        "payment_status": order_data.payment_status,
        "estimated_delivery_date": estimated_delivery,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.orders.insert_one(order_doc)
    
    # Remove MongoDB _id before returning
    order_doc.pop("_id", None)
    
    # Update product stock
    for item in order_items:
        await db.products.update_one(
            {"id": item["product_id"]},
            {"$inc": {"weight": -item["quantity"]}}
        )
    
    # Add user info to response
    order_doc["user"] = {
        "id": user["id"],
        "name": user.get("name"),
        "phone": user.get("phone")
    }
    
    return order_doc

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
    per_user_limit: int = 1
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
    per_user_limit: Optional[int] = None
    valid_from: Optional[str] = None
    valid_until: Optional[str] = None
    is_active: Optional[bool] = None
    description: Optional[str] = None

@api_router.get("/admin/coupons")
async def get_all_coupons(project_id: str = Depends(get_project_id)):
    coupons = await db.coupons.find({"project_id": project_id}, {"_id": 0}).to_list(1000)
    return coupons

@api_router.post("/admin/coupons")
async def create_coupon(coupon_data: CouponCreate, project_id: str = Depends(get_project_id)):
    import uuid
    
    # Check if code already exists within the project
    existing = await db.coupons.find_one({"code": coupon_data.code.upper(), "project_id": project_id}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=400, detail="Coupon code already exists")
    
    coupon_doc = {
        "id": str(uuid.uuid4()),
        "project_id": project_id,
        "code": coupon_data.code.upper(),
        "discount_type": coupon_data.discount_type,
        "discount_value": coupon_data.discount_value,
        "min_order_amount": coupon_data.min_order_amount,
        "max_discount": coupon_data.max_discount,
        "usage_limit": coupon_data.usage_limit,
        "per_user_limit": coupon_data.per_user_limit,
        "times_used": 0,
        "valid_from": coupon_data.valid_from,
        "valid_until": coupon_data.valid_until,
        "is_active": coupon_data.is_active,
        "description": coupon_data.description,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.coupons.insert_one(coupon_doc)
    # Remove _id added by MongoDB before returning
    coupon_doc.pop('_id', None)
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

@api_router.get("/coupons/welcome")
async def get_welcome_coupon(project_id: str = Depends(get_project_id)):
    """Public: return the welcome coupon (for storefront banner)."""
    coupon = await db.coupons.find_one(scoped_filter(project_id, {"code": "KHURPIWELCOME20"}), {"_id": 0})
    return coupon or {}

@api_router.post("/coupons/validate")
async def validate_coupon(code: str, order_amount: float, user_id: Optional[str] = None):
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
    
    # Check per-user limit
    if user_id:
        per_user_limit = coupon.get("per_user_limit", 1)
        user_usage_count = await db.orders.count_documents({
            "user_id": user_id,
            "coupon_code": code.upper()
        })
        if user_usage_count >= per_user_limit:
            raise HTTPException(status_code=400, detail=f"You've already used this coupon {per_user_limit} time(s)")
    
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
async def validate_discount_code(code: str, order_amount: float, user_id: Optional[str] = None):
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
        
        # Check per-user limit
        if user_id:
            per_user_limit = coupon.get("per_user_limit", 1)
            user_usage_count = await db.orders.count_documents({
                "user_id": user_id,
                "coupon_code": code_upper
            })
            if user_usage_count >= per_user_limit:
                raise HTTPException(status_code=400, detail=f"You've already used this coupon {per_user_limit} time(s)")
        
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

# ============ ORDER DISCOUNT TIERS API ============

@api_router.get("/admin/discount-tiers")
async def get_discount_tiers():
    """Get all discount tiers sorted by min_order_value"""
    tiers = await db.discount_tiers.find({}, {"_id": 0}).to_list(100)
    # Sort by min_order_value ascending
    tiers.sort(key=lambda x: x.get("min_order_value", 0))
    return tiers

@api_router.post("/admin/discount-tiers")
async def create_discount_tier(tier: DiscountTierCreate):
    """Create a new discount tier"""
    tier_doc = {
        "id": str(uuid.uuid4()),
        "min_order_value": tier.min_order_value,
        "discount_percent": tier.discount_percent,
        "active": tier.active,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.discount_tiers.insert_one(tier_doc)
    return {**tier_doc, "_id": None}

@api_router.put("/admin/discount-tiers/{tier_id}")
async def update_discount_tier(tier_id: str, tier: DiscountTierCreate):
    """Update a discount tier"""
    result = await db.discount_tiers.update_one(
        {"id": tier_id},
        {"$set": {
            "min_order_value": tier.min_order_value,
            "discount_percent": tier.discount_percent,
            "active": tier.active
        }}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Discount tier not found")
    return {"message": "Discount tier updated"}

@api_router.delete("/admin/discount-tiers/{tier_id}")
async def delete_discount_tier(tier_id: str):
    """Delete a discount tier"""
    result = await db.discount_tiers.delete_one({"id": tier_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Discount tier not found")
    return {"message": "Discount tier deleted"}

@api_router.get("/discount-tiers")
async def get_active_discount_tiers():
    """Get all active discount tiers for customers"""
    tiers = await db.discount_tiers.find({"active": True}, {"_id": 0}).to_list(100)
    tiers.sort(key=lambda x: x.get("min_order_value", 0))
    return tiers

@api_router.post("/discount-tiers/calculate")
async def calculate_order_discount(order_value: float):
    """Calculate applicable discount for an order value"""
    tiers = await db.discount_tiers.find({"active": True}, {"_id": 0}).to_list(100)
    tiers.sort(key=lambda x: x.get("min_order_value", 0), reverse=True)
    
    applicable_tier = None
    for tier in tiers:
        if order_value >= tier["min_order_value"]:
            applicable_tier = tier
            break
    
    if applicable_tier:
        discount_amount = (order_value * applicable_tier["discount_percent"]) / 100
        return {
            "applicable": True,
            "tier": applicable_tier,
            "discount_percent": applicable_tier["discount_percent"],
            "discount_amount": round(discount_amount, 2),
            "final_amount": round(order_value - discount_amount, 2)
        }
    
    return {
        "applicable": False,
        "tier": None,
        "discount_percent": 0,
        "discount_amount": 0,
        "final_amount": order_value
    }

@api_router.post("/admin/discount-tiers/seed-defaults")
async def seed_default_discount_tiers():
    """Seed default discount tiers"""
    # Check if tiers already exist
    existing = await db.discount_tiers.count_documents({})
    if existing > 0:
        return {"message": "Discount tiers already exist", "count": existing}
    
    default_tiers = [
        {"min_order_value": 1500, "discount_percent": 10},
        {"min_order_value": 2500, "discount_percent": 15},
        {"min_order_value": 4000, "discount_percent": 25}
    ]
    
    for tier in default_tiers:
        tier_doc = {
            "id": str(uuid.uuid4()),
            "min_order_value": tier["min_order_value"],
            "discount_percent": tier["discount_percent"],
            "active": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.discount_tiers.insert_one(tier_doc)
    
    return {"message": "Default discount tiers created", "count": len(default_tiers)}

# ============ EXPENSE TRACKING ============

# Default expense types
DEFAULT_EXPENSE_TYPES = [
    {"name": "seeds", "label": "Seeds"},
    {"name": "lights", "label": "Lights/LED"},
    {"name": "fans", "label": "Fans"},
    {"name": "racks", "label": "Racks/Shelves"},
    {"name": "trays", "label": "Trays"},
    {"name": "cocopeat", "label": "Cocopeat/Growing Medium"},
    {"name": "h2o2", "label": "H2O2/Sanitizer"},
    {"name": "packaging", "label": "Packaging Materials"},
    {"name": "stickers", "label": "Stickers/Labels"},
    {"name": "pamphlet", "label": "Pamphlets/Flyers"},
    {"name": "marketing", "label": "Marketing/Ads"},
    {"name": "digital_app", "label": "Digital/App Services"},
    {"name": "utilities", "label": "Utilities (Water/Power)"},
    {"name": "rent", "label": "Rent"},
    {"name": "salary", "label": "Salary/Wages"},
    {"name": "transport", "label": "Transport/Delivery"},
    {"name": "equipment", "label": "Equipment/Tools"},
    {"name": "maintenance", "label": "Maintenance/Repairs"},
    {"name": "other", "label": "Other"}
]

@api_router.get("/admin/expense-types")
async def get_expense_types():
    """Get all expense types"""
    custom_types = await db.expense_types.find({}, {"_id": 0}).to_list(100)
    # Merge default and custom types
    all_types = DEFAULT_EXPENSE_TYPES.copy()
    existing_names = {t["name"] for t in all_types}
    for ct in custom_types:
        if ct.get("name") not in existing_names:
            all_types.append(ct)
    return all_types

@api_router.post("/admin/expense-types")
async def create_expense_type(type_data: ExpenseTypeCreate):
    """Create a new expense type"""
    # Check if exists
    existing = await db.expense_types.find_one({"name": type_data.name})
    if existing:
        raise HTTPException(status_code=400, detail="Expense type already exists")
    
    type_doc = {
        "id": str(uuid.uuid4()),
        "name": type_data.name,
        "label": type_data.label,
        "description": type_data.description,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.expense_types.insert_one(type_doc)
    type_doc.pop("_id", None)
    return type_doc

@api_router.get("/admin/expenses")
async def get_all_expenses(
    expense_type: Optional[str] = None,
    paid_status: Optional[str] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None
):
    """Get all expenses with optional filters"""
    query = {}
    
    if expense_type:
        query["item_type"] = expense_type
    if paid_status:
        query["paid_status"] = paid_status
    if start_date:
        query["order_date"] = {"$gte": start_date}
    if end_date:
        if "order_date" in query:
            query["order_date"]["$lte"] = end_date
        else:
            query["order_date"] = {"$lte": end_date}
    
    expenses = await db.expenses.find(query, {"_id": 0}).sort("order_date", -1).to_list(1000)
    
    # Calculate summary
    total_amount = sum(e.get("total_price", 0) for e in expenses)
    total_paid = sum(e.get("paid_amount", 0) for e in expenses)
    pending_amount = total_amount - total_paid
    
    return {
        "expenses": expenses,
        "summary": {
            "total_expenses": len(expenses),
            "total_amount": round(total_amount, 2),
            "total_paid": round(total_paid, 2),
            "pending_amount": round(pending_amount, 2)
        }
    }

@api_router.post("/admin/expenses")
async def create_expense(expense_data: ExpenseCreate):
    """Create a new expense entry"""
    expense_doc = {
        "id": str(uuid.uuid4()),
        "item_type": expense_data.item_type,
        "item_name": expense_data.item_name,
        "description": expense_data.description,
        "vendor_name": expense_data.vendor_name,
        "vendor_location": expense_data.vendor_location,
        "vendor_phone": expense_data.vendor_phone,
        "quantity": expense_data.quantity,
        "unit_price": expense_data.unit_price,
        "total_price": expense_data.total_price,
        "paid_status": expense_data.paid_status,
        "paid_amount": expense_data.paid_amount or 0,
        "payment_method": expense_data.payment_method,
        "order_date": expense_data.order_date,
        "delivery_date": expense_data.delivery_date,
        "invoice_number": expense_data.invoice_number,
        "notes": expense_data.notes,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.expenses.insert_one(expense_doc)
    expense_doc.pop("_id", None)
    return expense_doc

@api_router.get("/admin/expenses/{expense_id}")
async def get_expense(expense_id: str):
    """Get a single expense by ID"""
    expense = await db.expenses.find_one({"id": expense_id}, {"_id": 0})
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    return expense

@api_router.put("/admin/expenses/{expense_id}")
async def update_expense(expense_id: str, expense_data: ExpenseUpdate):
    """Update an expense entry"""
    update_data = {k: v for k, v in expense_data.model_dump().items() if v is not None}
    
    if not update_data:
        raise HTTPException(status_code=400, detail="No data to update")
    
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    result = await db.expenses.update_one({"id": expense_id}, {"$set": update_data})
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Expense not found")
    
    expense = await db.expenses.find_one({"id": expense_id}, {"_id": 0})
    return expense

@api_router.delete("/admin/expenses/{expense_id}")
async def delete_expense(expense_id: str):
    """Delete an expense entry"""
    result = await db.expenses.delete_one({"id": expense_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Expense not found")
    return {"success": True, "message": "Expense deleted"}

@api_router.get("/admin/expenses/summary/monthly")
async def get_monthly_expense_summary():
    """Get monthly expense summary for the current year"""
    current_year = datetime.now(timezone.utc).year
    start_date = f"{current_year}-01-01"
    
    expenses = await db.expenses.find(
        {"order_date": {"$gte": start_date}},
        {"_id": 0}
    ).to_list(10000)
    
    # Group by month
    monthly_summary = {}
    type_summary = {}
    
    for expense in expenses:
        order_date = expense.get("order_date", "")[:7]  # YYYY-MM
        if order_date:
            if order_date not in monthly_summary:
                monthly_summary[order_date] = {"total": 0, "paid": 0, "count": 0}
            monthly_summary[order_date]["total"] += expense.get("total_price", 0)
            monthly_summary[order_date]["paid"] += expense.get("paid_amount", 0)
            monthly_summary[order_date]["count"] += 1
        
        # Group by type
        item_type = expense.get("item_type", "other")
        if item_type not in type_summary:
            type_summary[item_type] = {"total": 0, "count": 0}
        type_summary[item_type]["total"] += expense.get("total_price", 0)
        type_summary[item_type]["count"] += 1
    
    return {
        "monthly": dict(sorted(monthly_summary.items())),
        "by_type": dict(sorted(type_summary.items(), key=lambda x: x[1]["total"], reverse=True)),
        "year": current_year
    }

# ============ COST CALCULATOR ============

# Default categories for cost calculator
ONE_TIME_CATEGORIES = [
    {"name": "racks", "label": "Racks/Shelving"},
    {"name": "lights", "label": "LED Grow Lights"},
    {"name": "fans", "label": "Fans/Ventilation"},
    {"name": "trays", "label": "Trays (Bulk)"},
    {"name": "sensors", "label": "Sensors/Monitors"},
    {"name": "irrigation", "label": "Irrigation System"},
    {"name": "equipment", "label": "Other Equipment"},
    {"name": "setup", "label": "Setup/Installation"},
    {"name": "other", "label": "Other"}
]

FIXED_COST_CATEGORIES = [
    {"name": "rent", "label": "Rent"},
    {"name": "electricity", "label": "Electricity"},
    {"name": "water", "label": "Water"},
    {"name": "internet", "label": "Internet"},
    {"name": "insurance", "label": "Insurance"},
    {"name": "salary", "label": "Fixed Salary"},
    {"name": "maintenance", "label": "Maintenance"},
    {"name": "other", "label": "Other"}
]

PRODUCTION_COST_CATEGORIES = [
    {"name": "seeds", "label": "Seeds", "default_unit": "per_tray"},
    {"name": "soil", "label": "Soil/Cocopeat", "default_unit": "per_tray"},
    {"name": "labor", "label": "Labor", "default_unit": "per_hour"},
    {"name": "packaging", "label": "Packaging", "default_unit": "per_piece"},
    {"name": "sanitizer", "label": "H2O2/Sanitizer", "default_unit": "per_tray"},
    {"name": "consumables", "label": "Other Consumables", "default_unit": "per_tray"},
    {"name": "other", "label": "Other", "default_unit": "per_tray"}
]

@api_router.get("/admin/cost-calculator/categories")
async def get_cost_categories():
    """Get all cost calculator categories"""
    return {
        "one_time": ONE_TIME_CATEGORIES,
        "fixed": FIXED_COST_CATEGORIES,
        "production": PRODUCTION_COST_CATEGORIES
    }

# Cost Calculator Settings
@api_router.get("/admin/cost-calculator/settings")
async def get_cost_calculator_settings():
    """Get saved cost calculator settings"""
    settings = await db.cost_settings.find_one({"id": "default"}, {"_id": 0})
    if not settings:
        # Return default settings
        return {
            "id": "default",
            "monthly_production_trays": 100,
            "updated_at": None
        }
    return settings

@api_router.put("/admin/cost-calculator/settings")
async def update_cost_calculator_settings(settings_data: dict):
    """Update cost calculator settings"""
    update_data = {
        "id": "default",
        "monthly_production_trays": settings_data.get("monthly_production_trays", 100),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.cost_settings.update_one(
        {"id": "default"},
        {"$set": update_data},
        upsert=True
    )
    
    return update_data

# One-Time Purchases CRUD
@api_router.get("/admin/cost-calculator/one-time")
async def get_one_time_purchases():
    """Get all one-time purchases with depreciation"""
    purchases = await db.cost_one_time.find({}, {"_id": 0}).to_list(100)
    
    # Calculate depreciation for each item
    today = datetime.now(timezone.utc)
    for p in purchases:
        purchase_date = datetime.fromisoformat(p["purchase_date"].replace('Z', '+00:00')) if p.get("purchase_date") else today
        months_elapsed = max(0, (today.year - purchase_date.year) * 12 + (today.month - purchase_date.month))
        
        useful_life = p.get("useful_life_months", 36)
        purchase_cost = p.get("purchase_cost", 0)
        salvage_value = p.get("salvage_value", 0)
        
        # Straight-line depreciation
        depreciable_amount = purchase_cost - salvage_value
        monthly_depreciation = depreciable_amount / useful_life if useful_life > 0 else 0
        accumulated_depreciation = min(months_elapsed * monthly_depreciation, depreciable_amount)
        current_value = purchase_cost - accumulated_depreciation
        
        p["monthly_depreciation"] = round(monthly_depreciation, 2)
        p["accumulated_depreciation"] = round(accumulated_depreciation, 2)
        p["current_value"] = round(max(current_value, salvage_value), 2)
        p["months_remaining"] = max(0, useful_life - months_elapsed)
    
    # Calculate totals
    total_purchase_cost = sum(p.get("purchase_cost", 0) for p in purchases)
    total_monthly_depreciation = sum(p.get("monthly_depreciation", 0) for p in purchases)
    total_current_value = sum(p.get("current_value", 0) for p in purchases)
    
    return {
        "purchases": purchases,
        "summary": {
            "total_purchase_cost": round(total_purchase_cost, 2),
            "total_monthly_depreciation": round(total_monthly_depreciation, 2),
            "total_current_value": round(total_current_value, 2),
            "count": len(purchases)
        }
    }

@api_router.post("/admin/cost-calculator/one-time")
async def create_one_time_purchase(purchase: OneTimePurchase):
    """Create a one-time purchase entry"""
    doc = {
        "id": str(uuid.uuid4()),
        "name": purchase.name,
        "category": purchase.category,
        "purchase_cost": purchase.purchase_cost,
        "purchase_date": purchase.purchase_date,
        "useful_life_months": purchase.useful_life_months,
        "salvage_value": purchase.salvage_value,
        "notes": purchase.notes,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.cost_one_time.insert_one(doc)
    doc.pop("_id", None)
    return doc

@api_router.put("/admin/cost-calculator/one-time/{item_id}")
async def update_one_time_purchase(item_id: str, purchase: OneTimePurchase):
    """Update a one-time purchase entry"""
    update_data = {k: v for k, v in purchase.model_dump().items() if v is not None and k != "id"}
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    result = await db.cost_one_time.update_one({"id": item_id}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Item not found")
    
    item = await db.cost_one_time.find_one({"id": item_id}, {"_id": 0})
    return item

@api_router.delete("/admin/cost-calculator/one-time/{item_id}")
async def delete_one_time_purchase(item_id: str):
    """Delete a one-time purchase entry"""
    result = await db.cost_one_time.delete_one({"id": item_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Item not found")
    return {"success": True}

# Monthly Fixed Costs CRUD
@api_router.get("/admin/cost-calculator/fixed-costs")
async def get_fixed_costs():
    """Get all monthly fixed costs"""
    costs = await db.cost_fixed.find({}, {"_id": 0}).to_list(100)
    total = sum(c.get("monthly_amount", 0) for c in costs)
    
    return {
        "costs": costs,
        "summary": {
            "total_monthly": round(total, 2),
            "count": len(costs)
        }
    }

@api_router.post("/admin/cost-calculator/fixed-costs")
async def create_fixed_cost(cost: MonthlyFixedCost):
    """Create a monthly fixed cost entry"""
    doc = {
        "id": str(uuid.uuid4()),
        "name": cost.name,
        "category": cost.category,
        "monthly_amount": cost.monthly_amount,
        "notes": cost.notes,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.cost_fixed.insert_one(doc)
    doc.pop("_id", None)
    return doc

@api_router.put("/admin/cost-calculator/fixed-costs/{item_id}")
async def update_fixed_cost(item_id: str, cost: MonthlyFixedCost):
    """Update a monthly fixed cost entry"""
    update_data = {k: v for k, v in cost.model_dump().items() if v is not None and k != "id"}
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    result = await db.cost_fixed.update_one({"id": item_id}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Item not found")
    
    item = await db.cost_fixed.find_one({"id": item_id}, {"_id": 0})
    return item

@api_router.delete("/admin/cost-calculator/fixed-costs/{item_id}")
async def delete_fixed_cost(item_id: str):
    """Delete a monthly fixed cost entry"""
    result = await db.cost_fixed.delete_one({"id": item_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Item not found")
    return {"success": True}

# Production Costs CRUD
@api_router.get("/admin/cost-calculator/production-costs")
async def get_production_costs():
    """Get all production cost items"""
    costs = await db.cost_production.find({}, {"_id": 0}).to_list(100)
    return {"costs": costs, "count": len(costs)}

@api_router.post("/admin/cost-calculator/production-costs")
async def create_production_cost(cost: ProductionCostItem):
    """Create a production cost item"""
    doc = {
        "id": str(uuid.uuid4()),
        "name": cost.name,
        "category": cost.category,
        "cost_per_unit": cost.cost_per_unit,
        "unit": cost.unit,
        "notes": cost.notes,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.cost_production.insert_one(doc)
    doc.pop("_id", None)
    return doc

@api_router.put("/admin/cost-calculator/production-costs/{item_id}")
async def update_production_cost(item_id: str, cost: ProductionCostItem):
    """Update a production cost item"""
    update_data = {k: v for k, v in cost.model_dump().items() if v is not None and k != "id"}
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    result = await db.cost_production.update_one({"id": item_id}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Item not found")
    
    item = await db.cost_production.find_one({"id": item_id}, {"_id": 0})
    return item

@api_router.delete("/admin/cost-calculator/production-costs/{item_id}")
async def delete_production_cost(item_id: str):
    """Delete a production cost item"""
    result = await db.cost_production.delete_one({"id": item_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Item not found")
    return {"success": True}

# Product Cost Configurations CRUD
@api_router.get("/admin/cost-calculator/product-configs")
async def get_product_cost_configs():
    """Get all product cost configurations"""
    configs = await db.cost_product_configs.find({}, {"_id": 0}).to_list(100)
    return {"configs": configs, "count": len(configs)}

@api_router.post("/admin/cost-calculator/product-configs")
async def create_product_cost_config(config: ProductCostConfig):
    """Create or update a product cost configuration"""
    # Check if config exists for this product
    existing = await db.cost_product_configs.find_one({"product_id": config.product_id})
    
    doc = {
        "product_id": config.product_id,
        "product_name": config.product_name,
        "trays_per_batch": config.trays_per_batch,
        "growth_days": config.growth_days,
        "yield_grams_per_tray": config.yield_grams_per_tray,
        "seed_cost_per_tray": config.seed_cost_per_tray,
        "soil_cost_per_tray": config.soil_cost_per_tray,
        "labor_hours_per_batch": config.labor_hours_per_batch,
        "labor_rate_per_hour": config.labor_rate_per_hour,
        "packaging_cost_per_unit": config.packaging_cost_per_unit,
        "other_variable_costs": config.other_variable_costs,
        "notes": config.notes,
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    if existing:
        await db.cost_product_configs.update_one({"product_id": config.product_id}, {"$set": doc})
    else:
        doc["id"] = str(uuid.uuid4())
        doc["created_at"] = datetime.now(timezone.utc).isoformat()
        await db.cost_product_configs.insert_one(doc)
    
    result = await db.cost_product_configs.find_one({"product_id": config.product_id}, {"_id": 0})
    return result

@api_router.delete("/admin/cost-calculator/product-configs/{product_id}")
async def delete_product_cost_config(product_id: str):
    """Delete a product cost configuration"""
    result = await db.cost_product_configs.delete_one({"product_id": product_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Config not found")
    return {"success": True}

# Calculate Product Costs
@api_router.get("/admin/cost-calculator/calculate")
async def calculate_product_costs(monthly_production_trays: int = 100):
    """Calculate per-product costs based on all cost inputs"""
    
    # Get all cost data
    one_time_result = await get_one_time_purchases()
    fixed_result = await get_fixed_costs()
    product_configs = await db.cost_product_configs.find({}, {"_id": 0}).to_list(100)
    products = await db.products.find({}, {"_id": 0}).to_list(100)
    
    # === 1. ONE-TIME COSTS (Depreciation) ===
    monthly_depreciation = one_time_result["summary"]["total_monthly_depreciation"]
    depreciation_per_tray = monthly_depreciation / monthly_production_trays if monthly_production_trays > 0 else 0
    
    # === 2. FIXED COSTS (Monthly) ===
    monthly_fixed = fixed_result["summary"]["total_monthly"]
    fixed_per_tray = monthly_fixed / monthly_production_trays if monthly_production_trays > 0 else 0
    
    # Total overhead per tray
    total_overhead_per_tray = depreciation_per_tray + fixed_per_tray
    
    # Calculate cost for each configured product
    product_costs = []
    for config in product_configs:
        product = next((p for p in products if p.get("id") == config.get("product_id")), None)
        
        trays = config.get("trays_per_batch", 1)
        yield_per_tray = config.get("yield_grams_per_tray", 100)
        total_yield_grams = trays * yield_per_tray
        
        # === 3. VARIABLE COSTS (per batch) ===
        seed_cost = config.get("seed_cost_per_tray", 0) * trays
        soil_cost = config.get("soil_cost_per_tray", 0) * trays
        labor_cost = config.get("labor_hours_per_batch", 0) * config.get("labor_rate_per_hour", 0)
        packaging_cost = config.get("packaging_cost_per_unit", 0)
        other_variable = config.get("other_variable_costs", 0) * trays
        
        total_variable_per_batch = seed_cost + soil_cost + labor_cost + other_variable
        
        # === OVERHEAD ALLOCATION (per batch) ===
        depreciation_allocation = depreciation_per_tray * trays
        fixed_cost_allocation = fixed_per_tray * trays
        total_overhead_per_batch = depreciation_allocation + fixed_cost_allocation
        
        # === TOTAL COST PER BATCH (All 3 categories) ===
        total_cost_per_batch = total_variable_per_batch + total_overhead_per_batch
        
        # === COST PER 100g ===
        cost_per_gram = total_cost_per_batch / total_yield_grams if total_yield_grams > 0 else 0
        cost_per_100g = (cost_per_gram * 100) + packaging_cost
        
        # Get selling price from product
        selling_price = product.get("price", 0) if product else 0
        
        # Profit margin
        profit = selling_price - cost_per_100g
        margin_percent = (profit / selling_price * 100) if selling_price > 0 else 0
        
        product_costs.append({
            "product_id": config.get("product_id"),
            "product_name": config.get("product_name"),
            "selling_price": selling_price,
            "cost_breakdown": {
                # Variable Costs
                "seed_cost": round(seed_cost, 2),
                "soil_cost": round(soil_cost, 2),
                "labor_cost": round(labor_cost, 2),
                "other_variable": round(other_variable, 2),
                "total_variable": round(total_variable_per_batch, 2),
                # One-Time (Depreciation)
                "depreciation_allocation": round(depreciation_allocation, 2),
                # Fixed Costs
                "fixed_cost_allocation": round(fixed_cost_allocation, 2),
                # Total Overhead
                "total_overhead": round(total_overhead_per_batch, 2),
                # Packaging (added to final 100g cost)
                "packaging_cost": round(packaging_cost, 2),
                # Grand Total
                "total_cost_per_batch": round(total_cost_per_batch, 2)
            },
            "yield": {
                "trays_per_batch": trays,
                "grams_per_tray": yield_per_tray,
                "total_grams": total_yield_grams,
                "growth_days": config.get("growth_days", 7)
            },
            "unit_costs": {
                "cost_per_gram": round(cost_per_gram, 4),
                "cost_per_100g": round(cost_per_100g, 2),
                "cost_per_tray": round(total_cost_per_batch / trays if trays > 0 else 0, 2)
            },
            "profitability": {
                "profit_per_unit": round(profit, 2),
                "margin_percent": round(margin_percent, 1),
                "profitable": profit > 0
            }
        })
    
    # Sort by margin
    product_costs.sort(key=lambda x: x["profitability"]["margin_percent"], reverse=True)
    
    # Total monthly overhead
    total_monthly_overhead = monthly_depreciation + monthly_fixed
    
    return {
        "monthly_overhead": {
            "depreciation": round(monthly_depreciation, 2),
            "fixed_costs": round(monthly_fixed, 2),
            "total": round(total_monthly_overhead, 2),
            "depreciation_per_tray": round(depreciation_per_tray, 2),
            "fixed_per_tray": round(fixed_per_tray, 2),
            "overhead_per_tray": round(total_overhead_per_tray, 2)
        },
        "monthly_production_trays": monthly_production_trays,
        "product_costs": product_costs,
        "summary": {
            "products_configured": len(product_costs),
            "avg_margin": round(sum(p["profitability"]["margin_percent"] for p in product_costs) / len(product_costs), 1) if product_costs else 0,
            "profitable_products": sum(1 for p in product_costs if p["profitability"]["profitable"]),
            "unprofitable_products": sum(1 for p in product_costs if not p["profitability"]["profitable"])
        }
    }

# ==========================================
# STORE SETTINGS ENDPOINTS
# ==========================================

@api_router.get("/store/settings")
async def get_store_settings():
    """Get store settings (public endpoint)"""
    settings = await db.store_settings.find_one({"id": "store_settings"}, {"_id": 0})
    if not settings:
        # Return defaults
        return StoreSettings().model_dump()
    return settings

@api_router.get("/admin/store/settings")
async def get_admin_store_settings():
    """Get store settings (admin)"""
    settings = await db.store_settings.find_one({"id": "store_settings"}, {"_id": 0})
    if not settings:
        return StoreSettings().model_dump()
    return settings

@api_router.put("/admin/store/settings")
async def update_store_settings(settings_update: StoreSettingsUpdate):
    """Update store settings"""
    update_data = {k: v for k, v in settings_update.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No data to update")
    
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    result = await db.store_settings.update_one(
        {"id": "store_settings"},
        {"$set": update_data},
        upsert=True
    )
    
    settings = await db.store_settings.find_one({"id": "store_settings"}, {"_id": 0})
    return settings

# ==========================================
# CATEGORY ENDPOINTS
# ==========================================

@api_router.get("/categories")
async def get_categories(active_only: bool = True, include_subcategories: bool = True, project_id: str = Depends(get_project_id)):
    """Get all categories (public)"""
    query = {"active": True} if active_only else {}
    query["project_id"] = project_id
    categories = await db.categories.find(query, {"_id": 0}).sort("display_order", 1).to_list(100)
    
    if include_subcategories:
        # Organize into parent-child structure
        parents = [c for c in categories if not c.get("parent_id")]
        for parent in parents:
            parent["subcategories"] = [c for c in categories if c.get("parent_id") == parent["id"]]
        return parents
    
    return categories

@api_router.get("/categories/{category_id}")
async def get_category(category_id: str):
    """Get a single category"""
    category = await db.categories.find_one({"id": category_id}, {"_id": 0})
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    return category

@api_router.get("/admin/categories")
async def get_admin_categories(project_id: str = Depends(get_project_id)):
    """Get all categories (admin - includes inactive)"""
    categories = await db.categories.find({"project_id": project_id}, {"_id": 0}).sort("display_order", 1).to_list(100)
    return categories

@api_router.post("/admin/categories")
async def create_category(category: CategoryCreate, project_id: str = Depends(get_project_id)):
    """Create a new category"""
    # Generate slug if not provided
    slug = category.slug or category.name.lower().replace(" ", "-").replace("&", "and")
    
    # Check for duplicate slug within the project
    existing = await db.categories.find_one({"slug": slug, "project_id": project_id})
    if existing:
        slug = f"{slug}-{str(uuid.uuid4())[:8]}"
    
    doc = {
        "id": str(uuid.uuid4()),
        "project_id": project_id,
        "name": category.name,
        "slug": slug,
        "description": category.description,
        "image": category.image,
        "icon": category.icon,
        "parent_id": category.parent_id,
        "display_order": category.display_order,
        "active": category.active,
        "show_on_home": category.show_on_home,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.categories.insert_one(doc)
    return {k: v for k, v in doc.items() if k != "_id"}

@api_router.put("/admin/categories/{category_id}")
async def update_category(category_id: str, category_update: CategoryUpdate):
    """Update a category"""
    update_data = {k: v for k, v in category_update.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No data to update")
    
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    result = await db.categories.update_one({"id": category_id}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Category not found")
    
    category = await db.categories.find_one({"id": category_id}, {"_id": 0})
    return category

@api_router.delete("/admin/categories/{category_id}")
async def delete_category(category_id: str):
    """Delete a category"""
    # Check if category has products
    products_count = await db.products.count_documents({"category_id": category_id})
    if products_count > 0:
        raise HTTPException(status_code=400, detail=f"Cannot delete category with {products_count} products. Reassign products first.")
    
    # Check if category has subcategories
    subcategories_count = await db.categories.count_documents({"parent_id": category_id})
    if subcategories_count > 0:
        raise HTTPException(status_code=400, detail=f"Cannot delete category with {subcategories_count} subcategories. Delete subcategories first.")
    
    result = await db.categories.delete_one({"id": category_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Category not found")
    
    return {"success": True}

# ==========================================
# DELIVERY SLOT ENDPOINTS
# ==========================================

@api_router.get("/delivery-slots")
async def get_delivery_slots(date: Optional[str] = None):
    """Get available delivery slots (public)"""
    slots = await db.delivery_slots.find({"active": True}, {"_id": 0}).sort("display_order", 1).to_list(50)
    
    if date:
        # Check availability for specific date
        from datetime import datetime as dt
        target_date = dt.fromisoformat(date.replace('Z', '+00:00'))
        day_name = target_date.strftime("%A")
        
        # Check if date is blocked
        blocked = await db.blocked_dates.find_one({"date": date})
        
        available_slots = []
        for slot in slots:
            # Check if slot is available on this day
            if slot.get("available_days") and day_name not in slot["available_days"]:
                continue
            
            # Check if date is blocked
            if blocked:
                if blocked.get("block_all_slots"):
                    continue
                if slot["id"] in blocked.get("blocked_slot_ids", []):
                    continue
            
            # Count existing orders for this slot on this date
            orders_count = await db.orders.count_documents({
                "delivery_slot_id": slot["id"],
                "delivery_date": date
            })
            
            slot_info = {
                **slot,
                "available": orders_count < slot["max_orders"],
                "orders_count": orders_count,
                "remaining_capacity": max(0, slot["max_orders"] - orders_count)
            }
            available_slots.append(slot_info)
        
        return available_slots
    
    return slots

@api_router.get("/admin/delivery-slots")
async def get_admin_delivery_slots():
    """Get all delivery slots (admin - includes inactive)"""
    slots = await db.delivery_slots.find({}, {"_id": 0}).sort("display_order", 1).to_list(50)
    return slots

@api_router.post("/admin/delivery-slots")
async def create_delivery_slot(slot: DeliverySlotCreate):
    """Create a new delivery slot"""
    display_text = slot.display_text or f"{slot.start_time} - {slot.end_time}"
    
    doc = {
        "id": str(uuid.uuid4()),
        "name": slot.name,
        "start_time": slot.start_time,
        "end_time": slot.end_time,
        "display_text": display_text,
        "max_orders": slot.max_orders,
        "delivery_fee": slot.delivery_fee,
        "active": slot.active,
        "display_order": slot.display_order,
        "available_days": slot.available_days,
        "cutoff_hours": slot.cutoff_hours,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.delivery_slots.insert_one(doc)
    return {k: v for k, v in doc.items() if k != "_id"}

@api_router.put("/admin/delivery-slots/{slot_id}")
async def update_delivery_slot(slot_id: str, slot_update: DeliverySlotUpdate):
    """Update a delivery slot"""
    update_data = {k: v for k, v in slot_update.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No data to update")
    
    # Update display_text if times changed
    if "start_time" in update_data or "end_time" in update_data:
        slot = await db.delivery_slots.find_one({"id": slot_id})
        if slot:
            start = update_data.get("start_time", slot.get("start_time"))
            end = update_data.get("end_time", slot.get("end_time"))
            update_data["display_text"] = f"{start} - {end}"
    
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    result = await db.delivery_slots.update_one({"id": slot_id}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Delivery slot not found")
    
    slot = await db.delivery_slots.find_one({"id": slot_id}, {"_id": 0})
    return slot

@api_router.delete("/admin/delivery-slots/{slot_id}")
async def delete_delivery_slot(slot_id: str):
    """Delete a delivery slot"""
    result = await db.delivery_slots.delete_one({"id": slot_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Delivery slot not found")
    return {"success": True}

# ==========================================
# BLOCKED DATES ENDPOINTS
# ==========================================

@api_router.get("/admin/blocked-dates")
async def get_blocked_dates():
    """Get all blocked dates"""
    dates = await db.blocked_dates.find({}, {"_id": 0}).sort("date", 1).to_list(100)
    return dates

@api_router.post("/admin/blocked-dates")
async def create_blocked_date(blocked_date: BlockedDateCreate):
    """Block a date for delivery"""
    # Check if date is already blocked
    existing = await db.blocked_dates.find_one({"date": blocked_date.date})
    if existing:
        raise HTTPException(status_code=400, detail="This date is already blocked")
    
    doc = {
        "id": str(uuid.uuid4()),
        "date": blocked_date.date,
        "reason": blocked_date.reason,
        "block_all_slots": blocked_date.block_all_slots,
        "blocked_slot_ids": blocked_date.blocked_slot_ids,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.blocked_dates.insert_one(doc)
    return {k: v for k, v in doc.items() if k != "_id"}

@api_router.delete("/admin/blocked-dates/{blocked_date_id}")
async def delete_blocked_date(blocked_date_id: str):
    """Unblock a date"""
    result = await db.blocked_dates.delete_one({"id": blocked_date_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Blocked date not found")
    return {"success": True}

# ==========================================
# PRODUCT UNIT ENDPOINTS
# ==========================================

@api_router.get("/product-units")
async def get_product_units():
    """Get all product units (public)"""
    units = await db.product_units.find({"active": True}, {"_id": 0}).sort("display_order", 1).to_list(20)
    
    # Return defaults if none exist
    if not units:
        return [
            {"id": "kg", "name": "Kilogram", "short_name": "kg", "conversion_to_grams": 1000, "is_weight_based": True},
            {"id": "g", "name": "Gram", "short_name": "g", "conversion_to_grams": 1, "is_weight_based": True},
            {"id": "piece", "name": "Piece", "short_name": "pc", "conversion_to_grams": 0, "is_weight_based": False},
            {"id": "dozen", "name": "Dozen", "short_name": "dz", "conversion_to_grams": 0, "is_weight_based": False},
            {"id": "bunch", "name": "Bunch", "short_name": "bunch", "conversion_to_grams": 0, "is_weight_based": False}
        ]
    
    return units

@api_router.get("/admin/product-units")
async def get_admin_product_units():
    """Get all product units (admin)"""
    units = await db.product_units.find({}, {"_id": 0}).sort("display_order", 1).to_list(20)
    return units

@api_router.post("/admin/product-units")
async def create_product_unit(unit: ProductUnitCreate):
    """Create a new product unit"""
    doc = {
        "id": str(uuid.uuid4()),
        "name": unit.name,
        "short_name": unit.short_name,
        "conversion_to_grams": unit.conversion_to_grams,
        "is_weight_based": unit.is_weight_based,
        "active": unit.active,
        "display_order": unit.display_order
    }
    
    await db.product_units.insert_one(doc)
    return {k: v for k, v in doc.items() if k != "_id"}

@api_router.delete("/admin/product-units/{unit_id}")
async def delete_product_unit(unit_id: str):
    """Delete a product unit"""
    result = await db.product_units.delete_one({"id": unit_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Product unit not found")
    return {"success": True}

# ==========================================
# PRODUCTS BY CATEGORY ENDPOINT
# ==========================================

@api_router.get("/products/by-category/{category_id}")
async def get_products_by_category(category_id: str, active_only: bool = True, project_id: str = Depends(get_project_id)):
    """Get all products in a category"""
    query = {"category_id": category_id, "project_id": project_id}
    if active_only:
        query["active"] = True
    
    # Get category name
    category = await db.categories.find_one({"id": category_id}, {"_id": 0, "name": 1})
    category_name = category["name"] if category else None
    
    products = await db.products.find(query, {"_id": 0}).sort("display_order", 1).to_list(200)
    
    # Add category name and image_url to each product
    for product in products:
        product["category_name"] = category_name
        # Map 'image' to 'image_url' for Flutter app compatibility
        if product.get("image") and not product.get("image_url"):
            product["image_url"] = product["image"]
        if not product.get("images"):
            _primary = product.get("image_url") or product.get("image")
            product["images"] = [_primary] if _primary else []
    
    return products

@api_router.get("/products/featured")
async def get_featured_products(project_id: str = Depends(get_project_id)):
    """Get featured products"""
    products = await db.products.find(
        {"active": True, "featured": True, "project_id": project_id}, 
        {"_id": 0}
    ).sort("display_order", 1).to_list(20)
    # Map 'image' to 'image_url' for Flutter app compatibility
    for product in products:
        if product.get("image") and not product.get("image_url"):
            product["image_url"] = product["image"]
        if not product.get("images"):
            _primary = product.get("image_url") or product.get("image")
            product["images"] = [_primary] if _primary else []
    return products

# ==========================================
# BANNER ENDPOINTS
# ==========================================

class BannerCreate(BaseModel):
    title: str
    subtitle: Optional[str] = None
    image_url: str
    link_type: Optional[str] = None  # 'product', 'category', 'url', 'none'
    link_value: Optional[str] = None  # product_id, category_id, or external URL
    display_order: int = 0
    active: bool = True
    start_date: Optional[str] = None
    end_date: Optional[str] = None

class BannerUpdate(BaseModel):
    title: Optional[str] = None
    subtitle: Optional[str] = None
    image_url: Optional[str] = None
    link_type: Optional[str] = None
    link_value: Optional[str] = None
    display_order: Optional[int] = None
    active: Optional[bool] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None

@api_router.get("/banners")
async def get_banners(project_id: str = Depends(get_project_id)):
    """Get active banners (public endpoint)"""
    now = datetime.now(timezone.utc).isoformat()
    
    # Get active banners, optionally filter by date range
    banners = await db.banners.find(
        {"active": True, "project_id": project_id},
        {"_id": 0}
    ).sort("display_order", 1).to_list(20)
    
    # Filter by date if start_date/end_date are set
    active_banners = []
    for banner in banners:
        start = banner.get("start_date")
        end = banner.get("end_date")
        
        # If no dates set, include banner
        if not start and not end:
            active_banners.append(banner)
            continue
        
        # Check date range
        if start and now < start:
            continue
        if end and now > end:
            continue
        
        active_banners.append(banner)
    
    return active_banners

@api_router.get("/admin/banners")
async def get_admin_banners(project_id: str = Depends(get_project_id)):
    """Get all banners (admin - includes inactive)"""
    banners = await db.banners.find({"project_id": project_id}, {"_id": 0}).sort("display_order", 1).to_list(100)
    return banners

@api_router.post("/admin/banners")
async def create_banner(banner: BannerCreate, project_id: str = Depends(get_project_id)):
    """Create a new banner"""
    doc = {
        "id": str(uuid.uuid4()),
        "project_id": project_id,
        "title": banner.title,
        "subtitle": banner.subtitle,
        "image_url": banner.image_url,
        "link_type": banner.link_type,
        "link_value": banner.link_value,
        "display_order": banner.display_order,
        "active": banner.active,
        "start_date": banner.start_date,
        "end_date": banner.end_date,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.banners.insert_one(doc)
    doc.pop("_id", None)
    return doc

@api_router.put("/admin/banners/{banner_id}")
async def update_banner(banner_id: str, banner: BannerUpdate):
    """Update a banner"""
    update_data = {k: v for k, v in banner.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No data to update")
    
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    result = await db.banners.update_one(
        {"id": banner_id},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Banner not found")
    
    updated = await db.banners.find_one({"id": banner_id}, {"_id": 0})
    return updated

@api_router.delete("/admin/banners/{banner_id}")
async def delete_banner(banner_id: str):
    """Delete a banner"""
    result = await db.banners.delete_one({"id": banner_id})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Banner not found")
    
    return {"message": "Banner deleted successfully"}

@api_router.post("/admin/banners/reorder")
async def reorder_banners(banner_ids: List[str]):
    """Reorder banners"""
    for index, banner_id in enumerate(banner_ids):
        await db.banners.update_one(
            {"id": banner_id},
            {"$set": {"display_order": index}}
        )
    return {"message": "Banners reordered successfully"}

# ==========================================
# APP CONFIGURATION ENDPOINTS
# ==========================================

class AppConfigCreate(BaseModel):
    # Branding
    app_name: str = "Khurpi Fresh"
    app_tagline: str = "Fresh from Farm to Table"
    logo_url: Optional[str] = None
    
    # Colors (hex format)
    primary_color: str = "#4CAF50"
    primary_dark_color: str = "#388E3C"
    primary_light_color: str = "#C8E6C9"
    secondary_color: str = "#FFC107"
    secondary_dark_color: str = "#F57C00"
    accent_color: str = "#FF5722"
    background_color: str = "#F5F5F5"
    surface_color: str = "#FFFFFF"
    card_color: str = "#FFFFFF"
    text_primary_color: str = "#212121"
    text_secondary_color: str = "#757575"
    text_hint_color: str = "#BDBDBD"
    error_color: str = "#F44336"
    success_color: str = "#4CAF50"
    warning_color: str = "#FFC107"
    info_color: str = "#2196F3"
    in_stock_color: str = "#4CAF50"
    growing_color: str = "#FFC107"
    out_of_stock_color: str = "#F44336"
    border_color: str = "#E0E0E0"
    divider_color: str = "#EEEEEE"
    
    # Typography
    font_family: str = "Poppins"
    heading_font_size: int = 24
    body_font_size: int = 14
    caption_font_size: int = 12
    
    # Supported Service Areas
    supported_countries: List[str] = ["India"]
    supported_states: List[str] = []
    supported_cities: List[str] = []
    supported_pincodes: List[str] = []
    supported_societies: List[str] = []
    
    # Delivery Settings
    min_order_value: float = 100
    free_delivery_threshold: float = 500
    default_delivery_fee: float = 40
    
    # Feature Flags
    enable_cod: bool = True
    enable_online_payment: bool = True
    enable_subscriptions: bool = True
    enable_referrals: bool = True
    enable_spin_wheel: bool = True
    
    # Contact Info
    support_phone: Optional[str] = None
    support_email: Optional[str] = None
    support_whatsapp: Optional[str] = None

@api_router.get("/config")
async def get_app_config():
    """Get app configuration (public endpoint for mobile app)"""
    config = await db.app_config.find_one({"type": "app_config"}, {"_id": 0})
    if not config:
        # Return default config if none exists
        return AppConfigCreate().model_dump()
    # Merge stored values over defaults so newly-added fields always present
    return {**AppConfigCreate().model_dump(), **config}

@api_router.get("/admin/config")
async def get_admin_config():
    """Get full app configuration (admin)"""
    config = await db.app_config.find_one({"type": "app_config"}, {"_id": 0})
    if not config:
        return AppConfigCreate().model_dump()
    return {**AppConfigCreate().model_dump(), **config}

@api_router.post("/admin/config")
async def save_app_config(config: AppConfigCreate):
    """Save/Update app configuration"""
    config_dict = config.model_dump()
    config_dict["type"] = "app_config"
    config_dict["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    await db.app_config.update_one(
        {"type": "app_config"},
        {"$set": config_dict},
        upsert=True
    )
    return {"message": "Configuration saved successfully", "config": config_dict}

# ==========================================
# SPIN WHEEL PRIZES ENDPOINTS
# ==========================================

class SpinPrizeCreate(BaseModel):
    name: str
    product_id: Optional[str] = None
    quantity: float = 0
    unit: str = "g"
    color: str = "#4CAF50"
    is_empty: bool = False
    products: List[dict] = []  # combo prize: [{product_id, name, quantity, unit}]

@api_router.get("/spin-wheel/prizes")
async def get_spin_prizes(project_id: str = Depends(get_project_id)):
    """Get spin wheel prizes configuration"""
    prizes = await db.spin_prizes.find({"project_id": project_id}, {"_id": 0}).to_list(20)
    if not prizes:
        # Return default prizes
        return [
            {"name": "Tomato", "product_id": "spin_tomato", "quantity": 250, "unit": "g", "color": "#E53935", "is_empty": False},
            {"name": "Better Luck!", "product_id": None, "quantity": 0, "unit": "g", "color": "#9E9E9E", "is_empty": True},
            {"name": "Spinach", "product_id": "spin_spinach", "quantity": 100, "unit": "g", "color": "#43A047", "is_empty": False},
            {"name": "Carrot", "product_id": "spin_carrot", "quantity": 200, "unit": "g", "color": "#FF9800", "is_empty": False},
            {"name": "Onion", "product_id": "spin_onion", "quantity": 250, "unit": "g", "color": "#8E24AA", "is_empty": False},
            {"name": "Potato", "product_id": "spin_potato", "quantity": 500, "unit": "g", "color": "#795548", "is_empty": False},
        ]
    # Enrich prizes with fresh product image/name/price so the wheel & cart show images
    for prize in prizes:
        pid = prize.get("product_id")
        if pid:
            prod = await db.products.find_one({"id": pid}, {"_id": 0, "image_url": 1, "image": 1, "name": 1, "price": 1})
            if prod and not prize.get("image_url"):
                prize["image_url"] = prod.get("image_url") or prod.get("image")
        for cp in prize.get("products", []):
            cpid = cp.get("product_id")
            if cpid:
                prod = await db.products.find_one({"id": cpid}, {"_id": 0, "image_url": 1, "image": 1, "name": 1, "price": 1})
                if prod:
                    if not cp.get("image_url"):
                        cp["image_url"] = prod.get("image_url") or prod.get("image")
                    cp.setdefault("name", prod.get("name"))
                    cp.setdefault("price", prod.get("price"))
    return prizes

@api_router.post("/admin/spin-wheel/prizes")
async def save_spin_prizes(prizes: List[SpinPrizeCreate], project_id: str = Depends(get_project_id)):
    """Save spin wheel prizes (admin)"""
    # Clear existing prizes for this project
    await db.spin_prizes.delete_many({"project_id": project_id})
    
    # Insert new prizes
    if prizes:
        prize_docs = []
        for i, prize in enumerate(prizes):
            prize_dict = prize.model_dump()
            prize_dict["id"] = str(uuid.uuid4())
            prize_dict["project_id"] = project_id
            prize_dict["order"] = i
            prize_docs.append(prize_dict)
        await db.spin_prizes.insert_many(prize_docs)
    
    return {"message": "Spin prizes saved successfully", "count": len(prizes)}

# ==========================================
# USER ADDRESS ENDPOINTS
# ==========================================

class AddressCreate(BaseModel):
    label: str = "Home"  # Home, Work, Other
    full_name: str
    phone: str
    address_line1: str
    address_line2: Optional[str] = None
    landmark: Optional[str] = None
    city: str
    state: str
    pincode: str
    country: str = "India"
    society: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    is_default: bool = False

class AddressUpdate(BaseModel):
    label: Optional[str] = None
    full_name: Optional[str] = None
    phone: Optional[str] = None
    address_line1: Optional[str] = None
    address_line2: Optional[str] = None
    landmark: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    pincode: Optional[str] = None
    country: Optional[str] = None
    society: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    is_default: Optional[bool] = None

@api_router.get("/addresses")
async def get_user_addresses_alt(user_id: str):
    """Get all addresses for a user (alternative endpoint)"""
    addresses = await db.addresses.find(
        {"user_id": user_id, "deleted": {"$ne": True}},
        {"_id": 0}
    ).sort("is_default", -1).to_list(50)
    return addresses

@api_router.get("/addresses/default")
async def get_default_address(user_id: str):
    """Get user's default address"""
    address = await db.addresses.find_one(
        {"user_id": user_id, "is_default": True, "deleted": {"$ne": True}},
        {"_id": 0}
    )
    if not address:
        # Return first address if no default
        address = await db.addresses.find_one(
            {"user_id": user_id, "deleted": {"$ne": True}},
            {"_id": 0}
        )
    return address

@api_router.post("/addresses")
async def create_address(user_id: str, address: AddressCreate):
    """Create a new address"""
    # Validate pincode against supported areas
    config = await db.app_config.find_one({"type": "app_config"})
    if config and config.get("supported_pincodes"):
        if address.pincode not in config["supported_pincodes"]:
            raise HTTPException(status_code=400, detail="Delivery not available in this area")
    
    # If this is default, unset other defaults
    if address.is_default:
        await db.addresses.update_many(
            {"user_id": user_id},
            {"$set": {"is_default": False}}
        )
    
    doc = {
        "id": str(uuid.uuid4()),
        "user_id": user_id,
        **address.model_dump(),
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.addresses.insert_one(doc)
    doc.pop("_id", None)
    return doc

@api_router.put("/addresses/{address_id}")
async def update_address(address_id: str, user_id: str, address: AddressUpdate):
    """Update an address"""
    update_data = {k: v for k, v in address.model_dump().items() if v is not None}
    
    if address.is_default:
        await db.addresses.update_many(
            {"user_id": user_id},
            {"$set": {"is_default": False}}
        )
    
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    result = await db.addresses.update_one(
        {"id": address_id, "user_id": user_id},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Address not found")
    
    updated = await db.addresses.find_one({"id": address_id}, {"_id": 0})
    return updated

@api_router.delete("/addresses/{address_id}")
async def delete_address(address_id: str, user_id: str):
    """Soft delete an address"""
    result = await db.addresses.update_one(
        {"id": address_id, "user_id": user_id},
        {"$set": {"deleted": True, "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Address not found")
    
    return {"message": "Address deleted successfully"}

@api_router.post("/addresses/{address_id}/set-default")
async def set_default_address_alt(address_id: str, user_id: str):
    """Set an address as default (alternative endpoint)"""
    # Unset all defaults
    await db.addresses.update_many(
        {"user_id": user_id},
        {"$set": {"is_default": False}}
    )
    
    # Set this as default
    result = await db.addresses.update_one(
        {"id": address_id, "user_id": user_id},
        {"$set": {"is_default": True}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Address not found")
    
    return {"message": "Default address updated"}

# ==========================================
# SEARCH ENDPOINTS
# ==========================================

class SearchQuery(BaseModel):
    query: str
    limit: int = 20

@api_router.get("/search")
async def search_products(q: str, limit: int = 20):
    """Search products by name or description"""
    if not q or len(q) < 2:
        return {"products": [], "query": q}
    
    # Text search on name and description
    products = await db.products.find(
        {
            "active": True,
            "$or": [
                {"name": {"$regex": q, "$options": "i"}},
                {"description": {"$regex": q, "$options": "i"}},
                {"tags": {"$regex": q, "$options": "i"}}
            ]
        },
        {"_id": 0}
    ).limit(limit).to_list(limit)
    
    # Map image to image_url for Flutter compatibility
    for product in products:
        if product.get("image") and not product.get("image_url"):
            product["image_url"] = product["image"]
        if not product.get("images"):
            _primary = product.get("image_url") or product.get("image")
            product["images"] = [_primary] if _primary else []
    
    return {"products": products, "query": q, "count": len(products)}

@api_router.get("/search/recent")
async def get_recent_searches(user_id: str, limit: int = 5):
    """Get recent searches for a user"""
    searches = await db.recent_searches.find(
        {"user_id": user_id},
        {"_id": 0}
    ).sort("searched_at", -1).limit(limit).to_list(limit)
    return searches

@api_router.post("/search/recent")
async def save_recent_search(user_id: str, query: str):
    """Save a recent search"""
    # Remove if already exists
    await db.recent_searches.delete_one({"user_id": user_id, "query": query})
    
    # Add new search
    await db.recent_searches.insert_one({
        "id": str(uuid.uuid4()),
        "user_id": user_id,
        "query": query,
        "searched_at": datetime.now(timezone.utc).isoformat()
    })
    
    # Keep only last 10 searches
    all_searches = await db.recent_searches.find(
        {"user_id": user_id}
    ).sort("searched_at", -1).to_list(100)
    
    if len(all_searches) > 10:
        ids_to_delete = [s["id"] for s in all_searches[10:]]
        await db.recent_searches.delete_many({"id": {"$in": ids_to_delete}})
    
    return {"message": "Search saved"}

@api_router.delete("/search/recent")
async def clear_recent_searches(user_id: str):
    """Clear all recent searches for a user"""
    await db.recent_searches.delete_many({"user_id": user_id})
    return {"message": "Recent searches cleared"}

# ==========================================
# SUBCATEGORY ENDPOINTS
# ==========================================

class SubcategoryCreate(BaseModel):
    name: str
    slug: Optional[str] = None
    description: Optional[str] = None
    image: Optional[str] = None
    parent_category_id: str
    display_order: int = 0
    active: bool = True

class SubcategoryUpdate(BaseModel):
    name: Optional[str] = None
    slug: Optional[str] = None
    description: Optional[str] = None
    image: Optional[str] = None
    parent_category_id: Optional[str] = None
    display_order: Optional[int] = None
    active: Optional[bool] = None

@api_router.get("/subcategories")
async def get_subcategories(category_id: Optional[str] = None, project_id: str = Depends(get_project_id)):
    """Get subcategories, optionally filtered by parent category"""
    query = {"active": True, "project_id": project_id}
    if category_id:
        query["parent_category_id"] = category_id
    
    subcategories = await db.subcategories.find(
        query, {"_id": 0}
    ).sort("display_order", 1).to_list(100)
    return subcategories

@api_router.get("/admin/subcategories")
async def get_admin_subcategories(category_id: Optional[str] = None, project_id: str = Depends(get_project_id)):
    """Get all subcategories (admin - includes inactive)"""
    query = {"project_id": project_id}
    if category_id:
        query["parent_category_id"] = category_id
    
    subcategories = await db.subcategories.find(
        query, {"_id": 0}
    ).sort("display_order", 1).to_list(100)
    return subcategories

@api_router.post("/admin/subcategories")
async def create_subcategory(subcategory: SubcategoryCreate, project_id: str = Depends(get_project_id)):
    """Create a new subcategory"""
    doc = {
        "id": str(uuid.uuid4()),
        **subcategory.model_dump(),
        "project_id": project_id,
        "slug": subcategory.slug or subcategory.name.lower().replace(" ", "-"),
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.subcategories.insert_one(doc)
    doc.pop("_id", None)
    return doc

@api_router.put("/admin/subcategories/{subcategory_id}")
async def update_subcategory(subcategory_id: str, subcategory: SubcategoryUpdate):
    """Update a subcategory"""
    update_data = {k: v for k, v in subcategory.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No data to update")
    
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    result = await db.subcategories.update_one(
        {"id": subcategory_id},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Subcategory not found")
    
    updated = await db.subcategories.find_one({"id": subcategory_id}, {"_id": 0})
    return updated

@api_router.delete("/admin/subcategories/{subcategory_id}")
async def delete_subcategory(subcategory_id: str):
    """Delete a subcategory"""
    result = await db.subcategories.delete_one({"id": subcategory_id})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Subcategory not found")
    
    return {"message": "Subcategory deleted successfully"}

# Update products endpoint to support subcategory filtering
@api_router.get("/products/by-subcategory/{subcategory_id}")
async def get_products_by_subcategory(subcategory_id: str):
    """Get products by subcategory"""
    products = await db.products.find(
        {"subcategory_id": subcategory_id, "active": True},
        {"_id": 0}
    ).sort("display_order", 1).to_list(100)
    
    for product in products:
        if product.get("image") and not product.get("image_url"):
            product["image_url"] = product["image"]
    
    return products

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