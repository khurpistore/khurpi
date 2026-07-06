#!/usr/bin/env python3
"""
Script to add vegetables to the database
"""
import os
import requests
import json

BACKEND_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://july-branch.preview.emergentagent.com')
VEGETABLES_CATEGORY_ID = "034c8aea-38f6-49d0-b21e-3aee1f8b1365"
LEAFY_GREENS_CATEGORY_ID = "6900f756-4063-40f7-b158-c93a7d63508f"
ROOT_VEGETABLES_CATEGORY_ID = "3a1f7ff8-71db-4494-be32-6df62693f3dc"
EXOTIC_CATEGORY_ID = "d790f665-5c8d-4267-b078-aceee52da106"

# Vegetables data with Hindi names and details
vegetables = [
    # Herbs & Leafy
    {
        "name": "Coriander (धनिया पत्ता)",
        "image": "https://images.unsplash.com/photo-1592170577795-cf1d9e144c19?w=800",
        "benefit": "Rich in antioxidants, aids digestion, supports heart health. Essential herb in Indian cooking.",
        "nutrients": "Vitamins: A, C, K | Minerals: Potassium, Manganese | Antioxidants: Quercetin, Tocopherols",
        "price": 30,
        "wholesale_price": 22,
        "category_id": LEAFY_GREENS_CATEGORY_ID,
        "unit": "bunch",
        "min_quantity": 1,
        "step_quantity": 1,
        "stock_status": "in_stock",
        "shelf_life_days": 5
    },
    {
        "name": "Mint Leaves (पुदीना)",
        "image": "https://images.unsplash.com/photo-1580716937776-6196d257ee3d?w=800",
        "benefit": "Aids digestion, freshens breath, relieves headaches. Popular in chutneys and beverages.",
        "nutrients": "Vitamins: A, C | Minerals: Iron, Manganese | Essential Oils: Menthol",
        "price": 25,
        "wholesale_price": 18,
        "category_id": LEAFY_GREENS_CATEGORY_ID,
        "unit": "bunch",
        "min_quantity": 1,
        "step_quantity": 1,
        "stock_status": "in_stock",
        "shelf_life_days": 5
    },
    {
        "name": "Curry Leaves (कढ़ी पत्ता)",
        "image": "https://images.unsplash.com/photo-1607672632458-9eb56696346b?w=800",
        "benefit": "Promotes hair growth, aids digestion, controls blood sugar. Essential in South Indian cuisine.",
        "nutrients": "Vitamins: A, B, C, E | Minerals: Iron, Calcium | Antioxidants: Carbazole alkaloids",
        "price": 20,
        "wholesale_price": 15,
        "category_id": LEAFY_GREENS_CATEGORY_ID,
        "unit": "bunch",
        "min_quantity": 1,
        "step_quantity": 1,
        "stock_status": "in_stock",
        "shelf_life_days": 7
    },
    # Fruits/Citrus
    {
        "name": "Lemon (नींबू)",
        "image": "https://images.unsplash.com/photo-1590502593747-42a996133562?w=800",
        "benefit": "High in Vitamin C, boosts immunity, aids digestion, supports skin health.",
        "nutrients": "Vitamins: C, B6 | Minerals: Potassium | Antioxidants: Citric acid, Flavonoids",
        "price": 80,
        "wholesale_price": 60,
        "category_id": VEGETABLES_CATEGORY_ID,
        "unit": "kg",
        "min_quantity": 0.25,
        "step_quantity": 0.25,
        "stock_status": "in_stock",
        "shelf_life_days": 14
    },
    # Cucumbers
    {
        "name": "English Cucumber (इंग्लिश खीरा)",
        "image": "https://images.unsplash.com/photo-1449300079323-02e209d9d3a6?w=800",
        "benefit": "Hydrating, low calories, supports skin health. Seedless and mild taste.",
        "nutrients": "Vitamins: K, C | Minerals: Potassium, Magnesium | Water content: 96%",
        "price": 60,
        "wholesale_price": 45,
        "category_id": EXOTIC_CATEGORY_ID,
        "unit": "kg",
        "min_quantity": 0.5,
        "step_quantity": 0.25,
        "stock_status": "in_stock",
        "shelf_life_days": 7
    },
    {
        "name": "Green Cucumber (खीरा)",
        "image": "https://images.unsplash.com/photo-1604977042946-1eecc30f269e?w=800",
        "benefit": "Cooling effect, hydrating, aids weight loss. Perfect for salads and raita.",
        "nutrients": "Vitamins: K, C | Minerals: Potassium, Magnesium | Water content: 95%",
        "price": 35,
        "wholesale_price": 25,
        "category_id": VEGETABLES_CATEGORY_ID,
        "unit": "kg",
        "min_quantity": 0.5,
        "step_quantity": 0.25,
        "stock_status": "in_stock",
        "shelf_life_days": 7
    },
    # Carrots
    {
        "name": "Orange Carrot (नारंगी गाजर)",
        "image": "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=800",
        "benefit": "Excellent for eye health, rich in beta-carotene, supports immune system.",
        "nutrients": "Vitamins: A, K, C | Minerals: Potassium | Antioxidants: Beta-carotene, Lutein",
        "price": 45,
        "wholesale_price": 35,
        "category_id": ROOT_VEGETABLES_CATEGORY_ID,
        "unit": "kg",
        "min_quantity": 0.25,
        "step_quantity": 0.25,
        "stock_status": "in_stock",
        "shelf_life_days": 14
    },
    # Root Vegetables
    {
        "name": "Potato (आलू)",
        "image": "https://images.unsplash.com/photo-1518977676601-b53f82ber59?w=800",
        "benefit": "Good source of energy, rich in potassium, supports digestive health.",
        "nutrients": "Vitamins: C, B6 | Minerals: Potassium, Manganese | Fiber: 2g per 100g",
        "price": 30,
        "wholesale_price": 22,
        "category_id": ROOT_VEGETABLES_CATEGORY_ID,
        "unit": "kg",
        "min_quantity": 0.5,
        "step_quantity": 0.25,
        "stock_status": "in_stock",
        "shelf_life_days": 21
    },
    {
        "name": "Red Potato (लाल आलू)",
        "image": "https://images.unsplash.com/photo-1596097635121-14b63b7a0c19?w=800",
        "benefit": "Higher in antioxidants than white potatoes, supports heart health.",
        "nutrients": "Vitamins: C, B6 | Minerals: Potassium, Iron | Antioxidants: Anthocyanins",
        "price": 40,
        "wholesale_price": 30,
        "category_id": ROOT_VEGETABLES_CATEGORY_ID,
        "unit": "kg",
        "min_quantity": 0.5,
        "step_quantity": 0.25,
        "stock_status": "in_stock",
        "shelf_life_days": 21
    },
    {
        "name": "Baby Potato (बेबी आलू)",
        "image": "https://images.unsplash.com/photo-1508302730218-14fe02311c7e?w=800",
        "benefit": "Tender texture, cooks quickly, perfect for roasting and curries.",
        "nutrients": "Vitamins: C, B6 | Minerals: Potassium | Lower starch than regular potatoes",
        "price": 50,
        "wholesale_price": 38,
        "category_id": ROOT_VEGETABLES_CATEGORY_ID,
        "unit": "kg",
        "min_quantity": 0.5,
        "step_quantity": 0.25,
        "stock_status": "in_stock",
        "shelf_life_days": 14
    },
    {
        "name": "Onion (प्याज)",
        "image": "https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=800",
        "benefit": "Anti-inflammatory, supports heart health, boosts immunity. Kitchen essential.",
        "nutrients": "Vitamins: C, B6 | Minerals: Potassium, Manganese | Antioxidants: Quercetin",
        "price": 35,
        "wholesale_price": 25,
        "category_id": VEGETABLES_CATEGORY_ID,
        "unit": "kg",
        "min_quantity": 0.5,
        "step_quantity": 0.25,
        "stock_status": "in_stock",
        "shelf_life_days": 30
    },
    {
        "name": "Garlic (लहसुन)",
        "image": "https://images.unsplash.com/photo-1540148426945-6cf22a6b2383?w=800",
        "benefit": "Boosts immunity, supports heart health, has antibacterial properties.",
        "nutrients": "Vitamins: C, B6 | Minerals: Manganese, Selenium | Compounds: Allicin",
        "price": 200,
        "wholesale_price": 150,
        "category_id": VEGETABLES_CATEGORY_ID,
        "unit": "kg",
        "min_quantity": 0.25,
        "step_quantity": 0.25,
        "stock_status": "in_stock",
        "shelf_life_days": 30
    },
    {
        "name": "Ginger (अदरक)",
        "image": "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=800",
        "benefit": "Aids digestion, reduces nausea, has anti-inflammatory properties.",
        "nutrients": "Vitamins: B6, C | Minerals: Magnesium, Manganese | Compounds: Gingerol",
        "price": 180,
        "wholesale_price": 140,
        "category_id": VEGETABLES_CATEGORY_ID,
        "unit": "kg",
        "min_quantity": 0.25,
        "step_quantity": 0.25,
        "stock_status": "in_stock",
        "shelf_life_days": 21
    },
    {
        "name": "Beetroot (चुकंदर)",
        "image": "https://images.unsplash.com/photo-1593105544559-ecb03bf76f82?w=800",
        "benefit": "Improves blood flow, lowers blood pressure, boosts stamina.",
        "nutrients": "Vitamins: C, B9 (Folate) | Minerals: Iron, Manganese | Nitrates: Natural",
        "price": 50,
        "wholesale_price": 38,
        "category_id": ROOT_VEGETABLES_CATEGORY_ID,
        "unit": "kg",
        "min_quantity": 0.5,
        "step_quantity": 0.25,
        "stock_status": "in_stock",
        "shelf_life_days": 14
    },
    {
        "name": "Radish (मूली)",
        "image": "https://images.unsplash.com/photo-1585369109589-87eec9f64b70?w=800",
        "benefit": "Aids digestion, detoxifies liver, supports respiratory health.",
        "nutrients": "Vitamins: C, B6 | Minerals: Potassium, Calcium | Fiber: High",
        "price": 30,
        "wholesale_price": 22,
        "category_id": ROOT_VEGETABLES_CATEGORY_ID,
        "unit": "kg",
        "min_quantity": 0.5,
        "step_quantity": 0.25,
        "stock_status": "in_stock",
        "shelf_life_days": 10
    },
    {
        "name": "Arbi / Colocasia (अरबी)",
        "image": "https://images.unsplash.com/photo-1590165482129-1b8b27698780?w=800",
        "benefit": "Good source of fiber, supports digestive health, provides sustained energy.",
        "nutrients": "Vitamins: E, B6 | Minerals: Potassium, Magnesium | Fiber: High",
        "price": 60,
        "wholesale_price": 45,
        "category_id": ROOT_VEGETABLES_CATEGORY_ID,
        "unit": "kg",
        "min_quantity": 0.5,
        "step_quantity": 0.25,
        "stock_status": "in_stock",
        "shelf_life_days": 14
    },
    # Tomatoes
    {
        "name": "Cherry Tomatoes (चेरी टमाटर)",
        "image": "https://images.unsplash.com/photo-1558818498-28c1e002674f?w=800",
        "benefit": "High in lycopene, supports heart health, great for salads and snacking.",
        "nutrients": "Vitamins: A, C, K | Minerals: Potassium | Antioxidants: Lycopene",
        "price": 120,
        "wholesale_price": 90,
        "category_id": EXOTIC_CATEGORY_ID,
        "unit": "kg",
        "min_quantity": 0.25,
        "step_quantity": 0.25,
        "stock_status": "in_stock",
        "shelf_life_days": 7
    },
    {
        "name": "Hybrid Tomato (हाइब्रिड टमाटर)",
        "image": "https://images.unsplash.com/photo-1546470427-e26264be0b0e?w=800",
        "benefit": "Firm texture, long shelf life, ideal for cooking and salads.",
        "nutrients": "Vitamins: A, C, K | Minerals: Potassium | Antioxidants: Lycopene",
        "price": 40,
        "wholesale_price": 30,
        "category_id": VEGETABLES_CATEGORY_ID,
        "unit": "kg",
        "min_quantity": 0.5,
        "step_quantity": 0.25,
        "stock_status": "in_stock",
        "shelf_life_days": 10
    },
    {
        "name": "Desi Tomato (देसी टमाटर)",
        "image": "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800",
        "benefit": "Rich tangy flavor, softer texture, perfect for gravies and chutneys.",
        "nutrients": "Vitamins: A, C, K | Minerals: Potassium | Antioxidants: Lycopene",
        "price": 35,
        "wholesale_price": 25,
        "category_id": VEGETABLES_CATEGORY_ID,
        "unit": "kg",
        "min_quantity": 0.5,
        "step_quantity": 0.25,
        "stock_status": "in_stock",
        "shelf_life_days": 7
    },
    # Gourds
    {
        "name": "Bottle Gourd (लौकी)",
        "image": "https://images.unsplash.com/photo-1603431777007-61eb265d0670?w=800",
        "benefit": "Low calorie, high water content, aids weight loss, good for heart.",
        "nutrients": "Vitamins: C, B | Minerals: Zinc, Potassium | Water content: 92%",
        "price": 35,
        "wholesale_price": 25,
        "category_id": VEGETABLES_CATEGORY_ID,
        "unit": "kg",
        "min_quantity": 0.5,
        "step_quantity": 0.5,
        "stock_status": "in_stock",
        "shelf_life_days": 7
    },
    {
        "name": "Bitter Gourd (करेला)",
        "image": "https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?w=800",
        "benefit": "Controls blood sugar, rich in antioxidants, supports liver health.",
        "nutrients": "Vitamins: C, A, B | Minerals: Iron, Potassium | Compounds: Charantin",
        "price": 50,
        "wholesale_price": 38,
        "category_id": VEGETABLES_CATEGORY_ID,
        "unit": "kg",
        "min_quantity": 0.5,
        "step_quantity": 0.25,
        "stock_status": "in_stock",
        "shelf_life_days": 7
    },
    {
        "name": "Ridge Gourd (तोरई)",
        "image": "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=800",
        "benefit": "Low calorie, aids digestion, good for diabetics, supports skin health.",
        "nutrients": "Vitamins: C, A | Minerals: Iron, Magnesium | Fiber: High",
        "price": 40,
        "wholesale_price": 30,
        "category_id": VEGETABLES_CATEGORY_ID,
        "unit": "kg",
        "min_quantity": 0.5,
        "step_quantity": 0.25,
        "stock_status": "in_stock",
        "shelf_life_days": 5
    },
    {
        "name": "Sponge Gourd (नेनुआ)",
        "image": "https://images.unsplash.com/photo-1607672632458-9eb56696346b?w=800",
        "benefit": "Low calorie, cooling effect, good for digestion and skin.",
        "nutrients": "Vitamins: C, A | Minerals: Iron, Zinc | Water content: High",
        "price": 35,
        "wholesale_price": 26,
        "category_id": VEGETABLES_CATEGORY_ID,
        "unit": "kg",
        "min_quantity": 0.5,
        "step_quantity": 0.25,
        "stock_status": "in_stock",
        "shelf_life_days": 5
    },
    {
        "name": "Pointed Gourd (परवल)",
        "image": "https://images.unsplash.com/photo-1590165482129-1b8b27698780?w=800",
        "benefit": "Aids digestion, controls blood sugar, good for weight management.",
        "nutrients": "Vitamins: A, C | Minerals: Calcium, Iron | Fiber: Moderate",
        "price": 60,
        "wholesale_price": 45,
        "category_id": VEGETABLES_CATEGORY_ID,
        "unit": "kg",
        "min_quantity": 0.5,
        "step_quantity": 0.25,
        "stock_status": "in_stock",
        "shelf_life_days": 5
    },
    {
        "name": "Ivy Gourd (कुंदरू)",
        "image": "https://images.unsplash.com/photo-1601039641847-7857b994d704?w=800",
        "benefit": "Controls blood sugar, rich in beta-carotene, aids weight loss.",
        "nutrients": "Vitamins: A, B, C | Minerals: Iron, Calcium | Fiber: Moderate",
        "price": 50,
        "wholesale_price": 38,
        "category_id": VEGETABLES_CATEGORY_ID,
        "unit": "kg",
        "min_quantity": 0.5,
        "step_quantity": 0.25,
        "stock_status": "in_stock",
        "shelf_life_days": 5
    },
    {
        "name": "Round Gourd (टिंडा)",
        "image": "https://images.unsplash.com/photo-1601039641847-7857b994d704?w=800",
        "benefit": "Cooling effect, low calorie, good for digestion and hydration.",
        "nutrients": "Vitamins: C, B | Minerals: Calcium, Iron | Water content: High",
        "price": 45,
        "wholesale_price": 34,
        "category_id": VEGETABLES_CATEGORY_ID,
        "unit": "kg",
        "min_quantity": 0.5,
        "step_quantity": 0.25,
        "stock_status": "in_stock",
        "shelf_life_days": 5
    },
    {
        "name": "Pumpkin (कद्दू)",
        "image": "https://images.unsplash.com/photo-1506917728037-b6af01a7d403?w=800",
        "benefit": "Rich in beta-carotene, supports eye health, boosts immunity.",
        "nutrients": "Vitamins: A, C, E | Minerals: Potassium, Iron | Antioxidants: Beta-carotene",
        "price": 30,
        "wholesale_price": 22,
        "category_id": VEGETABLES_CATEGORY_ID,
        "unit": "kg",
        "min_quantity": 0.5,
        "step_quantity": 0.5,
        "stock_status": "in_stock",
        "shelf_life_days": 30
    },
    # Beans & Pods
    {
        "name": "Lady Finger (भिंडी)",
        "image": "https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=800",
        "benefit": "Rich in fiber, supports digestive health, good for diabetics.",
        "nutrients": "Vitamins: C, K | Minerals: Magnesium, Folate | Fiber: High",
        "price": 45,
        "wholesale_price": 34,
        "category_id": VEGETABLES_CATEGORY_ID,
        "unit": "kg",
        "min_quantity": 0.25,
        "step_quantity": 0.25,
        "stock_status": "in_stock",
        "shelf_life_days": 5
    },
    {
        "name": "French Beans (फ्रेंच बीन्स)",
        "image": "https://images.unsplash.com/photo-1567375698348-5d9d5ae99de0?w=800",
        "benefit": "High in protein and fiber, supports bone health, aids digestion.",
        "nutrients": "Vitamins: C, K, A | Minerals: Iron, Calcium | Protein: Moderate",
        "price": 80,
        "wholesale_price": 60,
        "category_id": VEGETABLES_CATEGORY_ID,
        "unit": "kg",
        "min_quantity": 0.25,
        "step_quantity": 0.25,
        "stock_status": "in_stock",
        "shelf_life_days": 5
    },
    {
        "name": "Cluster Beans (ग्वार फली)",
        "image": "https://images.unsplash.com/photo-1567375698348-5d9d5ae99de0?w=800",
        "benefit": "Excellent for diabetics, rich in fiber, supports digestive health.",
        "nutrients": "Vitamins: C, K | Minerals: Iron, Calcium | Fiber: Very High",
        "price": 60,
        "wholesale_price": 45,
        "category_id": VEGETABLES_CATEGORY_ID,
        "unit": "kg",
        "min_quantity": 0.25,
        "step_quantity": 0.25,
        "stock_status": "in_stock",
        "shelf_life_days": 4
    },
    {
        "name": "Cowpea Beans (लोबिया फली)",
        "image": "https://images.unsplash.com/photo-1567375698348-5d9d5ae99de0?w=800",
        "benefit": "High protein, supports muscle health, good source of iron.",
        "nutrients": "Vitamins: A, C | Minerals: Iron, Calcium | Protein: High",
        "price": 70,
        "wholesale_price": 52,
        "category_id": VEGETABLES_CATEGORY_ID,
        "unit": "kg",
        "min_quantity": 0.25,
        "step_quantity": 0.25,
        "stock_status": "in_stock",
        "shelf_life_days": 4
    },
    {
        "name": "Green Peas (हरी मटर)",
        "image": "https://images.unsplash.com/photo-1587735243615-c03f25aaff15?w=800",
        "benefit": "High protein, supports eye health, rich in fiber and vitamins.",
        "nutrients": "Vitamins: A, C, K | Minerals: Iron, Zinc | Protein: 5g per 100g",
        "price": 80,
        "wholesale_price": 60,
        "category_id": VEGETABLES_CATEGORY_ID,
        "unit": "kg",
        "min_quantity": 0.25,
        "step_quantity": 0.25,
        "stock_status": "in_stock",
        "shelf_life_days": 5
    },
    # Brinjals
    {
        "name": "Small Brinjal (छोटा बैंगन)",
        "image": "https://images.unsplash.com/photo-1605888969139-42cca4308aa2?w=800",
        "benefit": "Rich in antioxidants, supports brain health, low in calories.",
        "nutrients": "Vitamins: C, K, B6 | Minerals: Potassium, Manganese | Antioxidants: Nasunin",
        "price": 40,
        "wholesale_price": 30,
        "category_id": VEGETABLES_CATEGORY_ID,
        "unit": "kg",
        "min_quantity": 0.5,
        "step_quantity": 0.25,
        "stock_status": "in_stock",
        "shelf_life_days": 7
    },
    {
        "name": "Long Brinjal (लंबा बैंगन)",
        "image": "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=800",
        "benefit": "Low calorie, rich in fiber, supports heart health.",
        "nutrients": "Vitamins: C, K, B6 | Minerals: Potassium, Copper | Fiber: High",
        "price": 35,
        "wholesale_price": 26,
        "category_id": VEGETABLES_CATEGORY_ID,
        "unit": "kg",
        "min_quantity": 0.5,
        "step_quantity": 0.25,
        "stock_status": "in_stock",
        "shelf_life_days": 7
    },
    # Peppers
    {
        "name": "Green Chilli (हरी मिर्च)",
        "image": "https://images.unsplash.com/photo-1583119022894-919a68a3d0e3?w=800",
        "benefit": "Boosts metabolism, rich in Vitamin C, supports immune system.",
        "nutrients": "Vitamins: C, A, B6 | Minerals: Potassium | Compounds: Capsaicin",
        "price": 100,
        "wholesale_price": 75,
        "category_id": VEGETABLES_CATEGORY_ID,
        "unit": "kg",
        "min_quantity": 0.1,
        "step_quantity": 0.1,
        "stock_status": "in_stock",
        "shelf_life_days": 10
    },
    {
        "name": "Red Chilli (लाल मिर्च)",
        "image": "https://images.unsplash.com/photo-1588252303782-cb80119abd6d?w=800",
        "benefit": "Boosts metabolism, pain relief, supports digestive health.",
        "nutrients": "Vitamins: C, A, B6 | Minerals: Potassium | Compounds: Capsaicin",
        "price": 120,
        "wholesale_price": 90,
        "category_id": VEGETABLES_CATEGORY_ID,
        "unit": "kg",
        "min_quantity": 0.1,
        "step_quantity": 0.1,
        "stock_status": "in_stock",
        "shelf_life_days": 14
    },
    {
        "name": "Bajji Chilli (बड़ी हरी मिर्च)",
        "image": "https://images.unsplash.com/photo-1583119022894-919a68a3d0e3?w=800",
        "benefit": "Mild heat, perfect for stuffing and frying, rich in vitamins.",
        "nutrients": "Vitamins: C, A | Minerals: Potassium | Fiber: Moderate",
        "price": 80,
        "wholesale_price": 60,
        "category_id": VEGETABLES_CATEGORY_ID,
        "unit": "kg",
        "min_quantity": 0.25,
        "step_quantity": 0.25,
        "stock_status": "in_stock",
        "shelf_life_days": 7
    },
    {
        "name": "Green Capsicum (हरी शिमला मिर्च)",
        "image": "https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=800",
        "benefit": "Rich in Vitamin C, supports eye health, boosts immunity.",
        "nutrients": "Vitamins: C, A, B6 | Minerals: Potassium | Antioxidants: Beta-carotene",
        "price": 60,
        "wholesale_price": 45,
        "category_id": VEGETABLES_CATEGORY_ID,
        "unit": "kg",
        "min_quantity": 0.25,
        "step_quantity": 0.25,
        "stock_status": "in_stock",
        "shelf_life_days": 10
    },
    {
        "name": "Red Bell Pepper (लाल शिमला मिर्च)",
        "image": "https://images.unsplash.com/photo-1601752943749-7dd8d89a391f?w=800",
        "benefit": "Highest Vitamin C among peppers, supports skin health, antioxidant-rich.",
        "nutrients": "Vitamins: C, A, B6 | Minerals: Potassium | Antioxidants: Lycopene",
        "price": 150,
        "wholesale_price": 115,
        "category_id": EXOTIC_CATEGORY_ID,
        "unit": "kg",
        "min_quantity": 0.25,
        "step_quantity": 0.25,
        "stock_status": "in_stock",
        "shelf_life_days": 10
    },
    {
        "name": "Yellow Bell Pepper (पीली शिमला मिर्च)",
        "image": "https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=800",
        "benefit": "Sweet taste, rich in Vitamin C, supports immune system.",
        "nutrients": "Vitamins: C, A, B6 | Minerals: Potassium | Antioxidants: Zeaxanthin",
        "price": 150,
        "wholesale_price": 115,
        "category_id": EXOTIC_CATEGORY_ID,
        "unit": "kg",
        "min_quantity": 0.25,
        "step_quantity": 0.25,
        "stock_status": "in_stock",
        "shelf_life_days": 10
    },
    # Cabbage family
    {
        "name": "Cabbage (पत्तागोभी)",
        "image": "https://images.unsplash.com/photo-1598030343246-eec71cb44231?w=800",
        "benefit": "Rich in fiber, supports digestive health, anti-inflammatory.",
        "nutrients": "Vitamins: C, K, B6 | Minerals: Manganese, Potassium | Fiber: High",
        "price": 30,
        "wholesale_price": 22,
        "category_id": LEAFY_GREENS_CATEGORY_ID,
        "unit": "kg",
        "min_quantity": 0.5,
        "step_quantity": 0.5,
        "stock_status": "in_stock",
        "shelf_life_days": 14
    },
    {
        "name": "Cauliflower (फूलगोभी)",
        "image": "https://images.unsplash.com/photo-1568584711075-3d021a7c3ca3?w=800",
        "benefit": "Low carb, rich in fiber, supports brain health and detoxification.",
        "nutrients": "Vitamins: C, K, B6 | Minerals: Potassium | Antioxidants: Sulforaphane",
        "price": 40,
        "wholesale_price": 30,
        "category_id": VEGETABLES_CATEGORY_ID,
        "unit": "kg",
        "min_quantity": 0.5,
        "step_quantity": 0.5,
        "stock_status": "in_stock",
        "shelf_life_days": 7
    },
    {
        "name": "Broccoli (ब्रोकोली)",
        "image": "https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=800",
        "benefit": "Superfood, rich in sulforaphane, supports cancer prevention.",
        "nutrients": "Vitamins: C, K, A | Minerals: Potassium, Folate | Compounds: Sulforaphane",
        "price": 120,
        "wholesale_price": 90,
        "category_id": EXOTIC_CATEGORY_ID,
        "unit": "kg",
        "min_quantity": 0.25,
        "step_quantity": 0.25,
        "stock_status": "in_stock",
        "shelf_life_days": 7
    },
    {
        "name": "Bok Choy (बोक चॉय)",
        "image": "https://images.unsplash.com/photo-1571680322279-a226e6a4cc2a?w=800",
        "benefit": "Rich in vitamins, supports bone health, low in calories.",
        "nutrients": "Vitamins: A, C, K | Minerals: Calcium, Iron | Fiber: Moderate",
        "price": 100,
        "wholesale_price": 75,
        "category_id": EXOTIC_CATEGORY_ID,
        "unit": "kg",
        "min_quantity": 0.25,
        "step_quantity": 0.25,
        "stock_status": "in_stock",
        "shelf_life_days": 5
    },
    # Exotic & Special
    {
        "name": "American Sweet Corn Cob (अमेरिकन स्वीट कॉर्न भुट्टा)",
        "image": "https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=800",
        "benefit": "High in fiber, supports eye health, provides sustained energy.",
        "nutrients": "Vitamins: B1, B5, C | Minerals: Magnesium, Phosphorus | Fiber: 2g per cob",
        "price": 40,
        "wholesale_price": 30,
        "category_id": EXOTIC_CATEGORY_ID,
        "unit": "piece",
        "min_quantity": 1,
        "step_quantity": 1,
        "stock_status": "in_stock",
        "shelf_life_days": 5
    },
    {
        "name": "Zucchini (ज़ुकीनी)",
        "image": "https://images.unsplash.com/photo-1563252722-6434563a985d?w=800",
        "benefit": "Low calorie, rich in antioxidants, supports heart health.",
        "nutrients": "Vitamins: A, C, K | Minerals: Potassium, Manganese | Fiber: Moderate",
        "price": 80,
        "wholesale_price": 60,
        "category_id": EXOTIC_CATEGORY_ID,
        "unit": "kg",
        "min_quantity": 0.25,
        "step_quantity": 0.25,
        "stock_status": "in_stock",
        "shelf_life_days": 7
    },
    {
        "name": "Raw Turmeric (कच्ची हल्दी)",
        "image": "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=800",
        "benefit": "Powerful anti-inflammatory, supports joint health, boosts immunity.",
        "nutrients": "Vitamins: C, B6 | Minerals: Iron, Manganese | Compounds: Curcumin",
        "price": 150,
        "wholesale_price": 115,
        "category_id": VEGETABLES_CATEGORY_ID,
        "unit": "kg",
        "min_quantity": 0.25,
        "step_quantity": 0.25,
        "stock_status": "in_stock",
        "shelf_life_days": 21
    },
    {
        "name": "Drumstick (सहजन)",
        "image": "https://images.unsplash.com/photo-1601039641847-7857b994d704?w=800",
        "benefit": "Superfood, rich in nutrients, supports bone health and immunity.",
        "nutrients": "Vitamins: A, C | Minerals: Calcium, Iron | Protein: High",
        "price": 80,
        "wholesale_price": 60,
        "category_id": VEGETABLES_CATEGORY_ID,
        "unit": "kg",
        "min_quantity": 0.25,
        "step_quantity": 0.25,
        "stock_status": "in_stock",
        "shelf_life_days": 7
    },
    {
        "name": "Jackfruit (कटहल)",
        "image": "https://images.unsplash.com/photo-1593357262846-44ddd3b93f71?w=800",
        "benefit": "High in fiber and protein, great meat substitute, supports digestion.",
        "nutrients": "Vitamins: C, B6, A | Minerals: Potassium, Magnesium | Fiber: Very High",
        "price": 50,
        "wholesale_price": 38,
        "category_id": VEGETABLES_CATEGORY_ID,
        "unit": "kg",
        "min_quantity": 0.5,
        "step_quantity": 0.5,
        "stock_status": "in_stock",
        "shelf_life_days": 7
    },
    {
        "name": "Raw Mango (कच्चा आम)",
        "image": "https://images.unsplash.com/photo-1591073113125-e46713c829ed?w=800",
        "benefit": "Aids digestion, prevents heat stroke, rich in Vitamin C.",
        "nutrients": "Vitamins: C, A, B6 | Minerals: Potassium | Acids: Citric, Malic",
        "price": 60,
        "wholesale_price": 45,
        "category_id": VEGETABLES_CATEGORY_ID,
        "unit": "kg",
        "min_quantity": 0.5,
        "step_quantity": 0.25,
        "stock_status": "in_stock",
        "shelf_life_days": 10
    },
    {
        "name": "Karonda (करौंदा)",
        "image": "https://images.unsplash.com/photo-1601039641847-7857b994d704?w=800",
        "benefit": "Rich in iron, aids digestion, used in pickles and chutneys.",
        "nutrients": "Vitamins: C | Minerals: Iron, Phosphorus | Antioxidants: High",
        "price": 80,
        "wholesale_price": 60,
        "category_id": VEGETABLES_CATEGORY_ID,
        "unit": "kg",
        "min_quantity": 0.25,
        "step_quantity": 0.25,
        "stock_status": "in_stock",
        "shelf_life_days": 7
    },
    {
        "name": "Lemon Grass (लेमन ग्रास)",
        "image": "https://images.unsplash.com/photo-1607672632458-9eb56696346b?w=800",
        "benefit": "Aids digestion, reduces anxiety, has antibacterial properties.",
        "nutrients": "Vitamins: A, C | Minerals: Potassium, Magnesium | Essential Oils: Citral",
        "price": 50,
        "wholesale_price": 38,
        "category_id": EXOTIC_CATEGORY_ID,
        "unit": "bunch",
        "min_quantity": 1,
        "step_quantity": 1,
        "stock_status": "in_stock",
        "shelf_life_days": 14
    }
]

def add_vegetables():
    """Add all vegetables to the database"""
    success_count = 0
    error_count = 0
    
    for veg in vegetables:
        try:
            # Prepare product data
            product_data = {
                "name": veg["name"],
                "image": veg["image"],
                "benefit": veg["benefit"],
                "nutrients": veg.get("nutrients", ""),
                "price": veg["price"],
                "wholesale_price": veg.get("wholesale_price", veg["price"] * 0.75),
                "category_id": veg.get("category_id", VEGETABLES_CATEGORY_ID),
                "unit": veg.get("unit", "kg"),
                "unit_value": 1,
                "price_per": veg.get("unit", "kg"),
                "min_quantity": veg.get("min_quantity", 0.25),
                "step_quantity": veg.get("step_quantity", 0.25),
                "stock_quantity": 100,
                "low_stock_threshold": 10,
                "growth_days": 0,
                "weight": 1000,
                "pack_size": f"1 {veg.get('unit', 'kg')}",
                "active": True,
                "stock_status": veg.get("stock_status", "in_stock"),
                "ready_in_days": None,
                "availability_date": None,
                "seeds_available": False,
                "harvest_date": None,
                "shelf_life_days": veg.get("shelf_life_days", 7),
                "featured": False,
                "display_order": 0
            }
            
            # Make API request
            response = requests.post(
                f"{BACKEND_URL}/api/products",
                json=product_data,
                timeout=30
            )
            
            if response.status_code in [200, 201]:
                success_count += 1
                print(f"✅ Added: {veg['name']}")
            else:
                error_count += 1
                print(f"❌ Failed to add {veg['name']}: {response.status_code} - {response.text[:100]}")
                
        except Exception as e:
            error_count += 1
            print(f"❌ Error adding {veg['name']}: {str(e)}")
    
    print(f"\n{'='*50}")
    print(f"Total: {len(vegetables)}")
    print(f"Success: {success_count}")
    print(f"Errors: {error_count}")

if __name__ == "__main__":
    add_vegetables()
