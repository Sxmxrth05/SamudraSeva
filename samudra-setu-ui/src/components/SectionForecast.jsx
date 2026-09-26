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

/* Illustrative forecast data */
const FORECAST_DATA = {
  currentRate: 14.52,
  p50: 15.18,
  p10: 13.44,
  p90: 16.92,
  probIncrease: 62,
  residualSigma: 1.23,
  holdoutMAE: 0.67,
  holdoutRMSE: 0.89,
  naiveMAE: 0.94,
  naiveRMSE: 1.21,
  model: 'Holt (additive trend, no season)',
};

const FORECAST_TABLE = [
  { day: 'Day 1', p10: '$13.89', p50: '$14.60', p90: '$15.31' },
  { day: 'Day 3', p10: '$13.62', p50: '$14.78', p90: '$15.94' },
  { day: 'Day 5', p10: '$13.50', p50: '$14.96', p90: '$16.42' },
  { day: 'Day 7', p10: '$13.44', p50: '$15.18', p90: '$16.92' },
];

export default function SectionForecast() {
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
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
            Statistical Engine
          </span>
        </motion.div>

        <motion.h1
          variants={fadeUp}
          className="text-4xl lg:text-6xl font-black leading-[1.15] tracking-tight"
        >
          <span className="text-white">Deterministic</span>
          <br />
          <span className="text-white">Data &</span>{' '}
          <span className="bg-gradient-to-r from-teal-300 to-cyan-300 bg-clip-text text-transparent">
            Holt Forecast
          </span>
        </motion.h1>

        <motion.p
          variants={fadeUp}
          className="mt-8 text-base lg:text-lg text-slate-300/90 leading-[1.85] max-w-md"
        >
          Every rate series is reproducibly seeded from the route + vessel
          identifiers using SHA-256 hashing — or can be overridden with a real
          SAIL CSV (<code className="text-cyan-400 text-sm font-mono">data/freight_rates.csv</code>).
          Re-selecting the same combination always yields the exact same numbers.
        </motion.p>

        <motion.p
          variants={fadeUp}
          className="mt-5 text-base lg:text-lg text-slate-300/90 leading-[1.85] max-w-md"
        >
          The Holt exponential-smoothing model produces a point forecast (P50),
          and holdout-residual analysis derives P10/P90 uncertainty bands that
          widen with √t. An empirical "Probability of Increase" metric counts
          the share of historical forward moves that were positive.
        </motion.p>

        {/* Model card */}
        <motion.div
          variants={fadeUp}
          className="mt-10 p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm max-w-sm"
        >
          <div className="text-[0.65rem] font-bold text-cyan-400 tracking-widest uppercase mb-3">
            Model Metrics (Holdout)
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-slate-500 text-xs">Stat MAE</span>
              <div className="text-white font-semibold">${FORECAST_DATA.holdoutMAE}/mt</div>
            </div>
            <div>
              <span className="text-slate-500 text-xs">Stat RMSE</span>
              <div className="text-white font-semibold">${FORECAST_DATA.holdoutRMSE}/mt</div>
            </div>
            <div>
              <span className="text-slate-500 text-xs">Naive MAE</span>
              <div className="text-slate-400 font-semibold">${FORECAST_DATA.naiveMAE}/mt</div>
            </div>
            <div>
              <span className="text-slate-500 text-xs">Naive RMSE</span>
              <div className="text-slate-400 font-semibold">${FORECAST_DATA.naiveRMSE}/mt</div>
            </div>
          </div>
          <div className="mt-3 text-[0.65rem] text-slate-500">
            Model: {FORECAST_DATA.model}
          </div>
        </motion.div>
      </motion.div>

      {/* ── Right Card: Forecast Output ──────────────────── */}
      <div className="flex-shrink-0">
        <RightCard
          title="Point Forecast & Uncertainty"
          subtitle="Statistical forecast output with residual-based confidence intervals."
          sectionIndex={1}
        >
          {/* Primary metric */}
          <div className="metric-box text-center py-6">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              P50 Point Forecast (Day 7)
            </div>
            <div className="text-4xl font-black text-slate-800">
              ${FORECAST_DATA.p50}
              <span className="text-base font-medium text-slate-400">/mt</span>
            </div>
            <div className="mt-1 flex items-center justify-center gap-1 text-sm">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5">
                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                <polyline points="17 6 23 6 23 12" />
              </svg>
              <span className="text-emerald-600 font-semibold">
                +${(FORECAST_DATA.p50 - FORECAST_DATA.currentRate).toFixed(2)}
              </span>
              <span className="text-slate-400 text-xs">vs current</span>
            </div>
          </div>

          {/* P10 / P90 band metrics */}
          <div className="grid grid-cols-2 gap-4">
            <div className="metric-box text-center">
              <div className="text-[0.65rem] font-bold text-red-400 uppercase tracking-wider mb-1">
                P10 (Low)
              </div>
              <div className="text-xl font-bold text-slate-700">${FORECAST_DATA.p10}</div>
            </div>
            <div className="metric-box text-center">
              <div className="text-[0.65rem] font-bold text-emerald-500 uppercase tracking-wider mb-1">
                P90 (High)
              </div>
              <div className="text-xl font-bold text-slate-700">${FORECAST_DATA.p90}</div>
            </div>
          </div>

          {/* Probability of Increase */}
          <div className="metric-box">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Probability of Increase
              </span>
              <span className="text-lg font-bold text-cyan-600">
                {FORECAST_DATA.probIncrease}%
              </span>
            </div>
            <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-teal-400"
                initial={{ width: 0 }}
                animate={{ width: `${FORECAST_DATA.probIncrease}%` }}
                transition={{ duration: 1.2, delay: 0.3, ease: 'easeOut' }}
              />
            </div>
            <div className="text-[0.65rem] text-slate-400 mt-1.5">
              Share of historical 7-day forward moves that were positive
            </div>
          </div>

          {/* Forecast table */}
          <div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Forecast Band (P10 / P50 / P90)
            </div>
            <div className="rounded-xl border border-slate-200 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 text-slate-500">
                    <th className="px-3 py-2 text-left font-semibold text-xs">Horizon</th>
                    <th className="px-3 py-2 text-right font-semibold text-xs">P10</th>
                    <th className="px-3 py-2 text-right font-semibold text-xs">P50</th>
                    <th className="px-3 py-2 text-right font-semibold text-xs">P90</th>
                  </tr>
                </thead>
                <tbody>
                  {FORECAST_TABLE.map((row, i) => (
                    <tr
                      key={row.day}
                      className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}
                    >
                      <td className="px-3 py-2 font-medium text-slate-700">{row.day}</td>
                      <td className="px-3 py-2 text-right font-mono text-red-500 text-xs">{row.p10}</td>
                      <td className="px-3 py-2 text-right font-mono text-slate-800 font-semibold text-xs">{row.p50}</td>
                      <td className="px-3 py-2 text-right font-mono text-emerald-600 text-xs">{row.p90}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Residual sigma */}
          <div className="text-[0.65rem] text-slate-400 leading-relaxed">
            σ = ${FORECAST_DATA.residualSigma}/mt · Bands widen with √t ·
            Current observed rate: ${FORECAST_DATA.currentRate}/mt
          </div>
        </RightCard>
      </div>
    </div>
  );
}
