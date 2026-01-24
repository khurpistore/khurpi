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

async def seed_new_products():
    # Clear existing products
    await db.products.delete_many({})
    
    products = [
        {
            "id": str(uuid.uuid4()),
            "name": "Turnip Microgreens",
            "image": "https://images.unsplash.com/photo-1647613233056-fc9918256a8d?crop=entropy&cs=srgb&fm=jpg&q=85",
            "benefit": "High in vitamin C, calcium, and potassium. Supports bone health and immune function.",
            "nutrients": "Vitamins: A, C, K | Minerals: Calcium, Iron, Potassium | Antioxidants: Beta-carotene",
            "price": 180.0,
            "growth_days": 8,
            "stock": 50,
            "active": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Basil Microgreens",
            "image": "https://images.unsplash.com/photo-1653076446136-705337f5d2a1?crop=entropy&cs=srgb&fm=jpg&q=85",
            "benefit": "Rich in antioxidants and anti-inflammatory compounds. Aids digestion and reduces stress.",
            "nutrients": "Vitamins: A, C, K | Minerals: Calcium, Iron, Magnesium | Essential oils: Eugenol, Linalool",
            "price": 190.0,
            "growth_days": 12,
            "active": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Green Pea Shoot Microgreens",
            "image": "https://images.unsplash.com/photo-1633133451255-5e7b18ba768a?crop=entropy&cs=srgb&fm=jpg&q=85",
            "benefit": "Excellent source of plant protein and fiber. Supports heart health and blood sugar control.",
            "nutrients": "Vitamins: A, C, K, Folate | Minerals: Iron, Zinc | Protein: 7g per 100g",
            "price": 150.0,
            "growth_days": 10,
            "active": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Oats Microgreens",
            "image": "https://images.unsplash.com/photo-1647613233075-e0d5546b0f22?crop=entropy&cs=srgb&fm=jpg&q=85",
            "benefit": "Contains beta-glucan fiber for cholesterol reduction. Supports digestive and heart health.",
            "nutrients": "Vitamins: B-complex, E | Minerals: Manganese, Phosphorus | Fiber: Soluble and Insoluble",
            "price": 150.0,
            "growth_days": 9,
            "active": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Sweet Corn Microgreens",
            "image": "https://images.unsplash.com/photo-1647613233056-fc9918256a8d?crop=entropy&cs=srgb&fm=jpg&q=85",
            "benefit": "High in lutein and zeaxanthin for eye health. Natural sweetness with low calories.",
            "nutrients": "Vitamins: A, B, C | Minerals: Magnesium, Potassium | Carotenoids: Lutein, Zeaxanthin",
            "price": 160.0,
            "growth_days": 10,
            "active": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Cabbage Microgreens",
            "image": "https://images.unsplash.com/photo-1653076446136-705337f5d2a1?crop=entropy&cs=srgb&fm=jpg&q=85",
            "benefit": "Contains sulforaphane for cancer prevention. Supports liver detoxification and gut health.",
            "nutrients": "Vitamins: C, K, B6 | Minerals: Calcium, Potassium | Compounds: Sulforaphane, Indoles",
            "price": 180.0,
            "growth_days": 11,
            "active": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Cauliflower Microgreens",
            "image": "https://images.unsplash.com/photo-1633133451255-5e7b18ba768a?crop=entropy&cs=srgb&fm=jpg&q=85",
            "benefit": "Anti-inflammatory properties. Rich in choline for brain health and cognitive function.",
            "nutrients": "Vitamins: C, K, B9 | Minerals: Manganese, Potassium | Choline: 45mg per 100g",
            "price": 200.0,
            "growth_days": 11,
            "active": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Pak Choi Microgreens",
            "image": "https://images.unsplash.com/photo-1647613233075-e0d5546b0f22?crop=entropy&cs=srgb&fm=jpg&q=85",
            "benefit": "Powerhouse of vitamins. Supports bone health, immunity, and cardiovascular function.",
            "nutrients": "Vitamins: A, C, K | Minerals: Calcium, Iron, Folate | Antioxidants: Beta-carotene",
            "price": 165.0,
            "growth_days": 10,
            "active": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Red Amaranthus Microgreens",
            "image": "https://images.unsplash.com/photo-1647613233056-fc9918256a8d?crop=entropy&cs=srgb&fm=jpg&q=85",
            "benefit": "High in protein and lysine. Supports muscle growth and reduces inflammation.",
            "nutrients": "Vitamins: A, C, K, E | Minerals: Iron, Calcium, Magnesium | Protein: 9g per 100g",
            "price": 190.0,
            "growth_days": 9,
            "active": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Alfalfa Microgreens",
            "image": "https://images.unsplash.com/photo-1653076446136-705337f5d2a1?crop=entropy&cs=srgb&fm=jpg&q=85",
            "benefit": "Complete source of vitamins and minerals. Detoxifies liver and reduces cholesterol.",
            "nutrients": "Vitamins: K, C, A, B-complex | Minerals: Calcium, Iron, Zinc | Chlorophyll: High",
            "price": 160.0,
            "growth_days": 8,
            "active": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Radish Microgreens",
            "image": "https://images.unsplash.com/photo-1633133451255-5e7b18ba768a?crop=entropy&cs=srgb&fm=jpg&q=85",
            "benefit": "Spicy flavor with high vitamin C. Supports digestion and liver detoxification.",
            "nutrients": "Vitamins: C, A, K | Minerals: Calcium, Iron | Enzymes: Myrosinase",
            "price": 150.0,
            "growth_days": 7,
            "active": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Clover Microgreens",
            "image": "https://images.unsplash.com/photo-1647613233075-e0d5546b0f22?crop=entropy&cs=srgb&fm=jpg&q=85",
            "benefit": "Isoflavones for hormonal balance. Supports heart health and bone density.",
            "nutrients": "Vitamins: C, K, A | Minerals: Calcium, Magnesium | Isoflavones: Genistein, Daidzein",
            "price": 150.0,
            "growth_days": 9,
            "active": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Beet Root Microgreens",
            "image": "https://images.unsplash.com/photo-1647613233056-fc9918256a8d?crop=entropy&cs=srgb&fm=jpg&q=85",
            "benefit": "Natural nitrates for blood pressure control. Improves athletic performance and stamina.",
            "nutrients": "Vitamins: A, C, K | Minerals: Iron, Potassium, Magnesium | Nitrates: 250mg per 100g",
            "price": 180.0,
            "growth_days": 10,
            "active": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Fenugreek Microgreens",
            "image": "https://images.unsplash.com/photo-1653076446136-705337f5d2a1?crop=entropy&cs=srgb&fm=jpg&q=85",
            "benefit": "Regulates blood sugar and cholesterol. Supports lactation and digestive health.",
            "nutrients": "Vitamins: A, C, K | Minerals: Iron, Calcium | Fiber: 3g per 100g",
            "price": 150.0,
            "growth_days": 8,
            "active": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Kohlrabi Purple Microgreens",
            "image": "https://images.unsplash.com/photo-1633133451255-5e7b18ba768a?crop=entropy&cs=srgb&fm=jpg&q=85",
            "benefit": "Rich in anthocyanins. Anti-inflammatory and supports immune system health.",
            "nutrients": "Vitamins: C, B6, K | Minerals: Potassium, Copper | Anthocyanins: High",
            "price": 190.0,
            "growth_days": 9,
            "active": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Kale Purple Microgreens",
            "image": "https://images.unsplash.com/photo-1647613233075-e0d5546b0f22?crop=entropy&cs=srgb&fm=jpg&q=85",
            "benefit": "Superfood with highest antioxidant content. Supports eye, bone, and heart health.",
            "nutrients": "Vitamins: A, C, K (1000% DV) | Minerals: Calcium, Iron | Antioxidants: Quercetin, Kaempferol",
            "price": 200.0,
            "growth_days": 12,
            "active": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Red Carrot Microgreens",
            "image": "https://images.unsplash.com/photo-1647613233056-fc9918256a8d?crop=entropy&cs=srgb&fm=jpg&q=85",
            "benefit": "Beta-carotene for vision and skin health. Powerful antioxidant properties.",
            "nutrients": "Vitamins: A (300% DV), C, K | Minerals: Potassium | Carotenoids: Alpha & Beta-carotene",
            "price": 190.0,
            "growth_days": 10,
            "active": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Spinach / Palak Microgreens",
            "image": "https://images.unsplash.com/photo-1653076446136-705337f5d2a1?crop=entropy&cs=srgb&fm=jpg&q=85",
            "benefit": "Iron-rich for energy and blood health. Supports muscle function and cognitive health.",
            "nutrients": "Vitamins: A, C, K, Folate | Minerals: Iron, Calcium, Magnesium | Nitrates: High",
            "price": 150.0,
            "growth_days": 9,
            "active": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Red Radish Microgreens",
            "image": "https://images.unsplash.com/photo-1633133451255-5e7b18ba768a?crop=entropy&cs=srgb&fm=jpg&q=85",
            "benefit": "Anthocyanin-rich with peppery flavor. Supports liver detox and anti-aging.",
            "nutrients": "Vitamins: C, A, K, E | Minerals: Calcium, Iron | Anthocyanins: High",
            "price": 180.0,
            "growth_days": 8,
            "stock": 50,
            "active": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Pink Radish Microgreens",
            "image": "https://images.unsplash.com/photo-1647613233075-e0d5546b0f22?crop=entropy&cs=srgb&fm=jpg&q=85",
            "benefit": "Mild flavor with beautiful color. Supports digestion and cardiovascular health.",
            "nutrients": "Vitamins: C, K, Folate | Minerals: Potassium, Calcium | Flavonoids: High",
            "price": 190.0,
            "growth_days": 8,
            "active": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Red Spinach Microgreens",
            "image": "https://images.unsplash.com/photo-1647613233056-fc9918256a8d?crop=entropy&cs=srgb&fm=jpg&q=85",
            "benefit": "Higher antioxidants than green spinach. Supports blood health and reduces oxidative stress.",
            "nutrients": "Vitamins: A, C, E, K | Minerals: Iron, Calcium | Betalains: Anti-inflammatory compounds",
            "price": 195.0,
            "growth_days": 10,
            "active": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Broccoli Microgreens",
            "image": "https://images.unsplash.com/photo-1653076446136-705337f5d2a1?crop=entropy&cs=srgb&fm=jpg&q=85",
            "benefit": "50x more sulforaphane than mature broccoli. Powerful cancer-fighting properties.",
            "nutrients": "Vitamins: C, K, A | Minerals: Calcium, Iron | Sulforaphane: 100mg per 100g",
            "price": 200.0,
            "growth_days": 11,
            "active": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Sunflower Microgreens",
            "image": "https://images.unsplash.com/photo-1633133451255-5e7b18ba768a?crop=entropy&cs=srgb&fm=jpg&q=85",
            "benefit": "Complete protein source with nutty flavor. Rich in vitamins E and selenium for skin health.",
            "nutrients": "Vitamins: E (200% DV), B-complex | Minerals: Selenium, Zinc, Iron | Protein: 6g per 100g",
            "price": 160.0,
            "growth_days": 10,
            "active": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
    ]
    
    await db.products.insert_many(products)
    print(f"Seeded {len(products)} new microgreens products successfully!")

async def main():
    await seed_new_products()
    client.close()

if __name__ == "__main__":
    asyncio.run(main())
