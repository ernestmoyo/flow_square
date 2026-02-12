"""Variance tolerance engine for reconciliation checks."""


class ToleranceEngine:
    """Configurable tolerance checker for reconciliation variances.

    Default thresholds:
      - Pilot: ±1.5%
      - Target (6-9 months): ±0.5%
    """

    DEFAULT_TOLERANCE_PCT = 1.5
    TARGET_TOLERANCE_PCT = 0.5

    def __init__(self, tolerance_pct: float | None = None) -> None:
        self.tolerance_pct = tolerance_pct or self.DEFAULT_TOLERANCE_PCT

    def check_variance(self, expected: float, actual: float) -> dict:
        """Check if variance between expected and actual is within tolerance.

        Returns a dict with:
          - variance: absolute difference
          - variance_pct: percentage difference
          - within_tolerance: bool
          - tolerance_pct: the threshold used
        """
        if expected == 0:
            return {
                "variance": abs(actual),
                "variance_pct": 100.0 if actual != 0 else 0.0,
                "within_tolerance": actual == 0,
                "tolerance_pct": self.tolerance_pct,
            }

        variance = actual - expected
        variance_pct = abs(variance) / abs(expected) * 100

        return {
            "variance": variance,
            "variance_pct": variance_pct,
            "within_tolerance": variance_pct <= self.tolerance_pct,
            "tolerance_pct": self.tolerance_pct,
        }

    def batch_check(self, pairs: list[tuple[float, float]]) -> list[dict]:
        """Check multiple (expected, actual) pairs."""
        return [self.check_variance(exp, act) for exp, act in pairs]

    def get_exceptions(self, pairs: list[tuple[float, float]]) -> list[dict]:
        """Return only pairs that exceed tolerance."""
        results = self.batch_check(pairs)
        return [r for r in results if not r["within_tolerance"]]
