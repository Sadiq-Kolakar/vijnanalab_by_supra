
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Bot, FlaskConical, Atom, Dna, Calculator, Sparkles, Binary } from 'lucide-react';
import { motion } from 'framer-motion';

const Home: React.FC = () => {
  return (
    <div className="w-full min-h-screen pt-24 pb-20">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20 flex flex-col md:flex-row items-center justify-between py-20 gap-12">
        {/* Left: Heading + Description + CTA */}
        <div className="w-full md:w-1/2 space-y-8">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6">
              Vijnana <span className="text-gradient-cyan">Lab</span>
            </h1>
            <p className="text-xl text-gray-400 leading-relaxed max-w-lg mb-8">
              Experience science like never before. A professional virtual laboratory platform designed for the next generation of researchers and students.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/subjects">
                <button className="btn-primary px-10 py-4 text-lg">
                  Enter Laboratory <ArrowRight size={20} />
                </button>
              </Link>
              <Link to="/tutor">
                <button className="btn-secondary px-10 py-4 text-lg">
                  AI Tutor
                </button>
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Right: Product Preview */}
        <div className="w-full md:w-1/2">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-cyan-500/10 blur-[100px] rounded-full pointer-events-none"></div>
            <div className="relative glass-effect p-2 rounded-2xl border-subtle overflow-hidden shadow-2xl">
              <img 
                src="/vijnana_lab_preview.png" 
                alt="Vijnana Lab Simulation Interface" 
                className="rounded-xl w-full object-cover border border-white/5"
              />
            </div>
            {/* Subtle Overlay Elements */}
            <div className="absolute -top-6 -right-6 glass-effect p-4 rounded-xl border-subtle hidden lg:block">
              <FlaskConical className="text-cyan-400 w-8 h-8" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Feature Cards Section */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20 py-20">
        <div className="text-center mb-16 px-4">
          <h2 className="text-4xl font-bold mb-4">Explore Disciplines</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">Comprehensive virtual environments for mastering PCMB and advanced AI technologies.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          <FeatureCard 
            title="Physics"
            desc="Explore mechanics, optics, and quantum simulations with real-time data."
            Icon={Atom}
            link="/subjects/physics"
            delay={0.1}
          />
          <FeatureCard 
            title="Chemistry"
            desc="Visualize molecular structures and perform safe chemical reactions."
            Icon={FlaskConical}
            link="/subjects/chemistry"
            delay={0.2}
          />
          <FeatureCard 
            title="Biology"
            desc="Dive into cellular anatomy and complex genetic systems in 3D."
            Icon={Dna}
            link="/subjects/biology"
            delay={0.3}
          />
          <FeatureCard 
            title="Math"
            desc="Master functions, calculus, and geometry through visual exploration."
            Icon={Calculator}
            link="/subjects/mathematics"
            delay={0.4}
          />
          <FeatureCard 
            title="AI Tutor"
            desc="Personalized mentorship fueled by advanced generative science models."
            Icon={Bot}
            link="/tutor"
            delay={0.5}
            accent="green"
          />
        </div>
      </section>

      {/* Lab Blueprint / Research Section */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20 py-24 border-t border-white/5">
        <div className="glass-effect p-12 md:p-16 rounded-3xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-4xl font-bold mb-6">Brainstorm <span className="text-cyan-400">Hub</span></h2>
            <p className="text-lg text-gray-400 mb-8 leading-relaxed">
              Plan complex experiments, generate hypotheses, and blueprint apparatus setups with AI-driven architectural tools.
            </p>
            <Link to="/brainstorm">
              <button className="btn-primary">
                Explore Brainstorm Hub <Sparkles size={18} />
              </button>
            </Link>
          </div>
          <div className="relative glass-effect p-8 rounded-2xl border-subtle bg-black/20">
            <div className="flex items-center gap-4 mb-6 border-b border-white/10 pb-4">
              <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500/50"></div>
              <div className="w-3 h-3 rounded-full bg-green-500/50"></div>
              <span className="text-xs text-gray-500 font-mono">experiment_blueprint.json</span>
            </div>
            <pre className="text-sm font-mono text-cyan-300 overflow-x-auto no-scrollbar">
              {`{
  "project": "Vijnana Research #42",
  "topic": "Electromagnetic Induction",
  "setup": "Dual-Coil Configuration",
  "hypothesis": "Induced EMF is proportional to dB/dt",
  "status": "Ready for Simulation"
}`}
            </pre>
          </div>
        </div>
      </section>
    </div>
  );
};

const FeatureCard = ({ title, desc, Icon, link, delay, accent = 'cyan' }: { title: string, desc: string, Icon: any, link: string, delay: number, accent?: 'cyan' | 'green' }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      viewport={{ once: true }}
    >
      <Link to={link} className="block group">
        <div className="glass-effect p-8 rounded-2xl border-subtle card-hover h-full flex flex-col">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-colors duration-300 ${accent === 'cyan' ? 'bg-cyan-500/10 group-hover:bg-cyan-500/20' : 'bg-green-500/10 group-hover:bg-green-500/20'}`}>
            <Icon className={accent === 'cyan' ? 'text-cyan-400' : 'text-green-400'} size={28} />
          </div>
          <h3 className="text-2xl font-bold mb-3 group-hover:text-cyan-300 transition-colors">{title}</h3>
          <p className="text-gray-400 text-sm leading-relaxed mb-6 flex-grow">{desc}</p>
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-500 group-hover:text-white transition-colors">
            Learn more <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default Home;
    