"""
Freight forecasting & vessel chartering decision support -- overnight MVP.

SIH 2026, Problem Statement 26006. Single-page Streamlit prototype: every
number on screen is computed live from data/freight_rates.csv (synthetic
placeholder data if no real file is supplied) -- see README.md for exactly
what's real computation vs simplified for time.
"""

from pathlib import Path

import pandas as pd
import plotly.graph_objects as go
import streamlit as st

from backtest import run_backtest
from feasibility import VESSEL_SPECS, check_all_vessel_classes
from forecasting import build_forecast, get_scenario_series, holdout_errors
from recommendation import UTILIZATION, build_recommendation, compare_vessel_costs
from risk import AVAILABILITY_LEVELS, CONGESTION_LEVELS, compute_risk

DATA_PATH = Path(__file__).parent / "data" / "freight_rates.csv"

SCENARIOS = {
    "Australia -> Paradip (Supramax, Coal)": {
        "route": "Australia-Paradip", "vessel_class": "Supramax", "cargo_type": "Coal", "port": "Paradip",
    },
    "Indonesia -> Visakhapatnam (Panamax, Coal)": {
        "route": "Indonesia-Visakhapatnam", "vessel_class": "Panamax", "cargo_type": "Coal", "port": "Visakhapatnam",
    },
    "Mozambique -> Dhamra (Handysize, Coal)": {
        "route": "Mozambique-Dhamra", "vessel_class": "Handysize", "cargo_type": "Coal", "port": "Dhamra",
    },
}

STATUS_BADGE = {"pass": "🟢 Pass", "fail": "🔴 Fail", "unknown": "⚪ Unknown"}
RISK_COLOR = {"Low": "🟢", "Medium": "🟡", "High": "🔴"}


@st.cache_data
def load_data() -> pd.DataFrame:
    if not DATA_PATH.exists():
        from data.generate_data import generate_synthetic_data
        DATA_PATH.parent.mkdir(exist_ok=True)
        df = generate_synthetic_data()
        df.to_csv(DATA_PATH, index=False)
    else:
        df = pd.read_csv(DATA_PATH, parse_dates=["date"])
    return df


@st.cache_data
def cached_forecast(route, vessel_class, cargo_type, horizon):
    df = load_data()
    return build_forecast(df, route, vessel_class, cargo_type, horizon)


@st.cache_data
def cached_holdout_metrics(route, vessel_class, cargo_type):
    df = load_data()
    series = get_scenario_series(df, route, vessel_class, cargo_type)
    return holdout_errors(series)


st.set_page_config(page_title="SAIL Freight Forecasting & Chartering", layout="wide")

df = load_data()

st.title("Freight Forecasting & Vessel Chartering Decision Support")
st.caption("SIH 2026 - Problem Statement 26006 | Prototype MVP - all figures computed live from data/freight_rates.csv")

with st.sidebar:
    st.header("Scenario")
    scenario_label = st.radio("Route / vessel / cargo", list(SCENARIOS.keys()))
    scenario = SCENARIOS[scenario_label]

    horizon = st.radio("Forecast horizon", [7, 30], format_func=lambda h: f"{h} days", horizontal=True)

    st.header("Risk inputs (illustrative)")
    congestion_level = st.select_slider("Port congestion", CONGESTION_LEVELS, value="Medium")
    availability_level = st.select_slider("Vessel availability", AVAILABILITY_LEVELS, value="Medium")

    st.caption("Congestion and availability are manually set here for the demo -- not fetched from a live feed. See README.")

route, vessel_class, cargo_type, port = (
    scenario["route"], scenario["vessel_class"], scenario["cargo_type"], scenario["port"]
)

forecast = cached_forecast(route, vessel_class, cargo_type, horizon)

# ---------------------------------------------------------------- Forecast
st.subheader(f"Current rate & {horizon}-day forecast -- {route} ({vessel_class}, {cargo_type})")

col1, col2, col3 = st.columns(3)
col1.metric("Current rate (last observed)", f"${forecast['current_rate']:.2f}/mt")
col2.metric(f"Statistical forecast, day {horizon}", f"${forecast['point'][-1]:.2f}/mt",
            delta=f"{forecast['point'][-1] - forecast['current_rate']:+.2f}")
col3.metric(f"Probability of increase over {horizon}d", f"{forecast['prob_increase']:.0%}",
            help="Share of historical horizon-day forward moves in this series that were positive.")

hist = forecast["series"].tail(120)
fig = go.Figure()

fig.add_trace(go.Scatter(x=hist.index, y=hist.values, name="Historical rate",
                          mode="lines", line=dict(color="#1f77b4", width=2)))

fig.add_trace(go.Scatter(
    x=list(forecast["forecast_dates"]) + list(forecast["forecast_dates"][::-1]),
    y=list(forecast["p90"]) + list(forecast["p10"][::-1]),
    fill="toself", fillcolor="rgba(255,127,14,0.18)", line=dict(color="rgba(255,255,255,0)"),
    name="P10-P90 band", hoverinfo="skip",
))

fig.add_trace(go.Scatter(x=forecast["forecast_dates"], y=forecast["point"], name="Statistical forecast (P50)",
                          mode="lines", line=dict(color="#ff7f0e", width=2, dash="dash")))

fig.add_trace(go.Scatter(x=forecast["forecast_dates"], y=forecast["naive"], name="Naive baseline (last value)",
                          mode="lines", line=dict(color="#7f7f7f", width=1.5, dash="dot")))

fig.update_layout(height=420, margin=dict(l=10, r=10, t=10, b=10),
                   yaxis_title="USD / mt", legend=dict(orientation="h", yanchor="bottom", y=1.02))
st.plotly_chart(fig, use_container_width=True)
st.caption(f"P10-P90 band derived from {forecast['holdout_days_used']}-day holdout residual spread "
           f"(sigma = ${forecast['residual_sigma']:.2f}/mt), widened with sqrt(t). Naive baseline shown for comparison.")

hm = cached_holdout_metrics(route, vessel_class, cargo_type)
mcol1, mcol2 = st.columns(2)
mcol1.metric(f"Statistical model MAE / RMSE ({hm['holdout_days_used']}d holdout)",
             f"\\${hm['stat_mae']:.2f} / \\${hm['stat_rmse']:.2f}")
mcol2.metric(f"Naive baseline MAE / RMSE ({hm['holdout_days_used']}d holdout)",
             f"\\${hm['naive_mae']:.2f} / \\${hm['naive_rmse']:.2f}")
st.caption(f"Model: {hm['model_name']} · Holdout MAE \\${hm['stat_mae']:.2f}/mt, "
           f"RMSE \\${hm['stat_rmse']:.2f}/mt (vs. Naive MAE \\${hm['naive_mae']:.2f}/mt)")

# ---------------------------------------------------------------- Feasibility
st.subheader(f"Vessel feasibility at {port}")
st.caption("Representative specs/limits are hardcoded for this demo; every badge below is a computed comparison, "
           "never a preset verdict. 'Unknown' means the port limit isn't defined here.")

feas = check_all_vessel_classes(port)
feas_cols = st.columns(len(feas))
for col, (vc, checks) in zip(feas_cols, feas.items()):
    with col:
        highlight = " (selected)" if vc == vessel_class else ""
        st.markdown(f"**{vc}{highlight}**")
        for c in checks:
            limit_str = f"{c['port_limit']}" if c["port_limit"] is not None else "no limit on record"
            st.markdown(f"{STATUS_BADGE[c['status']]}  {c['constraint']}: {c['vessel_value']} vs {limit_str}")

# ---------------------------------------------------------------- Cost efficiency across vessels
st.subheader("Cost efficiency across feasible vessels")
default_cargo_qty = VESSEL_SPECS[vessel_class]["dwt_max"] * UTILIZATION
cargo_quantity_mt = st.number_input(
    "Cargo requirement (mt) -- fixed lot to be shipped, independent of vessel choice",
    min_value=1000.0, max_value=250000.0, value=float(default_cargo_qty), step=1000.0,
)

vessel_cost_cmp = compare_vessel_costs(port, forecast["current_rate"], cargo_quantity_mt)
cost_rows = [{
    "Vessel": r["vessel_class"],
    "Feasible?": "✅ Yes" if r["feasible"] else "❌ No",
    "Utilization": f"{r['utilization']:.0%}",
    "Estimated cost": f"${r['estimated_cost_usd']:,.0f}",
} for r in vessel_cost_cmp["rows"]]
st.dataframe(pd.DataFrame(cost_rows), use_container_width=True, hide_index=True)

if vessel_cost_cmp["cost_efficient_choice"]:
    st.markdown(f"**Cost-efficient choice:** {vessel_cost_cmp['cost_efficient_choice']} "
                f"(lowest estimated cost among feasible vessels; ties broken by best utilization).")
else:
    st.warning("No vessel class is fully feasible at this port for the checked constraints.")

st.caption("Estimated cost = (current rate + contract premium) x cargo requirement, using the same current rate and "
           "premium as the Recommendation section below -- this dataset carries one route-level spot rate, not a "
           "rate per vessel class, so $/mt cost is the same across feasible vessels here; feasibility and "
           "utilization are what actually differ between them.")

# ---------------------------------------------------------------- Risk
st.subheader("Risk assessment")
risk = compute_risk(forecast["series"], congestion_level, availability_level)
st.markdown(f"### {RISK_COLOR[risk['level']]} {risk['level']} risk  ({risk['total_score']} / {risk['max_score']})")

risk_cols = st.columns(len(risk["factors"]))
for col, factor in zip(risk_cols, risk["factors"]):
    col.metric(factor["name"], factor["value"], help=f"Contributes {factor['score']} / {factor['max']} to the risk score.")

# ---------------------------------------------------------------- Recommendation
st.subheader("Recommendation")
dwt_max = VESSEL_SPECS[vessel_class]["dwt_max"]
rec = build_recommendation(forecast, risk, vessel_class, dwt_max)

rcol1, rcol2 = st.columns([1, 2])
with rcol1:
    verdict_color = "green" if rec["decision"] == "Charter Now" else "orange"
    st.markdown(f"#### :{verdict_color}[{rec['decision']}]")
    st.markdown(f"**Vessel:** {rec['vessel_class']}")
    st.markdown(f"**Contract strategy:** {rec['contract_strategy']}")
    st.markdown(f"**Risk:** {RISK_COLOR[rec['risk_level']]} {rec['risk_level']}")

with rcol2:
    st.markdown("**Why:**")
    for reason in rec["reasons"]:
        st.markdown(f"- {reason}")

costs = rec["costs"]
ccol1, ccol2, ccol3 = st.columns(3)
ccol1.metric("Spot-only cost (avg forecast rate x tonnage)", f"${costs['spot_cost_usd']:,.0f}")
ccol2.metric("Fixed contract cost (current rate + premium x tonnage)", f"${costs['contract_cost_usd']:,.0f}")
ccol3.metric("Difference (spot - contract)", f"${costs['savings_usd']:,.0f}")
st.caption(f"Assumes {costs['tonnage_mt']:,.0f} mt cargo ({VESSEL_SPECS[vessel_class]['dwt_max']:,} DWT vessel at 90% utilization) "
           f"and a {rec['costs']['contract_rate'] / forecast['current_rate'] - 1:.1%} contract premium over the current spot rate. Simplified for time -- see README.")

# ---------------------------------------------------------------- Backtest
st.subheader("Backtest: rule vs spot-only")
bt = run_backtest(forecast["series"], horizon, congestion_level, availability_level)

if bt["n_points"] == 0:
    st.info("Not enough history to backtest this horizon.")
else:
    savings = bt["avg_savings_per_mt"]
    st.markdown(
        f"### Estimated avg. savings vs spot-only: **${savings:,.2f}/mt** "
        f"&nbsp; <span style='font-size:0.8em;color:gray'>(backtested/simulated estimate, {bt['n_points']} historical decision points)</span>",
        unsafe_allow_html=True,
    )
    bt_rows = [{
        "Decision date": p["decision_date"].date(),
        "Decision": p["decision"],
        "Rate at decision": f"${p['rate_at_decision']:.2f}",
        f"Actual rate +{horizon}d": f"${p['realized_rate_after_horizon']:.2f}",
        "Strategy rate": f"${p['strategy_rate']:.2f}",
        "Savings/mt vs spot-only": f"${p['savings_per_mt']:.2f}",
    } for p in bt["points"]]
    st.dataframe(pd.DataFrame(bt_rows), use_container_width=True, hide_index=True)
    st.caption("Each row re-runs the same forecast + risk + recommendation rule using only data available before that "
               "date (no look-ahead). The spot-only baseline waits and pays whatever spot costs when the cargo "
               "actually needs to move; a 'Charter Now' call locks a contract early instead, at a small premium. "
               "Congestion/availability inputs use today's slider values throughout history -- a simplification, see README.")
