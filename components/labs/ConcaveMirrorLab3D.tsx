
/**
 * ConcaveMirrorLab3D
 * Features:
 *  - SVG ray diagram with 3 principal rays animated
 *  - Animated light beams with glow
 *  - Draggable/slidable object position
 *  - Color-coded regions (u<f, f<u<2f, u=2f, u>2f)
 *  - Real-time image properties: position, nature, size
 *  - Particle sparkle at focal point
 *  - Live v, m calculation display
 *  - Step-by-step procedure
 */
import React, { useState, useCallback } from 'react';
import { RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react';
import ParticleEngine, { Particle, createSpark, createMolecule } from './ParticleEngine';

const W = 700, H = 300;
const MIRROR_X = 560; // mirror at right
const AXIS_Y = H / 2; // principal axis

// Mirror formula: 1/v + 1/u = 1/f  (sign convention: distances measured from pole)
// Object is always on left → u is negative in real sign convention
function mirrorCalc(u_abs: number, f: number): { v: number; m: number } {
  // 1/v = 1/f - 1/u  (u negative → -u_abs)
  const u = -u_abs;
  if (Math.abs(u) < 0.01) return { v: Infinity, m: Infinity };
  const v = 1 / (1 / f - 1 / u);
  const m = -(v / u);
  return { v, m };
}

// Scale: 1 cm = 6 px
const SCALE = 5;

function toSvgX(cmFromPole: number): number {
  return MIRROR_X - cmFromPole * SCALE;
}

function imageNature(v: number, m: number): { pos: string; nature: string; size: string; color: string } {
  if (!isFinite(v) || Math.abs(v) > 9999) {
    return { pos: '∞ (parallel reflected)', nature: 'No image formed', size: '—', color: '#94a3b8' };
  }
  const pos = v < 0 ? 'Real (same side as object)' : 'Virtual (behind mirror)';
  const nature = v < 0 ? 'Real, Inverted' : 'Virtual, Erect';
  const size = Math.abs(m) > 1.05 ? 'Magnified' : Math.abs(m) < 0.95 ? 'Diminished' : 'Same size';
  const color = v < 0 ? '#f87171' : '#34d399';
  return { pos, nature, size, color };
}

// Principal rays for concave mirror
function computeRays(u_abs: number, f: number, objH: number) {
  const { v, m } = mirrorCalc(u_abs, f);
  const objX = toSvgX(u_abs);
  const objTop = AXIS_Y - objH;
  const fX = toSvgX(f);
  const cX = toSvgX(2 * f);

  const rays: { d: string; color: string; label: string }[] = [];

  // Ray 1: Parallel to axis → reflects through focus
  rays.push({
    d: `M ${objX},${objTop} L ${MIRROR_X},${objTop} L ${fX},${AXIS_Y}`,
    color: '#fbbf24', label: 'Ray ∥ axis → F',
  });

  // Ray 2: Through principal focus → reflects parallel
  if (Math.abs(u_abs - f) > 0.5) {
    rays.push({
      d: `M ${objX},${objTop} L ${fX},${AXIS_Y} L ${MIRROR_X},${objTop} L ${20},${objTop}`,
      color: '#22d3ee', label: 'Ray through F',
    });
  }

  // Ray 3: Through center of curvature → reflects back on itself
  rays.push({
    d: `M ${objX},${objTop} L ${cX},${AXIS_Y} L ${MIRROR_X},${objTop} L ${cX},${AXIS_Y}`,
    color: '#a78bfa', label: 'Ray through C',
  });

  // Image (only if finite)
  let imageEl: { x: number; y: number; h: number; real: boolean } | null = null;
  if (isFinite(v) && Math.abs(v) < 500) {
    const imgH = Math.abs(objH * m);
    const imgX = toSvgX(Math.abs(v));
    const invertedTop = v < 0 ? AXIS_Y + imgH : AXIS_Y - imgH; // inverted if real
    imageEl = { x: imgX, y: invertedTop, h: imgH, real: v < 0 };
  }

  return { rays, imageEl, v, m };
}

// ─── REGION LABELS ────────────────────────────────────────────────────────────
function getRegionLabel(u: number, f: number): { label: string; color: string; desc: string } {
  if (u > 2 * f) return { label: 'Beyond C (u > 2f)', color: '#f87171', desc: 'Image: real, inverted, diminished, between F and C' };
  if (Math.abs(u - 2 * f) < 1) return { label: 'At C (u = 2f)', color: '#fb923c', desc: 'Image: real, inverted, same size, at C' };
  if (u > f) return { label: 'Between F & C', color: '#fbbf24', desc: 'Image: real, inverted, magnified, beyond C' };
  if (Math.abs(u - f) < 1) return { label: 'At F (u = f)', color: '#a78bfa', desc: 'Image: at infinity (parallel rays)' };
  return { label: 'Within F (u < f)', color: '#34d399', desc: 'Image: virtual, erect, magnified (behind mirror)' };
}

const GUIDE = [
  { icon: '🪞', title: 'Setup Mirror', desc: 'Place the concave mirror on a stand. Align ruler along principal axis.' },
  { icon: '🕯️', title: 'Place Object', desc: 'Place a candle beyond C (u > 2f). Observe real, inverted, diminished image.' },
  { icon: '📏', title: 'Locate Image', desc: 'Move screen until sharp image forms. Measure v from mirror pole.' },
  { icon: '📋', title: 'Record Data', desc: 'Record u, v. Calculate f using mirror formula: 1/f = 1/v + 1/u.' },
  { icon: '🔁', title: 'Repeat at 5 Positions', desc: 'Repeat for u at C, between F&C, at F, within F for all cases.' },
  { icon: '📐', title: 'Draw Ray Diagram', desc: 'Draw 3 principal rays to verify image position and nature geometrically.' },
];

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
const ConcaveMirrorLab3D: React.FC<{ hex: string }> = ({ hex }) => {
  const [u_abs, setUAbs] = useState(60); // cm, object distance
  const [f, setF] = useState(20);        // cm, focal length
  const [objH, setObjH] = useState(40);  // px, object height
  const [particles, setParticles] = useState<Particle[]>([]);
  const [tab, setTab] = useState<'diagram' | 'readings' | 'guide'>('diagram');
  const [recordings, setRecordings] = useState<{ u: number; v: number; f_calc: number }[]>([]);
  const [guideStep, setGuideStep] = useState(0);
  const [animFrame, setAnimFrame] = useState(0);

  React.useEffect(() => {
    const id = setInterval(() => setAnimFrame(f => (f + 1) % 60), 100);
    return () => clearInterval(id);
  }, []);

  const { rays, imageEl, v, m } = computeRays(u_abs, f, objH);
  const region = getRegionLabel(u_abs, f);
  const nature = imageNature(v, m);
  const fX = toSvgX(f);
  const cX = toSvgX(2 * f);
  const objX = toSvgX(u_abs);

  const logReading = useCallback(() => {
    if (!isFinite(v)) return;
    const f_calc = 1 / (1 / v + 1 / (-u_abs));
    setRecordings(r => [...r, { u: u_abs, v: parseFloat(v.toFixed(2)), f_calc: parseFloat(Math.abs(f_calc).toFixed(2)) }]);
    setParticles(p => [...p, ...Array.from({ length: 16 }, () => createSpark(fX, AXIS_Y, '#fbbf24'))]);
  }, [v, u_abs, fX]);

  return (
    <div className="flex flex-col h-full bg-slate-950 overflow-hidden">
      <style>{`
        @keyframes ray-dash { to { stroke-dashoffset: -20; } }
        @keyframes glow-focal { 0%,100%{filter:drop-shadow(0 0 4px #fbbf24)} 50%{filter:drop-shadow(0 0 12px #fbbf24)} }
      `}</style>

      {/* TAB BAR */}
      <div className="flex border-b border-white/10 bg-slate-900 shrink-0">
        {([
          { key: 'diagram',  label: '🪞 Ray Diagram' },
          { key: 'readings', label: '📋 Readings' },
          { key: 'guide',    label: '📖 Procedure' },
        ] as const).map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-colors ${tab === t.key
              ? 'border-amber-400 text-amber-300' : 'border-transparent text-slate-500 hover:text-white'}`}>
            {t.label}
          </button>
        ))}
        <div className="flex-1" />
        <div className="flex items-center pr-4">
          <span className="text-xs font-bold px-2 py-0.5 rounded text-xs" style={{ background: `${region.color}22`, color: region.color, border: `1px solid ${region.color}44` }}>
            {region.label}
          </span>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 flex flex-col overflow-y-auto" style={{ background: 'radial-gradient(ellipse at 50% 40%, #1a0a00 0%, #0a0010 60%, #000 100%)', position: 'relative' }}>

          <ParticleEngine particles={particles} setParticles={setParticles} width={W} height={H} />

          {tab === 'diagram' && (
            <>
              <svg width="100%" viewBox={`0 0 ${W} ${H}`} className="block" style={{ minHeight: 300 }}>
                {/* Dark gradient bg */}
                <defs>
                  <radialGradient id="focusglow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#fbbf2466" />
                    <stop offset="100%" stopColor="transparent" />
                  </radialGradient>
                  <filter id="glow">
                    <feGaussianBlur stdDeviation="2" result="blur" />
                    <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
                  </filter>
                </defs>

                {/* Grid */}
                {Array.from({ length: 14 }, (_, i) => (
                  <line key={i} x1={i*50} y1={0} x2={i*50} y2={H} stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                ))}
                {Array.from({ length: 6 }, (_, i) => (
                  <line key={i} x1={0} y1={i*50} x2={W} y2={i*50} stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                ))}

                {/* Principal axis */}
                <line x1={0} y1={AXIS_Y} x2={MIRROR_X} y2={AXIS_Y} stroke="#334155" strokeWidth="1.5" strokeDasharray="6,4" />
                <text x={10} y={AXIS_Y - 6} fill="#475569" fontSize="9">Principal Axis</text>

                {/* Concave mirror arc */}
                <path d={`M ${MIRROR_X},${AXIS_Y - 100} Q ${MIRROR_X - 24},${AXIS_Y} ${MIRROR_X},${AXIS_Y + 100}`}
                  fill="none" stroke="#60a5fa" strokeWidth="4"
                  style={{ filter: 'drop-shadow(0 0 6px #60a5fa)' }} />
                {/* Mirror reflective surface hatching */}
                {Array.from({ length: 8 }, (_, i) => {
                  const y = AXIS_Y - 85 + i * 24;
                  return <line key={i} x1={MIRROR_X} y1={y} x2={MIRROR_X + 12} y2={y + 8} stroke="#1e3a5f" strokeWidth="2" />;
                })}
                <text x={MIRROR_X + 4} y={AXIS_Y - 106} fill="#60a5fa" fontSize="8">Mirror</text>

                {/* Pole P */}
                <circle cx={MIRROR_X} cy={AXIS_Y} r={3} fill="#60a5fa" />
                <text x={MIRROR_X + 4} y={AXIS_Y + 12} fill="#60a5fa" fontSize="8">P</text>

                {/* Focus F */}
                <circle cx={fX} cy={AXIS_Y} r={5} fill="#fbbf24" style={{ animation: 'glow-focal 2s ease-in-out infinite' }} />
                <circle cx={fX} cy={AXIS_Y} r={12} fill="url(#focusglow)" opacity="0.6" />
                <text x={fX - 4} y={AXIS_Y + 16} fill="#fbbf24" fontSize="9" fontWeight="bold">F</text>

                {/* Center of curvature C */}
                <circle cx={cX} cy={AXIS_Y} r={4} fill="#a78bfa" />
                <text x={cX - 4} y={AXIS_Y + 16} fill="#a78bfa" fontSize="9">C</text>

                {/* Distance labels */}
                {u_abs > 0 && (
                  <>
                    <line x1={objX} y1={AXIS_Y + 25} x2={MIRROR_X} y2={AXIS_Y + 25} stroke="#94a3b8" strokeWidth="1" markerEnd="url(#arr)" />
                    <text x={(objX + MIRROR_X) / 2} y={AXIS_Y + 38} fill="#94a3b8" fontSize="8" textAnchor="middle">u = {u_abs} cm</text>
                  </>
                )}

                {isFinite(v) && Math.abs(v) < 500 && (
                  <>
                    <line x1={MIRROR_X} y1={AXIS_Y + 50} x2={toSvgX(Math.abs(v))} y2={AXIS_Y + 50} stroke={v < 0 ? '#f87171' : '#34d399'} strokeWidth="1" />
                    <text x={(MIRROR_X + toSvgX(Math.abs(v))) / 2} y={AXIS_Y + 62} fill={v < 0 ? '#f87171' : '#34d399'} fontSize="8" textAnchor="middle">
                      v = {v.toFixed(1)} cm {v > 0 ? '(virtual)' : ''}
                    </text>
                  </>
                )}

                {/* Object arrow */}
                <line x1={objX} y1={AXIS_Y} x2={objX} y2={AXIS_Y - objH} stroke="#22c55e" strokeWidth="2.5" />
                <polygon points={`${objX},${AXIS_Y - objH} ${objX - 6},${AXIS_Y - objH + 10} ${objX + 6},${AXIS_Y - objH + 10}`} fill="#22c55e" />
                <text x={objX - 12} y={AXIS_Y - objH - 6} fill="#22c55e" fontSize="8">O</text>

                {/* Principal rays */}
                {rays.map((ray, i) => (
                  <path key={i} d={ray.d} fill="none" stroke={ray.color} strokeWidth="1.5"
                    strokeDasharray="6,3"
                    style={{ animation: `ray-dash ${1 + i * 0.3}s linear infinite`, filter: `drop-shadow(0 0 3px ${ray.color})` }} />
                ))}

                {/* Image arrow */}
                {imageEl && (
                  <>
                    <line x1={imageEl.x} y1={AXIS_Y} x2={imageEl.x} y2={imageEl.y}
                      stroke={imageEl.real ? '#f87171' : '#34d399ee'} strokeWidth="2"
                      strokeDasharray={imageEl.real ? 'none' : '4,3'} />
                    <polygon
                      points={`${imageEl.x},${imageEl.y} ${imageEl.x - 5},${imageEl.y + (imageEl.real ? -10 : 10)} ${imageEl.x + 5},${imageEl.y + (imageEl.real ? -10 : 10)}`}
                      fill={imageEl.real ? '#f87171' : '#34d399'} />
                    <text x={imageEl.x + 8} y={imageEl.y - 4} fill={imageEl.real ? '#f87171' : '#34d399'} fontSize="8">I</text>
                  </>
                )}

                {/* Ray legend */}
                {[{ color: '#fbbf24', label: '∥axis → F' }, { color: '#22d3ee', label: 'Through F' }, { color: '#a78bfa', label: 'Through C' }].map((r, i) => (
                  <g key={i} transform={`translate(10,${16 + i * 14})`}>
                    <line x1={0} y1={4} x2={20} y2={4} stroke={r.color} strokeWidth="2" />
                    <text x={24} y={8} fill={r.color} fontSize="8">{r.label}</text>
                  </g>
                ))}
              </svg>

              {/* Region description banner */}
              <div className="mx-4 mb-4 p-3 rounded-xl" style={{ background: `${region.color}15`, border: `1px solid ${region.color}40` }}>
                <div className="text-xs font-bold mb-1" style={{ color: region.color }}>{region.label}</div>
                <div className="text-xs text-slate-400">{region.desc}</div>
              </div>
            </>
          )}

          {tab === 'readings' && (
            <div className="p-4 space-y-4">
              <div className="overflow-x-auto">
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-900">
                      {['#', 'u (cm)', 'v (cm)', 'f = uv/(u+v)', 'Nature'].map(h=>(
                        <th key={h} className="px-3 py-2 text-left text-slate-500 font-bold uppercase">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {recordings.length === 0 &&
                      <tr><td colSpan={5} className="text-center py-6 text-slate-600 italic">Log readings from the diagram tab</td></tr>}
                    {recordings.map((r, i) => (
                      <tr key={i} className={`border-b border-white/5 ${i%2===0?'bg-slate-950':'bg-slate-900/50'}`}>
                        <td className="px-3 py-1.5 font-mono text-slate-500">{i+1}</td>
                        <td className="px-3 py-1.5 font-mono text-amber-400">{r.u.toFixed(1)}</td>
                        <td className="px-3 py-1.5 font-mono text-red-400">{r.v.toFixed(2)}</td>
                        <td className="px-3 py-1.5 font-mono text-purple-300 font-bold">{r.f_calc.toFixed(2)}</td>
                        <td className="px-3 py-1.5 text-[10px]" style={{ color: r.v < 0 ? '#f87171' : '#34d399' }}>
                          {r.v < 0 ? 'Real, Inv.' : 'Virtual, Erect'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {recordings.length >= 2 && (() => {
                const fVals = recordings.map(r => r.f_calc);
                const mean = fVals.reduce((a,b)=>a+b,0)/fVals.length;
                const std = Math.sqrt(fVals.reduce((a,r)=>a+(r-mean)**2,0)/(fVals.length-1));
                return (
                  <div className="bg-slate-900 border border-white/10 rounded-xl p-4 space-y-2">
                    <div className="text-[10px] font-bold text-slate-400 uppercase mb-2">Focal Length Summary</div>
                    {[['Mean f', `${mean.toFixed(2)} cm`], ['Std Dev', `± ${std.toFixed(3)} cm`], ['Set f', `${f} cm`], ['Error %', `${Math.abs((mean-f)/f*100).toFixed(2)}%`]].map(([k,v])=>(
                      <div key={k} className="flex justify-between text-xs">
                        <span className="text-slate-500">{k}</span>
                        <span className="font-mono font-bold text-amber-300">{v}</span>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          )}

          {tab === 'guide' && (
            <div className="p-4 space-y-3">
              {GUIDE.map((s, i) => (
                <div key={i} onClick={() => setGuideStep(i)} role="button" tabIndex={0}
                  onKeyDown={e => e.key==='Enter' && setGuideStep(i)}
                  className={`flex gap-3 p-3 rounded-xl border cursor-pointer transition-all ${guideStep===i
                    ? 'border-amber-400 bg-amber-900/20' : 'border-white/10 bg-slate-900 hover:border-amber-400/30'}`}>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold shrink-0
                    ${i<guideStep?'bg-green-500 text-white':i===guideStep?'bg-amber-500 text-white':'bg-slate-800 text-slate-400'}`}>
                    {i<guideStep?'✓':i+1}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white mb-0.5">{s.icon} {s.title}</div>
                    <div className="text-xs text-slate-400 leading-relaxed">{s.desc}</div>
                  </div>
                </div>
              ))}
              <div className="flex gap-2">
                <button onClick={() => setGuideStep(s=>Math.max(0,s-1))} className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg bg-slate-800 text-slate-300"><ChevronLeft size={12}/> Prev</button>
                <button onClick={() => setGuideStep(s=>Math.min(GUIDE.length-1,s+1))} className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg bg-amber-600 text-white">Next <ChevronRight size={12}/></button>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT CONTROLS */}
        <div className="w-64 shrink-0 border-l border-white/10 bg-slate-900 flex flex-col p-4 gap-4 overflow-y-auto">
          {/* Live values */}
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'Object dist u', val: `${u_abs}`, unit: 'cm', color: '#22c55e' },
              { label: 'Image dist v', val: isFinite(v) ? v.toFixed(1) : '∞', unit: 'cm', color: v<0?'#f87171':'#34d399' },
              { label: 'f set', val: `${f}`, unit: 'cm', color: '#fbbf24' },
              { label: 'Magnif m', val: isFinite(m) ? m.toFixed(2) : '∞', unit: '×', color: Math.abs(m)>1?'#f59e0b':'#60a5fa' },
            ].map(x=>(
              <div key={x.label} className="bg-slate-950 border border-white/10 rounded-lg p-2 text-center">
                <div className="text-[9px] text-slate-500 uppercase font-bold mb-1">{x.label}</div>
                <div className="font-mono font-bold text-xs" style={{color:x.color}}>{x.val}</div>
                <div className="text-[8px] text-slate-600">{x.unit}</div>
              </div>
            ))}
          </div>

          {/* Image nature card */}
          <div className="bg-slate-950 border border-white/10 rounded-xl p-3">
            <div className="text-[9px] text-slate-500 uppercase font-bold mb-2">Image Properties</div>
            <div className="text-xs font-bold mb-1" style={{color: nature.color}}>{nature.nature}</div>
            <div className="text-xs text-slate-400">{nature.size}</div>
            <div className="text-[10px] text-slate-500 mt-1">{nature.pos}</div>
          </div>

          {/* Sliders */}
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400 font-bold">Object Distance (u)</span>
                <span className="font-mono text-green-400">{u_abs} cm</span>
              </div>
              <input type="range" min="5" max="100" step="1" value={u_abs}
                onChange={e => setUAbs(parseInt(e.target.value))}
                className="w-full h-2 rounded accent-green-500" />
              <div className="flex justify-between text-[9px] text-slate-600 mt-0.5">
                <span>5cm</span><span>F={f}cm</span><span>2F={2*f}cm</span><span>100cm</span>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400 font-bold">Focal Length (f)</span>
                <span className="font-mono text-amber-400">{f} cm</span>
              </div>
              <input type="range" min="10" max="40" step="5" value={f}
                onChange={e => setF(parseInt(e.target.value))}
                className="w-full h-2 rounded accent-amber-500" />
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400 font-bold">Object Height</span>
                <span className="font-mono text-slate-400">{objH}px</span>
              </div>
              <input type="range" min="20" max="80" step="5" value={objH}
                onChange={e => setObjH(parseInt(e.target.value))}
                className="w-full h-2 rounded accent-slate-500" />
            </div>
          </div>

          {/* Log button */}
          <button onClick={logReading} disabled={!isFinite(v)}
            className="w-full py-2.5 rounded-xl text-xs font-bold text-white active:scale-95 transition-all disabled:opacity-40"
            style={{ backgroundColor: hex, boxShadow: `0 6px 16px -6px ${hex}80` }}>
            + Log Reading
          </button>

          <button onClick={() => setRecordings([])}
            className="w-full py-2 rounded-xl text-xs bg-slate-800 text-slate-400 flex items-center justify-center gap-1.5 hover:text-red-400 transition-colors">
            <RotateCcw size={11}/> Clear Readings
          </button>

          {/* Formulae */}
          <div className="bg-slate-950 border border-white/10 rounded-xl p-3 space-y-1.5">
            <div className="text-[9px] font-bold text-slate-500 uppercase mb-2">Formulae</div>
            {['1/f = 1/v + 1/u', 'f = uv / (u + v)', 'm = −v/u', 'm = hᵢ/hₒ', 'R = 2f (radius of curvature)'].map(f=>(
              <div key={f} className="font-mono text-[9px] text-amber-400 bg-amber-900/20 px-2 py-1 rounded">{f}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConcaveMirrorLab3D;
