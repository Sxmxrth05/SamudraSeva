import { motion } from 'framer-motion';
import RightCard from './RightCard';

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

/* Illustrative cost data (Panamax, 72000mt, Australia→Paradip) */
const VESSEL_CLASS_COST_DISCOUNT = {
  Handysize: 0.0,
  Supramax: 0.03,
  Panamax: 0.06,
  Capesize: 0.10,
};

const CURRENT_RATE = 14.52;
const CARGO_QTY = 72000;
const CONTRACT_PREMIUM = 0.015;
const MULTI_VOYAGE_PREMIUM = 0.01;
const AVG_FORECAST_RATE = 15.18;

const spotCost = AVG_FORECAST_RATE * CARGO_QTY;
const shortTermCost = CURRENT_RATE * (1 + MULTI_VOYAGE_PREMIUM) * CARGO_QTY;
const medTermCost = CURRENT_RATE * (1 + CONTRACT_PREMIUM) * CARGO_QTY;

const STRATEGIES = [
  {
    name: 'Spot Market',
    rate: AVG_FORECAST_RATE.toFixed(2),
    premium: '—',
    cost: spotCost,
    desc: 'Avg forecast rate × tonnage',
  },
  {
    name: 'Short-term (3-voyage)',
    rate: (CURRENT_RATE * (1 + MULTI_VOYAGE_PREMIUM)).toFixed(2),
    premium: `+${(MULTI_VOYAGE_PREMIUM * 100).toFixed(1)}%`,
    cost: shortTermCost,
    desc: 'Current rate + multi-voyage premium',
  },
  {
    name: 'Medium-term (Fixed)',
    rate: (CURRENT_RATE * (1 + CONTRACT_PREMIUM)).toFixed(2),
    premium: `+${(CONTRACT_PREMIUM * 100).toFixed(1)}%`,
    cost: medTermCost,
    desc: 'Current rate + fixed contract premium',
  },
];

const cheapest = STRATEGIES.reduce((min, s) => (s.cost < min.cost ? s : min), STRATEGIES[0]);

const BACKTEST = {
  nPoints: 18,
  avgSavings: 0.42,
  charterNow: 11,
  waitMonitor: 7,
};

export default function SectionStrategy() {
  return (
    <div className="relative flex items-center justify-between h-full w-full px-12 lg:px-20 gap-12">
      {/* ── Left side ──────────────────────────────────────── */}
      <motion.div
        className="flex-1 max-w-xl"
        variants={stagger}
        initial="hidden"
        animate="show"
      >
        <motion.div variants={fadeUp} className="mb-8">
          <span className="section-label">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
            </svg>
            Optimization Engine
          </span>
        </motion.div>

        <motion.h1
          variants={fadeUp}
          className="text-4xl lg:text-6xl font-black leading-[1.15] tracking-tight"
        >
          <span className="text-white">Charter</span>
          <br />
          <span className="bg-gradient-to-r from-emerald-300 to-teal-300 bg-clip-text text-transparent">
            Optimization
          </span>
          <br />
          <span className="text-white/80">Engine</span>
        </motion.h1>

        <motion.p
          variants={fadeUp}
          className="mt-8 text-base lg:text-lg text-slate-300/90 leading-[1.85] max-w-md"
        >
          A transparent point-scoring ruleset over forecast direction,
          probability of increase, and risk level determines{' '}
          <span className="text-emerald-400 font-semibold">Charter Now</span>
          {' '}vs{' '}
          <span className="text-amber-400 font-semibold">Wait / Monitor</span>.
          No black boxes — every decision ships with the full list of reasons
          that drove it.
        </motion.p>

        <motion.p
          variants={fadeUp}
          className="mt-5 text-base lg:text-lg text-slate-300/90 leading-[1.85] max-w-md"
        >
          The 3-way strategy cost matrix applies <code className="text-cyan-400 text-sm font-mono">VESSEL_CLASS_COST_DISCOUNT</code>{' '}
          scaling for economies of scale. Each historical backtest point re-runs
          the full pipeline using only data available before that date — no
          look-ahead bias.
        </motion.p>

        {/* Backtest summary */}
        <motion.div
          variants={fadeUp}
          className="mt-10 p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm max-w-sm"
        >
          <div className="text-[0.65rem] font-bold text-emerald-400 tracking-widest uppercase mb-3">
            Backtest Summary
          </div>
          <div className="grid grid-cols-3 gap-3 text-sm">
            <div>
              <span className="text-slate-500 text-xs">Points</span>
              <div className="text-white font-bold text-lg">{BACKTEST.nPoints}</div>
            </div>
            <div>
              <span className="text-slate-500 text-xs">Charter Now</span>
              <div className="text-emerald-400 font-bold text-lg">{BACKTEST.charterNow}</div>
            </div>
            <div>
              <span className="text-slate-500 text-xs">Wait</span>
              <div className="text-amber-400 font-bold text-lg">{BACKTEST.waitMonitor}</div>
            </div>
          </div>
        </motion.div>

        {/* Discount table */}
        <motion.div
          variants={fadeUp}
          className="mt-5 flex items-center gap-3 flex-wrap"
        >
          {Object.entries(VESSEL_CLASS_COST_DISCOUNT).map(([cls, disc]) => (
            <div
              key={cls}
              className="px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 text-xs"
            >
              <span className="text-slate-400">{cls}</span>{' '}
              <span className="text-cyan-300 font-semibold">−{(disc * 100).toFixed(0)}%</span>
            </div>
          ))}
        </motion.div>
      </motion.div>

      {/* ── Right Card ─────────────────────────────────────── */}
      <div className="flex-shrink-0">
        <RightCard
          title="Strategy Cost Matrix & Backtest"
          subtitle="3-way cost comparison with simulated savings over historical decision points."
          sectionIndex={3}
        >
          {/* Strategy cards */}
          <div className="space-y-3">
            {STRATEGIES.map((s) => {
              const isCheapest = s.name === cheapest.name;
              return (
                <motion.div
                  key={s.name}
                  className={`strategy-card ${isCheapest ? 'cheapest' : ''}`}
                  whileHover={{ y: -2 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-slate-700">{s.name}</span>
                    {isCheapest && (
                      <span className="badge badge-pass text-[0.6rem]">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path d="M20 6L9 17l-5-5" />
                        </svg>
                        Cheapest
                      </span>
                    )}
                  </div>
                  <div className="flex items-end justify-between">
                    <div>
                      <div className="text-[0.65rem] text-slate-500">
                        Rate: <span className="font-mono">${s.rate}/mt</span>{' '}
                        {s.premium !== '—' && (
                          <span className="text-amber-600">({s.premium})</span>
                        )}
                      </div>
                      <div className="text-[0.65rem] text-slate-400 mt-0.5">{s.desc}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-black text-slate-800">
                        ${(s.cost / 1000).toFixed(0)}K
                      </div>
                      <div className="text-[0.6rem] text-slate-400">
                        ${s.cost.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Divider */}
          <div className="h-px bg-slate-200" />

          {/* Primary Recommendation */}
          <div className="metric-box">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Decision
            </div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              </div>
              <div>
                <div className="text-lg font-bold text-emerald-600">Charter Now</div>
                <div className="text-xs text-slate-500">Panamax · Medium Risk</div>
              </div>
            </div>
            <div className="text-xs text-slate-500 leading-relaxed space-y-1">
              <div>• Forecast trends up: $14.52 → $15.18/mt</div>
              <div>• P(increase) = 62% over 7 days</div>
              <div>• Risk score is Medium — neutral factor</div>
            </div>
          </div>

          {/* Backtest savings */}
          <div className="metric-box text-center">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
              Simulated Savings vs. Spot
            </div>
            <div className="text-3xl font-black text-emerald-600">
              ${BACKTEST.avgSavings.toFixed(2)}
              <span className="text-sm font-medium text-slate-400">/mt</span>
            </div>
            <div className="text-[0.65rem] text-slate-400 mt-1">
              Avg across {BACKTEST.nPoints} historical decision points ·
              No look-ahead bias
            </div>
            <div className="mt-3 flex items-center justify-center gap-4 text-xs">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="text-slate-500">Charter Now: {BACKTEST.charterNow}</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-amber-400" />
                <span className="text-slate-500">Wait: {BACKTEST.waitMonitor}</span>
              </div>
            </div>
          </div>

          {/* Cheapest strategy summary */}
          <div className="text-[0.65rem] text-slate-400 leading-relaxed">
            <strong>Cheapest Strategy:</strong> {cheapest.name} at $
            {cheapest.cost.toLocaleString('en-US', { maximumFractionDigits: 0 })} for{' '}
            {CARGO_QTY.toLocaleString()} mt. Contract premiums are illustrative —
            see README for methodology.
          </div>
        </RightCard>
      </div>
    </div>
  );
}
