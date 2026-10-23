import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import AgriPulseBrandMark from '../components/AgriPulseBrandMark';
import OnboardingModal from '../components/OnboardingModal';
import { Lock, Mail, User, ArrowRight, ShieldCheck, Sparkles, Check, HelpCircle } from 'lucide-react';
import { DATA_PROVENANCE } from '../services/agriPulseData';

const LoginScreen = () => {
    const [isSignUp, setIsSignUp] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (isSignUp) {
                await authService.register(name, email, password);
            } else {
                await authService.login(email, password);
            }
            navigate('/');
        } catch (err) {
            console.warn('Real auth server returned error or offline:', err);
            const serverMsg = err?.response?.data?.message;
            setError(serverMsg || 'Authentication server offline. Use the "Demo Engineer Access" button below to explore.');
        } finally {
            setLoading(false);
        }
    };

    const handleDemoLogin = () => {
        const demoUser = {
            id: 'demo-engineer-01',
            displayName: 'Tariq Mansour',
            email: 't.mansour@agripulse.ai',
            role: 'Lead Irrigation Engineer',
            organizationId: 'agripulse-delta-7'
        };
        localStorage.setItem('user', JSON.stringify(demoUser));
        localStorage.setItem('token', 'demo-jwt-token-agripulse-living-intelligence');
        navigate('/');
    };

    return (
        <div className="min-h-screen bg-[#F6F5EF] flex items-center justify-center p-4 selection:bg-[#C7F36B] selection:text-[#173F35]">
            <div className="w-full max-w-md bg-white border border-[#D8D7CD] rounded-3xl shadow-xl overflow-hidden flex flex-col">
                {/* Brand Masthead with Organic Glow */}
                <div className="bg-[#102D27] p-8 text-center text-white border-b border-[#1C4B40] relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-36 h-36 bg-[#C7F36B]/10 rounded-full blur-2xl pointer-events-none" />
                    
                    <div className="flex justify-center mb-3">
                        <AgriPulseBrandMark size={48} showText={false} />
                    </div>
                    <h2 className="text-2xl font-extrabold tracking-tight text-white">
                        Agri<span className="text-[#C7F36B]">Pulse</span>
                    </h2>
                    <p className="text-xs text-[#A0ABA4] mt-1 font-mono tracking-wider uppercase">
                        Living Intelligence for Smart Irrigation
                    </p>
                </div>

                {/* Form & Actions Body */}
                <div className="p-6 sm:p-8 space-y-5">
                    {/* Mode Switcher Tabs */}
                    <div className="flex rounded-xl bg-[#FAF9F5] p-1 border border-[#E6E5DC]">
                        <button
                            type="button"
                            onClick={() => setIsSignUp(false)}
                            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                                !isSignUp ? 'bg-[#173F35] text-white shadow-xs' : 'text-[#858A80] hover:text-[#252B28]'
                            }`}
                        >
                            Sign In
                        </button>
                        <button
                            type="button"
                            onClick={() => setIsSignUp(true)}
                            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                                isSignUp ? 'bg-[#173F35] text-white shadow-xs' : 'text-[#858A80] hover:text-[#252B28]'
                            }`}
                        >
                            Create Account
                        </button>
                    </div>

                    {error && (
                        <div className="p-3 bg-[#FDECEC] border border-[#F8B4B1] rounded-xl text-xs text-[#9E1F1A]">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
                        {isSignUp && (
                            <div>
                                <label className="block font-bold text-[#252B28] mb-1">Full Name</label>
                                <div className="relative">
                                    <User size={15} className="absolute left-3 top-3 text-[#858A80]" />
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="e.g., Tariq Mansour"
                                        required
                                        className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#D8D7CD] focus:outline-none focus:border-[#173F35] transition-colors"
                                    />
                                </div>
                            </div>
                        )}

                        <div>
                            <label className="block font-bold text-[#252B28] mb-1">Email Address</label>
                            <div className="relative">
                                <Mail size={15} className="absolute left-3 top-3 text-[#858A80]" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="engineer@agripulse.ai"
                                    required
                                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#D8D7CD] focus:outline-none focus:border-[#173F35] transition-colors"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block font-bold text-[#252B28] mb-1">Password</label>
                            <div className="relative">
                                <Lock size={15} className="absolute left-3 top-3 text-[#858A80]" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••••••"
                                    required
                                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#D8D7CD] focus:outline-none focus:border-[#173F35] transition-colors"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 rounded-xl bg-[#173F35] text-white font-extrabold text-xs hover:bg-[#113129] flex items-center justify-center gap-2 shadow-xs transition-all active:scale-[0.99] mt-2"
                        >
                            <span>{loading ? 'Authenticating...' : isSignUp ? 'Register Engineer Profile' : 'Sign In to Workspace'}</span>
                            <ArrowRight size={14} />
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="relative my-4">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-[#E6E5DC]" />
                        </div>
                        <div className="relative flex justify-center text-[0.68rem] uppercase font-mono tracking-wider">
                            <span className="bg-white px-3 text-[#858A80]">Instant Demonstration</span>
                        </div>
                    </div>

                    {/* 1-Tap Demo Access Button */}
                    <button
                        type="button"
                        onClick={handleDemoLogin}
                        className="w-full py-3 px-4 rounded-xl bg-[#C7F36B] hover:bg-[#B5E655] text-[#173F35] font-extrabold text-xs flex items-center justify-center gap-2 transition-all shadow-xs active:scale-[0.99]"
                    >
                        <Sparkles size={15} />
                        <span>Explore as Lead Engineer (Tariq Mansour)</span>
                    </button>

                    {/* Tour Trigger */}
                    <div className="text-center pt-1">
                        <button
                            type="button"
                            onClick={() => setIsOnboardingOpen(true)}
                            className="text-xs text-[#858A80] hover:text-[#173F35] font-semibold flex items-center justify-center gap-1.5 mx-auto"
                        >
                            <HelpCircle size={14} />
                            <span>Preview Living Intelligence Tour</span>
                        </button>
                    </div>

                    {/* Security & Provenance Badge */}
                    <div className="pt-2 text-center">
                        <div className="inline-flex items-center gap-1.5 text-[0.68rem] text-[#858A80] font-mono">
                            <ShieldCheck size={12} className="text-[#173F35]" />
                            <span>Telemetry Mode: {DATA_PROVENANCE.dataSource}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Onboarding Tour Modal */}
            <OnboardingModal 
                isOpen={isOnboardingOpen} 
                onClose={() => setIsOnboardingOpen(false)} 
            />
        </div>
    );
};

export default LoginScreen;
