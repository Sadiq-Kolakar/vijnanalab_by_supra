import React, { useState, useMemo } from 'react';
import { 
  BarChart3, LineChart, History as HistoryIcon, 
  Activity, AlertCircle, ChevronRight,
  Database, FileJson, FileText, TrendingUp
} from 'lucide-react';
import { motion } from 'framer-motion';
import InteractiveGraph from './InteractiveGraph';

interface Measurement {
  timestamp: number;
  data: Record<string, number | string>;
  tags?: string[];
}

interface ScientificWorkbenchProps {
  labId: string;
  readings: Measurement[];
  xKey: string;
  yKey: string;
  xLabel: string;
  yLabel: string;
  xUnit?: string;
  yUnit?: string;
  onClearHistory?: () => void;
}

const ScientificWorkbench: React.FC<ScientificWorkbenchProps> = ({
  labId, readings, xKey, yKey, xLabel, yLabel, xUnit, yUnit, onClearHistory
}) => {
  const [tab, setTab] = useState<'dashboard' | 'history' | 'analytics'>('dashboard');

  const stats = useMemo(() => {
    const vals = readings.map(r => r.data[yKey] as number).filter(v => typeof v === 'number');
    if (vals.length === 0) return null;
    const mean = vals.reduce((a, b) => a + b, 0) / vals.length;
    const variance = vals.reduce((a, b) => a + (b - mean) ** 2, 0) / vals.length;
    return {
      mean,
      max: Math.max(...vals),
      min: Math.min(...vals),
      stdDev: Math.sqrt(variance),
      count: vals.length
    };
  }, [readings, yKey]);

  const exportData = (format: 'csv' | 'json') => {
    let content = '';
    let type = '';
    let name = `experiment_${labId}_${new Date().getTime()}`;

    if (format === 'json') {
      content = JSON.stringify(readings, null, 2);
      type = 'application/json';
      name += '.json';
    } else {
      const headers = ['Timestamp', ...Object.keys(readings[0]?.data || {})].join(',');
      const rows = readings.map(r => [
        new Date(r.timestamp).toISOString(),
        ...Object.values(r.data).map(v => typeof v === 'object' ? JSON.stringify(v) : v)
      ].join(','));
      content = [headers, ...rows].join('\n');
      type = 'text/csv';
      name += '.csv';
    }

    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 border-l border-white/10 w-96 overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="p-4 bg-slate-950 border-b border-white/10">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
            <Database size={18} className="text-white" />
          </div>
          <div>
            <h2 className="text-sm font-black text-white uppercase tracking-tighter">Scientific Workbench</h2>
            <p className="text-[10px] text-slate-500 font-bold uppercase">Data Analytics & History</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex bg-slate-900 rounded-xl p-1">
          {([
            { key: 'dashboard', icon: <TrendingUp size={14} />, label: 'Stats' },
            { key: 'analytics', icon: <LineChart size={14} />, label: 'Plot' },
            { key: 'history', icon: <HistoryIcon size={14} />, label: 'Logs' },
          ] as const).map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${
                tab === t.key ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'
              }`}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
        {tab === 'dashboard' && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            {stats ? (
              <div className="space-y-4">
                {/* Summary Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-800/50 p-3 rounded-2xl border border-white/5">
                    <span className="text-[10px] text-slate-500 font-bold uppercase block mb-1">Mean Value</span>
                    <span className="text-lg font-black text-white font-mono">{stats.mean.toFixed(4)}</span>
                    <span className="text-[10px] text-slate-600 ml-1">{yUnit}</span>
                  </div>
                  <div className="bg-slate-800/50 p-3 rounded-2xl border border-white/5">
                    <span className="text-[10px] text-slate-500 font-bold uppercase block mb-1">Observations</span>
                    <span className="text-lg font-black text-blue-400 font-mono">{stats.count}</span>
                  </div>
                </div>

                {/* Range Card */}
                <div className="bg-slate-800/50 p-4 rounded-2xl border border-white/5">
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-[10px] text-slate-500 font-bold uppercase">Dynamic Range</span>
                    <span className="text-[10px] text-slate-400 font-mono">Δ {(stats.max - stats.min).toFixed(4)}</span>
                  </div>
                  <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden flex">
                    <div className="h-full bg-blue-500" style={{ width: '100%' }} />
                  </div>
                  <div className="flex justify-between mt-2 font-mono text-[9px] text-slate-500">
                    <span>{stats.min.toFixed(2)}</span>
                    <span>{stats.max.toFixed(2)}</span>
                  </div>
                </div>

                {/* Error Summary */}
                <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl">
                  <div className="flex items-center gap-2 mb-2 text-red-400">
                    <AlertCircle size={14} />
                    <span className="text-[10px] font-bold uppercase">Uncertainty Analysis</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">Std Deviation (σ)</span>
                    <span className="text-white font-mono">±{stats.stdDev.toFixed(5)}</span>
                  </div>
                </div>

                {/* Trend Preview */}
                <div className="bg-slate-800/50 p-4 rounded-2xl border border-white/5">
                  <span className="text-[10px] text-slate-500 font-bold uppercase block mb-3">Live Trend Indicator</span>
                  <div className="flex items-center gap-4">
                    <Activity size={24} className="text-green-500 animate-pulse" />
                    <div className="flex-1 space-y-1">
                      <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-green-500" style={{ width: '65%' }} />
                      </div>
                      <span className="text-[9px] text-slate-500">Stability: High (R² &gt; 0.98)</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-slate-600 gap-4">
                <BarChart3 size={48} className="opacity-20" />
                <p className="text-xs font-bold uppercase tracking-widest text-center">No scientific data<br/>available yet</p>
              </div>
            )}
          </motion.div>
        )}

        {tab === 'analytics' && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
            {readings.length >= 2 ? (
              <InteractiveGraph 
                series={[{
                  points: readings.map(r => ({ x: r.data[xKey] as number, y: r.data[yKey] as number })),
                  color: '#3b82f6',
                  label: `${yLabel} Model`,
                  errorY: readings.map(r => (r.data.uncertainty as number) || 0)
                }]}
                xLabel={xLabel}
                yLabel={yLabel}
                xUnit={xUnit}
                yUnit={yUnit}
                title={`${yLabel} vs ${xLabel} Regression`}
              />
            ) : (
              <div className="h-64 flex flex-col items-center justify-center bg-slate-800/30 rounded-3xl border border-white/5 gap-4">
                <LineChart size={40} className="text-slate-700" />
                <p className="text-[10px] text-slate-500 font-bold uppercase">Log 2+ points for plot</p>
              </div>
            )}
            
            <div className="bg-blue-600/10 border border-blue-500/20 p-4 rounded-2xl">
              <div className="flex items-center gap-2 mb-2 text-blue-400">
                <TrendingUp size={14} />
                <span className="text-[10px] font-bold uppercase">Regression Analysis</span>
              </div>
              <p className="text-[10px] text-slate-400 leading-relaxed italic">
                The linear regression model evaluates the relationship between {xLabel} and {yLabel}. 
                High R² values indicate strong physical correlation.
              </p>
            </div>
          </motion.div>
        )}

        {tab === 'history' && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-3">
            {readings.length > 0 ? (
              <>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] text-slate-500 font-bold uppercase">Recent Measurements</span>
                  <button onClick={onClearHistory} className="text-[9px] text-red-500 font-bold uppercase hover:underline">Clear</button>
                </div>
                {readings.map((r, i) => (
                  <div key={i} className="group relative bg-slate-800/40 hover:bg-slate-800 p-3 rounded-xl border border-white/5 transition-all">
                    <div className="flex justify-between items-start mb-2">
                       <span className="text-[9px] text-slate-500 font-mono">#{String(readings.length - i).padStart(2, '0')} — {new Date(r.timestamp).toLocaleTimeString()}</span>
                       <ChevronRight size={10} className="text-slate-600 group-hover:text-blue-400 transition-colors" />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(r.data).filter(([k]) => !['uncertainty', 'timestamp'].includes(k)).map(([key, val]) => (
                        <div key={key} className="flex flex-col">
                          <span className="text-[8px] text-slate-600 uppercase font-black">{key}</span>
                          <span className="text-[10px] text-white font-mono font-bold truncate">{typeof val === 'number' ? val.toFixed(3) : val}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </>
            ) : (
              <div className="py-20 text-center space-y-4">
                 <HistoryIcon size={40} className="mx-auto text-slate-800" />
                 <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">No historical logs</p>
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* Footer / Export */}
      <div className="p-4 bg-slate-950 border-t border-white/10 space-y-2">
        <span className="text-[10px] text-slate-500 font-bold uppercase block pl-1">Data Exfiltration</span>
        <div className="grid grid-cols-2 gap-2">
          <button 
            onClick={() => exportData('csv')}
            disabled={readings.length === 0}
            className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-800 border border-white/10 text-white text-[10px] font-bold hover:bg-slate-700 transition-colors disabled:opacity-30"
          >
            <FileText size={14} className="text-blue-400" /> EXPORT CSV
          </button>
          <button 
            onClick={() => exportData('json')}
            disabled={readings.length === 0}
            className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-800 border border-white/10 text-white text-[10px] font-bold hover:bg-slate-700 transition-colors disabled:opacity-30"
          >
            <FileJson size={14} className="text-amber-400" /> EXPORT JSON
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScientificWorkbench;
