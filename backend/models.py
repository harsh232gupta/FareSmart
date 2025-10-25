from pydantic import BaseModel
from typing import Optional, List

class SearchRequest(BaseModel):
    origin_city: str
    destination_city: str
    date: str  # "2025-10-30" (treat as string for MVP)
    max_ground_km: Optional[float] = None
    max_ground_minutes: Optional[int] = None

class RouteOption(BaseModel):
    airport_iata: str
    airport_name: str
    airport_city: str
    airport_distance_km: float
    ground_time_minutes: int
    flight_price_inr: float
    flight_duration_minutes: int
    total_cost_inr: float
    total_time_minutes: int
