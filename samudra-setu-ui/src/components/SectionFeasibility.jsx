import { useState, useMemo } from 'react';
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

/* Illustrative feasibility results for Panamax @ Paradip */
const FEASIBILITY = [
  { constraint: 'Draft', vesselValue: '14.5 m', portLimit: '18.1 m', status: 'pass' },
  { constraint: 'LOA', vesselValue: '225.0 m', portLimit: '300.0 m', status: 'pass' },
  { constraint: 'Beam', vesselValue: '32.3 m', portLimit: 'N/A', status: 'unknown' },
  { constraint: 'DWT', vesselValue: '80,000 mt', portLimit: '180,000 mt', status: 'pass' },
];

const CONGESTION_LABELS = ['Low', 'Medium', 'High'];
const AVAILABILITY_LABELS = ['High', 'Medium', 'Low'];

function computeRisk(congestionIdx, availabilityIdx, volatilityScore) {
  // Each factor contributes 0–2 points
  const congestionScore = congestionIdx; // 0=Low, 1=Medium, 2=High
  const availScore = availabilityIdx;     // 0=High(good), 1=Medium, 2=Low(bad)
  const volScore = volatilityScore;       // fixed illustrative
  const total = congestionScore + availScore + volScore;
  const maxScore = 6;
  const level = total <= 2 ? 'Low' : total <= 4 ? 'Medium' : 'High';
  return {
    total,
    maxScore,
    level,
    factors: [
      { name: 'Congestion', score: congestionScore, max: 2, value: CONGESTION_LABELS[congestionIdx] },
      { name: 'Availability', score: availScore, max: 2, value: AVAILABILITY_LABELS[availabilityIdx] },
      { name: 'Volatility (30d)', score: volScore, max: 2, value: '18.4%' },
    ],
  };
}

function BadgeIcon({ status }) {
  if (status === 'pass') {
    return (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5">
        <path d="M20 6L9 17l-5-5" />
      </svg>
    );
  }
  if (status === 'fail') {
    return (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2.5">
        <path d="M18 6L6 18M6 6l12 12" />
      </svg>
    );
  }
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2.5">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v.01M12 8v4" />
    </svg>
  );
}

export default function SectionFeasibility() {
  const [congestionIdx, setCongestionIdx] = useState(1);
  const [availabilityIdx, setAvailabilityIdx] = useState(1);

  const risk = useMemo(
    () => computeRisk(congestionIdx, availabilityIdx, 1),
    [congestionIdx, availabilityIdx]
  );

  const riskColor =
    risk.level === 'Low' ? '#10b981' : risk.level === 'Medium' ? '#f59e0b' : '#ef4444';

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
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            Risk Engine
          </span>
        </motion.div>

        <motion.h1
          variants={fadeUp}
          className="text-4xl lg:text-6xl font-black leading-[1.15] tracking-tight"
        >
          <span className="text-white">Port Constraints</span>
          <br />
          <span className="text-white">& </span>
          <span className="bg-gradient-to-r from-amber-300 to-orange-300 bg-clip-text text-transparent">
            Volatility
          </span>
          <br />
          <span className="text-white/80">Scoring</span>
        </motion.h1>

        <motion.p
          variants={fadeUp}
          className="mt-8 text-base lg:text-lg text-slate-300/90 leading-[1.85] max-w-md"
        >
          Every vessel class's draft, LOA, beam, and DWT are cross-referenced
          against real port limitations. A constraint resolves to{' '}
          <span className="text-emerald-400 font-semibold">Pass</span>,{' '}
          <span className="text-red-400 font-semibold">Fail</span>, or{' '}
          <span className="text-slate-400 font-semibold">Unknown</span>{' '}
          (when the port limit isn't published) — never a preset verdict.
        </motion.p>

        <motion.p
          variants={fadeUp}
          className="mt-5 text-base lg:text-lg text-slate-300/90 leading-[1.85] max-w-md"
        >
          The composite Risk Score factors in 30-day rate volatility (computed
          from the historical series), port congestion, and vessel availability.
          Congestion and availability are manually adjustable — in production
          these would feed from live port intelligence.
        </motion.p>

        {/* Port illustration */}
        <motion.div
          variants={fadeUp}
          className="mt-10 p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm max-w-sm"
        >
          <div className="text-[0.65rem] font-bold text-amber-400 tracking-widest uppercase mb-3">
            Port Limits — Paradip
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-slate-500 text-xs">Max Draft</span>
              <div className="text-white font-semibold">18.1 m</div>
            </div>
            <div>
              <span className="text-slate-500 text-xs">Max LOA</span>
              <div className="text-white font-semibold">300.0 m</div>
            </div>
            <div>
              <span className="text-slate-500 text-xs">Max Beam</span>
              <div className="text-slate-500 font-semibold italic">Not published</div>
            </div>
            <div>
              <span className="text-slate-500 text-xs">Max DWT</span>
              <div className="text-white font-semibold">180,000 mt</div>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* ── Right Card ─────────────────────────────────────── */}
      <div className="flex-shrink-0">
        <RightCard
          title="Feasibility & Risk Assessment"
          subtitle="Live vessel–port constraint check and composite risk scoring."
          sectionIndex={2}
        >
          {/* Feasibility Badges */}
          <div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
              Panamax @ Paradip
            </div>
            <div className="space-y-2">
              {FEASIBILITY.map((f) => (
                <div
                  key={f.constraint}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`badge ${
                        f.status === 'pass'
                          ? 'badge-pass'
                          : f.status === 'fail'
                          ? 'badge-fail'
                          : 'badge-unknown'
                      }`}
                    >
                      <BadgeIcon status={f.status} />
                      {f.status.charAt(0).toUpperCase() + f.status.slice(1)}
                    </span>
                    <span className="font-semibold text-slate-700 text-sm">
                      {f.constraint}
                    </span>
                  </div>
                  <div className="text-right text-xs text-slate-500">
                    <span className="font-mono">{f.vesselValue}</span>
                    <span className="mx-1.5 text-slate-300">vs</span>
                    <span className="font-mono">{f.portLimit}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-slate-200" />

          {/* Risk Sliders */}
          <div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
              Risk Inputs (Adjustable)
            </div>

            {/* Congestion slider */}
            <div className="mb-4">
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-slate-600 font-medium">Port Congestion</span>
                <span className="font-semibold text-slate-700">
                  {CONGESTION_LABELS[congestionIdx]}
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={2}
                value={congestionIdx}
                onChange={(e) => setCongestionIdx(Number(e.target.value))}
              />
              <div className="flex justify-between text-[0.6rem] text-slate-400 mt-0.5">
                <span>Low</span>
                <span>Medium</span>
                <span>High</span>
              </div>
            </div>

            {/* Availability slider */}
            <div className="mb-4">
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-slate-600 font-medium">Vessel Availability</span>
                <span className="font-semibold text-slate-700">
                  {AVAILABILITY_LABELS[availabilityIdx]}
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={2}
                value={availabilityIdx}
                onChange={(e) => setAvailabilityIdx(Number(e.target.value))}
              />
              <div className="flex justify-between text-[0.6rem] text-slate-400 mt-0.5">
                <span>High</span>
                <span>Medium</span>
                <span>Low</span>
              </div>
            </div>
          </div>

          {/* Risk Score */}
          <div className="metric-box text-center">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Composite Risk Score
            </div>
            <div className="flex items-center justify-center gap-3">
              <motion.div
                className="text-5xl font-black"
                style={{ color: riskColor }}
                key={risk.total}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                {risk.total}
              </motion.div>
              <div className="text-left">
                <div className="text-sm text-slate-400">/ {risk.maxScore}</div>
                <motion.div
                  className="text-sm font-bold"
                  style={{ color: riskColor }}
                  key={risk.level}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  {risk.level} Risk
                </motion.div>
              </div>
            </div>

            {/* Factor breakdown */}
            <div className="mt-4 space-y-2">
              {risk.factors.map((f) => (
                <div key={f.name} className="flex items-center gap-2 text-xs">
                  <span className="w-24 text-right text-slate-500">{f.name}</span>
                  <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{
                        background:
                          f.score === 0
                            ? '#10b981'
                            : f.score === 1
                            ? '#f59e0b'
                            : '#ef4444',
                      }}
                      initial={{ width: 0 }}
                      animate={{ width: `${(f.score / f.max) * 100}%` }}
                      transition={{ duration: 0.8, delay: 0.2 }}
                    />
                  </div>
                  <span className="w-8 text-slate-600 font-semibold">
                    {f.score}/{f.max}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </RightCard>
      </div>
    </div>
  );
}
