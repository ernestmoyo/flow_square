"""Geofence utilities for point-in-polygon and circle checks."""

import math


def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate the great-circle distance between two points in meters."""
    R = 6_371_000  # Earth radius in meters

    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)

    a = (
        math.sin(delta_phi / 2) ** 2
        + math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2) ** 2
    )
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))

    return R * c


def point_in_circle(
    lat: float, lon: float, center_lat: float, center_lon: float, radius_meters: float
) -> bool:
    """Check if a point is within a circular geofence."""
    distance = haversine_distance(lat, lon, center_lat, center_lon)
    return distance <= radius_meters


def point_in_polygon(lat: float, lon: float, polygon: list[tuple[float, float]]) -> bool:
    """Ray-casting algorithm for point-in-polygon check.

    polygon is a list of (lat, lon) tuples forming a closed polygon.
    """
    n = len(polygon)
    inside = False

    j = n - 1
    for i in range(n):
        yi, xi = polygon[i]
        yj, xj = polygon[j]

        if ((yi > lon) != (yj > lon)) and (lat < (xj - xi) * (lon - yi) / (yj - yi) + xi):
            inside = not inside
        j = i

    return inside


def check_route_corridor(
    route_points: list[tuple[float, float]],
    corridor_center: list[tuple[float, float]],
    corridor_width_meters: float,
) -> list[dict]:
    """Check if route points stay within a corridor defined by center line and width.

    Returns list of deviation records for points outside the corridor.
    """
    deviations = []
    half_width = corridor_width_meters / 2

    for idx, (lat, lon) in enumerate(route_points):
        min_distance = float("inf")
        for clat, clon in corridor_center:
            d = haversine_distance(lat, lon, clat, clon)
            min_distance = min(min_distance, d)

        if min_distance > half_width:
            deviations.append({
                "point_index": idx,
                "lat": lat,
                "lon": lon,
                "distance_from_corridor_m": min_distance,
                "exceeds_by_m": min_distance - half_width,
            })

    return deviations
