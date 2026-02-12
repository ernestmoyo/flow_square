"""Unit conversion utilities for oil & gas volumes and measurements."""

# Volume conversion factors (to cubic metres as base unit)
VOLUME_TO_M3: dict[str, float] = {
    "m3": 1.0,
    "L": 0.001,
    "litres": 0.001,
    "liters": 0.001,
    "bbl": 0.158987,       # US barrel
    "barrels": 0.158987,
    "gal": 0.00378541,     # US gallon
    "gallons": 0.00378541,
    "MT": 1.1628,           # Metric tons (avg crude density ~0.86 kg/L)
    "metric_tons": 1.1628,
    "ft3": 0.0283168,       # Cubic feet
}

# Pressure conversion factors (to bar as base unit)
PRESSURE_TO_BAR: dict[str, float] = {
    "bar": 1.0,
    "psi": 0.0689476,
    "kPa": 0.01,
    "MPa": 10.0,
    "atm": 1.01325,
}

# Temperature conversion handled by functions (non-linear)


def convert_volume(value: float, from_unit: str, to_unit: str) -> float:
    if from_unit not in VOLUME_TO_M3:
        raise ValueError(f"Unknown volume unit: {from_unit}")
    if to_unit not in VOLUME_TO_M3:
        raise ValueError(f"Unknown volume unit: {to_unit}")

    m3_value = value * VOLUME_TO_M3[from_unit]
    return m3_value / VOLUME_TO_M3[to_unit]


def convert_pressure(value: float, from_unit: str, to_unit: str) -> float:
    if from_unit not in PRESSURE_TO_BAR:
        raise ValueError(f"Unknown pressure unit: {from_unit}")
    if to_unit not in PRESSURE_TO_BAR:
        raise ValueError(f"Unknown pressure unit: {to_unit}")

    bar_value = value * PRESSURE_TO_BAR[from_unit]
    return bar_value / PRESSURE_TO_BAR[to_unit]


def celsius_to_fahrenheit(celsius: float) -> float:
    return celsius * 9 / 5 + 32


def fahrenheit_to_celsius(fahrenheit: float) -> float:
    return (fahrenheit - 32) * 5 / 9


def litres_to_m3(litres: float) -> float:
    return litres / 1000


def m3_to_litres(m3: float) -> float:
    return m3 * 1000


def barrels_to_m3(barrels: float) -> float:
    return barrels * VOLUME_TO_M3["bbl"]


def m3_to_barrels(m3: float) -> float:
    return m3 / VOLUME_TO_M3["bbl"]
