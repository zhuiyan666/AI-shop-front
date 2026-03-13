#!/usr/bin/env python3
"""Generate a frontend-friendly product dataset from the cleaned CSV."""

from __future__ import annotations

import csv
import json
import re
from pathlib import Path

SRC_CSV = Path(r"C:\Users\Lenovo\Desktop\demo\datas\final_data\products_final.csv")
OUT_JSON = Path(r"C:\Users\Lenovo\Desktop\demo\AIShop\front-end\AI-shop-front\front-shop\src\mock\products.generated.json")

CATEGORIES = {
    "mobile_digital": "\u624b\u673a\u6570\u7801",
    "computer_tablet": "\u7535\u8111\u5e73\u677f",
    "audio": "\u97f3\u9891\u8bbe\u5907",
    "home_appliance": "\u5bb6\u7528\u7535\u5668",
    "sports_fashion": "\u8fd0\u52a8\u670d\u9970",
    "beauty": "\u7f8e\u5986\u62a4\u80a4",
    "food_health": "\u98df\u54c1\u4fdd\u5065",
    "pet": "\u5ba0\u7269\u7528\u54c1",
    "auto": "\u6c7d\u8f66\u7528\u54c1",
    "office": "\u529e\u516c\u6587\u5177",
    "home_living": "\u5bb6\u5c45\u751f\u6d3b",
    "jewelry": "\u73e0\u5b9d\u914d\u9970",
    "toys_party": "\u73a9\u5177\u6d3e\u5bf9",
    "industrial": "\u5de5\u4e1a\u7528\u54c1",
}

TAGS = {
    "hot": "\u70ed\u5356",
    "discount": "\u4f18\u60e0",
    "top_rated": "\u9ad8\u8bc4\u5206",
    "low_stock": "\u4f4e\u5e93\u5b58",
}

CATEGORY_RULES = [
    (CATEGORIES["industrial"], [
        "safety vest", "industrial", "work glove", "thread insert", "gauge", "tool", "drill", "armor",
        "ansi", "tap wrench", "socket", "wrench", "\u5de5\u4e1a", "\u5de5\u5177", "\u5b89\u5168\u80cc\u5fc3", "\u94bb", "\u52b3\u4fdd",
    ]),
    (CATEGORIES["auto"], [
        "tire", "car", "automotive", "exhaust", "motorcycle", "truck", "bike grip", "bicycle",
        "carburetor", "headlight", "\u6c7d\u8f66", "\u8f6e\u80ce", "\u6392\u6c14", "\u81ea\u884c\u8f66", "\u5361\u8f66",
    ]),
    (CATEGORIES["mobile_digital"], [
        "iphone", "airpods", "ipad case", "screen replacement", "lcd", "digitizer", "bluetooth headset",
        "charger", "usb c", "wireless mouse", "router", "modem", "camera", "webcam", "smart watch",
        "\u624b\u673a", "\u8033\u673a", "\u84dd\u7259", "\u5145\u7535", "\u6570\u7801", "\u6444\u50cf", "\u624b\u8868",
    ]),
    (CATEGORIES["computer_tablet"], [
        "laptop", "notebook", "macbook", "ipad", "tablet", "monitor", "keyboard", "ssd", "hard drive",
        "memory card", "printer", "toner", "cartridge", "ink", "\u7b14\u8bb0\u672c", "\u7535\u8111", "\u5e73\u677f",
        "\u952e\u76d8", "\u9f20\u6807", "\u6253\u5370\u673a",
    ]),
    (CATEGORIES["audio"], [
        "speaker", "soundbar", "microphone", "earbud", "earphone", "headphone", "stereo", "subwoofer",
        "\u97f3\u7bb1", "\u97f3\u9891", "\u9ea6\u514b\u98ce", "\u8033\u673a",
    ]),
    (CATEGORIES["home_appliance"], [
        "vacuum", "fryer", "blender", "coffee", "humidifier", "dehumidifier", "heater", "fan", "lamp",
        "solar light", "air purifier", "microwave", "toaster", "cleaner",
        "\u5bb6\u7535", "\u706f", "\u5496\u5561", "\u98ce\u6247", "\u5438\u5c18",
    ]),
    (CATEGORIES["sports_fashion"], [
        "shoe", "shoes", "sneaker", "boot", "sandal", "slipper", "hoodie", "legging", "polo shirt",
        "shirt", "dress", "skirt", "pants", "jacket", "yoga", "running", "tennis", "baseball", "fitness",
        "\u978b", "\u51c9\u978b", "\u886c\u886b", "\u88e4", "\u8dd1\u978b", "\u745c\u4f3d", "\u670d", "\u8fd0\u52a8",
    ]),
    (CATEGORIES["beauty"], [
        "bio-oil", "moisturizer", "serum", "lotion", "shampoo", "conditioner", "hair oil", "skin care",
        "\u62a4\u80a4", "\u7f8e\u5bb9", "\u53d1\u6cb9", "\u4fdd\u6e7f", "\u5934\u53d1",
    ]),
    (CATEGORIES["food_health"], [
        "jam", "butter", "protein", "vitamin", "supplement", "snack", "tea", "coffee beans",
        "\u679c\u9171", "\u98df\u54c1", "\u4fdd\u5065", "\u7ef4\u751f\u7d20", "\u8865\u5145\u5242",
    ]),
    (CATEGORIES["pet"], [
        "dog", "cat", "pet", "aquarium", "collar", "leash", "bird", "fish tank",
        "\u72d7", "\u732b", "\u5ba0\u7269", "\u9c7c\u7f38", "\u9879\u5708",
    ]),
    (CATEGORIES["office"], [
        "folder", "binder", "paper", "pen", "desk", "office", "file", "shredder", "staple",
        "\u529e\u516c", "\u6587\u5177", "\u6587\u4ef6\u5939", "\u788e\u7eb8\u673a", "\u7eb8",
    ]),
    (CATEGORIES["home_living"], [
        "organizer", "storage", "bath towel", "robe", "curtain", "rug", "pillow", "kitchen", "garden",
        "fence", "post cap", "craft box", "sewing box",
        "\u5bb6\u5c45", "\u6536\u7eb3", "\u6d74\u888d", "\u53a8\u623f", "\u82b1\u56ed", "\u56f4\u680f",
    ]),
    (CATEGORIES["jewelry"], [
        "necklace", "bracelet", "ring", "anklet", "jewelry", "earring",
        "\u9879\u94fe", "\u624b\u94fe", "\u6212\u6307", "\u9996\u9970",
    ]),
    (CATEGORIES["toys_party"], [
        "toy", "party", "balloon", "beer cup", "game set", "gift bag",
        "\u73a9\u5177", "\u6d3e\u5bf9", "\u6c14\u7403", "\u676f\u5957", "\u793c\u888b",
    ]),
]


def parse_price(value: str) -> float:
    try:
        return float(value or 0)
    except Exception:
        return 0.0


def parse_float(value: str) -> float:
    try:
        return round(float(value or 0), 1)
    except Exception:
        return 0.0


def parse_int(value: str) -> int:
    try:
        return int(float(value or 0))
    except Exception:
        return 0


def infer_stock(availability: str) -> int:
    text = (availability or "").strip()
    match = re.search(r"\u5e93\u5b58\u4ec5\u5269\s*(\d+)\s*\u4ef6", text)
    if match:
        return max(1, int(match.group(1)))
    if "\u6709\u5b58\u8d27" in text or "\u6709\u5e93\u5b58" in text:
        return 120
    if "\u53d1\u8d27" in text:
        return 30
    if "\u7f3a\u8d27" in text:
        return 0
    return 20


def infer_category(title: str, brand: str, description: str) -> str:
    haystack = " ".join([
        (title or "").lower(),
        (brand or "").lower(),
        (description or "").lower()[:500],
    ])
    for category, keywords in CATEGORY_RULES:
        if any(keyword in haystack for keyword in keywords):
            return category
    return CATEGORIES["home_living"]


def infer_tags(price: float, rating: float, stock: int, category: str) -> list[str]:
    tags: list[str] = []
    if stock and stock <= 5:
        tags.append(TAGS["low_stock"])
    if rating >= 4.7:
        tags.append(TAGS["top_rated"])
    if price and price <= 20:
        tags.append(TAGS["discount"])
    if category in {CATEGORIES["mobile_digital"], CATEGORIES["computer_tablet"], CATEGORIES["sports_fashion"]} and rating >= 4.4:
        tags.append(TAGS["hot"])
    return list(dict.fromkeys(tags))[:2]


def infer_original_price(price: float, tags: list[str]):
    if price <= 0:
        return None
    factor = 1.18 if TAGS["discount"] in tags else 1.28
    original = price * factor
    if original >= 100:
        return int(round(original))
    return round(original, 2)


def main() -> int:
    rows = list(csv.DictReader(SRC_CSV.open("r", encoding="utf-8-sig", newline="")))
    products = []
    for idx, row in enumerate(rows, start=1):
        price = parse_price(row.get("price", "0"))
        rating = parse_float(row.get("rating_value", "0"))
        sales = parse_int(row.get("rating_count", "0"))
        stock = infer_stock(row.get("availability", ""))
        category = (row.get("category") or "").strip() or infer_category(
            row.get("title", ""),
            row.get("brand", ""),
            row.get("description", ""),
        )
        tags = infer_tags(price, rating, stock, category)
        image = (row.get("image") or "").strip()
        products.append({
            "id": idx,
            "sku": (row.get("sku") or "").strip(),
            "name": (row.get("title") or "").strip(),
            "price": int(round(price)) if price.is_integer() else price,
            "originalPrice": infer_original_price(price, tags),
            "image": image,
            "images": [image] if image else [],
            "category": category,
            "sales": sales,
            "rating": rating,
            "stock": stock,
            "tags": tags,
            "description": (row.get("description") or row.get("title") or "").strip(),
            "brand": (row.get("brand") or "").strip(),
            "store": (row.get("store") or "").strip(),
            "currency": (row.get("currency") or "").strip(),
            "availability": (row.get("availability") or "").strip(),
            "sourceUrl": (row.get("source_url") or "").strip(),
            "mpn": (row.get("mpn") or "").strip(),
            "gtin": (row.get("gtin") or "").strip(),
        })

    OUT_JSON.write_text(json.dumps(products, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Wrote {len(products)} products to {OUT_JSON}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
