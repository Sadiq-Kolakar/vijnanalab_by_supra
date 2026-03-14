import React, { useState, useCallback } from 'react';
import { Plus, Trash2, ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';
import ParticleEngine, { Particle, createSpark } from './ParticleEngine';
import { vernierReading, sphereVolume, analyzeReadings } from '../../services/simulationEngine';

const LC = 0.01; // Least count 0.01cm = 0.1mm
const MAIN_SCALE_DIVS = 20; // visible main scale divisions
const VERNIER_DIVS = 10;

// ─── MAIN SCALE RULER ─────────────────────────────────────────────────────────
const MainScale: React.FC<{ offset: number }> = ({ offset }) => {
  const total = MAIN_SCALE_DIVS + 5;
  return (
    <div className="relative h-12 overflow-hidden" style={{ width: '100%' }}>
      <div className="absolute top-0 h-full flex items-end"
        style={{ left: `-${offset * 36}px`, transition: 'left 0.2s ease' }}>
        {Array.from({ length: total * 10 }, (_, i) => {
          const isMm = i % 10 === 0;
          const isCm = i % 10 === 0 && i % 10 === 0;
          const val = i / 10;
          return (
            <div key={i} className="flex-shrink-0 flex flex-col items-center" style={{ width: 36 / 10 }}>
              <div style={{
                width: 1,
                height: isMm ? 24 : 12,
                background: isMm ? '#e2e8f0' : '#475569',
                marginBottom: 2,
              }} />
              {(i % 10 === 0) && (
                <span style={{ fontSize: 7, color: '#94a3b8', fontFamily: 'monospace', marginTop: 2, whiteSpace: 'nowrap' }}>{val.toFixed(0)}</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ─── VERNIER SCALE ─────────────────────────────────────────────────────────────
const VernierScale: React.FC<{ coinciding: number }> = ({ coinciding }) => {
  // 10 vernier divisions = 9 main scale divisions → each vernier div = 0.9 mm
  const vernierDivWidthPx = 36 * 0.9 / 10;
  return (
    <div className="relative h-10 bg-yellow-900/20 border border-yellow-500/30 rounded overflow-hidden" style={{ width: 200 }}>
      <div className="absolute top-0 flex h-full items-end">
        {Array.from({ length: VERNIER_DIVS + 1 }, (_, i) => (
          <div key={i} className="flex-shrink-0 relative flex flex-col items-center"
            style={{ width: vernierDivWidthPx }}>
            <div style={{
              width: i === coinciding ? 2 : 1,
              height: i === coinciding ? 28 : 14,
              background: i === coinciding ? '#fbbf24' : '#64748b',
              boxShadow: i === coinciding ? '0 0 6px #fbbf24' : 'none',
              transition: 'all 0.3s',
            }} />
            <span style={{ fontSize: 6, color: i === coinciding ? '#fbbf24' : '#475569', fontFamily: 'monospace' }}>{i}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── 3D CALIPER BODY ──────────────────────────────────────────────────────────
const CaliperBody3D: React.FC<{ openingMm: number; zeroError: number }> = ({ openingMm, zeroError }) => {
  const corrected = Math.max(0, openingMm - zeroError);
  const jawOpenPx = Math.min(corrected * 3.6, 200); // 1mm = 3.6px

  return (
    <div className="relative select-none" style={{ perspective: 800, height: 140, width: '100%' }}>
      {/* Main beam */}
      <div style={{
        position: 'absolute', top: 40, left: 20, right: 20, height: 40,
        background: 'linear-gradient(180deg, #94a3b8 0%, #64748b 40%, #475569 100%)',
        borderRadius: 4,
        boxShadow: '0 4px 16px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.2)',
        border: '1px solid rgba(255,255,255,0.1)',
      }}>
        {/* Ruler markings on beam */}
        {Array.from({ length: 15 }, (_, i) => (
          <div key={i} style={{
            position: 'absolute', left: `${i * 15 + 20}px`, top: 0,
            width: 1, height: i % 5 === 0 ? 16 : 8,
            background: 'rgba(255,255,255,0.3)',
          }} />
        ))}
        {/* cm labels */}
        {Array.from({ length: 8 }, (_, i) => (
          <span key={i} style={{
            position: 'absolute', left: `${i * 25 + 18}px`, top: 20,
            fontSize: 7, color: 'rgba(255,255,255,0.5)', fontFamily: 'monospace',
          }}>{i}</span>
        ))}
      </div>

      {/* Fixed jaw (left) */}
      <div style={{
        position: 'absolute', left: 20, top: 10, width: 30, height: 110,
        background: 'linear-gradient(135deg, #94a3b8, #475569)',
        borderRadius: '4px 4px 8px 8px',
        boxShadow: '2px 0 8px rgba(0,0,0,0.4)',
        border: '1px solid rgba(255,255,255,0.15)',
      }}>
        {/* Jaw tip */}
        <div style={{
          position: 'absolute', bottom: 0, left: '20%', right: '20%', height: 20,
          background: '#334155', borderRadius: '0 0 4px 4px',
          boxShadow: '0 0 8px rgba(59,130,246,0.3)',
        }} />
      </div>

      {/* Sliding jaw */}
      <div style={{
        position: 'absolute', top: 10, width: 36, height: 110,
        left: `${50 + jawOpenPx}px`,
        background: 'linear-gradient(135deg, #c0c9d8, #6b7280)',
        borderRadius: '4px 4px 8px 8px',
        boxShadow: '2px 0 8px rgba(0,0,0,0.5)',
        border: '1px solid rgba(255,255,255,0.2)',
        transition: 'left 0.15s ease',
        cursor: 'ew-resize',
      }}>
        {/* Thumb grip */}
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} style={{
            position: 'absolute', top: `${20 + i * 10}px`, left: 4, right: 4, height: 3,
            background: 'rgba(0,0,0,0.2)', borderRadius: 2,
          }} />
        ))}
        {/* Jaw tip */}
        <div style={{
          position: 'absolute', bottom: 0, left: '15%', right: '15%', height: 20,
          background: '#1e3a5f', borderRadius: '0 0 4px 4px',
          boxShadow: '0 0 10px rgba(59,130,246,0.5)',
        }} />
        {/* Vernier markings on sliding jaw */}
        <div style={{
          position: 'absolute', top: 42, left: 0, right: 0, height: 14,
          background: 'rgba(251,191,36,0.08)',
        }}>
          {Array.from({ length: 11 }, (_, i) => (
            <div key={i} style={{
              position: 'absolute', left: `${i * (100 / 10)}%`, top: 0,
              width: 1, height: i === Math.round(corrected * 10 % 10) ? 14 : 8,
              background: i === Math.round(corrected * 10 % 10) ? '#fbbf24' : 'rgba(255,255,255,0.3)',
            }} />
          ))}
        </div>
      </div>

      {/* Object being measured */}
      {jawOpenPx > 10 && (
        <div style={{
          position: 'absolute', top: 98, left: `${52}px`,
          width: `${jawOpenPx}px`, height: 22,
          background: 'linear-gradient(90deg, rgba(59,130,246,0.15), rgba(99,102,241,0.25))',
          border: '1.5px solid rgba(99,102,241,0.5)',
          borderRadius: 3,
          boxShadow: '0 0 12px rgba(99,102,241,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'width 0.15s ease',
        }}>
          <span style={{ fontSize: 8, color: '#818cf8', fontFamily: 'monospace', fontWeight: 'bold' }}>
            {corrected.toFixed(2)} mm
          </span>
        </div>
      )}

      {/* Measurement arrows */}
      {jawOpenPx > 20 && (
        <>
          <div style={{
            position: 'absolute', top: 128, left: 52, width: jawOpenPx,
            height: 1, background: 'rgba(251,191,36,0.5)',
          }} />
          <div style={{ position: 'absolute', top: 124, left: 52, fontSize: 0 }}>▶</div>
          <div style={{ position: 'absolute', top: 124, left: `${52 + jawOpenPx - 6}px`, fontSize: 0 }}>◀</div>
        </>
      )}
    </div>
  );
};

// ─── READING DISPLAY ──────────────────────────────────────────────────────────
const ReadingDisplay: React.FC<{ msr: number; vsd: number; zeroError: number; lc: number }> = ({ msr, vsd, zeroError, lc }) => {
  const raw = msr + vsd * lc;
  const corrected = raw - zeroError;
  const isNegativeZE = zeroError < 0;

  return (
    <div style={{
      background: '#0f172a', border: '1.5px solid rgba(255,255,255,0.1)',
      borderRadius: 12, padding: 12, fontFamily: 'monospace',
    }}>
      <div style={{ fontSize: 9, color: '#475569', marginBottom: 8, letterSpacing: 2, fontWeight: 'bold' }}>MEASUREMENT READOUT</div>
      <div className="space-y-1">
        {[
          { label: 'MSR', val: msr.toFixed(1), unit: 'mm', color: '#60a5fa' },
          { label: `VSD (${vsd}×${lc})`, val: (vsd * lc).toFixed(2), unit: 'mm', color: '#34d399' },
          { label: 'Raw', val: raw.toFixed(2), unit: 'mm', color: '#f59e0b' },
          { label: 'Zero Error', val: zeroError.toFixed(2), unit: 'mm', color: zeroError !== 0 ? '#f87171' : '#475569' },
          { label: '✓ Corrected', val: corrected.toFixed(2), unit: 'mm', color: '#a855f7' },
        ].map(r => (
          <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', fontSize: 10 }}>
            <span style={{ color: '#64748b' }}>{r.label}</span>
            <span style={{ color: r.color, fontWeight: 'bold', fontSize: 12 }}>{r.val} <span style={{ fontSize: 9, color: '#475569' }}>{r.unit}</span></span>
          </div>
        ))}
      </div>
      {/* Formula */}
      <div style={{ marginTop: 8, background: 'rgba(168,85,247,0.1)', borderRadius: 6, padding: '4px 8px', fontSize: 9, color: '#a855f7' }}>
        Reading = MSR + VSD × LC {isNegativeZE ? '(−ve ZE)' : zeroError > 0 ? '(+ve ZE)' : '(no ZE)'}
      </div>
    </div>
  );
};

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
const VernierCalipersLab3D: React.FC<{ hex: string; onLog?: (data: any) => void }> = ({ hex, onLog }) => {
  const [diameter, setDiameter] = useState(25.0); // mm
  const [zeroError, setZeroError] = useState(0.0);   // mm
  const [readings, setReadings] = useState<number[]>([]);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [tab, setTab] = useState<'caliper' | 'table' | 'guide'>('caliper');

  const result = vernierReading(diameter / 10, zeroError / 10); // pass cm values
  const raw_displayed_mm = result.displayed_value * 10;          // displayed in mm
  const msr = Math.floor(raw_displayed_mm * 10) / 10;            // main scale (mm, 0.5mm res)
  const vsd = Math.round((raw_displayed_mm - msr) / (LC * 10));  // vernier coinciding div
  const coinciding = Math.max(0, Math.min(10, vsd));
  const corrected = parseFloat((raw_displayed_mm - zeroError).toFixed(2)); // corrected mm

  const logReading = useCallback(() => {
    setReadings(prev => [...prev, corrected]);
    onLog?.({ id: readings.length + 1, diameter: corrected, uncertainty: 0.05 });
    // Spark at measurement point
    setParticles(prev => [...prev, ...Array.from({ length: 12 }, () => createSpark(160, 100, '#a855f7'))]);
  }, [corrected, readings.length, onLog]);

  const stats = readings.length >= 2
    ? analyzeReadings(readings)
    : null;

  const volume = readings.length > 0
    ? sphereVolume(readings.reduce((a, b) => a + b, 0) / readings.length / 10) // mm→cm
    : null;

  const GUIDE_STEPS = [
    { icon: '🔧', title: 'Check Zero Error', desc: 'Close the jaws completely. If the 0 of vernier doesn\'t coincide with 0 of main scale, note the zero error.' },
    { icon: '📏', title: 'Place Object', desc: 'Place the sphere/cylinder between the jaws. Tighten gently without forcing.' },
    { icon: '👁️', title: 'Read MSR', desc: 'Note the main scale reading — the last visible cm division before the vernier zero.' },
    { icon: '🔍', title: 'Read VSD', desc: 'Find which vernier division coincides exactly with a main scale division. That number is the VSD.' },
    { icon: '📋', title: 'Log Reading', desc: 'Apply: Reading = MSR + VSD × LC − Zero Error. Log the reading.' },
    { icon: '🔁', title: 'Repeat 5 Times', desc: 'Take 5 readings in slightly different orientations to get reliable mean and standard deviation.' },
    { icon: '📊', title: 'Calculate Volume', desc: 'V = (4/3)π(d/2)³ for a sphere. Use the mean diameter.' },
  ];

  const [guideStep, setGuideStep] = useState(0);

  return (
    <div className="flex flex-col h-full bg-slate-950 overflow-hidden">
      {/* TAB BAR */}
      <div className="flex border-b border-white/10 bg-slate-900 shrink-0">
        {([
          { key: 'caliper', label: '📐 Caliper' },
          { key: 'table',   label: '📋 Readings' },
          { key: 'guide',   label: '📖 Procedure' },
        ] as const).map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-4 py-2.5 text-xs font-bold transition-colors border-b-2 ${tab === t.key
              ? 'border-violet-500 text-violet-400' : 'border-transparent text-slate-500 hover:text-white'}`}>
            {t.label}
          </button>
        ))}
        <div className="flex-1" />
        <span className="flex items-center pr-4 text-xs font-mono text-violet-400">{readings.length} readings</span>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* MAIN CONTENT */}
        <div className="flex-1 flex flex-col overflow-y-auto p-4 gap-4"
          style={{ background: 'radial-gradient(ellipse at 50% 30%, #1e1b4b 0%, #0f0a1e 70%, #000 100%)', position: 'relative' }}>

          <ParticleEngine particles={particles} setParticles={setParticles} width={500} height={300} />

          {tab === 'caliper' && (
            <>
              {/* 3D Caliper */}
              <CaliperBody3D openingMm={diameter} zeroError={zeroError} />

              {/* Scale readout area */}
              <div className="bg-slate-900/80 border border-white/10 rounded-xl p-3">
                <div className="text-[9px] font-bold text-slate-500 uppercase mb-2">Main Scale (cm)</div>
                <div className="bg-slate-950 rounded-lg p-2 overflow-hidden border border-white/5">
                  <MainScale offset={Math.floor(diameter / 10)} />
                </div>
                <div className="text-[9px] font-bold text-slate-500 uppercase mt-3 mb-2">Vernier Scale</div>
                <VernierScale coinciding={coinciding} />
                <div className="text-[9px] text-amber-400 mt-1">
                  ↑ Division <strong>{coinciding}</strong> coincides — VSD = {coinciding}
                </div>
              </div>

              <ReadingDisplay msr={msr} vsd={vsd} zeroError={zeroError} lc={LC * 10} />
            </>
          )}

          {tab === 'table' && (
            <div className="space-y-3">
              <div className="overflow-x-auto">
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-900">
                      {['#', 'Diameter (mm)', 'Deviation', 'Del'].map(h => (
                        <th key={h} className="px-3 py-2 text-left text-slate-500 font-bold uppercase">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {readings.length === 0 &&
                      <tr><td colSpan={4} className="text-center py-6 text-slate-600 italic">Log readings using the caliper tab</td></tr>}
                    {readings.map((r, i) => {
                      const mean = readings.reduce((a,b)=>a+b,0)/readings.length;
                      const dev = r - mean;
                      return (
                        <tr key={i} className={`border-b border-white/5 ${i%2===0?'bg-slate-950':'bg-slate-900/50'}`}>
                          <td className="px-3 py-1.5 font-mono text-slate-500">{i+1}</td>
                          <td className="px-3 py-1.5 font-mono text-violet-400 font-bold">{r.toFixed(2)}</td>
                          <td className="px-3 py-1.5 font-mono text-xs" style={{ color: Math.abs(dev) < 0.05 ? '#22c55e' : '#f59e0b' }}>
                            {dev >= 0 ? '+' : ''}{dev.toFixed(3)}
                          </td>
                          <td className="px-3 py-1.5">
                            <button onClick={() => setReadings(rs => rs.filter((_,j)=>j!==i))} className="text-red-400 hover:text-red-300">
                              <Trash2 size={11}/>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {stats && (
                <div className="bg-slate-900 border border-white/10 rounded-xl p-4 space-y-2">
                  <div className="text-[10px] font-bold text-slate-400 uppercase mb-3">Statistical Summary</div>
                  {[
                    ['n', `${readings.length} readings`],
                    ['Mean d̄', `${stats.mean.toFixed(3)} mm`],
                    ['Std Dev σ', `${stats.std_deviation.toFixed(3)} mm`],
                    ['Max Error', `${stats.absolute_uncertainty.toFixed(3)} mm`],
                    ['Result', `(${stats.mean.toFixed(2)} ± ${stats.std_deviation.toFixed(2)}) mm`],
                  ].map(([k,v]) => (
                    <div key={k} className="flex justify-between text-xs">
                      <span className="text-slate-500">{k}</span>
                      <span className="font-mono font-bold text-violet-300">{v}</span>
                    </div>
                  ))}
                  {volume && (
                    <div className="mt-3 pt-3 border-t border-white/10">
                      <div className="text-[9px] text-slate-500 uppercase font-bold mb-1">Derived Quantity</div>
                      <div className="font-mono text-sm text-indigo-300">
                        V = (4/3)π(d/2)³ = <strong className="text-white">{volume.volume.toFixed(4)} {volume.unit}</strong>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {tab === 'guide' && (
            <div className="space-y-3">
              {GUIDE_STEPS.map((s, i) => (
                <div key={i} onClick={() => setGuideStep(i)} role="button" tabIndex={0}
                  onKeyDown={e => e.key==='Enter' && setGuideStep(i)}
                  className={`flex gap-3 p-3 rounded-xl border cursor-pointer transition-all ${guideStep===i
                    ? 'border-violet-500 bg-violet-900/20' : 'border-white/10 bg-slate-900 hover:border-violet-500/40'}`}>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold shrink-0
                    ${i<guideStep?'bg-green-500 text-white':i===guideStep?'bg-violet-500 text-white':'bg-slate-800 text-slate-400'}`}>
                    {i<guideStep?'✓':i+1}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white mb-0.5">{s.icon} {s.title}</div>
                    <div className="text-xs text-slate-400 leading-relaxed">{s.desc}</div>
                  </div>
                </div>
              ))}
              <div className="flex gap-2">
                <button onClick={() => setGuideStep(s=>Math.max(0,s-1))}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg bg-slate-800 text-slate-300">
                  <ChevronLeft size={12}/> Prev
                </button>
                <button onClick={() => setGuideStep(s=>Math.min(GUIDE_STEPS.length-1,s+1))}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg bg-violet-600 text-white">
                  Next <ChevronRight size={12}/>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT CONTROLS */}
        <div className="w-64 shrink-0 border-l border-white/10 bg-slate-900 flex flex-col p-4 gap-4 overflow-y-auto">
          {/* Live readout */}
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'MSR', val: `${msr.toFixed(1)}`, unit: 'mm', color: '#60a5fa' },
              { label: 'VSD', val: `${vsd}`, unit: '', color: '#fbbf24' },
              { label: 'Corrected', val: corrected.toFixed(2), unit: 'mm', color: '#a855f7' },
              { label: 'LC', val: `${(LC*10).toFixed(2)}`, unit: 'mm', color: '#34d399' },
            ].map(m=>(
              <div key={m.label} className="bg-slate-950 border border-white/10 rounded-lg p-2 text-center">
                <div className="text-[9px] text-slate-500 uppercase font-bold mb-1">{m.label}</div>
                <div className="font-mono font-bold text-xs" style={{color:m.color}}>{m.val}</div>
                {m.unit && <div className="text-[8px] text-slate-600">{m.unit}</div>}
              </div>
            ))}
          </div>

          {/* Sliders */}
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400 font-bold">Diameter (object)</span>
                <span className="font-mono text-violet-400">{diameter.toFixed(1)} mm</span>
              </div>
              <input type="range" min="5" max="50" step="0.5" value={diameter}
                onChange={e => setDiameter(parseFloat(e.target.value))}
                className="w-full h-2 rounded accent-violet-500" />
              <div className="flex justify-between text-[9px] text-slate-600 mt-0.5"><span>5mm</span><span>50mm</span></div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400 font-bold">Zero Error</span>
                <span className={`font-mono text-xs font-bold ${zeroError>0?'text-red-400':zeroError<0?'text-blue-400':'text-green-400'}`}>
                  {zeroError>=0?'+':''}{zeroError.toFixed(2)} mm
                </span>
              </div>
              <input type="range" min="-0.5" max="0.5" step="0.05" value={zeroError}
                onChange={e => setZeroError(parseFloat(e.target.value))}
                className="w-full h-2 rounded accent-red-500" />
              <div className="flex justify-between text-[9px] mt-0.5">
                <span className="text-blue-400">−ve ZE</span>
                <span className="text-green-400">No ZE</span>
                <span className="text-red-400">+ve ZE</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2">
            <button onClick={logReading}
              className="w-full py-2.5 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-2 transition-all active:scale-95"
              style={{ backgroundColor: hex, boxShadow: `0 6px 16px -6px ${hex}80` }}>
              <Plus size={13}/> Log Reading
            </button>
            <button onClick={() => setReadings([])}
              className="w-full py-2 rounded-xl text-xs bg-slate-800 text-slate-400 flex items-center justify-center gap-1.5 hover:text-red-400 transition-colors">
              <RotateCcw size={11}/> Clear All
            </button>
          </div>

          {/* Formula quick ref */}
          <div className="bg-slate-950 border border-white/10 rounded-xl p-3 space-y-1.5">
            <div className="text-[9px] font-bold text-slate-500 uppercase mb-2">Formulae</div>
            {[
              'LC = 1 MSD − 1 VSD',
              'LC = (1 − 9/10) mm = 0.1 mm',
              'R = MSR + VSD × LC',
              'R_corrected = R − ZE',
              'V_sphere = (4/3)π(d/2)³',
            ].map(f=>(
              <div key={f} className="font-mono text-[9px] text-violet-400 bg-violet-900/20 px-2 py-1 rounded">{f}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VernierCalipersLab3D;
