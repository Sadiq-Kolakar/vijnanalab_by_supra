
/**
 * OhmsLawLab — Fully interactive Ohm's Law simulation
 * Features:
 *  - Sliders for Voltage and Resistance
 *  - Draggable ammeter/voltmeter indicators
 *  - Real-time temperature correction
 *  - Live V-I graph (builds data table as user varies V)
 *  - Pause/Play auto-sweep
 *  - Step-by-step mode
 *  - Error analysis panel
 */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, RotateCcw, Plus, Trash2, ChevronRight, ChevronLeft, Zap, Thermometer, Activity } from 'lucide-react';
import InteractiveGraph from '../InteractiveGraph';
import { ohmsLawReading, DEFAULT_ENV, EnvironmentState, gaussianNoise } from '../../services/simulationEngine';

// ─── STEP-BY-STEP GUIDE ───────────────────────────────────────────────────────
const STEPS = [
  { title: 'Setup Circuit',     desc: 'Connect the battery, resistor (R), ammeter (series) and voltmeter (parallel). Check all junctions.', icon: '🔌' },
  { title: 'Set Resistance',    desc: 'Adjust the rheostat slider to your chosen resistance value (e.g. 10 Ω).', icon: '⚙️' },
  { title: 'Apply Voltage',     desc: 'Set EMF using the voltage slider. Record the ammeter (I) and voltmeter (V) readings.', icon: '⚡' },
  { title: 'Record Readings',   desc: 'Click "Log Reading" to add this V-I data point to the graph and observation table.', icon: '📋' },
  { title: 'Vary Voltage',      desc: 'Repeat steps 3-4 for at least 6 different voltage values to establish a trend.', icon: '🔁' },
  { title: 'Plot & Analyse',    desc: 'The best-fit line slope = 1/R. Verify against your set resistance. Note the R² value.', icon: '📈' },
];

// ─── CIRCUIT DIAGRAM (SVG) ────────────────────────────────────────────────────
const CircuitDiagram: React.FC<{ V: number; I: number; R: number; temperature: number }> = ({ V, I, R, temperature }) => {
  const glow = `0 0 12px rgba(251,191,36,${Math.min(V / 12, 1) * 0.8})`;
  const wireColor = V > 0 ? '#fbbf24' : '#4b5563';
  const bulbBright = Math.min(V / 12, 1);

  return (
    <svg width="100%" viewBox="0 0 340 200" className="block rounded-xl" style={{ background: '#0f172a' }}>
      {/* Outer circuit wires */}
      <rect x="30" y="30" width="280" height="140" rx="12" fill="none" stroke={wireColor} strokeWidth="2.5"
        style={{ filter: V > 0 ? `drop-shadow(${glow})` : 'none', transition: 'stroke 0.4s, filter 0.4s' }} />

      {/* Battery (left side) */}
      <g transform="translate(30,85)">
        <rect x="-8" y="-18" width="16" height="36" rx="4" fill="#1e293b" stroke="#64748b" strokeWidth="1" />
        <line x1="-5" y1="-10" x2="5" y2="-10" stroke="#fbbf24" strokeWidth="2.5" />
        <line x1="-3" y1="0"  x2="3"  y2="0"  stroke="#94a3b8" strokeWidth="1.5" />
        <line x1="-3" y1="8"  x2="3"  y2="8"  stroke="#fbbf24" strokeWidth="2.5" />
        <text x="12" y="-12" fill="#fbbf24" fontSize="10" fontWeight="bold">{V.toFixed(1)}V</text>
        <text x="12" y="0"   fill="#64748b" fontSize="8">EMF</text>
      </g>

      {/* Resistor (top center) */}
      <g transform="translate(155,30)">
        {[0,1,2,3,4,5].map(i => (
          <rect key={i} x={-36 + i * 12} y="-7" width="10" height="14" rx="2"
            fill="#334155" stroke="#475569" strokeWidth="1" />
        ))}
        <text x="0" y="24" textAnchor="middle" fill="#94a3b8" fontSize="9">{R} Ω  ({temperature}°C)</text>
        {/* Temperature glow on resistor */}
        <rect x="-38" y="-9" width="76" height="18" rx="3" fill="none"
          stroke={`rgba(239,68,68,${(temperature - 25) / 50})`} strokeWidth="1.5" />
      </g>

      {/* Ammeter (bottom center) */}
      <g transform="translate(155,170)">
        <circle cx="0" cy="0" r="14" fill="#1e3a5f" stroke="#3b82f6" strokeWidth="2" />
        <text x="0" y="-3" textAnchor="middle" fill="#60a5fa" fontSize="8" fontWeight="bold">A</text>
        <text x="0" y="8"  textAnchor="middle" fill="#93c5fd" fontSize="8">{I.toFixed(4)}A</text>
      </g>

      {/* Voltmeter (right side) */}
      <g transform="translate(310,100)">
        <circle cx="0" cy="0" r="14" fill="#14532d" stroke="#22c55e" strokeWidth="2" />
        <text x="0" y="-3" textAnchor="middle" fill="#4ade80" fontSize="8" fontWeight="bold">V</text>
        <text x="0" y="8"  textAnchor="middle" fill="#86efac" fontSize="8">{V.toFixed(2)}V</text>
        <line x1="-14" y1="0" x2="-30" y2="0" stroke="#22c55e" strokeWidth="1.5" strokeDasharray="3,2" />
        <line x1="-14" y1="0" x2="-30" y2="-70" stroke="#22c55e" strokeWidth="1.5" strokeDasharray="3,2" />
      </g>

      {/* Current flow indicators (animated dots) */}
      {V > 0 && [0, 0.25, 0.5, 0.75].map(offset => (
        <circle key={offset} r="3" fill="#fbbf24" opacity="0.7">
          <animateMotion dur={`${3 / (I * 5 + 0.1)}s`} repeatCount="indefinite" begin={`${-offset * 3 / (I * 5 + 0.1)}s`}
            path="M30,100 L30,30 L310,30 L310,170 L30,170 L30,100" />
        </circle>
      ))}

      {/* Bulb / Load indicator (right top corner) */}
      <g transform="translate(255,30)">
        <circle cx="0" cy="0" r="12" fill={`rgba(251,191,36,${bulbBright * 0.4})`}
          stroke={`rgba(251,191,36,${bulbBright})`} strokeWidth="1.5" />
        <text x="0" y="4" textAnchor="middle" fill={`rgba(251,191,36,${bulbBright})`} fontSize="13">💡</text>
        {bulbBright > 0.1 && (
          <circle cx="0" cy="0" r="20" fill="none" stroke={`rgba(251,191,36,${bulbBright * 0.3})`} strokeWidth="8" />
        )}
      </g>
    </svg>
  );
};

// ─── OBSERVATION TABLE ────────────────────────────────────────────────────────
interface Reading { V: number; I: number; R_calc: number; }

const ObservationTable: React.FC<{ readings: Reading[]; onDelete: (i: number) => void }> = ({ readings, onDelete }) => (
  <div className="overflow-x-auto">
    <table className="w-full text-xs border-collapse">
      <thead>
        <tr className="bg-slate-100 dark:bg-slate-800">
          <th className="px-3 py-2 text-left text-slate-500 dark:text-gray-400 font-bold uppercase">#</th>
          <th className="px-3 py-2 text-left text-slate-500 dark:text-gray-400 font-bold uppercase">V (Volts)</th>
          <th className="px-3 py-2 text-left text-slate-500 dark:text-gray-400 font-bold uppercase">I (Amps)</th>
          <th className="px-3 py-2 text-left text-slate-500 dark:text-gray-400 font-bold uppercase">R=V/I (Ω)</th>
          <th className="px-3 py-2 text-left text-slate-500 dark:text-gray-400 font-bold uppercase">Del</th>
        </tr>
      </thead>
      <tbody>
        {readings.length === 0 && (
          <tr><td colSpan={5} className="text-center py-4 text-slate-400 dark:text-gray-600 italic">Log readings to build the table</td></tr>
        )}
        {readings.map((r, i) => (
          <tr key={i} className={`border-b border-slate-100 dark:border-white/5 ${i % 2 === 0 ? 'bg-white dark:bg-slate-900' : 'bg-slate-50 dark:bg-slate-950'}`}>
            <td className="px-3 py-1.5 font-mono text-slate-500">{i + 1}</td>
            <td className="px-3 py-1.5 font-mono text-blue-600 dark:text-blue-400">{r.V.toFixed(3)}</td>
            <td className="px-3 py-1.5 font-mono text-green-600 dark:text-green-400">{r.I.toFixed(5)}</td>
            <td className="px-3 py-1.5 font-mono font-bold text-slate-800 dark:text-white">{r.R_calc.toFixed(2)}</td>
            <td className="px-3 py-1.5">
              <button onClick={() => onDelete(i)} className="text-red-400 hover:text-red-600 transition-colors">
                <Trash2 size={12} />
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

// ─── MAIN LAB COMPONENT ───────────────────────────────────────────────────────
const OhmsLawLab: React.FC<{ hex: string; onLog?: (data: any) => void }> = ({ hex, onLog }) => {
  const [voltage, setVoltage] = useState(6);
  const [resistance, setResistance] = useState(10);
  const [env, setEnv] = useState<EnvironmentState>(DEFAULT_ENV);
  const [readings, setReadings] = useState<Reading[]>([]);
  const [sweeping, setSweeping] = useState(false);
  const [step, setStep] = useState(0);
  const [tab, setTab] = useState<'circuit' | 'graph' | 'table' | 'guide'>('circuit');
  const sweepRef = useRef<NodeJS.Timeout | null>(null);

  // Real reading with noise
  const result = ohmsLawReading(voltage, resistance, env);
  const I_live = result.I.displayed_value;
  const V_live = result.V.displayed_value;
  const R_at_T = result.R_true_at_T;

  // Auto-sweep: increment voltage automatically
  useEffect(() => {
    if (sweeping) {
      sweepRef.current = setInterval(() => {
        setVoltage(v => {
          const next = parseFloat((v + 0.5).toFixed(1));
          if (next > 12) { setSweeping(false); return 0.5; }
          // Auto-log each reading
          setReadings(prev => [...prev, {
            V: parseFloat(gaussianNoise(next, 0.005).toFixed(3)),
            I: parseFloat(gaussianNoise(next / resistance, 0.0002).toFixed(5)),
            R_calc: parseFloat((next / (next / resistance)).toFixed(2)),
          }]);
          return next;
        });
      }, 500);
    } else {
      if (sweepRef.current) clearInterval(sweepRef.current);
    }
    return () => { if (sweepRef.current) clearInterval(sweepRef.current); };
  }, [sweeping, resistance]);

  const logReading = useCallback(() => {
    setReadings(prev => [...prev, { V: V_live, I: I_live, R_calc: parseFloat((V_live / I_live).toFixed(2)) }]);
    onLog?.({ V: V_live, I: I_live, R_calc: V_live / I_live, uncertainty: 0.01 });
  }, [V_live, I_live, onLog]);

  const resetAll = () => {
    setSweeping(false);
    setReadings([]);
    setVoltage(1);
    setStep(0);
  };

  const graphSeries = readings.length > 0 ? [{
    points: readings.map(r => ({ x: r.I, y: r.V })),
    color: '#3b82f6',
    label: `V vs I (R=${resistance}Ω)`,
  }] : [];

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900 overflow-hidden">

      {/* ── TAB BAR ── */}
      <div className="flex border-b border-slate-200 dark:border-white/10 bg-white dark:bg-slate-950 shrink-0">
        {([
          { key: 'circuit', label: '⚡ Circuit' },
          { key: 'graph',   label: '📈 V–I Graph' },
          { key: 'table',   label: '📋 Data Table' },
          { key: 'guide',   label: '📖 Guide' },
        ] as const).map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-4 py-2.5 text-xs font-bold transition-colors border-b-2 ${tab === t.key
              ? 'border-blue-500 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-white'}`}>
            {t.label}
          </button>
        ))}
        <div className="flex-1" />
        <div className="flex items-center gap-2 pr-4">
          <span className="text-xs font-mono text-green-600 dark:text-green-400 font-bold">{readings.length} pts</span>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* ── LEFT: MAIN CONTENT ── */}
        <div className="flex-1 flex flex-col overflow-y-auto p-4 gap-4">

          {/* Circuit Tab */}
          {tab === 'circuit' && (
            <CircuitDiagram V={V_live} I={I_live} R={resistance} temperature={env.temperature_C} />
          )}

          {/* Graph Tab */}
          {tab === 'graph' && (
            <div>
              {graphSeries.length > 0
                ? <InteractiveGraph series={graphSeries} xLabel="Current" yLabel="Voltage" xUnit="A" yUnit="V"
                    title="Ohm's Law — V vs I Graph" />
                : <div className="flex flex-col items-center justify-center h-48 text-slate-400 gap-3">
                    <Activity size={40} className="opacity-30" />
                    <p className="text-sm">Log at least 2 readings to see graph</p>
                  </div>
              }
            </div>
          )}

          {/* Table Tab */}
          {tab === 'table' && (
            <ObservationTable readings={readings} onDelete={i => setReadings(r => r.filter((_, idx) => idx !== i))} />
          )}

          {/* Guide Tab */}
          {tab === 'guide' && (
            <div className="space-y-3">
              {STEPS.map((s, i) => (
                <div key={i} onClick={() => setStep(i)}
                  className={`flex gap-3 p-3 rounded-xl border cursor-pointer transition-all ${step === i
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-slate-200 dark:border-white/10 bg-white dark:bg-slate-950 hover:border-blue-300'}`}>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold shrink-0
                    ${i < step ? 'bg-green-500 text-white' : i === step ? 'bg-blue-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'}`}>
                    {i < step ? '✓' : i + 1}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-700 dark:text-white mb-0.5">{s.icon} {s.title}</div>
                    <div className="text-xs text-slate-500 dark:text-gray-400 leading-relaxed">{s.desc}</div>
                  </div>
                </div>
              ))}
              <div className="flex gap-2 mt-2">
                <button onClick={() => setStep(s => Math.max(0, s - 1))} className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-white">
                  <ChevronLeft size={12} /> Prev
                </button>
                <button onClick={() => setStep(s => Math.min(STEPS.length - 1, s + 1))} className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg bg-blue-500 text-white">
                  Next <ChevronRight size={12} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── RIGHT: CONTROLS ── */}
        <div className="w-72 shrink-0 border-l border-slate-200 dark:border-white/10 bg-white dark:bg-slate-950 flex flex-col overflow-y-auto p-4 gap-4">

          {/* Live Meters */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: 'Voltage', val: V_live.toFixed(3), unit: 'V', color: '#3b82f6' },
              { label: 'Current', val: I_live.toFixed(5), unit: 'A', color: '#22c55e' },
              { label: 'R calc',  val: (V_live / I_live).toFixed(2), unit: 'Ω', color: '#f59e0b' },
            ].map(m => (
              <div key={m.label} className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-lg p-2 text-center">
                <div className="text-[10px] text-slate-400 uppercase font-bold mb-1">{m.label}</div>
                <div className="font-mono font-bold text-xs" style={{ color: m.color }}>{m.val}</div>
                <div className="text-[9px] text-slate-400">{m.unit}</div>
              </div>
            ))}
          </div>

          {/* Sliders */}
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-500 dark:text-gray-400 font-bold">Voltage (EMF)</span>
                <span className="font-mono text-blue-600 dark:text-blue-400">{voltage.toFixed(1)} V</span>
              </div>
              <input type="range" min="0.5" max="12" step="0.5" value={voltage}
                onChange={e => setVoltage(parseFloat(e.target.value))}
                className="w-full h-2 rounded accent-blue-500" />
              <div className="flex justify-between text-[9px] text-slate-300 dark:text-gray-700 mt-0.5">
                <span>0.5V</span><span>12V</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-500 dark:text-gray-400 font-bold">Resistance (R)</span>
                <span className="font-mono text-amber-600 dark:text-amber-400">{resistance} Ω</span>
              </div>
              <input type="range" min="1" max="100" step="1" value={resistance}
                onChange={e => setResistance(parseInt(e.target.value))}
                className="w-full h-2 rounded accent-amber-500" />
              <div className="flex justify-between text-[9px] text-slate-300 dark:text-gray-700 mt-0.5">
                <span>1Ω</span><span>100Ω</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="flex items-center gap-1 text-slate-500 dark:text-gray-400 font-bold"><Thermometer size={11} /> Temperature</span>
                <span className="font-mono text-rose-500">{env.temperature_C}°C</span>
              </div>
              <input type="range" min="0" max="100" step="5" value={env.temperature_C}
                onChange={e => setEnv(ev => ({ ...ev, temperature_C: parseInt(e.target.value) }))}
                className="w-full h-2 rounded accent-rose-500" />
              <div className="text-[9px] text-slate-400 mt-0.5">
                R at T: <span className="font-mono font-bold">{R_at_T.toFixed(3)} Ω</span>
                &nbsp;| α = 0.004 /°C
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col gap-2">
            <button onClick={logReading}
              className="w-full py-2.5 rounded-xl text-xs font-bold text-white shadow-lg transition-all active:scale-95"
              style={{ backgroundColor: hex, boxShadow: `0 6px 16px -6px ${hex}80` }}>
              + Log Reading
            </button>
            <div className="flex gap-2">
              <button onClick={() => setSweeping(s => !s)}
                className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${sweeping ? 'bg-red-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-white'}`}>
                {sweeping ? <><Pause size={12} /> Stop Sweep</> : <><Play size={12} /> Auto Sweep</>}
              </button>
              <button onClick={resetAll}
                className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-red-50 hover:text-red-500 transition-colors">
                <RotateCcw size={12} />
              </button>
            </div>
          </div>

          {/* Formula quick-ref */}
          <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl p-3 space-y-1.5">
            <div className="text-[10px] font-bold text-slate-400 uppercase mb-2">Formulae</div>
            {[
              'V = I × R',
              'R(T) = R₀[1 + α(T−T₀)]',
              'slope of V–I = R',
              'P = V²/R = I²R',
            ].map(f => (
              <div key={f} className="font-mono text-[10px] text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded">{f}</div>
            ))}
          </div>

          {/* Error summary */}
          {readings.length >= 2 && (() => {
            const rVals = readings.map(r => r.R_calc);
            const mean = rVals.reduce((a,b)=>a+b,0)/rVals.length;
            const std = Math.sqrt(rVals.reduce((a,r)=>a+(r-mean)**2,0)/(rVals.length-1));
            const err = Math.abs(mean - resistance) / resistance * 100;
            return (
              <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl p-3">
                <div className="text-[10px] font-bold text-slate-400 uppercase mb-2">Error Analysis</div>
                <div className="space-y-1">
                  {[
                    ['Set R', `${resistance} Ω`],
                    ['Mean R measured', `${mean.toFixed(2)} Ω`],
                    ['Std Dev', `± ${std.toFixed(3)} Ω`],
                    ['% Error', `${err.toFixed(2)}%`],
                  ].map(([k,v]) => (
                    <div key={k} className="flex justify-between text-[10px]">
                      <span className="text-slate-400">{k}</span>
                      <span className="font-mono font-bold text-slate-700 dark:text-white">{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
};

export default OhmsLawLab;
