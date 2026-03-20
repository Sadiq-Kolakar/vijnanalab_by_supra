
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Atom, Twitter, Github, Linkedin, Instagram, Send, Mail, Heart } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

// Fix for Framer Motion types
const MotionSpan = motion.span as any;

const TITLES = [
  { text: "Vijnana Lab", lang: "en" },
  { text: "विज्ञान लैब", lang: "hi" },
  { text: "ವಿಜ್ಞಾನ ಲ್ಯಾಬ್", lang: "kn" }
];

const Footer: React.FC = () => {
  const [feedback, setFeedback] = useState('');
  const [sent, setSent] = useState(false);
  const [titleIndex, setTitleIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTitleIndex((prev) => (prev + 1) % TITLES.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedback.trim()) return;
    setSent(true);
    setTimeout(() => {
      setSent(false);
      setFeedback('');
    }, 2000);
  };

  return (
    <footer className="bg-[#020617] border-t border-white/5 pt-16 pb-8 z-10 relative mt-auto">
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          
          {/* Brand Section */}
          <div className="space-y-4">
             <Link to="/home" className="flex items-center gap-2 group">
                <Atom className="w-8 h-8 text-cyan-400 relative z-10" />
                <span className="text-2xl font-bold text-white tracking-tight leading-none whitespace-nowrap">
                    Vijnana <span className="text-cyan-400">Lab</span>
                </span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
              Professional virtual laboratory platform for next-generation science education.
            </p>
            <div className="flex gap-4 pt-2">
              <a href="#" className="text-gray-400 hover:text-emerald-400 transition-colors"><Twitter size={20} /></a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors"><Github size={20} /></a>
              <a href="#" className="text-gray-400 hover:text-indigo-400 transition-colors"><Linkedin size={20} /></a>
              <a href="#" className="text-gray-400 hover:text-pink-500 transition-colors"><Instagram size={20} /></a>
            </div>
          </div>
 
          {/* Quick Links */}
          <div>
            <h3 className="text-white font-bold mb-6 tracking-wide">Platform</h3>
            <ul className="space-y-3 text-sm text-gray-400">
              <li><Link to="/" className="hover:text-emerald-400 transition-colors">Home</Link></li>
              <li><Link to="/subjects" className="hover:text-emerald-400 transition-colors">Virtual Labs</Link></li>
              <li><Link to="/tutor" className="hover:text-emerald-400 transition-colors">AI Tutor</Link></li>
              <li><Link to="/student-dashboard" className="hover:text-emerald-400 transition-colors">Student Dashboard</Link></li>
              <li><Link to="/teacher-dashboard" className="hover:text-emerald-400 transition-colors">Teacher Dashboard</Link></li>
            </ul>
          </div>
 
          {/* Support & Legal */}
          <div>
            <h3 className="text-white font-bold mb-6 tracking-wide">Support</h3>
            <ul className="space-y-3 text-sm text-gray-400">
              <li><Link to="/contact" className="hover:text-emerald-400 transition-colors">Contact Us</Link></li>
              <li><Link to="/about" className="hover:text-emerald-400 transition-colors">About Us</Link></li>
              <li><a href="#" className="hover:text-emerald-400 transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-emerald-400 transition-colors">Terms & Conditions</a></li>
              <li><a href="#" className="hover:text-emerald-400 transition-colors">Help Center</a></li>
            </ul>
          </div>
 
          {/* Feedback Form */}
          <div>
            <h3 className="text-white font-bold mb-6 tracking-wide">Feedback</h3>
            <p className="text-xs text-gray-400 mb-4">Help us improve your experience.</p>
            <form onSubmit={handleFeedback} className="space-y-4">
              <div className="relative group">
                <textarea 
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Your suggestions..."
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm text-white focus:outline-none focus:border-emerald-500/50 focus:bg-white/10 transition-all resize-none h-28 placeholder-gray-600 shadow-inner"
                />
                <button 
                  type="submit"
                  className={`absolute bottom-3 right-3 p-2.5 rounded-xl transition-all shadow-xl hover:scale-110 active:scale-95 ${
                    sent ? 'bg-green-500 text-white' : 'btn-primary text-black'
                  }`}
                >
                  {sent ? <Heart size={18} fill="currentColor" /> : <Send size={18} />}
                </button>
              </div>
              {sent && <motion.p initial={{opacity:0, y: 5}} animate={{opacity:1, y:0}} className="text-xs text-emerald-400 font-medium">Thank you for your feedback!</motion.p>}
            </form>
          </div>
        </div>

        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} Vijnana Lab Inc. All rights reserved.
          </p>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Mail size={14} />
            <span>support@vijnanalab.com</span>
          </div>
        </div>
        
        <div className="w-full text-center mt-6 pt-4 border-t border-white/5 pb-4">
            <p className="text-sm text-gray-500 flex items-center justify-center gap-1">
                Innovation by <span className="text-slate-300 font-bold tracking-wide">TEAM SUPRA</span>
            </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
