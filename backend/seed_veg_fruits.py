"""
Seed script to populate the database with vegetables and fruits
"""
import asyncio
import os
import uuid
from datetime import datetime, timezone
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB Configuration
mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
db_name = os.environ.get('DB_NAME', 'khurpi_test')

client = AsyncIOMotorClient(mongo_url)
db = client[db_name]

# Category IDs (fetched from the database)
CATEGORIES = {
    "vegetables": "034c8aea-38f6-49d0-b21e-3aee1f8b1365",
    "fruits": "54e2ce6c-4261-44eb-994f-64ac5a8c678b",
    "leafy_greens": "6900f756-4063-40f7-b158-c93a7d63508f",
    "root_vegetables": "3a1f7ff8-71db-4494-be32-6df62693f3dc",
    "exotic": "d790f665-5c8d-4267-b078-aceee52da106"
}

# Products data organized by category
VEGETABLES = [
    {
        "name": "Fresh Tomatoes",
        "image": "https://images.pexels.com/photos/33499935/pexels-photo-33499935.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
        "benefit": "Rich in lycopene, vitamins A and C. Supports heart health and skin vitality.",
        "nutrients": "Vitamins: A, C, K | Minerals: Potassium | Antioxidants: Lycopene, Beta-carotene",
        "price": 40,
        "wholesale_price": 30,
        "stock_status": "in_stock",
        "stock_quantity": 100,
        "shelf_life_days": 7
    },
    {
        "name": "Fresh Cauliflower",
        "image": "https://images.pexels.com/photos/32640196/pexels-photo-32640196.jpeg",
        "benefit": "High in fiber and B-vitamins. Supports digestion and brain health.",
        "nutrients": "Vitamins: C, K, B6 | Minerals: Potassium, Manganese | Fiber: High",
        "price": 35,
        "wholesale_price": 25,
        "stock_status": "in_stock",
        "stock_quantity": 50,
        "shelf_life_days": 10
    },
    {
        "name": "Fresh Cabbage",
        "image": "https://images.unsplash.com/photo-1594282486552-05b4d80fbb9f",
        "benefit": "Low calorie, high in vitamin C and K. Aids digestion and immunity.",
        "nutrients": "Vitamins: C, K, B6 | Minerals: Manganese, Potassium | Fiber: High",
        "price": 25,
        "wholesale_price": 18,
        "stock_status": "in_stock",
        "stock_quantity": 80,
        "shelf_life_days": 14
    },
    {
        "name": "Fresh Broccoli",
        "image": "https://images.pexels.com/photos/30893315/pexels-photo-30893315.jpeg",
        "benefit": "Excellent source of vitamins C and K. Supports bone health and immunity.",
        "nutrients": "Vitamins: C, K, A | Minerals: Iron, Potassium | Fiber: High",
        "price": 60,
        "wholesale_price": 45,
        "stock_status": "in_stock",
        "stock_quantity": 40,
        "shelf_life_days": 7
    },
    {
        "name": "French Beans",
        "image": "https://images.unsplash.com/photo-1574963835594-61eede2070dc",
        "benefit": "Rich in fiber, folate, and vitamin K. Supports heart and bone health.",
        "nutrients": "Vitamins: K, C, A | Minerals: Iron, Manganese | Protein: Moderate",
        "price": 80,
        "wholesale_price": 60,
        "stock_status": "in_stock",
        "stock_quantity": 35,
        "shelf_life_days": 5
    },
    {
        "name": "Bell Peppers (Capsicum)",
        "image": "https://images.pexels.com/photos/28352592/pexels-photo-28352592.jpeg",
        "benefit": "Very high in vitamin C. Contains antioxidants that support eye health.",
        "nutrients": "Vitamins: C, A, B6 | Minerals: Potassium | Antioxidants: Capsanthin",
        "price": 120,
        "wholesale_price": 90,
        "stock_status": "in_stock",
        "stock_quantity": 60,
        "shelf_life_days": 10
    },
    {
        "name": "Fresh Cucumber",
        "image": "https://images.pexels.com/photos/17975573/pexels-photo-17975573.jpeg",
        "benefit": "Hydrating with low calories. Good for skin and helps in weight management.",
        "nutrients": "Vitamins: K, C | Minerals: Potassium, Magnesium | Water: 95%",
        "price": 30,
        "wholesale_price": 22,
        "stock_status": "in_stock",
        "stock_quantity": 100,
        "shelf_life_days": 7
    },
    {
        "name": "Brinjal (Eggplant)",
        "image": "https://images.pexels.com/photos/5701882/pexels-photo-5701882.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
        "benefit": "Rich in fiber and antioxidants. Supports heart health and blood sugar control.",
        "nutrients": "Vitamins: B1, B6 | Minerals: Potassium, Copper | Antioxidants: Nasunin",
        "price": 40,
        "wholesale_price": 28,
        "stock_status": "in_stock",
        "stock_quantity": 70,
        "shelf_life_days": 7
    },
    {
        "name": "Green Peas",
        "image": "https://images.pexels.com/photos/32188889/pexels-photo-32188889.jpeg",
        "benefit": "High in protein and fiber. Excellent source of vitamins A, K, and C.",
        "nutrients": "Vitamins: A, K, C | Minerals: Iron, Zinc | Protein: High",
        "price": 90,
        "wholesale_price": 70,
        "stock_status": "growing",
        "stock_quantity": 20,
        "shelf_life_days": 5
    },
    {
        "name": "Bitter Gourd (Karela)",
        "image": "https://images.unsplash.com/photo-1676994174279-102e0abff98f",
        "benefit": "Helps regulate blood sugar. Rich in vitamins and minerals.",
        "nutrients": "Vitamins: C, A, B | Minerals: Iron, Potassium | Antioxidants: High",
        "price": 50,
        "wholesale_price": 38,
        "stock_status": "in_stock",
        "stock_quantity": 40,
        "shelf_life_days": 7
    },
    {
        "name": "Lady Finger (Okra)",
        "image": "https://images.unsplash.com/photo-1610210143623-417eda0cca0e?crop=entropy&cs=srgb&fm=jpg&q=85",
        "benefit": "Good for digestion and blood sugar control. Rich in fiber and vitamins.",
        "nutrients": "Vitamins: C, K, A | Minerals: Magnesium, Folate | Fiber: High",
        "price": 45,
        "wholesale_price": 32,
        "stock_status": "in_stock",
        "stock_quantity": 55,
        "shelf_life_days": 5
    },
    {
        "name": "Pumpkin",
        "image": "https://images.unsplash.com/photo-1634977961336-0a9237b8a064?crop=entropy&cs=srgb&fm=jpg&q=85",
        "benefit": "High in beta-carotene and vitamin A. Supports eye health and immunity.",
        "nutrients": "Vitamins: A, C, E | Minerals: Potassium, Iron | Fiber: Moderate",
        "price": 30,
        "wholesale_price": 20,
        "stock_status": "in_stock",
        "stock_quantity": 45,
        "shelf_life_days": 30
    },
    {
        "name": "Green Chillies",
        "image": "https://images.unsplash.com/photo-1599987141071-f5810d32e21a?crop=entropy&cs=srgb&fm=jpg&q=85",
        "benefit": "Boosts metabolism and contains capsaicin. Rich in vitamins A and C.",
        "nutrients": "Vitamins: A, C, B6 | Minerals: Iron, Potassium | Capsaicin: High",
        "price": 60,
        "wholesale_price": 45,
        "stock_status": "in_stock",
        "stock_quantity": 80,
        "shelf_life_days": 10
    },
    {
        "name": "Fresh Corn",
        "image": "https://images.unsplash.com/photo-1634467524884-897d0af5e104?crop=entropy&cs=srgb&fm=jpg&q=85",
        "benefit": "Good source of fiber and B vitamins. Supports digestive health.",
        "nutrients": "Vitamins: B5, B1, C | Minerals: Magnesium, Phosphorus | Fiber: High",
        "price": 35,
        "wholesale_price": 25,
        "stock_status": "in_stock",
        "stock_quantity": 60,
        "shelf_life_days": 5
    },
    {
        "name": "Fresh Mushrooms",
        "image": "https://images.pexels.com/photos/8541399/pexels-photo-8541399.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
        "benefit": "Rich in antioxidants and selenium. Supports immune function.",
        "nutrients": "Vitamins: D, B2, B3 | Minerals: Selenium, Copper | Protein: Moderate",
        "price": 150,
        "wholesale_price": 110,
        "stock_status": "in_stock",
        "stock_quantity": 30,
        "shelf_life_days": 5
    },
    {
        "name": "Bean Sprouts",
        "image": "https://images.pexels.com/photos/36346265/pexels-photo-36346265.jpeg",
        "benefit": "Low calorie, high in protein. Excellent for weight management.",
        "nutrients": "Vitamins: C, K | Minerals: Iron, Manganese | Protein: High",
        "price": 40,
        "wholesale_price": 28,
        "stock_status": "in_stock",
        "stock_quantity": 35,
        "shelf_life_days": 3
    }
]

ROOT_VEGETABLES = [
    {
        "name": "Fresh Potatoes",
        "image": "https://images.pexels.com/photos/33653570/pexels-photo-33653570.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
        "benefit": "Good source of potassium and vitamin C. Provides sustained energy.",
        "nutrients": "Vitamins: C, B6 | Minerals: Potassium, Manganese | Fiber: Moderate",
        "price": 30,
        "wholesale_price": 22,
        "stock_status": "in_stock",
        "stock_quantity": 200,
        "shelf_life_days": 21
    },
    {
        "name": "Fresh Onions",
        "image": "https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb",
        "benefit": "Rich in antioxidants and sulfur compounds. Supports heart health.",
        "nutrients": "Vitamins: C, B6 | Minerals: Potassium, Manganese | Antioxidants: Quercetin",
        "price": 35,
        "wholesale_price": 25,
        "stock_status": "in_stock",
        "stock_quantity": 250,
        "shelf_life_days": 30
    },
    {
        "name": "Fresh Carrots",
        "image": "https://images.pexels.com/photos/4193418/pexels-photo-4193418.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
        "benefit": "Excellent source of beta-carotene. Supports eye health and immunity.",
        "nutrients": "Vitamins: A, K, C | Minerals: Potassium | Antioxidants: Beta-carotene",
        "price": 40,
        "wholesale_price": 28,
        "stock_status": "in_stock",
        "stock_quantity": 120,
        "shelf_life_days": 21
    },
    {
        "name": "Fresh Beetroot",
        "image": "https://images.pexels.com/photos/20517382/pexels-photo-20517382.jpeg",
        "benefit": "High in nitrates for blood pressure. Rich in folate and manganese.",
        "nutrients": "Vitamins: C, B9 | Minerals: Manganese, Potassium | Nitrates: High",
        "price": 45,
        "wholesale_price": 32,
        "stock_status": "in_stock",
        "stock_quantity": 70,
        "shelf_life_days": 14
    },
    {
        "name": "Fresh Radish",
        "image": "https://images.pexels.com/photos/11770221/pexels-photo-11770221.jpeg",
        "benefit": "Low calorie, good for digestion. Contains natural compounds for detox.",
        "nutrients": "Vitamins: C, B6 | Minerals: Potassium, Calcium | Fiber: Moderate",
        "price": 25,
        "wholesale_price": 18,
        "stock_status": "in_stock",
        "stock_quantity": 80,
        "shelf_life_days": 10
    },
    {
        "name": "Fresh Ginger",
        "image": "https://images.pexels.com/photos/10112136/pexels-photo-10112136.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
        "benefit": "Anti-inflammatory properties. Aids digestion and reduces nausea.",
        "nutrients": "Vitamins: B6, C | Minerals: Magnesium, Manganese | Gingerol: High",
        "price": 180,
        "wholesale_price": 140,
        "stock_status": "in_stock",
        "stock_quantity": 50,
        "shelf_life_days": 21
    },
    {
        "name": "Fresh Garlic",
        "image": "https://images.unsplash.com/photo-1501420193726-1f65acd36cda",
        "benefit": "Boosts immunity and heart health. Contains allicin with antimicrobial properties.",
        "nutrients": "Vitamins: C, B6 | Minerals: Manganese, Selenium | Allicin: High",
        "price": 200,
        "wholesale_price": 150,
        "stock_status": "in_stock",
        "stock_quantity": 100,
        "shelf_life_days": 60
    },
    {
        "name": "Sweet Potato",
        "image": "https://images.pexels.com/photos/33653570/pexels-photo-33653570.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
        "benefit": "High in fiber and beta-carotene. Supports gut health and vision.",
        "nutrients": "Vitamins: A, C, B6 | Minerals: Potassium, Manganese | Fiber: High",
        "price": 50,
        "wholesale_price": 38,
        "stock_status": "in_stock",
        "stock_quantity": 60,
        "shelf_life_days": 21
    },
    {
        "name": "Turnip",
        "image": "https://images.pexels.com/photos/11770221/pexels-photo-11770221.jpeg",
        "benefit": "Low calorie, high in vitamin C. Good for bone health.",
        "nutrients": "Vitamins: C, K | Minerals: Calcium, Potassium | Fiber: High",
        "price": 35,
        "wholesale_price": 25,
        "stock_status": "growing",
        "stock_quantity": 30,
        "shelf_life_days": 14
    },
    {
        "name": "Yam (Jimikand)",
        "image": "https://images.pexels.com/photos/33653570/pexels-photo-33653570.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
        "benefit": "Good source of fiber and potassium. Supports digestive health.",
        "nutrients": "Vitamins: C, B6 | Minerals: Potassium, Manganese | Fiber: High",
        "price": 60,
        "wholesale_price": 45,
        "stock_status": "in_stock",
        "stock_quantity": 40,
        "shelf_life_days": 30
    },
    {
        "name": "Colocasia (Arbi)",
        "image": "https://images.pexels.com/photos/33653570/pexels-photo-33653570.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
        "benefit": "Rich in fiber and resistant starch. Good for gut health.",
        "nutrients": "Vitamins: E, B6 | Minerals: Potassium, Magnesium | Fiber: Very High",
        "price": 55,
        "wholesale_price": 40,
        "stock_status": "in_stock",
        "stock_quantity": 35,
        "shelf_life_days": 14
    },
    {
        "name": "Elephant Foot Yam",
        "image": "https://images.pexels.com/photos/33653570/pexels-photo-33653570.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
        "benefit": "High in fiber, aids digestion. Traditional Ayurvedic benefits.",
        "nutrients": "Vitamins: B6, C | Minerals: Potassium, Phosphorus | Fiber: Very High",
        "price": 70,
        "wholesale_price": 52,
        "stock_status": "in_stock",
        "stock_quantity": 25,
        "shelf_life_days": 21
    },
    {
        "name": "Raw Banana",
        "image": "https://images.pexels.com/photos/33653570/pexels-photo-33653570.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
        "benefit": "Rich in resistant starch. Good for blood sugar management.",
        "nutrients": "Vitamins: B6, C | Minerals: Potassium, Magnesium | Resistant Starch: High",
        "price": 40,
        "wholesale_price": 28,
        "stock_status": "in_stock",
        "stock_quantity": 50,
        "shelf_life_days": 7
    },
    {
        "name": "Lotus Root (Kamal Kakdi)",
        "image": "https://images.pexels.com/photos/33653570/pexels-photo-33653570.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
        "benefit": "Rich in fiber and vitamin C. Supports digestive and immune health.",
        "nutrients": "Vitamins: C, B6 | Minerals: Copper, Potassium | Fiber: High",
        "price": 120,
        "wholesale_price": 90,
        "stock_status": "growing",
        "stock_quantity": 15,
        "shelf_life_days": 7
    },
    {
        "name": "Tapioca (Cassava)",
        "image": "https://images.pexels.com/photos/33653570/pexels-photo-33653570.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
        "benefit": "Gluten-free energy source. Good source of resistant starch.",
        "nutrients": "Vitamins: C | Minerals: Calcium, Phosphorus | Carbs: High",
        "price": 45,
        "wholesale_price": 32,
        "stock_status": "in_stock",
        "stock_quantity": 40,
        "shelf_life_days": 14
    }
]

LEAFY_GREENS = [
    {
        "name": "Fresh Spinach",
        "image": "https://images.pexels.com/photos/2325843/pexels-photo-2325843.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
        "benefit": "High in iron and vitamins. Supports bone health and energy levels.",
        "nutrients": "Vitamins: A, C, K | Minerals: Iron, Calcium | Antioxidants: Lutein",
        "price": 30,
        "wholesale_price": 22,
        "stock_status": "in_stock",
        "stock_quantity": 80,
        "shelf_life_days": 5
    },
    {
        "name": "Fresh Coriander",
        "image": "https://images.pexels.com/photos/10329642/pexels-photo-10329642.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
        "benefit": "Rich in antioxidants. Aids digestion and has detoxifying properties.",
        "nutrients": "Vitamins: A, C, K | Minerals: Potassium, Manganese | Essential Oils: High",
        "price": 20,
        "wholesale_price": 15,
        "stock_status": "in_stock",
        "stock_quantity": 100,
        "shelf_life_days": 5
    },
    {
        "name": "Fresh Mint",
        "image": "https://images.pexels.com/photos/12717629/pexels-photo-12717629.jpeg",
        "benefit": "Cooling effect, aids digestion. Rich in antioxidants.",
        "nutrients": "Vitamins: A, C | Minerals: Iron, Manganese | Menthol: High",
        "price": 25,
        "wholesale_price": 18,
        "stock_status": "in_stock",
        "stock_quantity": 90,
        "shelf_life_days": 5
    },
    {
        "name": "Fresh Lettuce",
        "image": "https://images.pexels.com/photos/36285423/pexels-photo-36285423.jpeg",
        "benefit": "Low calorie, hydrating. Good source of vitamin K and folate.",
        "nutrients": "Vitamins: K, A, C | Minerals: Potassium, Calcium | Water: 95%",
        "price": 50,
        "wholesale_price": 38,
        "stock_status": "in_stock",
        "stock_quantity": 40,
        "shelf_life_days": 5
    },
    {
        "name": "Fresh Kale",
        "image": "https://images.pexels.com/photos/4963545/pexels-photo-4963545.jpeg",
        "benefit": "Superfood with high nutrient density. Excellent for detox.",
        "nutrients": "Vitamins: K, A, C | Minerals: Calcium, Potassium | Antioxidants: Very High",
        "price": 80,
        "wholesale_price": 60,
        "stock_status": "in_stock",
        "stock_quantity": 30,
        "shelf_life_days": 7
    },
    {
        "name": "Bok Choy",
        "image": "https://images.pexels.com/photos/12150346/pexels-photo-12150346.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
        "benefit": "Rich in vitamins A and C. Supports bone health and immunity.",
        "nutrients": "Vitamins: A, C, K | Minerals: Calcium, Potassium | Fiber: Moderate",
        "price": 70,
        "wholesale_price": 52,
        "stock_status": "in_stock",
        "stock_quantity": 25,
        "shelf_life_days": 5
    },
    {
        "name": "Fresh Celery",
        "image": "https://images.unsplash.com/photo-1610903122389-3674aafb17a5",
        "benefit": "Very low calorie, high in water. Good for hydration and weight loss.",
        "nutrients": "Vitamins: K, C | Minerals: Potassium, Folate | Water: 95%",
        "price": 90,
        "wholesale_price": 68,
        "stock_status": "in_stock",
        "stock_quantity": 30,
        "shelf_life_days": 10
    },
    {
        "name": "Fenugreek Leaves (Methi)",
        "image": "https://images.pexels.com/photos/2325843/pexels-photo-2325843.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
        "benefit": "Helps control blood sugar. Rich in iron and fiber.",
        "nutrients": "Vitamins: A, C, K | Minerals: Iron, Calcium | Fiber: High",
        "price": 25,
        "wholesale_price": 18,
        "stock_status": "in_stock",
        "stock_quantity": 60,
        "shelf_life_days": 3
    },
    {
        "name": "Mustard Greens (Sarson)",
        "image": "https://images.pexels.com/photos/2325843/pexels-photo-2325843.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
        "benefit": "High in vitamin K and C. Supports heart and bone health.",
        "nutrients": "Vitamins: K, A, C | Minerals: Calcium, Manganese | Glucosinolates: High",
        "price": 30,
        "wholesale_price": 22,
        "stock_status": "growing",
        "stock_quantity": 25,
        "shelf_life_days": 5
    },
    {
        "name": "Amaranth Leaves (Chaulai)",
        "image": "https://images.pexels.com/photos/2325843/pexels-photo-2325843.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
        "benefit": "High in protein for a leafy green. Rich in calcium and iron.",
        "nutrients": "Vitamins: A, C, K | Minerals: Iron, Calcium | Protein: High",
        "price": 25,
        "wholesale_price": 18,
        "stock_status": "in_stock",
        "stock_quantity": 45,
        "shelf_life_days": 3
    },
    {
        "name": "Drumstick Leaves (Moringa)",
        "image": "https://images.pexels.com/photos/2325843/pexels-photo-2325843.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
        "benefit": "Superfood with exceptional nutrient density. Anti-inflammatory.",
        "nutrients": "Vitamins: A, C, E | Minerals: Iron, Calcium | Protein: Very High",
        "price": 40,
        "wholesale_price": 30,
        "stock_status": "in_stock",
        "stock_quantity": 35,
        "shelf_life_days": 5
    },
    {
        "name": "Curry Leaves",
        "image": "https://images.pexels.com/photos/10329642/pexels-photo-10329642.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
        "benefit": "Rich in antioxidants. Aids digestion and hair health.",
        "nutrients": "Vitamins: A, B, C | Minerals: Iron, Calcium | Carbazole Alkaloids: High",
        "price": 15,
        "wholesale_price": 10,
        "stock_status": "in_stock",
        "stock_quantity": 100,
        "shelf_life_days": 7
    },
    {
        "name": "Spring Onions",
        "image": "https://images.pexels.com/photos/10329642/pexels-photo-10329642.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
        "benefit": "Rich in vitamin K and C. Supports bone and immune health.",
        "nutrients": "Vitamins: K, C, A | Minerals: Potassium, Calcium | Sulfur Compounds: High",
        "price": 35,
        "wholesale_price": 25,
        "stock_status": "in_stock",
        "stock_quantity": 55,
        "shelf_life_days": 7
    },
    {
        "name": "Dill Leaves (Soya)",
        "image": "https://images.pexels.com/photos/10329642/pexels-photo-10329642.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
        "benefit": "Good for digestion. Rich in vitamin A and flavonoids.",
        "nutrients": "Vitamins: A, C | Minerals: Iron, Manganese | Essential Oils: High",
        "price": 30,
        "wholesale_price": 22,
        "stock_status": "in_stock",
        "stock_quantity": 40,
        "shelf_life_days": 5
    },
    {
        "name": "Bathua (Lamb's Quarters)",
        "image": "https://images.pexels.com/photos/2325843/pexels-photo-2325843.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
        "benefit": "Traditionally used for digestive health. Rich in vitamins.",
        "nutrients": "Vitamins: A, C, K | Minerals: Calcium, Iron | Fiber: High",
        "price": 20,
        "wholesale_price": 15,
        "stock_status": "growing",
        "stock_quantity": 20,
        "shelf_life_days": 3
    },
    {
        "name": "Parsley",
        "image": "https://images.pexels.com/photos/10329642/pexels-photo-10329642.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
        "benefit": "Excellent source of vitamin K. Supports bone and heart health.",
        "nutrients": "Vitamins: K, C, A | Minerals: Iron, Potassium | Apigenin: High",
        "price": 60,
        "wholesale_price": 45,
        "stock_status": "in_stock",
        "stock_quantity": 30,
        "shelf_life_days": 7
    }
]

FRUITS = [
    {
        "name": "Fresh Apples",
        "image": "https://images.pexels.com/photos/31558767/pexels-photo-31558767.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
        "benefit": "High in fiber and vitamin C. Supports heart health and weight management.",
        "nutrients": "Vitamins: C, K | Minerals: Potassium | Fiber: High | Antioxidants: Quercetin",
        "price": 150,
        "wholesale_price": 120,
        "stock_status": "in_stock",
        "stock_quantity": 100,
        "shelf_life_days": 30
    },
    {
        "name": "Fresh Bananas",
        "image": "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?crop=entropy&cs=srgb&fm=jpg&q=85",
        "benefit": "Excellent source of potassium. Provides instant energy.",
        "nutrients": "Vitamins: B6, C | Minerals: Potassium, Magnesium | Fiber: Moderate",
        "price": 50,
        "wholesale_price": 38,
        "stock_status": "in_stock",
        "stock_quantity": 150,
        "shelf_life_days": 7
    },
    {
        "name": "Fresh Oranges",
        "image": "https://images.unsplash.com/photo-1592187270271-9a4b84faa228",
        "benefit": "Very high in vitamin C. Boosts immunity and skin health.",
        "nutrients": "Vitamins: C, A, B1 | Minerals: Potassium, Calcium | Citric Acid: High",
        "price": 80,
        "wholesale_price": 60,
        "stock_status": "in_stock",
        "stock_quantity": 120,
        "shelf_life_days": 14
    },
    {
        "name": "Fresh Mangoes",
        "image": "https://images.pexels.com/photos/37816783/pexels-photo-37816783.jpeg",
        "benefit": "King of fruits! Rich in vitamin A and C. Supports immunity.",
        "nutrients": "Vitamins: A, C, E | Minerals: Potassium, Copper | Fiber: High",
        "price": 120,
        "wholesale_price": 90,
        "stock_status": "growing",
        "stock_quantity": 50,
        "shelf_life_days": 7
    },
    {
        "name": "Fresh Grapes",
        "image": "https://images.unsplash.com/photo-1637715924886-cbe4485f90b9?crop=entropy&cs=srgb&fm=jpg&q=85",
        "benefit": "Rich in antioxidants like resveratrol. Supports heart health.",
        "nutrients": "Vitamins: C, K | Minerals: Potassium, Copper | Resveratrol: High",
        "price": 100,
        "wholesale_price": 75,
        "stock_status": "in_stock",
        "stock_quantity": 80,
        "shelf_life_days": 7
    },
    {
        "name": "Watermelon",
        "image": "https://images.pexels.com/photos/3513238/pexels-photo-3513238.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
        "benefit": "Highly hydrating with 92% water. Good for skin and hydration.",
        "nutrients": "Vitamins: A, C | Minerals: Potassium | Lycopene: High | Water: 92%",
        "price": 30,
        "wholesale_price": 22,
        "stock_status": "in_stock",
        "stock_quantity": 40,
        "shelf_life_days": 14
    },
    {
        "name": "Fresh Papaya",
        "image": "https://images.unsplash.com/photo-1517282009859-f000ec3b26fe?crop=entropy&cs=srgb&fm=jpg&q=85",
        "benefit": "Contains papain enzyme for digestion. Rich in vitamin C.",
        "nutrients": "Vitamins: C, A, E | Minerals: Potassium, Magnesium | Papain: High",
        "price": 50,
        "wholesale_price": 38,
        "stock_status": "in_stock",
        "stock_quantity": 60,
        "shelf_life_days": 7
    },
    {
        "name": "Pomegranate",
        "image": "https://images.pexels.com/photos/18523341/pexels-photo-18523341.jpeg",
        "benefit": "Powerful antioxidants. Supports heart health and reduces inflammation.",
        "nutrients": "Vitamins: C, K | Minerals: Potassium | Punicalagins: Very High",
        "price": 180,
        "wholesale_price": 140,
        "stock_status": "in_stock",
        "stock_quantity": 70,
        "shelf_life_days": 30
    },
    {
        "name": "Fresh Guava",
        "image": "https://images.unsplash.com/photo-1536511132770-e5058c7e8c46?crop=entropy&cs=srgb&fm=jpg&q=85",
        "benefit": "Very high in vitamin C. Supports digestive and immune health.",
        "nutrients": "Vitamins: C, A | Minerals: Potassium, Magnesium | Fiber: Very High",
        "price": 60,
        "wholesale_price": 45,
        "stock_status": "in_stock",
        "stock_quantity": 80,
        "shelf_life_days": 7
    },
    {
        "name": "Fresh Pineapple",
        "image": "https://images.pexels.com/photos/38090831/pexels-photo-38090831.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
        "benefit": "Contains bromelain enzyme. Aids digestion and reduces inflammation.",
        "nutrients": "Vitamins: C, B6 | Minerals: Manganese, Copper | Bromelain: High",
        "price": 50,
        "wholesale_price": 38,
        "stock_status": "in_stock",
        "stock_quantity": 45,
        "shelf_life_days": 5
    },
    {
        "name": "Fresh Lemons",
        "image": "https://images.unsplash.com/photo-1608322368735-b6b6ec262af7?crop=entropy&cs=srgb&fm=jpg&q=85",
        "benefit": "High in vitamin C and citric acid. Aids digestion and detox.",
        "nutrients": "Vitamins: C | Minerals: Potassium | Citric Acid: Very High",
        "price": 80,
        "wholesale_price": 60,
        "stock_status": "in_stock",
        "stock_quantity": 100,
        "shelf_life_days": 21
    },
    {
        "name": "Fresh Coconut",
        "image": "https://images.pexels.com/photos/30893235/pexels-photo-30893235.jpeg",
        "benefit": "Rich in healthy fats. Hydrating coconut water with electrolytes.",
        "nutrients": "Vitamins: C, E | Minerals: Potassium, Manganese | MCTs: High",
        "price": 45,
        "wholesale_price": 32,
        "stock_status": "in_stock",
        "stock_quantity": 60,
        "shelf_life_days": 14
    },
    {
        "name": "Fresh Pears",
        "image": "https://images.pexels.com/photos/31024463/pexels-photo-31024463.jpeg",
        "benefit": "Good source of fiber and vitamin C. Supports gut health.",
        "nutrients": "Vitamins: C, K | Minerals: Potassium, Copper | Fiber: High",
        "price": 140,
        "wholesale_price": 105,
        "stock_status": "in_stock",
        "stock_quantity": 55,
        "shelf_life_days": 14
    },
    {
        "name": "Fresh Plums",
        "image": "https://images.unsplash.com/photo-1603408209093-cd3c9af497d6?crop=entropy&cs=srgb&fm=jpg&q=85",
        "benefit": "Rich in antioxidants. Supports bone health and digestion.",
        "nutrients": "Vitamins: C, K, A | Minerals: Potassium | Anthocyanins: High",
        "price": 160,
        "wholesale_price": 120,
        "stock_status": "growing",
        "stock_quantity": 30,
        "shelf_life_days": 7
    },
    {
        "name": "Fresh Peaches",
        "image": "https://images.unsplash.com/photo-1629828874514-c1e5103f2150?crop=entropy&cs=srgb&fm=jpg&q=85",
        "benefit": "Good for skin health. Rich in vitamins A and C.",
        "nutrients": "Vitamins: A, C, E | Minerals: Potassium, Niacin | Fiber: Moderate",
        "price": 200,
        "wholesale_price": 150,
        "stock_status": "growing",
        "stock_quantity": 25,
        "shelf_life_days": 5
    },
    {
        "name": "Fresh Cherries",
        "image": "https://images.pexels.com/photos/1149021/pexels-photo-1149021.jpeg",
        "benefit": "Rich in melatonin for sleep. High in antioxidants.",
        "nutrients": "Vitamins: C, A | Minerals: Potassium | Melatonin: High",
        "price": 350,
        "wholesale_price": 280,
        "stock_status": "out_of_stock",
        "stock_quantity": 0,
        "shelf_life_days": 5
    },
    {
        "name": "Amla (Indian Gooseberry)",
        "image": "https://images.pexels.com/photos/32112804/pexels-photo-32112804.jpeg",
        "benefit": "Exceptional vitamin C content. Traditional immunity booster.",
        "nutrients": "Vitamins: C | Minerals: Iron, Calcium | Antioxidants: Very High",
        "price": 100,
        "wholesale_price": 75,
        "stock_status": "in_stock",
        "stock_quantity": 70,
        "shelf_life_days": 14
    },
    {
        "name": "Custard Apple (Sitaphal)",
        "image": "https://images.unsplash.com/photo-1680008703863-f3e0f4231b83?crop=entropy&cs=srgb&fm=jpg&q=85",
        "benefit": "Rich in vitamins B6 and C. Good for heart and brain health.",
        "nutrients": "Vitamins: B6, C | Minerals: Potassium, Magnesium | Fiber: High",
        "price": 150,
        "wholesale_price": 115,
        "stock_status": "growing",
        "stock_quantity": 20,
        "shelf_life_days": 5
    },
    {
        "name": "Chickoo (Sapota)",
        "image": "https://images.pexels.com/photos/37816783/pexels-photo-37816783.jpeg",
        "benefit": "Natural sweetness with fiber. Good for energy and digestion.",
        "nutrients": "Vitamins: A, C | Minerals: Iron, Calcium | Fiber: High",
        "price": 80,
        "wholesale_price": 60,
        "stock_status": "in_stock",
        "stock_quantity": 50,
        "shelf_life_days": 7
    }
]

EXOTIC = [
    {
        "name": "Avocado",
        "image": "https://images.pexels.com/photos/10899607/pexels-photo-10899607.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
        "benefit": "Rich in healthy monounsaturated fats. Supports heart and brain health.",
        "nutrients": "Vitamins: K, E, C | Minerals: Potassium | Healthy Fats: Very High",
        "price": 250,
        "wholesale_price": 190,
        "stock_status": "in_stock",
        "stock_quantity": 40,
        "shelf_life_days": 5
    },
    {
        "name": "Dragon Fruit",
        "image": "https://images.pexels.com/photos/31558794/pexels-photo-31558794.jpeg",
        "benefit": "Rich in antioxidants and prebiotics. Supports gut health.",
        "nutrients": "Vitamins: C | Minerals: Iron, Magnesium | Prebiotics: High",
        "price": 300,
        "wholesale_price": 230,
        "stock_status": "in_stock",
        "stock_quantity": 25,
        "shelf_life_days": 7
    },
    {
        "name": "Blueberries",
        "image": "https://images.unsplash.com/photo-1498557850523-fd3d118b962e",
        "benefit": "Superfood for brain health. Highest antioxidant content among fruits.",
        "nutrients": "Vitamins: C, K | Minerals: Manganese | Anthocyanins: Very High",
        "price": 450,
        "wholesale_price": 350,
        "stock_status": "in_stock",
        "stock_quantity": 20,
        "shelf_life_days": 7
    },
    {
        "name": "Strawberries",
        "image": "https://images.pexels.com/photos/1998893/pexels-photo-1998893.jpeg",
        "benefit": "High in vitamin C and manganese. Supports heart health.",
        "nutrients": "Vitamins: C | Minerals: Manganese, Folate | Anthocyanins: High",
        "price": 350,
        "wholesale_price": 270,
        "stock_status": "in_stock",
        "stock_quantity": 30,
        "shelf_life_days": 5
    },
    {
        "name": "Kiwi Fruit",
        "image": "https://images.pexels.com/photos/31558795/pexels-photo-31558795.jpeg",
        "benefit": "Very high in vitamin C. Supports immunity and skin health.",
        "nutrients": "Vitamins: C, K, E | Minerals: Potassium | Actinidin: High",
        "price": 200,
        "wholesale_price": 150,
        "stock_status": "in_stock",
        "stock_quantity": 45,
        "shelf_life_days": 14
    },
    {
        "name": "Asparagus",
        "image": "https://images.unsplash.com/photo-1552825898-5896ec192f9c",
        "benefit": "Rich in folate and fiber. Supports digestive and heart health.",
        "nutrients": "Vitamins: K, A, C | Minerals: Folate, Iron | Fiber: High",
        "price": 350,
        "wholesale_price": 270,
        "stock_status": "in_stock",
        "stock_quantity": 20,
        "shelf_life_days": 5
    },
    {
        "name": "Lychee",
        "image": "https://images.pexels.com/photos/28939333/pexels-photo-28939333.jpeg",
        "benefit": "Rich in vitamin C and polyphenols. Supports skin and immunity.",
        "nutrients": "Vitamins: C, B6 | Minerals: Potassium, Copper | Oligonol: High",
        "price": 200,
        "wholesale_price": 150,
        "stock_status": "growing",
        "stock_quantity": 15,
        "shelf_life_days": 5
    },
    {
        "name": "Passion Fruit",
        "image": "https://images.pexels.com/photos/6332803/pexels-photo-6332803.jpeg",
        "benefit": "Rich in fiber and vitamin C. Supports digestive and immune health.",
        "nutrients": "Vitamins: C, A | Minerals: Iron, Potassium | Fiber: Very High",
        "price": 280,
        "wholesale_price": 215,
        "stock_status": "in_stock",
        "stock_quantity": 25,
        "shelf_life_days": 7
    },
    {
        "name": "Red Cabbage",
        "image": "https://images.unsplash.com/photo-1594282486552-05b4d80fbb9f",
        "benefit": "Rich in anthocyanins and vitamin C. Supports heart health.",
        "nutrients": "Vitamins: C, K | Minerals: Potassium | Anthocyanins: Very High",
        "price": 80,
        "wholesale_price": 60,
        "stock_status": "in_stock",
        "stock_quantity": 35,
        "shelf_life_days": 14
    },
    {
        "name": "Baby Corn",
        "image": "https://images.unsplash.com/photo-1634467524884-897d0af5e104?crop=entropy&cs=srgb&fm=jpg&q=85",
        "benefit": "Low calorie, high fiber. Adds crunch to stir-fries.",
        "nutrients": "Vitamins: B5, B3 | Minerals: Potassium, Phosphorus | Fiber: Moderate",
        "price": 120,
        "wholesale_price": 90,
        "stock_status": "in_stock",
        "stock_quantity": 40,
        "shelf_life_days": 5
    },
    {
        "name": "Zucchini",
        "image": "https://images.pexels.com/photos/17975573/pexels-photo-17975573.jpeg",
        "benefit": "Very low calorie. Rich in vitamin A and antioxidants.",
        "nutrients": "Vitamins: A, C | Minerals: Potassium, Manganese | Water: 94%",
        "price": 100,
        "wholesale_price": 75,
        "stock_status": "in_stock",
        "stock_quantity": 30,
        "shelf_life_days": 7
    },
    {
        "name": "Cherry Tomatoes",
        "image": "https://images.pexels.com/photos/33499935/pexels-photo-33499935.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
        "benefit": "Higher lycopene content than regular tomatoes. Snack-sized.",
        "nutrients": "Vitamins: C, A, K | Minerals: Potassium | Lycopene: Very High",
        "price": 150,
        "wholesale_price": 115,
        "stock_status": "in_stock",
        "stock_quantity": 50,
        "shelf_life_days": 7
    },
    {
        "name": "Yellow Bell Pepper",
        "image": "https://images.pexels.com/photos/28352592/pexels-photo-28352592.jpeg",
        "benefit": "Sweeter than green peppers. Very high in vitamin C.",
        "nutrients": "Vitamins: C, A, B6 | Minerals: Potassium | Carotenoids: High",
        "price": 200,
        "wholesale_price": 150,
        "stock_status": "in_stock",
        "stock_quantity": 35,
        "shelf_life_days": 10
    },
    {
        "name": "Enoki Mushrooms",
        "image": "https://images.pexels.com/photos/16732696/pexels-photo-16732696.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
        "benefit": "Low calorie, immune boosting. Rich in B vitamins.",
        "nutrients": "Vitamins: B3, B5 | Minerals: Selenium, Copper | Beta-glucans: High",
        "price": 180,
        "wholesale_price": 135,
        "stock_status": "in_stock",
        "stock_quantity": 25,
        "shelf_life_days": 5
    },
    {
        "name": "Brussels Sprouts",
        "image": "https://images.pexels.com/photos/30893315/pexels-photo-30893315.jpeg",
        "benefit": "Mini cabbages rich in vitamins K and C. Supports bone health.",
        "nutrients": "Vitamins: K, C | Minerals: Manganese, Potassium | Glucosinolates: High",
        "price": 200,
        "wholesale_price": 150,
        "stock_status": "growing",
        "stock_quantity": 15,
        "shelf_life_days": 7
    },
    {
        "name": "Artichoke",
        "image": "https://images.pexels.com/photos/32640196/pexels-photo-32640196.jpeg",
        "benefit": "Highest antioxidant vegetable. Supports liver health.",
        "nutrients": "Vitamins: C, K | Minerals: Magnesium, Folate | Cynarin: High",
        "price": 250,
        "wholesale_price": 190,
        "stock_status": "out_of_stock",
        "stock_quantity": 0,
        "shelf_life_days": 7
    }
]


async def seed_products():
    """Seed all products into the database"""
    print(f"Connected to database: {db_name}")
    
    # First, let's delete existing products that are not microgreens (keep old data)
    # Comment out this line if you want to keep existing products
    # await db.products.delete_many({"category_id": {"$in": list(CATEGORIES.values())}})
    
    all_products = []
    
    # Add vegetables
    for product in VEGETABLES:
        all_products.append({
            **product,
            "category_id": CATEGORIES["vegetables"],
            "id": str(uuid.uuid4()),
            "unit": "kg",
            "unit_value": 1,
            "price_per": "kg",
            "min_quantity": 0.25,
            "step_quantity": 0.25,
            "low_stock_threshold": 10,
            "growth_days": 0,
            "weight": 100,
            "pack_size": "1 kg",
            "active": True,
            "ready_in_days": None,
            "availability_date": None,
            "seeds_available": False,
            "harvest_date": None,
            "featured": False,
            "display_order": 0,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": None
        })
    
    # Add root vegetables
    for product in ROOT_VEGETABLES:
        all_products.append({
            **product,
            "category_id": CATEGORIES["root_vegetables"],
            "id": str(uuid.uuid4()),
            "unit": "kg",
            "unit_value": 1,
            "price_per": "kg",
            "min_quantity": 0.25,
            "step_quantity": 0.25,
            "low_stock_threshold": 10,
            "growth_days": 0,
            "weight": 100,
            "pack_size": "1 kg",
            "active": True,
            "ready_in_days": None,
            "availability_date": None,
            "seeds_available": False,
            "harvest_date": None,
            "featured": False,
            "display_order": 0,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": None
        })
    
    # Add leafy greens
    for product in LEAFY_GREENS:
        all_products.append({
            **product,
            "category_id": CATEGORIES["leafy_greens"],
            "id": str(uuid.uuid4()),
            "unit": "kg",
            "unit_value": 1,
            "price_per": "kg",
            "min_quantity": 0.1,
            "step_quantity": 0.1,
            "low_stock_threshold": 5,
            "growth_days": 0,
            "weight": 100,
            "pack_size": "250g",
            "active": True,
            "ready_in_days": None,
            "availability_date": None,
            "seeds_available": False,
            "harvest_date": None,
            "featured": False,
            "display_order": 0,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": None
        })
    
    # Add fruits
    for product in FRUITS:
        all_products.append({
            **product,
            "category_id": CATEGORIES["fruits"],
            "id": str(uuid.uuid4()),
            "unit": "kg",
            "unit_value": 1,
            "price_per": "kg",
            "min_quantity": 0.5,
            "step_quantity": 0.5,
            "low_stock_threshold": 10,
            "growth_days": 0,
            "weight": 100,
            "pack_size": "1 kg",
            "active": True,
            "ready_in_days": None,
            "availability_date": None,
            "seeds_available": False,
            "harvest_date": None,
            "featured": False,
            "display_order": 0,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": None
        })
    
    # Add exotic items
    for product in EXOTIC:
        all_products.append({
            **product,
            "category_id": CATEGORIES["exotic"],
            "id": str(uuid.uuid4()),
            "unit": "kg",
            "unit_value": 1,
            "price_per": "kg",
            "min_quantity": 0.25,
            "step_quantity": 0.25,
            "low_stock_threshold": 5,
            "growth_days": 0,
            "weight": 100,
            "pack_size": "250g",
            "active": True,
            "ready_in_days": None,
            "availability_date": None,
            "seeds_available": False,
            "harvest_date": None,
            "featured": False,
            "display_order": 0,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": None
        })
    
    # Insert all products
    if all_products:
        result = await db.products.insert_many(all_products)
        print(f"Successfully inserted {len(result.inserted_ids)} products")
        
        # Print summary by category
        print("\n--- Product Summary ---")
        print(f"Vegetables: {len(VEGETABLES)}")
        print(f"Root Vegetables: {len(ROOT_VEGETABLES)}")
        print(f"Leafy Greens: {len(LEAFY_GREENS)}")
        print(f"Fruits: {len(FRUITS)}")
        print(f"Exotic & Imported: {len(EXOTIC)}")
        print(f"Total: {len(all_products)}")
    else:
        print("No products to insert")


if __name__ == "__main__":
    asyncio.run(seed_products())
