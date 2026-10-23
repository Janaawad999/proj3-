import React, { useState } from 'react';
import { 
    Sparkles, BrainCircuit, Droplets, ArrowRight, 
    Check, X, ShieldCheck, Activity, Eye, ChevronRight
} from 'lucide-react';
import AgriPulseBrandMark from './AgriPulseBrandMark';

const ONBOARDING_STEPS = [
    {
        badge: "LIVING INTELLIGENCE",
        title: "Your irrigation network, continuously alive.",
        subtitle: "AgriPulse bridges the physical domain of hydraulic pumps with AI, monitoring 18 high-capacity pumps across 4,370 hectares in real time.",
        accentColor: "#173F35",
        highlightPill: "18 Smart Pumps • 3 Sectors",
        renderIllustration: () => (
            <div className="relative w-44 h-44 mx-auto flex items-center justify-center">
                {/* Organic pulsing ripples */}
                <div className="absolute inset-0 rounded-full border border-[#DCE7D8] animate-ring-pulse opacity-40" />
                <div className="absolute inset-4 rounded-full border border-[#C7F36B] opacity-60 animate-ping" style={{ animationDuration: '3s' }} />
                <div className="absolute inset-8 rounded-full bg-[#EBF1E8] flex items-center justify-center shadow-inner">
                    <svg className="w-24 h-24" viewBox="0 0 100 100" fill="none">
                        {/* Fluid stream spirals */}
                        <circle cx="50" cy="50" r="32" stroke="#173F35" strokeWidth="2" strokeDasharray="6 3" className="animate-water-flow" />
                        <circle cx="50" cy="50" r="20" stroke="#C7F36B" strokeWidth="3" />
                        <path d="M50 18 C50 18, 58 35, 58 50 C58 65, 42 65, 42 50 C42 35, 50 18, 50 18 Z" fill="#173F35" opacity="0.85" />
                        <circle cx="50" cy="50" r="6" fill="#C7F36B" />
                    </svg>
                </div>
            </div>
        )
    },
    {
        badge: "PREDICTIVE FORESIGHT",
        title: "Foresee failures before the line runs dry.",
        subtitle: "Weibull Remaining Useful Life models and ISO 10816 vibration severity analysis forecast cavitation and bearing failure 38 to 96 hours in advance.",
        accentColor: "#E7A944",
        highlightPill: "ISO 10816 Calibrated • Zero Guesswork",
        renderIllustration: () => (
            <div className="relative w-44 h-44 mx-auto flex items-center justify-center">
                <div className="w-full bg-[#102D27] rounded-2xl p-4 shadow-lg text-white border border-[#1C4B40] flex flex-col justify-between h-36">
                    <div className="flex items-center justify-between">
                        <span className="text-[0.65rem] font-mono uppercase text-[#C7F36B] font-bold">RUL FORECAST</span>
                        <span className="text-[0.65rem] px-1.5 py-0.5 rounded bg-[#D94C45]/20 text-[#D94C45] font-mono font-bold">URGENT</span>
                    </div>
                    <div className="my-1">
                        <div className="text-2xl font-mono font-extrabold text-white">38h <span className="text-xs font-normal text-[#A0ABA4]">window</span></div>
                        <div className="text-[0.68rem] text-[#A0ABA4]">Pump P-04 • Bearing Micro-pitting</div>
                    </div>
                    <div className="w-full bg-[#1C4B40] h-1.5 rounded-full overflow-hidden">
                        <div className="bg-[#E7A944] h-full rounded-full" style={{ width: '38%' }} />
                    </div>
                </div>
            </div>
        )
    },
    {
        badge: "EXPLAINABLE AI",
        title: "Evidence-based diagnostics & crop vision.",
        subtitle: "The AI Copilot cross-references OEM technical manuals with vibration harmonics, while Field Vision flags foliar water stress from canopy photos.",
        accentColor: "#173F35",
        highlightPill: "OEM Manual Citations • YOLOv8 Canopy Vision",
        renderIllustration: () => (
            <div className="relative w-44 h-44 mx-auto flex items-center justify-center">
                <div className="w-full bg-white rounded-2xl p-3.5 shadow-md border border-[#DCE7D8] space-y-2">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-[#173F35] text-[#C7F36B] flex items-center justify-center">
                            <Sparkles size={12} />
                        </div>
                        <span className="text-[0.7rem] font-bold text-[#173F35]">AgriPulse Copilot</span>
                        <span className="ml-auto text-[0.65rem] font-mono text-[#858A80]">89% Conf.</span>
                    </div>
                    <div className="bg-[#F6F5EF] p-2 rounded-lg text-[0.68rem] text-[#252B28] leading-relaxed border border-[#E6E5DC]">
                        "Cavitation harmonic detected at 1.48 kHz. Recommend throttling bypass valve by 12%."
                    </div>
                    <div className="text-[0.62rem] text-[#858A80] font-mono flex items-center gap-1">
                        <ShieldCheck size={11} className="text-[#173F35]" />
                        <span>Source: Grundfos CR 95-2 Manual §4.2</span>
                    </div>
                </div>
            </div>
        )
    }
];

const OnboardingModal = ({ isOpen, onClose }) => {
    const [currentStep, setCurrentStep] = useState(0);

    if (!isOpen) return null;

    const step = ONBOARDING_STEPS[currentStep];
    const isLastStep = currentStep === ONBOARDING_STEPS.length - 1;

    const handleNext = () => {
        if (isLastStep) {
            handleComplete();
        } else {
            setCurrentStep(prev => prev + 1);
        }
    };

    const handleComplete = () => {
        try {
            localStorage.setItem('agripulse_onboarding_completed', 'true');
        } catch (e) {}
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#102D27]/60 backdrop-blur-sm">
            <div 
                className="w-full max-w-md bg-[#FAF9F5] border border-[#D8D7CD] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                style={{ minHeight: '520px' }}
            >
                {/* Top bar with logo and skip */}
                <div className="p-5 pb-2 flex items-center justify-between border-b border-[#E6E5DC]/60">
                    <div className="flex items-center gap-2">
                        <AgriPulseBrandMark size={28} showText={false} />
                        <span className="text-sm font-extrabold text-[#173F35] tracking-tight">
                            Agri<span className="text-[#173F35]">Pulse</span>
                        </span>
                    </div>
                    <button
                        onClick={handleComplete}
                        className="text-xs font-semibold text-[#858A80] hover:text-[#173F35] px-2 py-1 rounded-md transition-colors"
                    >
                        Skip
                    </button>
                </div>

                {/* Illustration Body */}
                <div className="px-6 pt-6 pb-2 flex-1 flex flex-col items-center justify-center text-center">
                    {/* Render Step Illustration */}
                    <div className="mb-4">
                        {step.renderIllustration()}
                    </div>

                    {/* Step pill */}
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#EBF1E8] border border-[#DCE7D8] text-[0.68rem] font-mono font-bold text-[#173F35] mb-2.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#173F35]" />
                        {step.badge}
                    </div>

                    {/* Title */}
                    <h3 className="text-xl font-extrabold text-[#173F35] tracking-tight leading-snug px-2">
                        {step.title}
                    </h3>

                    {/* Subtitle */}
                    <p className="text-xs text-[#858A80] mt-2 leading-relaxed max-w-sm px-2">
                        {step.subtitle}
                    </p>

                    {/* Metadata pill */}
                    <div className="mt-3 text-[0.68rem] font-mono text-[#555A52] bg-white px-3 py-1 rounded-lg border border-[#E6E5DC] shadow-xs">
                        {step.highlightPill}
                    </div>
                </div>

                {/* Footer with Step Dots and CTA */}
                <div className="p-5 pt-3 border-t border-[#E6E5DC]/80 bg-white/70 flex flex-col gap-3">
                    {/* Dots indicator */}
                    <div className="flex justify-center items-center gap-2">
                        {ONBOARDING_STEPS.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => setCurrentStep(idx)}
                                aria-label={`Go to slide ${idx + 1}`}
                                className={`h-1.5 rounded-full transition-all duration-300 ${
                                    currentStep === idx 
                                        ? 'w-6 bg-[#173F35]' 
                                        : 'w-1.5 bg-[#D8D7CD] hover:bg-[#858A80]'
                                }`}
                            />
                        ))}
                    </div>

                    {/* Buttons */}
                    <div className="flex items-center gap-2 pt-1">
                        {currentStep > 0 && (
                            <button
                                onClick={() => setCurrentStep(prev => prev - 1)}
                                className="px-4 py-2.5 rounded-xl border border-[#D8D7CD] text-xs font-bold text-[#555A52] hover:bg-[#F6F5EF] transition-colors"
                            >
                                Back
                            </button>
                        )}
                        <button
                            onClick={handleNext}
                            className="flex-1 py-3 px-4 rounded-xl bg-[#173F35] text-white text-xs font-extrabold hover:bg-[#113129] flex items-center justify-center gap-2 shadow-sm active:scale-[0.99] transition-all"
                        >
                            <span>{isLastStep ? 'Explore AgriPulse' : 'Continue'}</span>
                            <ChevronRight size={14} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OnboardingModal;
