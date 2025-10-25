import math
import pandas as pd

EARTH_R = 6371.0  # km
TAXI_RATE_PER_KM_INR = 16  # simple estimate for MVP
AVG_DRIVING_SPEED_KMPH = 45  # conservative avg for India roads
# AIRPORTS_CSV = "indian_airports_mvp.csv"
import os
import pandas as pd
import math

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
AIRPORTS_CSV = os.path.join(BASE_DIR, "indian_airports_mvp.csv")

def haversine_km(lat1, lon1, lat2, lon2):
    p = math.pi/180
    a = 0.5 - math.cos((lat2-lat1)*p)/2 + math.cos(lat1*p)*math.cos(lat2*p)*(1-math.cos((lon2-lon1)*p))/2
    return 2 * EARTH_R * math.asin(math.sqrt(a))

def estimate_drive_minutes(distance_km):
    hours = distance_km / AVG_DRIVING_SPEED_KMPH
    return int(round(hours * 60))

def ground_cost_inr(distance_km):
    return round(distance_km * TAXI_RATE_PER_KM_INR, 0)

def load_airports_df():
    return pd.read_csv(AIRPORTS_CSV)

def city_guess_coords(city_name: str):
    # MVP: small hardcoded lookup (replace with LatLong Geocoding later)
    known = {
        "mangaluru": (12.915, 74.855),
        "mangalore": (12.915, 74.855),
        "bengaluru": (12.9716, 77.5946),
        "bangalore": (12.9716, 77.5946),
        "ayodhya": (26.799, 82.199),
        "delhi": (28.6139, 77.2090),
        "mumbai": (19.0760, 72.8777),
        "varanasi": (25.3176, 82.9739),
        "lucknow": (26.8467, 80.9462),
        "kochi": (9.9312, 76.2673),
    }
    key = city_name.strip().lower()
    return known.get(key)
