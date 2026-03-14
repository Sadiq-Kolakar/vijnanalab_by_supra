
/**
 * LogicGatesLab
 * Features:
 *  - Interactive gate simulation
 *  - Visual wire glowing
 *  - Choice of multiple gates
 *  - Truth table view
 */
import React, { useState } from 'react';
import { Cpu, Power, Activity, Eye, RefreshCw, Zap, Check } from 'lucide-react';

interface LogicGatesLabProps {
  hex: string;
}

const LogicGatesLab: React.FC<LogicGatesLabProps> = ({ hex }) => {
  const [logic, setLogic] = useState({ a: false, b: false, type: 'AND' as 'AND' | 'OR' | 'NAND' | 'NOR' | 'XOR' });
  const [tab, setTab] = useState<'simulation' | 'truth-table' | 'guide'>('simulation');

  const calculateOutput = () => {
    if (logic.type === 'AND') return logic.a && logic.b;
    if (logic.type === 'OR') return logic.a || logic.b;
    if (logic.type === 'NAND') return !(logic.a && logic.b);
    if (logic.type === 'NOR') return !(logic.a || logic.b);
    if (logic.type === 'XOR') return logic.a !== logic.b;
    return false;
  };

  const output = calculateOutput();

  const truthTable = [
    { a: false, b: false },
    { a: false, b: true },
    { a: true,  b: false },
    { a: true,  b: true },
  ].map(row => {
    let res = false;
    if (logic.type === 'AND') res = row.a && row.b;
    if (logic.type === 'OR') res = row.a || row.b;
    if (logic.type === 'NAND') res = !(row.a && row.b);
    if (logic.type === 'NOR') res = !(row.a || row.b);
    if (logic.type === 'XOR') res = row.a !== row.b;
    return { ...row, out: res };
  });

  return (
    <div className="flex flex-col h-full bg-slate-100 dark:bg-slate-900 overflow-hidden">
      {/* Tab Bar */}
      <div className="flex border-b border-slate-200 dark:border-white/10 bg-white dark:bg-slate-950">
        {[
          { key: 'simulation', label: '⚡ Simulation' },
          { key: 'truth-table', label: '📊 Truth Table' },
          { key: 'guide', label: '📖 Guide' },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key as any)}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-colors ${tab === t.key
              ? 'border-purple-500 text-purple-600 dark:text-purple-400'
              : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-white'}`}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {tab === 'simulation' && (
          <div className="h-full flex flex-col items-center justify-center gap-12">
            <div className="relative flex items-center gap-12 bg-white dark:bg-slate-800 p-12 rounded-[32px] shadow-2xl border border-slate-200 dark:border-white/10">
              
              {/* Inputs */}
              <div className="flex flex-col gap-12">
                {[
                  { id: 'a', label: 'Input A', val: logic.a },
                  { id: 'b', label: 'Input B', val: logic.b },
                ].map(input => (
                  <div key={input.id} className="flex flex-col items-center gap-2">
                    <button 
                      onClick={() => setLogic(prev => ({ ...prev, [input.id]: !input.val }))}
                      className={`w-14 h-8 rounded-full p-1 transition-all duration-300 flex items-center ${input.val ? 'bg-green-500 justify-end' : 'bg-slate-300 dark:bg-slate-700 justify-start'}`}
                    >
                      <div className="w-6 h-6 bg-white rounded-full shadow-md" />
                    </button>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{input.label}</span>
                    <span className={`font-mono text-xl font-bold ${input.val ? 'text-green-500' : 'text-slate-400'}`}>{input.val ? '1' : '0'}</span>
                  </div>
                ))}
              </div>

              {/* Gate Visual */}
              <div className="relative group">
                {/* Visual Wires Inlet */}
                <div className={`absolute -left-12 top-4 w-12 h-1 transition-colors duration-500 ${logic.a ? 'bg-green-500 shadow-[0_0_10px_#22c55e]' : 'bg-slate-300 dark:bg-slate-700'}`} />
                <div className={`absolute -left-12 bottom-4 w-12 h-1 transition-colors duration-500 ${logic.b ? 'bg-green-500 shadow-[0_0_10px_#22c55e]' : 'bg-slate-300 dark:bg-slate-700'}`} />
                
                <div className="w-40 h-40 bg-slate-900 border-2 border-slate-700 rounded-2xl flex flex-col items-center justify-center relative overflow-hidden group-hover:border-purple-500 transition-colors">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent pointer-events-none" />
                  <Cpu size={56} className="text-purple-400 mb-2 animate-pulse" />
                  <span className="text-xl font-black text-white tracking-widest">{logic.type}</span>
                  <div className="text-[10px] text-slate-500 font-mono mt-1 tracking-tighter">74HC SERIES</div>
                </div>

                {/* Visual Wires Outlet */}
                <div className={`absolute -right-12 top-1/2 -translate-y-1/2 w-12 h-1 transition-colors duration-500 ${output ? 'bg-yellow-400 shadow-[0_0_15px_#facc15]' : 'bg-slate-300 dark:bg-slate-700'}`} />
              </div>

              {/* Output */}
              <div className="flex flex-col items-center gap-4">
                <div className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-500 ${output ? 'bg-yellow-400 shadow-[0_0_40px_rgba(250,204,21,0.5)] scale-110' : 'bg-slate-900 border border-slate-800'}`}>
                  <Zap size={32} className={output ? 'text-yellow-900' : 'text-slate-800'} />
                </div>
                <div className="text-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Result</span>
                  <span className={`font-mono text-2xl font-black ${output ? 'text-yellow-500' : 'text-slate-400'}`}>{output ? '1 (ON)' : '0 (OFF)'}</span>
                </div>
              </div>
            </div>

            {/* Selector */}
            <div className="flex flex-wrap justify-center gap-3">
              {['AND', 'OR', 'NAND', 'NOR', 'XOR'].map(type => (
                <button 
                  key={type} 
                  onClick={() => setLogic(prev => ({ ...prev, type: type as any }))}
                  className={`px-6 py-3 rounded-2xl font-black text-sm transition-all active:scale-95 ${logic.type === type 
                    ? 'bg-purple-600 text-white shadow-xl shadow-purple-600/30 -translate-y-1' 
                    : 'bg-white dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-white/5 hover:border-purple-500/50'}`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        )}

                {tab === 'truth-table' && (
          <div className="max-w-md mx-auto">
            <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-white/10 overflow-hidden shadow-xl">
              <div className="bg-purple-600 p-4 text-white font-bold text-center uppercase tracking-widest text-sm">
                Truth Table: {logic.type} Gate
              </div>
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-white/10">
                    <th className="p-4 text-slate-400 font-mono text-xs text-center border-r border-slate-200 dark:border-white/10 uppercase">Input A</th>
                    <th className="p-4 text-slate-400 font-mono text-xs text-center border-r border-slate-200 dark:border-white/10 uppercase">Input B</th>
                    <th className="p-4 text-purple-500 font-mono text-xs text-center uppercase">Output Y</th>
                  </tr>
                </thead>
                <tbody>
                  {truthTable.map((row) => (
                    <tr key={`${row.a}-${row.b}`} className={`border-b border-slate-100 dark:border-white/5 transition-colors ${row.a === logic.a && row.b === logic.b ? 'bg-purple-500/10' : ''}`}>
                      <td className="p-4 text-center border-r border-slate-200 dark:border-white/10 font-mono font-bold">{row.a ? '1' : '0'}</td>
                      <td className="p-4 text-center border-r border-slate-200 dark:border-white/10 font-mono font-bold">{row.b ? '1' : '0'}</td>
                      <td className={`p-4 text-center font-mono font-black ${row.out ? 'text-yellow-500' : 'text-slate-400'}`}>{row.out ? '1' : '0'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-center text-[10px] text-slate-500 mt-6 uppercase tracking-widest font-bold">Highlighting indicates current inputs</p>
          </div>
        )}

        {tab === 'guide' && (
          <div className="max-w-2xl mx-auto space-y-4">
            {[
              { title: 'Logic Gates', desc: 'The fundamental building blocks of digital circuits. Use the buttons below the simulation to switch between types.', icon: <Cpu className="text-purple-500"/> },
              { title: 'Binary States', desc: 'In digital logic, 1 (High/True) and 0 (Low/False) represent discrete voltage levels.', icon: <Power className="text-green-500"/> },
              { title: 'Truth Tables', desc: 'A mathematical table used in logic to determine the functional values of logical expressions.', icon: <Check className="text-blue-500"/> },
            ].map((item, i) => (
              <div key={i} className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-white/10 flex gap-6 shadow-sm">
                <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-900 flex items-center justify-center shrink-0">
                  {item.icon}
                </div>
                <div>
                  <h3 className="text-lg font-bold mb-1">{item.title}</h3>
                  <p className="text-sm text-slate-500 dark:text-gray-400 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LogicGatesLab;
