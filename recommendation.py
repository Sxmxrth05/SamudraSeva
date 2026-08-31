"""
Recommendation module.

An explicit, transparent point-scoring rule over forecast direction,
probability of increase, and risk level decides Charter Now vs
Wait/Monitor -- never a hardcoded verdict. A spot-only vs multi-voyage
contract cost comparison is computed from the forecast, and every decision
ships with the list of reasons that drove it.
"""

import numpy as np

from feasibility import VESSEL_SPECS, check_feasibility

CONTRACT_PREMIUM = 0.015  # illustrative premium a charterer pays to lock in a fixed multi-voyage rate
UTILIZATION = 0.90  # assumed cargo tonnage as a share of vessel DWT capacity


def score_decision(forecast: dict, risk: dict) -> tuple[str, list[str]]:
    reasons = []
    score = 0

    current_rate = forecast["current_rate"]
    end_point = forecast["point"][-1]
    prob_increase = forecast["prob_increase"]
    risk_level = risk["level"]

    if not np.isnan(prob_increase) and prob_increase > 0.55:
        score += 1
        reasons.append(f"Historical {len(forecast['point'])}-day forward moves were positive {prob_increase:.0%} of the time.")
    elif not np.isnan(prob_increase) and prob_increase < 0.45:
        score -= 1
        reasons.append(f"Historical {len(forecast['point'])}-day forward moves were positive only {prob_increase:.0%} of the time.")

    if end_point > current_rate:
        score += 1
        reasons.append(f"Statistical forecast trends up: \\${current_rate:.2f} -> \\${end_point:.2f}/mt over the horizon.")
    else:
        score -= 1
        reasons.append(f"Statistical forecast trends down or flat: \\${current_rate:.2f} -> \\${end_point:.2f}/mt over the horizon.")

    if risk_level == "High":
        score += 1
        reasons.append("Risk score is High -- locking in now avoids further uncertainty.")
    elif risk_level == "Low":
        score -= 1
        reasons.append("Risk score is Low -- there is room to wait for a potentially better rate.")
    else:
        reasons.append("Risk score is Medium -- a neutral factor in this decision.")

    decision = "Charter Now" if score >= 1 else "Wait / Monitor"
    return decision, reasons


def cost_comparison(forecast: dict, vessel_class: str, dwt_max: float) -> dict:
    tonnage = dwt_max * UTILIZATION
    avg_spot_rate = float(np.mean(forecast["point"]))
    contract_rate = forecast["current_rate"] * (1 + CONTRACT_PREMIUM)

    spot_cost = avg_spot_rate * tonnage
    contract_cost = contract_rate * tonnage
    savings = spot_cost - contract_cost

    return {
        "tonnage_mt": tonnage,
        "avg_spot_rate": avg_spot_rate,
        "contract_rate": contract_rate,
        "spot_cost_usd": spot_cost,
        "contract_cost_usd": contract_cost,
        "savings_usd": savings,
    }


def build_recommendation(forecast: dict, risk: dict, vessel_class: str, dwt_max: float) -> dict:
    decision, reasons = score_decision(forecast, risk)
    costs = cost_comparison(forecast, vessel_class, dwt_max)

    strategy = "Multi-voyage / COA contract" if costs["contract_cost_usd"] < costs["spot_cost_usd"] else "Spot market"

    return {
        "decision": decision,
        "reasons": reasons,
        "vessel_class": vessel_class,
        "risk_level": risk["level"],
        "contract_strategy": strategy,
        "costs": costs,
    }


def compare_vessel_costs(port: str, current_rate: float, cargo_quantity_mt: float) -> dict:
    """Cost/feasibility comparison across every vessel class for a fixed
    cargo requirement (not just the scenario's preset vessel). Uses the
    same current_rate and CONTRACT_PREMIUM already computed elsewhere --
    no new rate is fetched or estimated. Because the underlying data only
    carries one route-level spot rate (not a rate per vessel class), the
    $/mt cost is the same for every feasible vessel here; what actually
    differs between vessel classes is feasibility and utilization, so the
    "cost-efficient choice" breaks ties on the best (highest) utilization
    among the feasible, lowest-cost vessels."""
    effective_rate = current_rate * (1 + CONTRACT_PREMIUM)

    rows = []
    for vessel_class, spec in VESSEL_SPECS.items():
        checks = check_feasibility(vessel_class, port)
        feasible = all(c["status"] != "fail" for c in checks)
        utilization = min(cargo_quantity_mt / spec["dwt_max"], 1.0)
        estimated_cost = effective_rate * cargo_quantity_mt

        rows.append({
            "vessel_class": vessel_class,
            "feasible": feasible,
            "utilization": utilization,
            "estimated_cost_usd": estimated_cost,
        })

    feasible_rows = [r for r in rows if r["feasible"]]
    cost_efficient_choice = None
    if feasible_rows:
        best = min(feasible_rows, key=lambda r: (r["estimated_cost_usd"], -r["utilization"]))
        cost_efficient_choice = best["vessel_class"]

    return {
        "rows": rows,
        "cost_efficient_choice": cost_efficient_choice,
        "effective_rate": effective_rate,
        "cargo_quantity_mt": cargo_quantity_mt,
    }
