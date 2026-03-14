
import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Play, Pause, RotateCcw, Check, 
    Beaker, MousePointer2, 
    FlaskConical, Calculator, Plus, Minus, RefreshCw,
    Lightbulb, AlertTriangle, Gauge, ArrowRight, ArrowLeft, Cpu, Flame, Droplets, Ruler, Zap, Power, Eye, Microscope, Binary,
    Activity
} from 'lucide-react';
import ScientificPanel from './ScientificPanel';
import OhmsLawLab from './labs/OhmsLawLab';
import PendulumLab from './labs/PendulumLab';
import TitrationLab3D from './labs/TitrationLab3D';
import VernierCalipersLab3D from './labs/VernierCalipersLab3D';
import ConcaveMirrorLab3D from './labs/ConcaveMirrorLab3D';

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
    const [running, setRunning] = useState(false);
    
    // Physics State
    const [pendulum, setPendulum] = useState({ length: 1.0, angle: Math.PI/6, time: 0, period: 2.0 });
    const [vernier, setVernier] = useState({ pos: 0 }); // P1
    const [screw, setScrew] = useState({ rotation: 0 }); // P3
    const [mirror, setMirror] = useState({ u: 30 }); // P5 (u is taken as positive magnitude for slider, handled as negative in logic)

    // Chemistry State
    const [titration, setTitration] = useState({ vol: 0, running: false, flaskColor: '#e2e8f0' }); 

    // CS State
    const [logic, setLogic] = useState({ a: false, b: false, type: 'AND' }); // CS1

    // Reset State on Lab Change
    useEffect(() => {
        setRunning(false);
        setTitration({ vol: 0, running: false, flaskColor: '#e2e8f0' });
        setVernier({ pos: 0 });
        setScrew({ rotation: 0 });
        setMirror({ u: 30 });
        setLogic({ a: false, b: false, type: 'AND' });
        setPendulum({ length: 1.0, angle: Math.PI/6, time: 0, period: 2.0 });
    }, [labId]);

    // Animation Loops
    useEffect(() => {
        let interval: any;
        if (running) {
            interval = setInterval(() => {
                // Titration Animation
                if (labId === 'c1') {
                    setTitration(prev => {
                        if (prev.vol >= 50) { setRunning(false); return prev; }
                        const newVol = prev.vol + 0.2;
                        let color = '#e2e8f0'; 
                        if (newVol >= 20) color = '#fbcfe8'; // Pink
                        if (newVol >= 22) color = '#db2777'; // Dark Pink
                        return { ...prev, vol: newVol, flaskColor: color };
                    });
                }
                // Pendulum Animation
                if (labId === 'p2') {
                    setPendulum(prev => {
                        const t = prev.time + 0.05;
                        const w = Math.sqrt(9.8 / prev.length);
                        const angle = (Math.PI/6) * Math.cos(w * t);
                        return { ...prev, time: t, angle, period: 2 * Math.PI * Math.sqrt(prev.length/9.8) };
                    });
                }
            }, 50);
        }
        return () => clearInterval(interval);
    }, [running, labId]);

    // --- RENDERERS ---

    // P1: VERNIER CALIPERS — Full 3D visual lab
    if (labId === 'p1') {
        return <VernierCalipersLab3D hex={hex} />;
    }

    // P2: SIMPLE PENDULUM — Full interactive lab
    if (labId === 'p2') {
        return <PendulumLab hex={hex} />;
    }

    // P4: OHM'S LAW — Full interactive lab
    if (labId === 'p4') {
        return <OhmsLawLab hex={hex} />;
    }

    // P3: SCREW GAUGE
    if (labId === 'p3') {
        const pitch = 1; // 1mm
        const divisions = 100;
        const totalRotations = screw.rotation / divisions;
        const mainScaleReading = Math.floor(totalRotations); // mm
        const circularScaleReading = Math.round(screw.rotation % divisions);
        const reading = (mainScaleReading + (circularScaleReading * (pitch/divisions))).toFixed(2);
        
        // Visual calculations
        // 1 rotation moves thimble by 20px visually to reveal 1mm mark
        const pixelsPerMm = 20;
        const thimblePos = totalRotations * pixelsPerMm;

        return (
            <div className="flex h-full bg-slate-100 dark:bg-slate-900">
            <div className="flex flex-col flex-1 overflow-hidden">
                <div className="flex-1 flex flex-col items-center justify-center relative p-8 select-none">
                    <div className="relative flex items-center scale-125 md:scale-150 transform transition-transform">
                        
                        {/* U-Frame */}
                        <div className="w-10 h-32 border-[12px] border-slate-700 rounded-l-full border-r-0 relative">
                            {/* Anvil */}
                            <div className="absolute top-1/2 -translate-y-1/2 right-[-10px] w-4 h-3 bg-slate-400 border border-slate-600"></div>
                        </div>
                        
                        {/* Gap/Object */}
                        <div className="w-16 h-32 flex items-center justify-center relative">
                             {/* Wire Object appearing when jaws open */}
                             <div className="h-3 bg-yellow-500 border border-yellow-700 absolute left-[-10px]" style={{ width: `${Math.min(60, thimblePos)}px`, opacity: thimblePos > 0 ? 1 : 0 }}></div>
                        </div>

                        {/* Spindle (Moves with thimble) */}
                        <div className="absolute h-3 bg-slate-400 border border-slate-600 left-[40px] top-[58px]" style={{ width: `${60 - Math.min(60, thimblePos)}px` }}></div>

                        {/* Main Scale Sleeve (Fixed) */}
                        <div className="w-40 h-10 bg-gradient-to-b from-gray-200 to-gray-400 border border-gray-600 flex items-center relative overflow-hidden">
                            <div className="absolute top-1/2 w-full h-[1px] bg-black"></div>
                            {/* MM Marks */}
                            {Array.from({length: 15}).map((_, i) => (
                                <div key={i} className="absolute" style={{ left: `${i * pixelsPerMm + 10}px` }}>
                                    <div className="w-[1px] h-2 bg-black absolute bottom-5"></div> {/* Top mark */}
                                    {/* <div className="w-[1px] h-1.5 bg-black absolute top-5 left-[10px]"></div> Half mm */}
                                    {i % 5 === 0 && <span className="text-[8px] font-bold absolute top-1 -left-1">{i}</span>}
                                </div>
                            ))}
                        </div>

                        {/* Thimble (Rotating & Moving) */}
                        <div 
                            className="w-32 h-14 bg-gradient-to-b from-gray-300 to-gray-500 border border-gray-700 rounded-r shadow-[5px_5px_15px_rgba(0,0,0,0.3)] flex items-center relative z-10"
                            style={{ marginLeft: `-${160 - thimblePos}px` }} // Starts covering scale
                        >
                             {/* Beveled Edge with ticks */}
                             <div className="w-8 h-full border-r border-gray-600 bg-gray-300 relative overflow-hidden">
                                 <div 
                                    className="absolute w-full h-[200%] top-[-50%]"
                                    style={{ transform: `translateY(${-(circularScaleReading * 3)}px)` }}
                                 >
                                     {/* Render vertical ticks simulation */}
                                     {Array.from({length: 120}).map((_, i) => {
                                         const val = i % 100;
                                         return (
                                            <div key={i} className="h-[3px] w-full flex items-center justify-end pr-1 relative">
                                                <div className={`bg-black ${val % 5 === 0 ? 'w-4' : 'w-2'} h-[1px]`}></div>
                                                {val % 10 === 0 && <span className="text-[8px] absolute right-5">{val}</span>}
                                            </div>
                                         )
                                     })}
                                 </div>
                             </div>
                             {/* Knurling Pattern */}
                             <div className="flex-1 h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-30"></div>
                        </div>

                        {/* Ratchet */}
                        <div className="w-6 h-6 bg-slate-800 rounded-r ml-[-2px] z-0"></div>
                    </div>
                </div>
                
                <div className="bg-white dark:bg-slate-950 p-6 z-40 border-t border-slate-200 dark:border-white/10 flex gap-8 items-center">
                    <div className="flex-1">
                        <label className="text-xs text-slate-500 font-bold uppercase mb-2 block">Rotate Thimble</label>
                        <input
                            type="range" min="0" max="1000" step="1"
                            value={screw.rotation}
                            onChange={(e)=>setScrew({rotation: parseInt(e.target.value)})}
                            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                        />
                    </div>
                    <div className="text-right bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-white/10">
                        <div className="text-xs text-slate-500 uppercase font-bold">Diameter</div>
                        <div className="text-2xl font-mono font-bold text-blue-600 dark:text-blue-400">{reading} mm</div>
                    </div>
                </div>
            </div>
            <ScientificPanel labId="p3" hex={hex} sliderValue={screw.rotation} />
        </div>
        );
    }

    // P5: CONCAVE MIRROR — Full 3D visual lab
    if (labId === 'p5') {
        return <ConcaveMirrorLab3D hex={hex} />;
    }

    // CS1: LOGIC GATES
    if (labId === 'cs1') {
        const calculateOutput = () => {
            if (logic.type === 'AND') return logic.a && logic.b;
            if (logic.type === 'OR') return logic.a || logic.b;
            if (logic.type === 'NAND') return !(logic.a && logic.b);
            if (logic.type === 'NOR') return !(logic.a || logic.b);
            if (logic.type === 'XOR') return logic.a !== logic.b;
            return false;
        };
        const output = calculateOutput();

        return (
            <div className="flex flex-col h-full bg-slate-100 dark:bg-slate-900">
                <div className="flex-1 flex flex-col items-center justify-center relative bg-grid-pattern">
                    <div className="bg-slate-800 p-8 rounded-3xl shadow-2xl border-4 border-slate-600 flex items-center gap-8">
                        <div className="flex flex-col gap-8">
                            <div className="flex items-center gap-3">
                                <span className="text-white font-bold">A</span>
                                <button onClick={() => setLogic({...logic, a: !logic.a})} 
                                    className={`w-16 h-8 rounded-full transition-colors flex items-center px-1 ${logic.a ? 'bg-green-500 justify-end' : 'bg-red-500 justify-start'}`}>
                                    <div className="w-6 h-6 bg-white rounded-full shadow"></div>
                                </button>
                                <span className="text-mono text-white">{logic.a ? '1' : '0'}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-white font-bold">B</span>
                                <button onClick={() => setLogic({...logic, b: !logic.b})} 
                                    className={`w-16 h-8 rounded-full transition-colors flex items-center px-1 ${logic.b ? 'bg-green-500 justify-end' : 'bg-red-500 justify-start'}`}>
                                    <div className="w-6 h-6 bg-white rounded-full shadow"></div>
                                </button>
                                <span className="text-mono text-white">{logic.b ? '1' : '0'}</span>
                            </div>
                        </div>
                        <div className="w-32 h-32 bg-slate-700 border border-slate-500 rounded-xl flex flex-col items-center justify-center relative">
                            <Cpu size={48} className="text-purple-400 mb-2"/>
                            <span className="text-white font-bold">{logic.type}</span>
                            {/* Visual Wires */}
                            <div className="absolute left-[-32px] top-8 w-8 h-1 bg-gray-400"></div>
                            <div className="absolute left-[-32px] bottom-8 w-8 h-1 bg-gray-400"></div>
                            <div className="absolute right-[-32px] top-1/2 w-8 h-1 bg-gray-400"></div>
                        </div>
                        <div className="flex flex-col items-center">
                            <div className={`w-16 h-16 rounded-full shadow-lg mb-2 transition-all duration-300 ${output ? 'bg-yellow-400 shadow-yellow-400/50 scale-110' : 'bg-gray-900 border border-gray-700'}`}></div>
                            <span className="text-white font-mono">{output ? '1 (ON)' : '0 (OFF)'}</span>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-950 p-6 z-40 border-t border-slate-200 dark:border-white/10 flex justify-center gap-4 flex-wrap">
                    {['AND', 'OR', 'NAND', 'NOR', 'XOR'].map(type => (
                        <button 
                            key={type} 
                            onClick={() => setLogic({...logic, type: type as any})}
                            className={`px-4 py-2 rounded-lg font-bold transition-colors ${logic.type === type ? 'bg-purple-600 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'}`}
                        >
                            {type}
                        </button>
                    ))}
                </div>
            </div>
        );
    }

    // C1: TITRATION — Full 3D visual lab
    if (labId === 'c1') {
        return <TitrationLab3D hex={hex} />;
    }

    // Fallback for others to procedural
    const scenario = LAB_SCENARIOS[labId];
    if (scenario) return <RichProceduralLab scenario={scenario} labId={labId} hex={hex} />;

    // --- GENERIC FALLBACK (If somehow still missing) ---
    return <div className="flex items-center justify-center h-full text-gray-500 bg-slate-100 dark:bg-slate-900"><div className="text-center"><FlaskConical size={48} className="mx-auto mb-4 opacity-20" /><p>Select a specific module to begin.</p></div></div>;
};

export default SimulationStage;
