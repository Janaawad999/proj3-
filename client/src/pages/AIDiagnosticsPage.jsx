import React, { useState, useEffect, useRef } from 'react';
import { 
    Sparkles, Send, Bot, AlertTriangle, FileText, 
    ShieldAlert, CheckCircle2, Copy, Check, RefreshCw, 
    Layers, BookOpen, ExternalLink, Terminal, Info, ChevronRight
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { 
    SMART_PUMPS, RAG_TECHNICAL_DOCUMENTS, 
    DATA_PROVENANCE 
} from '../services/agriPulseData';
import { assistantService } from '../services/api';

const SUGGESTED_DIAGNOSTIC_QUESTIONS = [
    {
        title: "Diagnose Bearing Vibration on P-04",
        prompt: "Analyze the 5.84 mm/s vibration spike and 1.48 kHz harmonic on Pump P-04. What is the root cause and ISO 10816 severity?",
        badge: "Vibration"
    },
    {
        title: "Cavitation vs NPSH Margin",
        prompt: "Explain how discharge throttling on P-04 affects Net Positive Suction Head (NPSH) margin and induces cavitation.",
        badge: "Hydraulics"
    },
    {
        title: "LOTO Safety Protocol for Seal Replacement",
        prompt: "What are the required Lockout/Tagout (LOTO) safety steps for servicing the mechanical seal on Grundfos CR 95-2?",
        badge: "Safety"
    },
    {
        title: "Cross-Reference ISO 10816 Zone Limits",
        prompt: "Cross-reference ISO 10816-3 Class II pump vibration thresholds. At what level is emergency shutdown mandatory?",
        badge: "Standard"
    }
];

const AIDiagnosticsPage = () => {
    // Contextual pump selector
    const [selectedPumpId, setSelectedPumpId] = useState('P-04');
    const selectedPump = SMART_PUMPS.find(p => p.id === selectedPumpId) || SMART_PUMPS[0];

    // Chat history state persisted in localStorage
    const [messages, setMessages] = useState(() => {
        try {
            const saved = localStorage.getItem('agripulse_diagnostics_chat');
            if (saved) return JSON.parse(saved);
        } catch (e) {}
        return [
            {
                id: 'msg-welcome',
                role: 'assistant',
                text: `Welcome to **AgriPulse Technical AI Diagnostics**. I am grounded in continuous IoT pump telemetry, ISO 10816 mechanical standards, and OEM service manuals (Grundfos CR, KSB MegaCPK, Sulzer). \n\nCurrently inspecting: **${selectedPump.name} (${selectedPump.model})**. How can I assist with your diagnostic analysis?`,
                timestamp: 'System Initialized'
            }
        ];
    });

    const [inputQuery, setInputQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [aiGatewayError, setAiGatewayError] = useState(null);
    const [isCopied, setIsCopied] = useState(false);

    const chatEndRef = useRef(null);

    // Auto-scroll chat
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading]);

    // Save chat
    useEffect(() => {
        try {
            localStorage.setItem('agripulse_diagnostics_chat', JSON.stringify(messages));
        } catch (e) {}
    }, [messages]);

    const handleSendMessage = async (queryText) => {
        const textToSend = (queryText || inputQuery).trim();
        if (!textToSend || isLoading) return;

        const userMsg = {
            id: `usr-${Date.now()}`,
            role: 'user',
            text: textToSend,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setMessages(prev => [...prev, userMsg]);
        setInputQuery('');
        setIsLoading(true);
        setAiGatewayError(null);

        try {
            const data = await assistantService.sendChatMessage({
                question: textToSend,
                pumpId: selectedPump.id,
                context: {
                    model: selectedPump.model,
                    metrics: selectedPump.metrics,
                    status: selectedPump.status,
                    failureMode: selectedPump.failureMode
                }
            });

            const aiText = data.text || data.answer || data.message || JSON.stringify(data);

            const assistantMsg = {
                id: `ai-${Date.now()}`,
                role: 'assistant',
                text: aiText,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                dataProvenance: data.dataProvenance || "LIVE_RAG_GATEWAY"
            };

            setMessages(prev => [...prev, assistantMsg]);
        } catch (err) {
            console.warn('AI Gateway unreachable or failed:', err);
            setAiGatewayError(err.userMessage || err.message || 'AI Gateway Service Error');

            const failureNoticeMsg = {
                id: `err-${Date.now()}`,
                role: 'system',
                isError: true,
                text: `⚠️ **Diagnostic Gateway Notice**: ${err.userMessage || 'Could not contact LLM diagnostic service'}. Please refer to the verified OEM Technical Manuals in the right-hand panel or retry.`,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };

            setMessages(prev => [...prev, failureNoticeMsg]);
        } finally {
            setIsLoading(false);
        }
    };

    const copyReport = () => {
        const reportText = `AGRIPULSE TECHNICAL DIAGNOSTIC REPORT\nTarget: ${selectedPump.name} (${selectedPump.model})\nStatus: ${selectedPump.status}\nVibration: ${selectedPump.metrics.vibrationRms} mm/s RMS (ISO 10816)\nRoot Cause: ${selectedPump.failureMode}\nPrimary Action: ${selectedPump.technicianNotes}`;
        navigator.clipboard.writeText(reportText);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#E6E5DC] pb-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-[0.68rem] font-mono tracking-widest uppercase font-extrabold px-2 py-0.5 rounded bg-[#173F35] text-[#C7F36B]">
                            RAG TECHNICAL DIAGNOSTIC WORKSPACE
                        </span>
                        <span className="text-[0.68rem] font-mono px-2 py-0.5 rounded bg-[#ECEBE4] text-[#555A52] border border-[#D5D4CA]">
                            OEM KNOWLEDGE BASE
                        </span>
                    </div>
                    <h1 className="text-3xl font-extrabold text-[#173F35] tracking-tight">
                        AI Diagnostics & Root Cause Analysis
                    </h1>
                    <p className="text-sm text-[#858A80] mt-0.5">
                        Interactive diagnostic dialogue on the left, verified engineering report and OEM citations on the right.
                    </p>
                </div>

                {/* Contextual Pump Selector */}
                <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-[#858A80]">Target Pump:</span>
                    <select
                        value={selectedPumpId}
                        onChange={(e) => setSelectedPumpId(e.target.value)}
                        className="px-3 py-1.5 rounded-md bg-white border border-[#D8D7CD] font-mono text-xs font-bold text-[#173F35] focus:outline-none focus:border-[#173F35]"
                    >
                        {SMART_PUMPS.map(p => (
                            <option key={p.id} value={p.id}>
                                {p.id} — {p.name} ({p.status})
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* AI Gateway Offline Warning if active */}
            {aiGatewayError && (
                <div className="bg-[#FDECEC] border border-[#F8B4B1] rounded-md p-3 text-xs text-[#9E1F1A] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <AlertTriangle size={15} />
                        <span><strong>Gateway Notice:</strong> External LLM backend unreachable ({aiGatewayError}). Showing deterministic OEM standards.</span>
                    </div>
                    <span className="font-mono text-[0.68rem] font-bold">STRICT INTEGRITY ENFORCED</span>
                </div>
            )}

            {/* Split Screen Workspace */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* ================= LEFT PANE: INTERACTIVE DIALOGUE (7 cols) ================= */}
                <div className="lg:col-span-7 bg-[#102D27] text-white rounded-lg border border-[#1C4B40] shadow-xl flex flex-col h-[700px] overflow-hidden">
                    {/* Top Dialogue Bar */}
                    <div className="px-5 py-3.5 border-b border-[#1C4B40] flex items-center justify-between bg-[#0B231E]">
                        <div className="flex items-center gap-2">
                            <Bot size={17} className="text-[#C7F36B]" />
                            <span className="font-bold text-xs tracking-wide">
                                AgriPulse Diagnostic Terminal
                            </span>
                            <span className="text-[0.65rem] font-mono px-2 py-0.5 rounded bg-[#173F35] text-[#C7F36B]">
                                Grounded in {selectedPump.id}
                            </span>
                        </div>
                        <button
                            onClick={() => setMessages([])}
                            className="text-[0.7rem] text-[#A0ABA4] hover:text-white"
                        >
                            Clear Thread
                        </button>
                    </div>

                    {/* Messages Scroll Area */}
                    <div className="flex-1 p-5 overflow-y-auto space-y-4">
                        {messages.map((msg) => (
                            <div 
                                key={msg.id}
                                className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                            >
                                <div className="text-[0.65rem] font-mono text-[#A0ABA4] mb-1">
                                    {msg.role === 'user' ? 'Lead Engineer' : 'AgriPulse Diagnostics'} • {msg.timestamp}
                                </div>
                                <div className={`p-3.5 rounded-lg text-xs leading-relaxed max-w-[85%] ${
                                    msg.isError 
                                        ? 'bg-[#D94C45]/20 border border-[#D94C45] text-[#FDECEC]'
                                        : msg.role === 'user'
                                        ? 'bg-[#173F35] text-[#F6F5EF] border border-[#2D6B5D]'
                                        : 'bg-[#143831] text-[#EFEFE7] border border-[#1C4B40]'
                                }`}>
                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                        {msg.text}
                                    </ReactMarkdown>
                                </div>
                            </div>
                        ))}

                        {isLoading && (
                            <div className="flex items-center gap-2 text-xs text-[#C7F36B] font-mono py-2">
                                <RefreshCw size={14} className="animate-spin" />
                                <span>Analyzing telemetry harmonics and querying OEM RAG manuals...</span>
                            </div>
                        )}
                        <div ref={chatEndRef} />
                    </div>

                    {/* Suggested Diagnostic Prompts */}
                    <div className="px-5 py-2.5 bg-[#0B231E]/80 border-t border-[#1C4B40] overflow-x-auto flex gap-2">
                        {SUGGESTED_DIAGNOSTIC_QUESTIONS.map((sug, idx) => (
                            <button
                                key={idx}
                                onClick={() => handleSendMessage(sug.prompt)}
                                className="whitespace-nowrap px-2.5 py-1 rounded bg-[#173F35] hover:bg-[#1C4B41] text-[0.7rem] text-[#DCE7D8] border border-[#2D6B5D] transition-colors flex items-center gap-1.5"
                            >
                                <Sparkles size={11} className="text-[#C7F36B]" />
                                <span>{sug.title}</span>
                            </button>
                        ))}
                    </div>

                    {/* Prompt Input Form */}
                    <div className="p-3 bg-[#0B231E] border-t border-[#1C4B40]">
                        <form 
                            onSubmit={(e) => {
                                e.preventDefault();
                                handleSendMessage();
                            }}
                            className="flex items-center gap-2"
                        >
                            <input
                                type="text"
                                value={inputQuery}
                                onChange={(e) => setInputQuery(e.target.value)}
                                placeholder={`Ask diagnostic question about ${selectedPump.id}...`}
                                className="flex-1 bg-[#143831] border border-[#1C4B40] rounded-md px-3.5 py-2 text-xs text-white placeholder-[#A0ABA4] focus:outline-none focus:border-[#C7F36B]"
                            />
                            <button
                                type="submit"
                                disabled={isLoading || !inputQuery.trim()}
                                className="px-4 py-2 bg-[#C7F36B] hover:bg-[#B5E655] disabled:opacity-40 text-[#102D27] font-bold text-xs rounded-md transition-colors flex items-center gap-1"
                            >
                                <Send size={13} />
                                <span>Query</span>
                            </button>
                        </form>
                    </div>
                </div>

                {/* ================= RIGHT PANE: STRUCTURED DIAGNOSTIC REPORT (5 cols) ================= */}
                <div className="lg:col-span-5 bg-white border border-[#E6E5DC] rounded-lg p-5 shadow-sm space-y-5 h-[700px] overflow-y-auto">
                    {/* Report Header */}
                    <div className="flex items-center justify-between pb-3 border-b border-[#F0EFEA]">
                        <div>
                            <span className="text-[0.68rem] font-mono text-[#858A80] uppercase tracking-wider font-extrabold">
                                ISO 10816 DIAGNOSTIC SHEET
                            </span>
                            <h3 className="text-base font-extrabold text-[#173F35]">
                                {selectedPump.name}
                            </h3>
                        </div>
                        <button
                            onClick={copyReport}
                            className="agri-btn agri-btn-outline text-[0.72rem] py-1 px-2.5"
                            title="Copy Diagnostic Summary"
                        >
                            {isCopied ? <Check size={13} className="text-[#2E7D32]" /> : <Copy size={13} />}
                            <span>{isCopied ? "Copied" : "Copy"}</span>
                        </button>
                    </div>

                    {/* Section 1: Observed Evidence */}
                    <div>
                        <div className="text-xs font-bold text-[#173F35] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                            <Terminal size={14} />
                            1. Observed Telemetry Evidence
                        </div>
                        <div className="p-3 bg-[#F6F5EF] rounded border border-[#E6E5DC] text-xs font-mono space-y-1">
                            <div className="flex justify-between">
                                <span className="text-[#858A80]">Vibration Velocity:</span>
                                <strong className="text-[#D94C45]">{selectedPump.metrics.vibrationRms} mm/s RMS (ISO Zone C)</strong>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-[#858A80]">Harmonic Frequency:</span>
                                <strong className="text-[#173F35]">1,480 Hz (Acoustic Cavitation Peak)</strong>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-[#858A80]">Casing Temperature:</span>
                                <strong className="text-[#E7A944]">{selectedPump.metrics.casingTemp}°C (+14°C above baseline)</strong>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-[#858A80]">Discharge Pressure:</span>
                                <strong className="text-[#173F35]">{selectedPump.metrics.dischargePressure} bar (Throttled)</strong>
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Probable Root Causes */}
                    <div>
                        <div className="text-xs font-bold text-[#173F35] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                            <AlertTriangle size={14} />
                            2. Probable Root Causes (Ranked)
                        </div>
                        <div className="space-y-2 text-xs">
                            <div className="p-2.5 rounded bg-[#FDECEC]/60 border border-[#F8B4B1]">
                                <div className="flex justify-between font-bold text-[#9E1F1A]">
                                    <span>Inner Bearing Raceway Fatigue & Micro-pitting</span>
                                    <span>88% Prob</span>
                                </div>
                                <p className="text-[0.72rem] text-[#7A1C18] mt-0.5">
                                    Induced by sustained discharge throttling and inadequate NPSH margin.
                                </p>
                            </div>
                            <div className="p-2.5 rounded bg-[#FDF4E6]/60 border border-[#F5D8A3]">
                                <div className="flex justify-between font-bold text-[#925805]">
                                    <span>Impeller Eye Cavitation</span>
                                    <span>65% Prob</span>
                                </div>
                                <p className="text-[0.72rem] text-[#6E4204] mt-0.5">
                                    Vapor bubble implosions eroding vane inlet tips under high head pressure.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Section 3: Verified RAG Technical Document Citations */}
                    <div>
                        <div className="text-xs font-bold text-[#173F35] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                            <BookOpen size={14} />
                            3. Retrieved OEM Manual References
                        </div>
                        <div className="space-y-2.5">
                            {RAG_TECHNICAL_DOCUMENTS.map((doc) => (
                                <div key={doc.id} className="p-3 rounded border border-[#E6E5DC] bg-white text-xs">
                                    <div className="flex items-start justify-between">
                                        <div className="font-bold text-[#173F35] text-[0.75rem]">{doc.title}</div>
                                        <span className="font-mono text-[0.65rem] text-[#858A80]">{doc.code}</span>
                                    </div>
                                    <div className="text-[0.68rem] text-[#858A80] mt-0.5 font-semibold">
                                        {doc.section} • {doc.page}
                                    </div>
                                    <p className="mt-1.5 text-[0.72rem] text-[#555A52] italic bg-[#F6F5EF] p-2 rounded leading-relaxed">
                                        "{doc.verifiedExcerpt}"
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Section 4: Mandatory Safety & Lockout Procedures */}
                    <div>
                        <div className="text-xs font-bold text-[#173F35] uppercase tracking-wider mb-2 flex items-center gap-1.5 text-[#D94C45]">
                            <ShieldAlert size={14} />
                            4. Mandatory Safety Protocol (LOTO)
                        </div>
                        <div className="p-3 rounded bg-[#FDECEC] border border-[#F8B4B1] text-xs text-[#7A1C18] space-y-1 font-mono text-[0.72rem]">
                            <div>1. Apply Padlock & Tag on 380V Main Breaker CB-04.</div>
                            <div>2. Depressurize suction and discharge isolation valves.</div>
                            <div>3. Bleed casing drain plug before unbolting coupling.</div>
                            <div>4. Mandate Class 2 Electrical Gloves & Face Shield.</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AIDiagnosticsPage;
