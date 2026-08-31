"""
Synthetic placeholder data generator for the freight forecasting MVP.

*** THIS IS NOT REAL SAIL / MARKET DATA. ***
It generates ~2 years of daily "freight rate" series for three illustrative
route/vessel/cargo scenarios, built from a trend + annual seasonal wobble +
weekly wobble + noise + a small random-walk component (for realistic
autocorrelation). Used only so the rest of the pipeline (forecasting,
feasibility, risk, recommendation, backtest) has something real to compute on.

Run directly to (re)write data/freight_rates.csv:
    python data/generate_data.py
"""

import numpy as np
import pandas as pd
from pathlib import Path

SCENARIOS = [
    dict(route="Australia-Paradip", vessel_class="Supramax", cargo_type="Coal",
         base=22.0, trend_per_day=0.0025, seasonal_amp=1.5, weekly_amp=0.4,
         noise_std=0.6, seed=42),
    dict(route="Indonesia-Visakhapatnam", vessel_class="Panamax", cargo_type="Coal",
         base=14.0, trend_per_day=-0.0015, seasonal_amp=1.0, weekly_amp=0.3,
         noise_std=0.5, seed=43),
    dict(route="Mozambique-Dhamra", vessel_class="Handysize", cargo_type="Coal",
         base=26.0, trend_per_day=0.0018, seasonal_amp=2.0, weekly_amp=0.5,
         noise_std=0.8, seed=44),
]


def generate_synthetic_data(days: int = 730, end_date=None) -> pd.DataFrame:
    if end_date is None:
        end_date = pd.Timestamp.today().normalize()
    dates = pd.date_range(end=end_date, periods=days, freq="D")
    t = np.arange(days)

    frames = []
    for sc in SCENARIOS:
        rng = np.random.default_rng(sc["seed"])
        trend = sc["base"] + sc["trend_per_day"] * t
        seasonal = sc["seasonal_amp"] * np.sin(2 * np.pi * t / 365.25)
        weekly = sc["weekly_amp"] * np.sin(2 * np.pi * t / 7)
        noise = rng.normal(0, sc["noise_std"], days)
        random_walk = np.cumsum(rng.normal(0, sc["noise_std"] * 0.15, days))

        rate = trend + seasonal + weekly + noise + random_walk
        rate = np.clip(rate, 1.0, None)

        frames.append(pd.DataFrame({
            "date": dates,
            "route": sc["route"],
            "vessel_class": sc["vessel_class"],
            "cargo_type": sc["cargo_type"],
            "rate_usd_per_mt": rate.round(2),
        }))

    return pd.concat(frames, ignore_index=True)


if __name__ == "__main__":
    out_path = Path(__file__).parent / "freight_rates.csv"
    df = generate_synthetic_data()
    df.to_csv(out_path, index=False)
    print(f"Wrote {len(df)} rows to {out_path}")
