"""Tests for unit conversion utilities."""

import pytest

from app.utils.units import convert_volume, convert_pressure, convert_temperature


class TestVolumeConversion:
    def test_m3_to_litres(self):
        assert convert_volume(1.0, "m3", "L") == pytest.approx(1000.0)

    def test_m3_to_barrels(self):
        assert convert_volume(1.0, "m3", "bbl") == pytest.approx(6.28981, rel=1e-3)

    def test_litres_to_m3(self):
        assert convert_volume(1000.0, "L", "m3") == pytest.approx(1.0)

    def test_same_unit(self):
        assert convert_volume(42.0, "m3", "m3") == 42.0


class TestPressureConversion:
    def test_bar_to_psi(self):
        assert convert_pressure(1.0, "bar", "psi") == pytest.approx(14.5038, rel=1e-3)

    def test_psi_to_bar(self):
        assert convert_pressure(14.5038, "psi", "bar") == pytest.approx(1.0, rel=1e-3)


class TestTemperatureConversion:
    def test_celsius_to_fahrenheit(self):
        assert convert_temperature(0.0, "C", "F") == pytest.approx(32.0)
        assert convert_temperature(100.0, "C", "F") == pytest.approx(212.0)

    def test_fahrenheit_to_celsius(self):
        assert convert_temperature(32.0, "F", "C") == pytest.approx(0.0)
