
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Atom, Mail, Lock, User, ArrowRight, Check, BookOpen, Building, Globe, Loader2, AlertCircle } from 'lucide-react';
import { auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, db, setDoc, doc, getDoc } from '../services/firebase';

const AVATARS = [
    'bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-red-500',
    'bg-yellow-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500'
];

const Login: React.FC = () => {
    const navigate = useNavigate();
    const [isSignup, setIsSignup] = useState(false);
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');

    const [profileData, setProfileData] = useState({
        grade: '',
        institution: '',
        language: 'English',
        avatar: 'bg-blue-500'
    });

    const handleSignup = async () => {
        if (step === 1) {
            if (!name || !email || !password) throw new Error("Please fill all fields");
            if (password.length < 6) throw new Error("Password must be at least 6 characters");
            setStep(2);
            setLoading(false);
            return;
        }

        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        await setDoc(doc(db, "users", user.uid), {
            name,
            email,
            role: 'Student',
            ...profileData,
            progress: { physics: 0, chemistry: 0, biology: 0, math: 0, cs: 0 },
            createdAt: new Date().toISOString()
        });
        navigate('/home');
    };

    const handleLogin = async () => {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Fetch role to decide where to navigate
        const userDoc = await getDoc(doc(db, "users", user.uid));
        const role = userDoc.exists() ? userDoc.data().role : 'Student';

        navigate(role === 'Teacher' ? '/teacher-dashboard' : '/student-dashboard');
    };

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (isSignup) {
                await handleSignup();
            } else {
                await handleLogin();
            }
        } catch (err: any) {
            setError(err.message || 'Authentication failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden bg-[#020617]">
            {/* Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 -left-20 w-96 h-96 bg-blue-600/20 rounded-full blur-[100px]" />
                <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-purple-600/20 rounded-full blur-[100px]" />
            </div>

            <div className="w-full max-w-4xl bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl overflow-hidden flex flex-col md:flex-row relative z-10">

                {/* Left Side - Visual */}
                <div className="md:w-1/2 p-8 md:p-12 bg-gradient-to-br from-blue-600/20 to-purple-600/20 flex flex-col justify-between relative overflow-hidden">
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="p-2 bg-blue-600 rounded-lg">
                                <Atom className="text-white w-6 h-6" />
                            </div>
                            <span className="text-2xl font-display font-bold text-white">Vijnana Lab</span>
                        </div>
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                            {isSignup ? "Start Your Scientific Journey." : "Welcome Back, Explorer."}
                        </h2>
                        <p className="text-blue-100/80 leading-relaxed">
                            Perform real-time simulations, clear doubts instantly, and grow with smart AI guidance.
                        </p>
                    </div>
                    {/* Decorative Atom */}
                    <div className="absolute -bottom-20 -right-20 text-white/5 rotate-12">
                        <Atom size={300} />
                    </div>
                </div>

                {/* Right Side - Form */}
                <div className="md:w-1/2 p-8 md:p-12 bg-black/20">
                    <div className="flex justify-end mb-8">
                        <button
                            onClick={() => { setIsSignup(!isSignup); setStep(1); setError(''); }}
                            className="text-sm text-gray-400 hover:text-white transition-colors"
                        >
                            {isSignup ? "Already have an account? Log In" : "Don't have an account? Sign Up"}
                        </button>
                    </div>

                    <form onSubmit={handleAuth} className="space-y-6">
                        {error && (
                            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400 text-sm">
                                <AlertCircle size={16} /> {error}
                            </div>
                        )}

                        {/* LOGIN / SIGNUP STEP 1 */}
                        {(!isSignup || step === 1) && (
                            <div className="space-y-4 animate-in slide-in-from-left-8 fade-in duration-300">
                                {isSignup && (
                                    <div className="relative group">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-400 transition-colors" size={18} />
                                        <input
                                            type="text"
                                            placeholder="Full Name"
                                            className="w-full bg-black/20 border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:bg-white/5 transition-all"
                                            value={name}
                                            onChange={e => setName(e.target.value)}
                                            required={isSignup}
                                        />
                                    </div>
                                )}
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-400 transition-colors" size={18} />
                                    <input
                                        type="email"
                                        placeholder="Email Address"
                                        className="w-full bg-black/20 border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:bg-white/5 transition-all"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-400 transition-colors" size={18} />
                                    <input
                                        type="password"
                                        placeholder="Password"
                                        className="w-full bg-black/20 border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:bg-white/5 transition-all"
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                        )}

                        {/* SIGNUP STEP 2: PROFILE */}
                        {isSignup && step === 2 && (
                            <div className="space-y-4 animate-in slide-in-from-right-8 fade-in duration-300">
                                <div className="relative group">
                                    <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-400 transition-colors" size={18} />
                                    <select
                                        className="w-full bg-black/20 border border-white/10 rounded-xl py-3.5 pl-12 pr-10 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:bg-white/5 transition-all appearance-none cursor-pointer"
                                        value={profileData.grade}
                                        onChange={e => setProfileData({ ...profileData, grade: e.target.value })}
                                        required
                                    >
                                        <option className="bg-slate-900 text-gray-500" value="" disabled>Select Grade / Class</option>
                                        <option className="bg-slate-900 text-white" value="8th Grade">8th Grade</option>
                                        <option className="bg-slate-900 text-white" value="9th Grade">9th Grade</option>
                                        <option className="bg-slate-900 text-white" value="10th Grade">10th Grade</option>
                                        <option className="bg-slate-900 text-white" value="11th Grade (PUC I)">11th Grade (PUC I)</option>
                                        <option className="bg-slate-900 text-white" value="12th Grade (PUC II)">12th Grade (PUC II)</option>
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6" /></svg>
                                    </div>
                                </div>

                                <div className="relative group">
                                    <Building className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-400 transition-colors" size={18} />
                                    <input
                                        type="text"
                                        placeholder="Institution Name"
                                        className="w-full bg-black/20 border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:bg-white/5 transition-all"
                                        value={profileData.institution}
                                        onChange={e => setProfileData({ ...profileData, institution: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="relative group">
                                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-400 transition-colors" size={18} />
                                    <select
                                        className="w-full bg-black/20 border border-white/10 rounded-xl py-3.5 pl-12 pr-10 text-white focus:outline-none focus:border-blue-500/50 focus:bg-white/5 transition-all appearance-none cursor-pointer"
                                        value={profileData.language}
                                        onChange={e => setProfileData({ ...profileData, language: e.target.value })}
                                    >
                                        <option className="bg-slate-900 text-white" value="English">English</option>
                                        <option className="bg-slate-900 text-white" value="Hindi">Hindi</option>
                                        <option className="bg-slate-900 text-white" value="Kannada">Kannada</option>
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6" /></svg>
                                    </div>
                                </div>

                                <div className="pt-2">
                                    <span className="block text-xs text-gray-400 mb-2 ml-1 uppercase">Choose Avatar</span>
                                    <div className="flex flex-wrap gap-3 justify-center">
                                        {AVATARS.map((av) => (
                                            <button
                                                type="button"
                                                key={av}
                                                onClick={() => setProfileData({ ...profileData, avatar: av })}
                                                className={`w-10 h-10 rounded-full ${av} transition-transform hover:scale-110 relative ${profileData.avatar === av ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900 scale-110' : 'opacity-70 hover:opacity-100'}`}
                                            >
                                                {profileData.avatar === av && <Check size={14} className="text-white absolute inset-0 m-auto" />}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold shadow-lg shadow-blue-600/20 transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading && <Loader2 className="animate-spin" size={20} />}
                            {!loading && isSignup && step === 1 && (
                                <>Next Step <ArrowRight size={20} /></>
                            )}
                            {!loading && isSignup && step === 2 && "Create Account"}
                            {!loading && !isSignup && "Log In"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;
