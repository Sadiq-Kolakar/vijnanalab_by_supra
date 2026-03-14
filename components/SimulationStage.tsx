import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
    Play, Pause, RotateCcw, Check, 
    Beaker, MousePointer2, 
    FlaskConical, Calculator, RefreshCw,
    Lightbulb, AlertTriangle, Gauge, ArrowRight, ArrowLeft, Cpu, Flame, Droplets, Ruler, Zap, Eye, Microscope, Binary, Power,
    Activity
} from 'lucide-react';
import ScientificPanel from './ScientificPanel';
import OhmsLawLab from './labs/OhmsLawLab';
import PendulumLab from './labs/PendulumLab';
import TitrationLab3D from './labs/TitrationLab3D';
import VernierCalipersLab3D from './labs/VernierCalipersLab3D';
import ConcaveMirrorLab3D from './labs/ConcaveMirrorLab3D';
import ScrewGaugeLab3D from './labs/ScrewGaugeLab3D';
import LogicGatesLab from './labs/LogicGatesLab';
import ScientificWorkbench from './ScientificWorkbench';

interface SimulationStageProps {
  subjectId: string;
  labId: string;
  hex: string;
  isActive: boolean;
}

// Fix for Framer Motion type definitions in strict environments
const MotionDiv = motion.div as any;

// --- RICH PROCEDURAL ENGINE (Fallback for Math/Theory heavy labs) ---

interface SimStep {
    step: number;
    instruction: string;
    user_action: string;
    icon?: React.ReactNode;
    animation?: string;
    output_change?: string;
}

interface UniversalScenario {
    title: string;
    color: string; // Hex code
    simulation_steps: SimStep[];
    interactive_controls?: {
        buttons: string[];
        inputs: string[];
    };
    tooltips?: string[];
    realtime_outputs?: string[];
    warnings?: string[];
    result_summary: string;
    fact?: string;
}

const RichProceduralLab = ({ 
    scenario,
    labId,
    hex,
}: { 
    scenario: UniversalScenario;
    labId: string;
    hex: string;
}) => {
    const { title, simulation_steps, color, result_summary, fact, warnings } = scenario;
    const [currentStep, setCurrentStep] = useState(0);
    const [animating, setAnimating] = useState(false);
    const [feedbackMsg, setFeedbackMsg] = useState("");
    const isComplete = currentStep >= simulation_steps.length;

    const handleAction = () => {
        if (isComplete) return;
        setAnimating(true);
        setFeedbackMsg(simulation_steps[currentStep].output_change || "Processing...");
        
        setTimeout(() => {
            setAnimating(false);
            setCurrentStep(p => p + 1);
            setFeedbackMsg("");
        }, 1500);
    };

    return (
        <div className="flex md:flex-row h-full w-full bg-slate-100 dark:bg-slate-900 transition-colors">
            {/* Visual Stage */}
            <div className="flex-1 relative p-8 flex items-center justify-center overflow-hidden bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-200 to-slate-300 dark:from-slate-800 dark:to-slate-900 transition-all">
                {/* Warnings Overlay */}
                {warnings && warnings.length > 0 && (
                     <div className="absolute top-4 right-4 flex flex-col gap-2">
                         {warnings.map((w, i) => (
                             <div key={i} className="bg-red-500/20 border border-red-500/50 p-2 rounded-lg flex items-center gap-2 animate-pulse">
                                 <AlertTriangle size={14} className="text-red-600 dark:text-red-400"/>
                                 <span className="text-xs text-red-800 dark:text-red-200">{w}</span>
                             </div>
                         ))}
                     </div>
                )}

                <div className="relative z-10 flex flex-col items-center">
                    <div 
                        className={`w-64 h-64 rounded-3xl flex items-center justify-center relative overflow-hidden shadow-2xl border border-slate-200 dark:border-white/10 transition-all duration-500 bg-white dark:bg-white/5 ${animating ? 'scale-105' : ''}`}
                        style={{ boxShadow: animating ? `0 0 30px ${color}40` : '' }}
                    >
                        <MotionDiv 
                            key={currentStep}
                            initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                            className="text-slate-700 dark:text-white/80"
                        >
                            {isComplete ? <Check size={80} style={{color}} /> : (simulation_steps[currentStep]?.icon || <Beaker size={80} style={{color}} />)}
                        </MotionDiv>
                        
                        {animating && (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="absolute inset-0 bg-white/60 dark:bg-black/60 backdrop-blur-sm"></div>
                                <div className="relative z-10 flex flex-col items-center">
                                    <RefreshCw className="animate-spin text-slate-800 dark:text-white mb-2" size={32} />
                                    <span className="text-xs font-bold text-slate-800 dark:text-white tracking-wider uppercase">{feedbackMsg}</span>
                                </div>
                            </div>
                        )}

                        {/* Progress Ring */}
                        <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none">
                            <circle cx="50%" cy="50%" r="120" fill="none" stroke="rgba(128,128,128,0.1)" strokeWidth="4" />
                            <circle 
                                cx="50%" cy="50%" r="120" fill="none" stroke={color} strokeWidth="4" 
                                strokeDasharray="754" 
                                strokeDashoffset={754 - (754 * (currentStep / simulation_steps.length))} 
                                className="transition-all duration-1000 ease-out"
                            />
                        </svg>
                    </div>
                    
                    {fact && (
                        <MotionDiv initial={{opacity: 0, y: 20}} animate={{opacity: 1, y: 0}} className="mt-8 max-w-md bg-white/60 dark:bg-white/5 p-4 rounded-xl border border-slate-200 dark:border-white/5 flex gap-3 items-start shadow-sm">
                            <Lightbulb size={20} className="text-yellow-500 dark:text-yellow-400 shrink-0 mt-1" />
                            <div>
                                <h4 className="text-xs font-bold text-yellow-600 dark:text-yellow-400 uppercase mb-1">Did You Know?</h4>
                                <p className="text-xs text-slate-600 dark:text-gray-400 leading-relaxed">{fact}</p>
                            </div>
                        </MotionDiv>
                    )}
                </div>
            </div>

            {/* Controls Panel */}
            <div className="w-full md:w-96 bg-white dark:bg-slate-950 border-l border-slate-200 dark:border-white/10 flex flex-col transition-colors">
                <div className="p-6 border-b border-slate-200 dark:border-white/10">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">{title}</h2>
                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-gray-400">
                        <span 
                            className="px-2 py-0.5 rounded border"
                            style={{ backgroundColor: `${color}15`, color: color, borderColor: `${color}30` }}
                        >
                            Simulation
                        </span>
                        <span>Step {Math.min(currentStep + 1, simulation_steps.length)} of {simulation_steps.length}</span>
                    </div>
                </div>

                <div className="flex-1 p-6 overflow-y-auto">
                    {isComplete ? (
                        <div className="bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 rounded-xl p-6 text-center">
                            <div className="w-12 h-12 bg-green-100 dark:bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Check className="text-green-600 dark:text-green-400" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Lab Completed!</h3>
                            <p className="text-sm text-slate-600 dark:text-gray-400 mb-6">{result_summary}</p>
                            <button onClick={() => setCurrentStep(0)} className="text-sm text-green-600 dark:text-green-400 hover:underline flex items-center justify-center gap-1">
                                <RotateCcw size={14}/> Restart Experiment
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="bg-slate-50 dark:bg-white/5 rounded-xl p-5 border border-slate-200 dark:border-white/10">
                                <h3 className="text-sm font-bold text-slate-500 dark:text-gray-400 uppercase mb-3">Instruction</h3>
                                <p className="text-lg text-slate-800 dark:text-white font-medium leading-snug">{simulation_steps[currentStep].instruction}</p>
                            </div>
                            
                            <button 
                                onClick={handleAction}
                                disabled={animating}
                                className="w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group active:scale-[0.98]"
                                style={{backgroundColor: color, boxShadow: `0 10px 20px -10px ${color}60` }}
                            >
                                {animating ? <RefreshCw className="animate-spin" /> : <MousePointer2 className="group-hover:-translate-y-1 transition-transform" />}
                                {simulation_steps[currentStep].user_action}
                            </button>
                        </div>
                    )}
                </div>
            </div>
            <ScientificPanel labId={labId} hex={hex} />
        </div>
    );
};

// --- SCENARIO DATABASE ---
const LAB_SCENARIOS: Record<string, UniversalScenario> = {
    // PHYSICS FALLBACK
    'p4': { title: "Ohm's Law", color: "#3b82f6", simulation_steps: [{step: 1, instruction: "Connect Battery, Ammeter, and Voltmeter.", user_action: "Connect Circuit", icon: <Zap size={64}/>}, {step: 2, instruction: "Adjust Rheostat to 10 Ohms.", user_action: "Set Resistance", icon: <Gauge size={64}/>}, {step: 3, instruction: "Note Voltage (V) and Current (I).", user_action: "Record Readings", icon: <Check size={64}/>}, {step: 4, instruction: "Plot Graph V vs I.", user_action: "Plot Graph", icon: <Activity size={64}/>}], result_summary: "Graph is linear. Ohm's Law verified.", fact: "V = IR is the fundamental law of circuits." },
    
    // CHEMISTRY FALLBACKS
    'c2': { title: "Salt Analysis", color: "#10b981", simulation_steps: [{step: 1, instruction: "Take salt in a test tube.", user_action: "Pick Salt", icon: <FlaskConical size={64}/>}, {step: 2, instruction: "Add Dilute HCl (Group 1 Reagent).", user_action: "Add Acid", icon: <Droplets size={64}/>}, {step: 3, instruction: "Observe for effervescence or precipitate.", user_action: "Observe", icon: <Eye size={64}/>}, {step: 4, instruction: "Perform Flame Test.", user_action: "Heat", icon: <Flame size={64}/>}], result_summary: "Cation identified successfully.", warnings: ["Handle Acid with Care"] },
    'c3': { title: "pH Determination", color: "#10b981", simulation_steps: [{step: 1, instruction: "Dip pH paper in Lemon Juice.", user_action: "Dip Paper", icon: <Droplets size={64}/>}, {step: 2, instruction: "Observe color change to Red.", user_action: "Check Color", icon: <Eye size={64}/>}, {step: 3, instruction: "Compare with pH Scale.", user_action: "Match", icon: <Ruler size={64}/>}], result_summary: "pH is approx 2.5 (Acidic)." },
    'c4': { title: "Functional Groups", color: "#10b981", simulation_steps: [{step: 1, instruction: "Add Tollen's Reagent to sample.", user_action: "Add Reagent", icon: <FlaskConical size={64}/>}, {step: 2, instruction: "Heat in water bath.", user_action: "Heat", icon: <Flame size={64}/>}, {step: 3, instruction: "Look for Silver Mirror.", user_action: "Observe", icon: <Eye size={64}/>}], result_summary: "Aldehyde group confirmed." },
    'c5': { title: "Exothermic Reaction", color: "#10b981", simulation_steps: [{step: 1, instruction: "Measure initial temp of HCl.", user_action: "Measure T1", icon: <Calculator size={64}/>}, {step: 2, instruction: "Measure initial temp of NaOH.", user_action: "Measure T2", icon: <Calculator size={64}/>}, {step: 3, instruction: "Mix solutions in calorimeter.", user_action: "Mix", icon: <RefreshCw size={64}/>}, {step: 4, instruction: "Note rise in temperature.", user_action: "Record Final T", icon: <Flame size={64}/>}], result_summary: "Reaction is Exothermic." },

    // BIOLOGY FALLBACKS
    'b1': { title: "Mitosis", color: "#65a30d", simulation_steps: [{step: 1, instruction: "Place onion root tip slide on stage.", user_action: "Mount Slide", icon: <Microscope size={64}/>}, {step: 2, instruction: "Adjust coarse focus.", user_action: "Focus", icon: <Eye size={64}/>}, {step: 3, instruction: "Locate dividing cells.", user_action: "Search", icon: <Check size={64}/>}], result_summary: "Stages of division observed." },
    'b2': { title: "Stomata", color: "#65a30d", simulation_steps: [{step: 1, instruction: "Peel leaf epidermis.", user_action: "Peel", icon: <MousePointer2 size={64}/>}, {step: 2, instruction: "Stain with Safranin.", user_action: "Stain", icon: <Droplets size={64}/>}, {step: 3, instruction: "Count stomata in field of view.", user_action: "Count", icon: <Calculator size={64}/>}], result_summary: "Stomatal index calculated." },
    'b3': { title: "Osmosis", color: "#65a30d", simulation_steps: [{step: 1, instruction: "Scoop potato cavity.", user_action: "Prepare", icon: <MousePointer2 size={64}/>}, {step: 2, instruction: "Fill with sugar solution.", user_action: "Fill", icon: <Droplets size={64}/>}, {step: 3, instruction: "Place in water beaker.", user_action: "Place", icon: <FlaskConical size={64}/>}, {step: 4, instruction: "Wait and observe level rise.", user_action: "Observe", icon: <ArrowRight size={64} className="-rotate-90"/>}], result_summary: "Level rose due to Endosmosis." },
    'b4': { title: "Urine Sugar Test", color: "#65a30d", simulation_steps: [{step: 1, instruction: "Take 2ml Urine sample.", user_action: "Pipette", icon: <FlaskConical size={64}/>}, {step: 2, instruction: "Add Benedict's Reagent.", user_action: "Add Reagent", icon: <Droplets size={64}/>}, {step: 3, instruction: "Boil for 2 minutes.", user_action: "Boil", icon: <Flame size={64}/>}, {step: 4, instruction: "Observe Brick Red ppt.", user_action: "Check Result", icon: <Eye size={64}/>}], result_summary: "Presence of Glucose confirmed." },
    'b5': { title: "Chromatography", color: "#65a30d", simulation_steps: [{step: 1, instruction: "Apply spinach extract spot.", user_action: "Spot", icon: <MousePointer2 size={64}/>}, {step: 2, instruction: "Dip paper in solvent jar.", user_action: "Dip", icon: <FlaskConical size={64}/>}, {step: 3, instruction: "Watch solvent rise.", user_action: "Wait", icon: <ArrowRight size={64} className="-rotate-90"/>}, {step: 4, instruction: "Mark pigment bands.", user_action: "Analyze", icon: <Ruler size={64}/>}], result_summary: "Pigments separated based on solubility." },

    // MATH SCENARIOS
    'm1': { title: "Graphing", color: "#8b5cf6", simulation_steps: [{step: 1, instruction: "Enter function f(x) = x².", user_action: "Input", icon: <Calculator size={64}/>}, {step: 2, instruction: "Calculate f(x) for x = -2, -1, 0, 1, 2.", user_action: "Calculate", icon: <Calculator size={64}/>}, {step: 3, instruction: "Plot points.", user_action: "Plot", icon: <MousePointer2 size={64}/>}, {step: 4, instruction: "Join curve.", user_action: "Draw", icon: <Activity size={64}/>}], result_summary: "Parabolic curve obtained." },
    'm2': { title: "Integration", color: "#8b5cf6", simulation_steps: [{step: 1, instruction: "Select function.", user_action: "Select", icon: <MousePointer2 size={64}/>}, {step: 2, instruction: "Define limits a to b.", user_action: "Limits", icon: <Ruler size={64}/>}, {step: 3, instruction: "Sum rectangular strips.", user_action: "Integrate", icon: <Calculator size={64}/>}], result_summary: "Area under curve calculated." },
    'm3': { title: "Unit Circle", color: "#8b5cf6", simulation_steps: [{step: 1, instruction: "Draw circle radius 1.", user_action: "Draw", icon: <MousePointer2 size={64}/>}, {step: 2, instruction: "Mark point P(x,y).", user_action: "Mark", icon: <MousePointer2 size={64}/>}, {step: 3, instruction: "Drop perpendicular.", user_action: "Measure", icon: <Ruler size={64}/>}], result_summary: "Sin² + Cos² = 1 verified." },
    'm4': { title: "Conics", color: "#8b5cf6", simulation_steps: [{step: 1, instruction: "Fix focus and directrix.", user_action: "Setup", icon: <MousePointer2 size={64}/>}, {step: 2, instruction: "Plot points equidistant.", user_action: "Plot", icon: <MousePointer2 size={64}/>}, {step: 3, instruction: "Trace locus.", user_action: "Trace", icon: <Activity size={64}/>}], result_summary: "Parabola constructed." },
    'm5': { title: "Vectors", color: "#8b5cf6", simulation_steps: [{step: 1, instruction: "Define vector A.", user_action: "Vector A", icon: <ArrowRight size={64}/>}, {step: 2, instruction: "Define vector B.", user_action: "Vector B", icon: <ArrowRight size={64}/>}, {step: 3, instruction: "Compute Cross Product.", user_action: "Compute", icon: <Calculator size={64}/>}], result_summary: "Orthogonal vector obtained." },
    
    // CS SCENARIOS
    'cs2': { title: "Bubble Sort", color: "#a855f7", simulation_steps: [{step: 1, instruction: "Initialize array [5, 1, 4, 2].", user_action: "Start", icon: <Cpu size={64}/>, output_change: "Array Loaded"}, {step: 2, instruction: "Compare 5 & 1. Swap.", user_action: "Swap", icon: <RefreshCw size={64}/>, output_change: "1, 5, 4, 2"}, {step: 3, instruction: "Compare 5 & 4. Swap.", user_action: "Swap", icon: <RefreshCw size={64}/>, output_change: "1, 4, 5, 2"}, {step: 4, instruction: "Compare 5 & 2. Swap.", user_action: "Swap", icon: <RefreshCw size={64}/>, output_change: "1, 4, 2, 5 (Sorted End)"}], result_summary: "Largest element bubbled to end." },
    'cs3': { title: "Insertion Sort", color: "#a855f7", simulation_steps: [{step: 1, instruction: "Array [5, 2, 9, 1]. Pick 2.", user_action: "Pick", icon: <MousePointer2 size={64}/>, output_change: "2 picked"}, {step: 2, instruction: "Insert 2 before 5.", user_action: "Insert", icon: <ArrowLeft size={64}/>, output_change: "2, 5, 9, 1"}, {step: 3, instruction: "Pick 9. Place remains same.", user_action: "Check", icon: <Check size={64}/>, output_change: "2, 5, 9, 1"}, {step: 4, instruction: "Pick 1. Insert at start.", user_action: "Insert", icon: <ArrowLeft size={64}/>, output_change: "1, 2, 5, 9"}], result_summary: "Array sorted by building sorted list." },
    'cs4': { title: "Stack Operations", color: "#a855f7", simulation_steps: [{step: 1, instruction: "Push 'A' onto stack.", user_action: "Push", icon: <ArrowRight size={64} className="-rotate-90"/>, output_change: "Stack: [A]"}, {step: 2, instruction: "Push 'B' onto stack.", user_action: "Push", icon: <ArrowRight size={64} className="-rotate-90"/>, output_change: "Stack: [A, B]"}, {step: 3, instruction: "Pop element.", user_action: "Pop", icon: <ArrowRight size={64} className="rotate-90"/>, output_change: "Returned: B"}, {step: 4, instruction: "Peek top.", user_action: "Peek", icon: <Eye size={64}/>, output_change: "Top: A"}], result_summary: "LIFO Principle demonstrated." },
    'cs5': { title: "Number Systems", color: "#94a3b8", simulation_steps: [ { step: 1, instruction: "Choose binary number 1010.", user_action: "Input", icon: <Binary size={64} className="text-slate-400"/>, output_change: "Input: 1010" }, { step: 2, instruction: "Identify positions: 8, 4, 2, 1.", user_action: "Parse", icon: <Gauge size={64} className="text-slate-400"/>, output_change: "Weights identified" }, { step: 3, instruction: "Sum weights of '1' bits: 8 + 2.", user_action: "Add", icon: <Calculator size={64} className="text-slate-400"/>, output_change: "Sum = 10" }, { step: 4, instruction: "Result is 10.", user_action: "Finish", icon: <Check size={64} className="text-slate-400"/>, output_change: "Conversion Done" } ], result_summary: "Binary 1010 equals Decimal 10.", fact: "Binary is base-2." }
};

// --- MAIN STAGE ---
const SimulationStage: React.FC<SimulationStageProps> = ({ subjectId, labId, hex, isActive }) => {
    const [history, setHistory] = useState<any[]>([]);
    const [wbOpen, setWbOpen] = useState(false);

    // Reset State on Lab Change
    useEffect(() => {
        setHistory([]);
    }, [labId]);

    const logMeasurement = (data: Record<string, any>) => {
        setHistory(prev => [{
            timestamp: Date.now(),
            data
        }, ...prev]);
    };

    // Workbench configs per lab
    const wbConfig = useMemo(() => {
        switch(labId) {
            case 'p1': return { xKey: 'id', yKey: 'diameter', xLabel: 'Run #', yLabel: 'Diameter', xUnit: '', yUnit: 'mm' };
            case 'p3': return { xKey: 'id', yKey: 'thickness', xLabel: 'Run #', yLabel: 'Thickness', xUnit: '', yUnit: 'mm' };
            case 'p4': return { xKey: 'I', yKey: 'V', xLabel: 'Current', yLabel: 'Voltage', xUnit: 'A', yUnit: 'V' };
            default: return { xKey: 'timestamp', yKey: 'value', xLabel: 'Time', yLabel: 'Value', xUnit: 's', yUnit: '' };
        }
    }, [labId]);

    // --- RENDERERS ---

    // Fallback for others to procedural
    const scenario = LAB_SCENARIOS[labId];
    let content = <div className="flex items-center justify-center h-full text-gray-500 bg-slate-100 dark:bg-slate-900"><div className="text-center"><FlaskConical size={48} className="mx-auto mb-4 opacity-20" /><p>Select a specific module to begin.</p></div></div>;

    if (labId === 'p1') content = <VernierCalipersLab3D hex={hex} onLog={logMeasurement} />;
    else if (labId === 'p2') content = <PendulumLab hex={hex} />;
    else if (labId === 'p4') content = <OhmsLawLab hex={hex} onLog={logMeasurement} />;
    else if (labId === 'p3') content = <ScrewGaugeLab3D hex={hex} onLog={logMeasurement} />;
    else if (labId === 'p5') content = <ConcaveMirrorLab3D hex={hex} />;
    else if (labId === 'cs1') content = <LogicGatesLab hex={hex} />;
    else if (labId === 'c1') content = <TitrationLab3D hex={hex} />;
    else if (scenario) content = <RichProceduralLab scenario={scenario} labId={labId} hex={hex} />;

    return (
        <div className="flex h-full w-full overflow-hidden">
            <div className="flex-1 flex flex-col relative h-full">
                {content}
                
                {/* Workbench Toggle */}
                <button 
                  onClick={() => setWbOpen(!wbOpen)}
                  className="absolute bottom-6 right-6 p-3 rounded-full bg-blue-600 text-white shadow-2xl hover:scale-110 active:scale-95 transition-all z-50 group"
                  title="Open Scientific Workbench"
                >
                  <Database size={20} className={wbOpen ? 'rotate-180' : ''} transition-transform />
                  {history.length > 0 && !wbOpen && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-[10px] flex items-center justify-center font-bold">
                      {history.length}
                    </span>
                  )}
                </button>
            </div>

            <AnimatePresence>
                {wbOpen && (
                    <motion.div 
                        initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
                        className="h-full z-[60]"
                    >
                        <ScientificWorkbench 
                            labId={labId}
                            readings={history}
                            onClearHistory={() => setHistory([])}
                            {...wbConfig}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default SimulationStage;
