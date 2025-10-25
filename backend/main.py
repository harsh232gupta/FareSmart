from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List
from models import SearchRequest, RouteOption
from utils import (
    load_airports_df, haversine_km, estimate_drive_minutes, ground_cost_inr, city_guess_coords
)

app = FastAPI(title="SmartRoute India MVP")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"],
)

AIRPORTS = load_airports_df()

# ========== MOCK flight pricing for MVP ==========
def mock_flight_query(from_iata: str, to_city: str, date: str):
    """
    Return a fake cheapest price and duration, varying by distance from some hubs.
    You can replace this with a real flight API later.
    """
    base_prices = {
        "BLR": 3800, "DEL": 4200, "BOM": 4400, "MAA": 4000, "HYD": 4100,
        "COK": 3600, "GOX": 3500, "IXE": 6500, "LKO": 3600, "VNS": 3700, "AYJ": 3900
    }
    fallback = 5200
    price = base_prices.get(from_iata, fallback)
    duration = 90 if from_iata in ("BLR","LKO","DEL") else 130
    return price, duration

@app.post("/find_routes")
def find_routes(req: SearchRequest):
    origin_coords = city_guess_coords(req.origin_city)
    dest_coords = city_guess_coords(req.destination_city)

    if not origin_coords or not dest_coords:
        raise HTTPException(400, "Unknown city name")

    o_lat, o_lon = origin_coords
    d_lat, d_lon = dest_coords

    from_airports = []
    to_airports = []

    # 1️⃣ Find all nearby FROM airports
    for _, row in AIRPORTS.iterrows():
        if not row.get("has_commercial", True):
            continue
        d_km = haversine_km(o_lat, o_lon, row["lat"], row["lon"])
        if req.max_ground_km and d_km <= req.max_ground_km:
            from_airports.append(row["iata"])

    # 2️⃣ Find all nearby TO airports (around destination)
    for _, row in AIRPORTS.iterrows():
        if not row.get("has_commercial", True):
            continue
        d_km = haversine_km(d_lat, d_lon, row["lat"], row["lon"])
        if req.max_ground_km and d_km <= req.max_ground_km:
            to_airports.append(row["iata"])

    # 3️⃣ Now brute-force all combinations
    candidates = []
    for from_air in from_airports:
        for to_air in to_airports:
            flight_price, flight_duration = mock_flight_query(from_air, to_air, req.date)
            candidates.append({
                "from_airport": from_air,
                "to_airport": to_air,
                "flight_price_inr": float(flight_price)
            })

    candidates.sort(key=lambda c: c["flight_price_inr"])
    return candidates[:10]

