
import React from 'react';
import ProjectArchitect from '../components/ProjectArchitect';
import { motion } from 'framer-motion';
import { Sparkles, BrainCircuit, Users, Compass } from 'lucide-react';
import GlassCard from '../components/GlassCard';
import AIPipeline from '../components/AIPipeline';

const MotionDiv = motion.div as any;

const BrainstormHub: React.FC = () => {
    return (
        <div className="min-h-screen pt-28 pb-20 px-6 md:px-12 lg:px-20 bg-[#020617] relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20">
                <div className="absolute top-20 right-20 w-[600px] h-[600px] bg-amber-600/20 rounded-full blur-[120px]" />
                <div className="absolute bottom-20 left-20 w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-[120px]" />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto mb-16 text-center">
                <MotionDiv
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs font-bold uppercase tracking-widest mb-4">
                        <Sparkles size={14} /> Intelligence Center
                    </div>
                    <h1 className="text-4xl md:text-6xl font-display font-bold text-white text-glow leading-tight">
                        The Ideation Lab
                    </h1>
                    <p className="text-xl text-slate-400 max-w-2xl mx-auto font-light leading-relaxed">
                        Where raw curiosity meets scientific structure. Use our advanced AI models to architect your research, map connections, and plan the impossible.
                    </p>
                </MotionDiv>
            </div>

            {/* Quick Feature Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16 relative z-10 max-w-7xl mx-auto">
                <GlassCard color="amber" className="!p-8 group">
                    <BrainCircuit className="text-amber-500 w-10 h-10 mb-6 group-hover:scale-110 transition-transform" />
                    <h3 className="text-xl font-bold text-white mb-2">Project Architecture</h3>
                    <p className="text-sm text-slate-400">Blueprint a complete experimental setup from just a simple goal or hypothesis.</p>
                </GlassCard>
                <GlassCard color="indigo" className="!p-8 group">
                    <Compass className="text-indigo-500 w-10 h-10 mb-6 group-hover:scale-110 transition-transform" />
                    <h3 className="text-xl font-bold text-white mb-2">Concept Mapping</h3>
                    <p className="text-sm text-slate-400 text-glow">Map out connections between disparate scientific disciplines in real-time.</p>
                </GlassCard>
                <GlassCard color="emerald" className="!p-8 group">
                    <Users className="text-emerald-500 w-10 h-10 mb-6 group-hover:scale-110 transition-transform" />
                    <h3 className="text-xl font-bold text-white mb-2">Innovation Hub</h3>
                    <p className="text-sm text-slate-400">Collaborate with the AI to refine your methods and safety protocols.</p>
                </GlassCard>
            </div>

            {/* Main Interactive Tool Area */}
            <section className="relative z-10 bg-white/5 backdrop-blur-3xl rounded-[40px] border border-white/10 shadow-2xl overflow-hidden p-8 md:p-12 mb-20 max-w-7xl mx-auto">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-amber-500 via-indigo-500 to-emerald-500 opacity-50"></div>
                <ProjectArchitect />
            </section>

            {/* AI Technical Pipeline Section */}
            <section className="relative z-10 max-w-7xl mx-auto mb-20">
                <AIPipeline />
            </section>
        </div>
    );
};

export default BrainstormHub;
