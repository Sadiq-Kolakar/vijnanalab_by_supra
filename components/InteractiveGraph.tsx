import React, { useRef, useState } from 'react';
import { Trash2, Download, ZoomIn, ZoomOut } from 'lucide-react';

export interface GraphPoint { x: number; y: number; label?: string; }

interface Series {
  points: GraphPoint[];
  color: string;
  label: string;
  dashed?: boolean;
  errorY?: number[]; // Array of uncertainty values for each point
}

interface InteractiveGraphProps {
  series: Series[];
  xLabel: string;
  yLabel: string;
  xUnit?: string;
  yUnit?: string;
  showGrid?: boolean;
  title?: string;
  onPointClick?: (point: GraphPoint, seriesIdx: number) => void;
}

// Auto-range with padding
function range(vals: number[]): [number, number] {
  if (vals.length === 0) return [0, 1];
  const mn = Math.min(...vals), mx = Math.max(...vals);
  const pad = (mx - mn) * 0.12 || 0.5;
  return [mn - pad, mx + pad];
}

function linReg(pts: GraphPoint[]): { slope: number; intercept: number; r2: number } | null {
  const n = pts.length;
  if (n < 2) return null;
  const sx = pts.reduce((a, p) => a + p.x, 0);
  const sy = pts.reduce((a, p) => a + p.y, 0);
  const sxy = pts.reduce((a, p) => a + p.x * p.y, 0);
  const sx2 = pts.reduce((a, p) => a + p.x * p.x, 0);
  const slope = (n * sxy - sx * sy) / (n * sx2 - sx * sx);
  const intercept = (sy - slope * sx) / n;
  const ym = sy / n;
  const ss_tot = pts.reduce((a, p) => a + (p.y - ym) ** 2, 0);
  const ss_res = pts.reduce((a, p) => a + (p.y - (slope * p.x + intercept)) ** 2, 0);
  const r2 = ss_tot === 0 ? 1 : 1 - ss_res / ss_tot;
  return { slope, intercept, r2 };
}

const InteractiveGraph: React.FC<InteractiveGraphProps> = ({
  series, xLabel, yLabel, xUnit = '', yUnit = '', title,
  showGrid = true, onPointClick,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [zoom, setZoom] = useState(1);
  const [hoveredPt, setHoveredPt] = useState<{ x: number; y: number; sx: number; sy: number; label: string } | null>(null);
  const [showReg, setShowReg] = useState(true);

  const PAD = { top: 30, right: 20, bottom: 54, left: 56 };
  const W = 480, H = 280;
  const PW = W - PAD.left - PAD.right;
  const PH = H - PAD.top - PAD.bottom;

  const allX = series.flatMap(s => s.points.map(p => p.x));
  const allY = series.flatMap(s => s.points.map(p => p.y));
  const [xMin, xMax] = range(allX);
  const [yMin, yMax] = range(allY);

  const toSvgX = (x: number) => PAD.left + ((x - xMin) / (xMax - xMin)) * PW;
  const toSvgY = (y: number) => PAD.top + PH - ((y - yMin) / (yMax - yMin)) * PH;

  const gridLines = 5;
  const ticks = (mn: number, mx: number) =>
    Array.from({ length: gridLines + 1 }, (_, i) => mn + (i / gridLines) * (mx - mn));

  function handleDownload() {
    if (!svgRef.current) return;
    const data = new XMLSerializer().serializeToString(svgRef.current);
    const blob = new Blob([data], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'graph.svg'; a.click();
    URL.revokeObjectURL(url);
  }

  function handleExportCSV() {
    let csv = `Series,${xLabel},${yLabel},Uncertainty\n`;
    series.forEach(s => {
      s.points.forEach((p, i) => {
        csv += `${s.label},${p.x},${p.y},${s.errorY?.[i] || 0}\n`;
      });
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'experiment_data.csv'; a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-100 dark:border-white/10">
        <span className="text-xs font-bold text-slate-600 dark:text-white">{title || `${yLabel} vs ${xLabel}`}</span>
        <div className="flex gap-2">
          <button onClick={() => setShowReg(r => !r)}
            className={`text-[10px] px-2 py-0.5 rounded border transition-colors ${showReg ? 'bg-blue-600 text-white border-blue-500' : 'text-slate-400 border-slate-200 dark:border-white/10'}`}>
            Best Fit
          </button>
          <button onClick={() => setZoom(z => Math.min(z + 0.25, 2))} className="p-1 hover:bg-slate-100 dark:hover:bg-white/10 rounded text-slate-400" title="Zoom In"><ZoomIn size={12} /></button>
          <button onClick={() => setZoom(z => Math.max(z - 0.25, 0.5))} className="p-1 hover:bg-slate-100 dark:hover:bg-white/10 rounded text-slate-400" title="Zoom Out"><ZoomOut size={12} /></button>
          <button onClick={handleDownload} className="p-1 hover:bg-slate-100 dark:hover:bg-white/10 rounded text-slate-400" title="Download SVG"><Download size={12} /></button>
          <button onClick={handleExportCSV} className="p-1 hover:bg-slate-100 dark:hover:bg-white/10 rounded text-slate-400" title="Export CSV"><Trash2 size={12} className="rotate-180" /></button>
        </div>
      </div>

      {/* SVG */}
      <div className="overflow-auto">
        <svg ref={svgRef} width={W * zoom} height={H * zoom} viewBox={`0 0 ${W} ${H}`} className="block">
          {/* Grid */}
          {showGrid && (
            <g opacity="0.15">
              {ticks(xMin, xMax).map((v, i) => (
                <line key={`vg-${v}-${i}`} x1={toSvgX(v)} y1={PAD.top} x2={toSvgX(v)} y2={PAD.top + PH}
                  stroke="currentColor" strokeWidth="1" className="text-slate-400 dark:text-white" />
              ))}
              {ticks(yMin, yMax).map((v, i) => (
                <line key={`hg-${v}-${i}`} x1={PAD.left} y1={toSvgY(v)} x2={PAD.left + PW} y2={toSvgY(v)}
                  stroke="currentColor" strokeWidth="1" className="text-slate-400 dark:text-white" />
              ))}
            </g>
          )}

          {/* Axes */}
          <line x1={PAD.left} y1={PAD.top} x2={PAD.left} y2={PAD.top + PH} stroke="#64748b" strokeWidth="1.5" />
          <line x1={PAD.left} y1={PAD.top + PH} x2={PAD.left + PW} y2={PAD.top + PH} stroke="#64748b" strokeWidth="1.5" />

          {/* Tick labels */}
          {ticks(xMin, xMax).map((v, i) => (
            <text key={`xl-${v}-${i}`} x={toSvgX(v)} y={PAD.top + PH + 16} textAnchor="middle" fontSize="9" fill="#94a3b8">
              {v.toFixed(2)}
            </text>
          ))}
          {ticks(yMin, yMax).map((v, i) => (
            <text key={`yl-${v}-${i}`} x={PAD.left - 6} y={toSvgY(v) + 3} textAnchor="end" fontSize="9" fill="#94a3b8">
              {v.toFixed(2)}
            </text>
          ))}

          {/* Axis labels */}
          <text x={PAD.left + PW / 2} y={H - 4} textAnchor="middle" fontSize="10" fill="#64748b" fontWeight="bold">
            {xLabel}{xUnit ? ` (${xUnit})` : ''}
          </text>
          <text x={12} y={PAD.top + PH / 2} textAnchor="middle" fontSize="10" fill="#64748b" fontWeight="bold"
            transform={`rotate(-90, 12, ${PAD.top + PH / 2})`}>
            {yLabel}{yUnit ? ` (${yUnit})` : ''}
          </text>

          {series.map((s, si) => {
            const reg = showReg ? linReg(s.points) : null;
            const regX1 = xMin, regX2 = xMax;

            return (
              <g key={`s-${si}-${s.label}`}>
                {/* Line connecting points */}
                {s.points.length > 1 && (
                  <polyline
                    points={s.points.map(p => `${toSvgX(p.x)},${toSvgY(p.y)}`).join(' ')}
                    fill="none" stroke={s.color} strokeWidth="1.5" opacity="0.4"
                    strokeDasharray={s.dashed ? '4,3' : undefined}
                  />
                )}

                {/* Best fit line */}
                {reg && (
                  <line
                    x1={toSvgX(regX1)} y1={toSvgY(reg.slope * regX1 + reg.intercept)}
                    x2={toSvgX(regX2)} y2={toSvgY(reg.slope * regX2 + reg.intercept)}
                    stroke={s.color} strokeWidth="2" strokeDasharray="6,3" opacity="0.9"
                  />
                )}

                {/* Error Bars */}
                {s.errorY && s.points.map((p, pi) => {
                  const err = s.errorY![pi];
                  if (!err) return null;
                  const yTop = toSvgY(p.y + err);
                  const yBot = toSvgY(p.y - err);
                  return (
                    <g key={`eb-${si}-${pi}`} opacity="0.6">
                      <line x1={toSvgX(p.x)} y1={yTop} x2={toSvgX(p.x)} y2={yBot} stroke={s.color} strokeWidth="1" />
                      <line x1={toSvgX(p.x) - 3} y1={yTop} x2={toSvgX(p.x) + 3} y2={yTop} stroke={s.color} strokeWidth="1" />
                      <line x1={toSvgX(p.x) - 3} y1={yBot} x2={toSvgX(p.x) + 3} y2={yBot} stroke={s.color} strokeWidth="1" />
                    </g>
                  );
                })}

                {/* Points */}
                {s.points.map((p, pi) => (
                  <circle
                    key={`p-${si}-${pi}`}
                    cx={toSvgX(p.x)} cy={toSvgY(p.y)} r="4"
                    fill={s.color} stroke="white" strokeWidth="1.5"
                    style={{ cursor: 'pointer' }}
                    onMouseEnter={() => setHoveredPt({ x: p.x, y: p.y, sx: toSvgX(p.x), sy: toSvgY(p.y), label: s.label })}
                    onMouseLeave={() => setHoveredPt(null)}
                    onClick={() => onPointClick?.(p, si)}
                  />
                ))}

                {/* R² label */}
                {reg && s.points.length >= 2 && (
                  <text x={PAD.left + PW - 4} y={PAD.top + 14 + si * 14} textAnchor="end" fontSize="9" fill={s.color} fontWeight="bold">
                    {s.label}: R²={reg.r2.toFixed(4)}, m={reg.slope.toFixed(4)}
                  </text>
                )}
              </g>
            );
          })}

          {/* Hover Tooltip */}
          {hoveredPt && (
            <g>
              <rect x={hoveredPt.sx + 8} y={hoveredPt.sy - 24} width={100} height={30} rx="4" fill="#1e293b" opacity="0.9" />
              <text x={hoveredPt.sx + 13} y={hoveredPt.sy - 12} fontSize="8.5" fill="white">
                {hoveredPt.label}
              </text>
              <text x={hoveredPt.sx + 13} y={hoveredPt.sy + 0} fontSize="8.5" fill="#94a3b8">
                x={hoveredPt.x.toFixed(3)}{xUnit}  y={hoveredPt.y.toFixed(3)}{yUnit}
              </text>
            </g>
          )}
        </svg>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 px-4 pb-2 pt-1 border-t border-slate-100 dark:border-white/10">
        {series.map((s, i) => (
          <div key={`lg-${s.label}-${i}`} className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: s.color }} />
            <span className="text-[10px] text-slate-500 dark:text-gray-400">{s.label}</span>
          </div>
        ))}
        {series.map((s, i) => {
          const r = linReg(s.points);
          if (!r) return null;
          return (
            <div key={`slope-${i}`} className="text-[10px] text-slate-400">
              {s.label} Slope = {r.slope.toFixed(4)} {yUnit}/{xUnit}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default InteractiveGraph;

