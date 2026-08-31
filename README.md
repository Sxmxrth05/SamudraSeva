# Freight Forecasting & Vessel Chartering Decision Support (MVP Prototype)

SIH 2026 — Problem Statement 26006 (SAIL freight forecasting & vessel chartering decision support).

This is an overnight hackathon-qualifier prototype: a **single Streamlit app**, no
database, no auth, no microservices. It exists to show a working, end-to-end
pipeline — data → forecast → feasibility → risk → recommendation → backtest —
where every number on screen is genuinely computed, not asserted.

## Run it

```bash
pip install -r requirements.txt
streamlit run app.py
```

If `data/freight_rates.csv` doesn't exist yet, the app generates it automatically
on first run (or run `python data/generate_data.py` yourself beforehand).

## What's in here

- `data/generate_data.py` — generates the synthetic freight-rate history.
- `forecasting.py` — naive baseline, Holt exponential-smoothing point forecast,
  P10/P50/P90 band from holdout-residual spread, probability-of-increase,
  and holdout MAE/RMSE for both the naive and statistical forecasts.
- `feasibility.py` — vessel-class specs, port limits, pass/fail/unknown checks.
- `risk.py` — volatility (computed) + congestion/availability (manual) → risk score.
- `recommendation.py` — Charter Now vs Wait/Monitor rule, spot vs contract cost
  comparison for the scenario's vessel, and a cost/feasibility/utilization
  comparison across all four vessel classes for a fixed cargo requirement.
- `backtest.py` — walks back through history, re-applies the same rule with no
  look-ahead, and compares it to a spot-only baseline.
- `app.py` — the single-page Streamlit UI wiring all of the above together.

## Honest note on what's real vs. simplified

**Data is synthetic.** `data/freight_rates.csv` is generated placeholder data
(trend + seasonal wobble + weekly wobble + noise + a small random-walk
component), clearly marked as such in `data/generate_data.py`. It is **not**
real SAIL freight-rate data. Swap in a real CSV with the same schema
(`date, route, vessel_class, cargo_type, rate_usd_per_mt`) and everything
downstream recomputes from it unchanged.

**Genuinely computed, end-to-end, from whatever CSV is loaded:**
- The statistical forecast (Holt exponential smoothing), the naive baseline,
  and the P10/P50/P90 band (from real holdout-forecast residuals, widened
  with a sqrt(t) random-walk assumption — a deliberately crude but real
  uncertainty estimate, not a formal ARIMA confidence interval).
- Probability of increase (empirical share of historical N-day forward moves
  that were positive).
- Feasibility pass/fail/unknown badges (real comparisons against the specs/limits
  tables below — "unknown" only ever means the port limit isn't defined, never a
  silently assumed pass or fail).
- The risk score's volatility component (coefficient of variation over the
  recent window of the actual series).
- The Charter Now / Wait / Monitor recommendation and its listed reasons
  (an explicit point-scoring rule over forecast direction, probability of
  increase, and risk level).
- The spot-only vs. contract cost comparison (computed from the forecast and
  an assumed cargo tonnage).
- The backtest's "estimated savings vs. spot-only" figure (re-runs the exact
  same rule at several past decision points using only data available before
  each point — no look-ahead — then compares to what spot-only would have cost).
  **This is always a backtested/simulated estimate over a handful of historical
  points, not a guarantee of future performance**, and the UI labels it that
  way every time it's shown.
- Holdout MAE/RMSE for both the naive baseline and the statistical forecast
  (same train/test split used for the P10/P90 band, computed independently
  so it can never change the forecast, band, risk score, or backtest numbers).
- The cost-efficiency table across all four vessel classes (not just the
  scenario's preset vessel): feasibility comes from the same `feasibility.py`
  checks used elsewhere, utilization is cargo requirement ÷ vessel DWT
  (capped at 100%), and cost uses the same current rate and contract premium
  as the Recommendation section. Because the dataset carries one route-level
  spot rate rather than a rate per vessel class, the $/mt cost is genuinely
  identical across feasible vessels here — the "cost-efficient choice" ties on
  cost and is decided by the best (highest) utilization among the cheapest,
  feasible options, which the app states explicitly rather than implying a
  cost difference that isn't there.

**Hardcoded / manually set (illustrative, not fetched or surveyed):**
- Vessel-class specs (draft/LOA/beam/DWT for Handysize/Supramax/Panamax/Capesize)
  and port limits (Paradip/Visakhapatnam/Dhamra) in `feasibility.py` are
  representative approximations, not a class-society or port-authority source.
- Port congestion and vessel availability are sliders the user sets by hand in
  the sidebar — not pulled from any live AIS/port feed. They still feed into
  a real, computed risk score; they just aren't live data.
- The contract premium (1.5%) and cargo tonnage (90% of vessel DWT) used in the
  cost comparison are simplifying assumptions, not derived from real charter-party
  terms.

**Deliberately out of scope for tonight** (per the brief): no LSTM/XGBoost/
TimesFM/Chronos-2 model benchmarking, no database, no multi-user auth, no
multi-page navigation. The forecasting method is intentionally simple
(Holt exponential smoothing) so it's fast, explainable, and honestly framed
as a baseline statistical model rather than a production forecasting engine.
