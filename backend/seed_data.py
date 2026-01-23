import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
from pathlib import Path
import uuid
from datetime import datetime, timezone

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

async def seed_products():
    await db.products.delete_many({})
    
    products = [
        {
            "id": str(uuid.uuid4()),
            "name": "Sunflower Microgreens",
            "image": "https://images.unsplash.com/photo-1647613233075-e0d5546b0f22?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1NzZ8MHwxfHNlYXJjaHw0fHxtaWNyb2dyZWVucyUyMHRyYXklMjBmcmVzaHxlbnwwfHx8fDE3NjkxNzI1MjB8MA&ixlib=rb-4.1.0&q=85",
            "benefit": "Rich in vitamins E, B complex, and minerals. Supports heart health and boosts energy.",
            "price": 120.0,
            "growth_days": 10,
            "active": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Garden Cress",
            "image": "https://images.unsplash.com/photo-1653076446136-705337f5d2a1?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1NzZ8MHwxfHNlYXJjaHwyfHxtaWNyb2dyZWVucyUyMHRyYXklMjBmcmVzaHxlbnwwfHx8fDE3NjkxNzI1MjB8MA&ixlib=rb-4.1.0&q=85",
            "benefit": "High in iron and calcium. Great for bone health and improving immunity.",
            "price": 100.0,
            "growth_days": 7,
            "active": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Mixed Salad Microgreens",
            "image": "https://images.unsplash.com/photo-1633133451255-5e7b18ba768a?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1NzZ8MHwxfHNlYXJjaHwzfHxtaWNyb2dyZWVucyUyMHRyYXklMjBmcmVzaHxlbnwwfHx8fDE3NjkxNzI1MjB8MA&ixlib=rb-4.1.0&q=85",
            "benefit": "A blend of multiple greens packed with antioxidants and essential nutrients.",
            "price": 150.0,
            "growth_days": 12,
            "active": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Radish Microgreens",
            "image": "https://images.unsplash.com/photo-1647613233056-fc9918256a8d?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1NzZ8MHwxfHNlYXJjaHwxfHxtaWNyb2dyZWVucyUyMHRyYXklMjBmcmVzaHxlbnwwfHx8fDE3NjkxNzI1MjB8MA&ixlib=rb-4.1.0&q=85",
            "benefit": "Spicy flavor with high vitamin C content. Supports digestion and detoxification.",
            "price": 110.0,
            "growth_days": 8,
            "active": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Mustard Microgreens",
            "image": "https://images.unsplash.com/photo-1653076446136-705337f5d2a1?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1NzZ8MHwxfHNlYXJjaHwyfHxtaWNyb2dyZWVucyUyMHRyYXklMjBmcmVzaHxlbnwwfHx8fDE3NjkxNzI1MjB8MA&ixlib=rb-4.1.0&q=85",
            "benefit": "Contains cancer-fighting compounds and rich in vitamins A, C, and K.",
            "price": 115.0,
            "growth_days": 9,
            "active": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Broccoli Microgreens",
            "image": "https://images.unsplash.com/photo-1647613233075-e0d5546b0f22?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1NzZ8MHwxfHNlYXJjaHw0fHxtaWNyb2dyZWVucyUyMHRyYXklMjBmcmVzaHxlbnwwfHx8fDE3NjkxNzI1MjB8MA&ixlib=rb-4.1.0&q=85",
            "benefit": "Rich in sulforaphane, supports heart health and cancer prevention.",
            "price": 130.0,
            "growth_days": 11,
            "active": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
    ]
    
    await db.products.insert_many(products)
    print(f"Seeded {len(products)} products successfully!")

async def main():
    await seed_products()
    client.close()

if __name__ == "__main__":
    asyncio.run(main())
