
import React from 'react';
import { motion } from 'framer-motion';
import { 
  Zap, Brain, Cpu, FlaskConical, 
  Eye, Sliders, BarChart3, ChevronRight 
} from 'lucide-react';
import GlassCard from './GlassCard';

const MotionDiv = motion.div as any;

const PIPELINE_STEPS = [
  {
    phase: "01",
    title: "Concept Input",
    desc: "The student enters a scientific inquiry in natural language (e.g., 'How does the concentration of HCl affect the rate of reaction with Mg?').",
    icon: Zap,
    color: "amber"
  },
  {
    phase: "02",
    title: "Semantic Analysis",
    desc: "Our LLM-driven engine parses the query to identify independent/dependent variables, required physical constants, and relevant thermal/chemical laws.",
    icon: Brain,
    color: "indigo"
  },
  {
    phase: "03",
    title: "Architectural Blueprinting",
    desc: "The system generates a structured JSON schema defining the apparatus, initialization parameters, and safety boundaries for the session.",
    icon: Cpu,
    color: "emerald"
  },
  {
    phase: "04",
    title: "Simulation Synthesis",
    desc: "A headless physics/chemistry engine calculates the mathematical outcome of every interaction using real-time differential equations.",
    icon: FlaskConical,
    color: "sky"
  },
  {
    phase: "05",
    title: "Dynamic Rendering",
    desc: "Translates raw data into high-fidelity 3D assets or SVG-based fluid animations for visual immersion.",
    icon: Eye,
    color: "violet"
  },
  {
    phase: "06",
    title: "Interactive Feedback",
    desc: "Students manipulate parameters like Force, Molarity, or Heat through glass-morphic sliders, triggering instant re-simulation.",
    icon: Sliders,
    color: "rose"
  },
  {
    phase: "07",
    title: "Analytical Synthesis",
    desc: "The system visualizes the results through dynamic charts and provides an AI-summarized conclusion of the discovery.",
    icon: BarChart3,
    color: "emerald"
  }
];

const AIPipeline: React.FC = () => {
    return (
        <div className="py-20">
            <div className="text-center mb-16 space-y-4">
                <h2 className="text-3xl md:text-5xl font-display font-bold text-white text-glow">How the Lab Generation <br/>Pipeline Works</h2>
                <p className="text-slate-400 max-w-2xl mx-auto font-light leading-relaxed italic">
                    Seamlessly bridging the gap between a student's curiosity and a functional virtual simulation.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 px-4">
                {PIPELINE_STEPS.map((step, index) => (
                    <MotionDiv
                        key={step.phase}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        viewport={{ once: true }}
                        className="relative group"
                    >
                        {index < PIPELINE_STEPS.length - 1 && (
                            <div className="hidden lg:block absolute top-10 -right-4 z-0 opacity-20 group-hover:opacity-100 transition-opacity">
                                <ChevronRight className="text-white w-6 h-6" />
                            </div>
                        )}
                        
                        <GlassCard color={step.color as any} className="h-full !p-8 border-white/5 hover:border-white/20 transition-all flex flex-col group overflow-hidden">
                            <div className="absolute -top-4 -right-4 text-6xl font-display font-black text-white/5 group-hover:text-white/10 transition-colors">
                                {step.phase}
                            </div>
                            
                            <div className={`p-4 rounded-2xl bg-${step.color}-500/10 mb-6 inline-flex`}>
                                <step.icon className={`text-${step.color}-500 w-8 h-8`} />
                            </div>
                            
                            <h3 className="text-xl font-bold text-white mb-3 tracking-tight">{step.title}</h3>
                            <p className="text-sm text-slate-400 leading-relaxed font-light flex-1">
                                {step.desc}
                            </p>
                        </GlassCard>
                    </MotionDiv>
                ))}
                
                {/* Final Connect Card */}
                <MotionDiv
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="lg:col-span-1"
                >
                    <div className="h-full rounded-3xl bg-gradient-to-br from-indigo-600/20 to-emerald-600/20 border border-white/10 p-8 flex flex-col items-center justify-center text-center group hover:from-indigo-600/40 hover:to-emerald-600/40 transition-all cursor-pointer">
                        <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <Zap className="text-white w-10 h-10 animate-pulse" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Ready to Launch?</h3>
                        <p className="text-xs text-slate-400 mb-6">Experience the AI-driven synthesis firsthand in our labs.</p>
                        <button className="px-6 py-2 rounded-full border border-white/20 text-xs font-bold text-white hover:bg-white/10 transition-all">Explore Experiments</button>
                    </div>
                </MotionDiv>
            </div>
            
            {/* Connection Line Decoration */}
            <div className="hidden lg:block w-full max-w-6xl mx-auto h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mt-12"></div>
        </div>
    );
};

export default AIPipeline;
