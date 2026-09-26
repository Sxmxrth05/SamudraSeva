import { useState } from 'react';
import { motion } from 'framer-motion';
import RightCard from './RightCard';

const ORIGINS = ['Australia', 'United States', 'Mozambique', 'Russia', 'Indonesia'];
const DESTINATIONS = [
  'Paradip',
  'Visakhapatnam',
  'Gangavaram',
  'Gopalpur',
  'Dhamra',
  'Sagar/Sandheads',
  'Haldia',
];
const VESSEL_CLASSES = ['Handysize', 'Supramax', 'Panamax', 'Capesize'];

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

export default function SectionHero() {
  const [origin, setOrigin] = useState('Australia');
  const [destination, setDestination] = useState('Paradip');
  const [vesselClass, setVesselClass] = useState('Panamax');
  const [cargoQty, setCargoQty] = useState(72000);
  const [horizon, setHorizon] = useState(7);

  return (
    <div className="relative flex items-center justify-between h-full w-full px-12 lg:px-20 gap-12">
      {/* ── Left: Hero Typography ─────────────────────────── */}
      <motion.div
        className="flex-1 max-w-xl"
        variants={stagger}
        initial="hidden"
        animate="show"
      >
        <motion.div variants={fadeUp} className="mb-8">
          <span className="section-label">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
            Pipeline Input
          </span>
        </motion.div>

        <motion.h1
          variants={fadeUp}
          className="text-5xl lg:text-7xl font-black leading-[1.12] tracking-tight"
        >
          <span className="text-white">Predictive.</span>
          <br />
          <span className="bg-gradient-to-r from-cyan-300 via-teal-300 to-emerald-300 bg-clip-text text-transparent">
            Automated
          </span>
          <br />
          <span className="text-white/80">Chartering.</span>
        </motion.h1>

        <motion.p
          variants={fadeUp}
          className="mt-8 text-lg lg:text-xl text-slate-300/90 leading-[1.8] max-w-md"
        >
          An end-to-end computed pipeline that ingests procurement requirements,
          generates deterministic freight-rate forecasts, cross-references vessel
          feasibility against real port constraints, and outputs an optimal
          chartering recommendation — all in real time.
        </motion.p>

        <motion.div variants={fadeUp} className="mt-10 flex items-center gap-5">
          <button className="group relative px-7 py-3 rounded-full border-2 border-cyan-400/60 text-cyan-300 font-semibold text-sm tracking-wide overflow-hidden transition-all duration-300 hover:border-cyan-300 hover:text-white hover:shadow-[0_0_30px_rgba(34,211,238,0.2)] cursor-pointer">
            <span className="relative z-10">EXPLORE PIPELINE</span>
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-teal-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </button>
          <span className="text-xs text-slate-500">SIH 2026 · PS 26006</span>
        </motion.div>

        {/* Floating stats */}
        <motion.div
          variants={fadeUp}
          className="mt-12 flex items-center gap-8"
        >
          {[
            { value: '7', unit: 'Ports', desc: 'Indian destinations' },
            { value: '4', unit: 'Classes', desc: 'Handysize → Capesize' },
            { value: '3', unit: 'Strategies', desc: 'Cost comparison' },
          ].map((s) => (
            <div key={s.unit} className="text-center">
              <div className="text-2xl font-bold text-white">
                {s.value}
                <span className="text-sm font-medium text-cyan-400 ml-1">
                  {s.unit}
                </span>
              </div>
              <div className="text-[0.65rem] text-slate-500 mt-0.5">{s.desc}</div>
            </div>
          ))}
        </motion.div>
      </motion.div>

      {/* ── Right Card: Procurement Form ──────────────────── */}
      <div className="flex-shrink-0">
        <RightCard
          title="Procurement Requirement"
          subtitle="Specify your cargo parameters to begin the forecasting pipeline."
          sectionIndex={0}
        >
          {/* Origin */}
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Origin
            </label>
            <select
              className="form-select"
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
            >
              {ORIGINS.map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>
          </div>

          {/* Destination */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Destination (Indian Port)
            </label>
            <select
              className="form-select"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
            >
              {DESTINATIONS.map((d) => (
                <option key={d}>{d}</option>
              ))}
            </select>
          </div>

          {/* Vessel Class */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Vessel Class
            </label>
            <select
              className="form-select"
              value={vesselClass}
              onChange={(e) => setVesselClass(e.target.value)}
            >
              {VESSEL_CLASSES.map((v) => (
                <option key={v}>{v}</option>
              ))}
            </select>
          </div>

          {/* Cargo Quantity */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Cargo Quantity (mt)
            </label>
            <input
              type="number"
              className="form-input"
              value={cargoQty}
              onChange={(e) => setCargoQty(Number(e.target.value))}
              min={1000}
              max={250000}
              step={1000}
            />
          </div>

          {/* Cargo Type (disabled) */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Cargo Type
            </label>
            <select className="form-select" disabled value="Coal">
              <option>Coal</option>
            </select>
            <span className="text-[0.65rem] text-slate-400 mt-1 block">
              Fixed for this prototype
            </span>
          </div>

          {/* Horizon Toggle */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Forecast Horizon
            </label>
            <div className="toggle-group">
              <button
                className={`toggle-btn ${horizon === 7 ? 'active' : ''}`}
                onClick={() => setHorizon(7)}
              >
                7 Days
              </button>
              <button
                className={`toggle-btn ${horizon === 30 ? 'active' : ''}`}
                onClick={() => setHorizon(30)}
              >
                30 Days
              </button>
            </div>
          </div>

          {/* Submit hint */}
          <div className="pt-2">
            <button className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 text-white font-semibold text-sm shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 transition-shadow duration-300 cursor-pointer">
              Run Pipeline →
            </button>
          </div>
        </RightCard>
      </div>
    </div>
  );
}
