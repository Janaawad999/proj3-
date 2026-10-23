import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
    Bot, Send, Sparkles, Trash2, Copy, Check,
    AlertCircle, RefreshCw, TrendingUp, DollarSign,
    PieChart, ShieldCheck, Image as ImageIcon,
    Mic, Play, Pause, Volume2,
    CheckCircle2, ArrowRight, X, Tag, ArrowDownRight, ArrowUpRight,
    ChevronDown, AlertTriangle
} from 'lucide-react';

const SUGGESTED_PROMPTS = [
    {
        title: 'Transactions by Date',
        prompt: 'Show me my transactions for 2026-08-30',
        icon: DollarSign
    },
    {
        title: 'Monthly Spending',
        prompt: 'How much did I spend this month?',
        icon: TrendingUp
    },
    {
        title: 'Top Expenses',
        prompt: 'What are my biggest expenses?',
        icon: PieChart
    },
    {
        title: 'Spending Analysis',
        prompt: 'Analyze my spending habits',
        icon: Sparkles
    },
    {
        title: 'Budget Check',
        prompt: 'Am I within my budget?',
        icon: ShieldCheck
    },
    {
        title: 'Financial Summary',
        prompt: 'Give me a financial summary',
        icon: Bot
    }
];

const getUserStorageKey = (prefix) => {
    try {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            const user = JSON.parse(userStr);
            const userId = user.id || user.userId || user.email || 'user';
            return `${prefix}_${userId}`;
        }
    } catch (e) {}
    return prefix;
};

function CoPilotsPage() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();

    // ────────────────────── Persistent Chat State ──────────────────────
    const [messages, setMessages] = useState(() => {
        try {
            const saved = localStorage.getItem(getUserStorageKey('montera_copilot_messages'));
            if (saved) {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    return parsed;
                }
            }
        } catch (e) {
            console.warn('Failed to load saved copilot messages:', e);
        }
        return [];
    });

    const [chatId, setChatId] = useState(() => {
        try {
            const saved = localStorage.getItem(getUserStorageKey('montera_copilot_chat_id'));
            if (saved && typeof saved === 'string' && saved.trim()) {
                return saved;
            }
        } catch (e) {
            console.warn('Failed to load saved copilot chatId:', e);
        }
        return `montera_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    });

    const [inputValue, setInputValue] = useState('');
    const [loading, setLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('Montera Co-Pilot is analyzing your financial data...');
    const [error, setError] = useState(null);
    const [copiedIndex, setCopiedIndex] = useState(null);
    const [showClearModal, setShowClearModal] = useState(false);
    const [showScrollBottom, setShowScrollBottom] = useState(false);

    // Image Upload State
    const [selectedImage, setSelectedImage] = useState(null);
    const fileInputRef = useRef(null);

    // Voice Input State
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [liveTranscript, setLiveTranscript] = useState('');
    const [playingAudioId, setPlayingAudioId] = useState(null);

    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const recordingTimerRef = useRef(null);
    const recognitionRef = useRef(null);
    const audioPlayerRef = useRef({});

    const scrollContainerRef = useRef(null);
    const messagesEndRef = useRef(null);
    const textareaRef = useRef(null);

    // Handle prefilled prompt when navigating from Radar Investigation
    useEffect(() => {
        if (location.state?.prefilledPrompt) {
            setInputValue(location.state.prefilledPrompt);
            if (textareaRef.current) {
                textareaRef.current.focus();
            }
        }
    }, [location.state]);

    // Persist messages whenever they change
    useEffect(() => {
        try {
            const key = getUserStorageKey('montera_copilot_messages');
            if (messages && messages.length > 0) {
                localStorage.setItem(key, JSON.stringify(messages));
            } else {
                localStorage.removeItem(key);
            }
        } catch (e) {
            console.warn('Failed to persist copilot messages:', e);
        }
    }, [messages]);

    // Persist chatId whenever it changes
    useEffect(() => {
        try {
            const key = getUserStorageKey('montera_copilot_chat_id');
            if (chatId) {
                localStorage.setItem(key, chatId);
            }
        } catch (e) {
            console.warn('Failed to persist copilot chatId:', e);
        }
    }, [chatId]);

    // Track scroll position to show/hide "scroll to bottom" button
    const handleScroll = () => {
        if (!scrollContainerRef.current) return;
        const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
        const isNearBottom = scrollHeight - scrollTop - clientHeight < 120;
        setShowScrollBottom(!isNearBottom);
    };

    const scrollToBottom = (smooth = true) => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({
                behavior: smooth ? 'smooth' : 'auto',
                block: 'end'
            });
        }
    };

    // Scroll to bottom on initial mount if messages exist
    useEffect(() => {
        if (messages.length > 0) {
            setTimeout(() => scrollToBottom(false), 100);
        }
    }, []);

    // Clean up timer and recorders on unmount
    useEffect(() => {
        return () => {
            if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
            if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
                try { mediaRecorderRef.current.stop(); } catch (e) {}
            }
            if (recognitionRef.current) {
                try { recognitionRef.current.stop(); } catch (e) {}
            }
        };
    }, []);

    // ────────────────────── File / Receipt Upload ──────────────────────
    const handleFileClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            setError('Please attach an image file (PNG, JPG, JPEG, WEBP).');
            return;
        }

        const reader = new FileReader();
        reader.onload = () => {
            setSelectedImage({
                file,
                name: file.name,
                size: (file.size / 1024).toFixed(1) + ' KB',
                dataUrl: reader.result
            });
            setError(null);
        };
        reader.readAsDataURL(file);

        e.target.value = '';
    };

    const handleRemoveSelectedImage = () => {
        setSelectedImage(null);
    };

    // ────────────────────── Voice Recording & Speech-to-Text ──────────────────────
    const startRecording = async () => {
        try {
            setError(null);
            setLiveTranscript('');
            setRecordingTime(0);

            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            audioChunksRef.current = [];

            let mimeType = 'audio/webm';
            if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
                mimeType = 'audio/webm;codecs=opus';
            } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
                mimeType = 'audio/mp4';
            }

            const mediaRecorder = new MediaRecorder(stream, { mimeType });
            mediaRecorderRef.current = mediaRecorder;

            mediaRecorder.ondataavailable = (event) => {
                if (event.data && event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.start(100);
            setIsRecording(true);

            recordingTimerRef.current = setInterval(() => {
                setRecordingTime((prev) => prev + 1);
            }, 1000);

            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            if (SpeechRecognition) {
                try {
                    const recognition = new SpeechRecognition();
                    recognition.continuous = true;
                    recognition.interimResults = true;
                    recognition.lang = 'en-US';

                    recognition.onresult = (event) => {
                        let fullText = '';
                        for (let i = 0; i < event.results.length; ++i) {
                            fullText += event.results[i][0].transcript;
                        }
                        if (fullText) {
                            setLiveTranscript(fullText);
                        }
                    };

                    recognition.onerror = (e) => {
                        console.warn('Speech recognition warning:', e.error);
                    };

                    recognition.start();
                    recognitionRef.current = recognition;
                } catch (e) {
                    console.warn('Speech recognition start notice:', e);
                }
            }
        } catch (err) {
            console.error('Microphone error:', err);
            setError('Could not access microphone. Please allow microphone permissions in your browser.');
        }
    };

    const stopRecording = (shouldSend = true) => {
        if (!mediaRecorderRef.current) return;

        if (recordingTimerRef.current) {
            clearInterval(recordingTimerRef.current);
            recordingTimerRef.current = null;
        }

        const capturedTranscript = liveTranscript.trim();

        if (recognitionRef.current) {
            try { recognitionRef.current.stop(); } catch (e) {}
            recognitionRef.current = null;
        }

        const mediaRecorder = mediaRecorderRef.current;

        mediaRecorder.onstop = async () => {
            try {
                mediaRecorder.stream?.getTracks().forEach((track) => track.stop());
            } catch (e) {}

            if (shouldSend) {
                if (capturedTranscript) {
                    handleSendMessage(capturedTranscript, { isVoice: true });
                } else if (audioChunksRef.current.length > 0) {
                    const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                    const reader = new FileReader();
                    reader.onload = () => {
                        handleSendMessage(null, { audioDataUrl: reader.result, isVoice: true });
                    };
                    reader.readAsDataURL(audioBlob);
                }
            }
            audioChunksRef.current = [];
            setLiveTranscript('');
        };

        if (mediaRecorder.state === 'recording') {
            mediaRecorder.stop();
        }
        setIsRecording(false);
    };

    const cancelRecording = () => {
        stopRecording(false);
        setLiveTranscript('');
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    };

    // ────────────────────── Send Message Flow ──────────────────────
    const handleSendMessage = async (textToSend = null, options = {}) => {
        const imageAttachment = options.image || selectedImage;
        const voiceAttachment = options.audioDataUrl;
        const isVoiceMessage = Boolean(options.isVoice || voiceAttachment);

        let queryText = (textToSend !== null ? textToSend : inputValue).trim();

        if (!queryText && imageAttachment) {
            queryText = 'Please inspect this receipt or payment screenshot and extract all transaction details.';
        } else if (!queryText && voiceAttachment) {
            queryText = 'Voice query';
        }

        if (!queryText && !imageAttachment && !voiceAttachment) return;
        if (loading) return;

        setError(null);
        setInputValue('');
        setSelectedImage(null);

        if (imageAttachment) {
            setLoadingMessage('Montera Co-Pilot is analyzing your receipt and extracting transaction details...');
        } else if (isVoiceMessage) {
            setLoadingMessage('Montera Co-Pilot is processing your voice query...');
        } else {
            setLoadingMessage('Montera Co-Pilot is analyzing your financial data...');
        }

        const userMsg = {
            id: `user-${Date.now()}`,
            sender: 'user',
            text: queryText,
            image: imageAttachment ? imageAttachment.dataUrl : null,
            imageName: imageAttachment ? imageAttachment.name : null,
            isVoice: isVoiceMessage,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        const updatedMessages = [...messages, userMsg];
        setMessages(updatedMessages);
        setLoading(true);

        setTimeout(() => scrollToBottom(true), 50);

        try {
            const token = localStorage.getItem('token');
            const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
            const endpoint = apiBase.endsWith('/api') ? `${apiBase}/v1/ai/query` : `${apiBase}/api/v1/ai/query`;

            const history = updatedMessages.slice(-6).map(m => ({
                role: m.sender === 'user' ? 'userMessage' : 'apiMessage',
                message: m.text
            }));

            const requestPayload = {
                question: queryText,
                chatId: chatId,
                history,
                ...(imageAttachment ? {
                    image: imageAttachment.dataUrl,
                    imageName: imageAttachment.name,
                    imageType: imageAttachment.file?.type || 'image/jpeg'
                } : {}),
                ...(voiceAttachment ? {
                    audio: voiceAttachment,
                    audioName: 'voice-message.webm'
                } : {})
            };

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                },
                body: JSON.stringify(requestPayload)
            });

            const responseData = await response.json();

            if (!response.ok) {
                const errMsg = responseData.message || responseData.error || `Server returned error (${response.status})`;
                throw new Error(errMsg);
            }

            if (responseData.chatId && responseData.chatId !== chatId) {
                setChatId(responseData.chatId);
            }

            let aiText = '';
            if (typeof responseData === 'string') {
                aiText = responseData;
            } else if (responseData && typeof responseData === 'object') {
                aiText = responseData.text ||
                    responseData.answer ||
                    responseData.response ||
                    responseData.result ||
                    (responseData.message && typeof responseData.message === 'string' ? responseData.message : '') ||
                    JSON.stringify(responseData, null, 2);
            }

            const aiMsg = {
                id: `ai-${Date.now()}`,
                sender: 'ai',
                text: aiText || 'No response generated from workflow.',
                transactionCreated: responseData.transactionCreated || null,
                audio: responseData.audio || responseData.audioUrl || null,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };

            setMessages([...updatedMessages, aiMsg]);
            setTimeout(() => scrollToBottom(true), 50);

            if (aiMsg.audio) {
                playAudioResponse(aiMsg.id, aiMsg.audio);
            }
        } catch (err) {
            console.error('❌ Montera Co-Pilot query error:', err);
            setError(err.message || 'Failed to communicate with MicroMind Core workflow.');
        } finally {
            setLoading(false);
            if (textareaRef.current) {
                textareaRef.current.focus();
            }
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    // ────────────────────── Clear Chat Modal & Flow ──────────────────────
    const handleConfirmClearChat = () => {
        setMessages([]);
        setError(null);
        setShowClearModal(false);
        const newChatId = `montera_${Date.now()}_${Math.random().toString(36).substring(7)}`;
        setChatId(newChatId);
        try {
            localStorage.removeItem(getUserStorageKey('montera_copilot_messages'));
            localStorage.setItem(getUserStorageKey('montera_copilot_chat_id'), newChatId);
        } catch (e) {}
    };

    const handleCopyText = (text, index) => {
        navigator.clipboard.writeText(text);
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
    };

    // ────────────────────── Audio Response Player ──────────────────────
    const playAudioResponse = (msgId, audioSrc) => {
        if (playingAudioId === msgId) {
            if (audioPlayerRef.current[msgId]) {
                audioPlayerRef.current[msgId].pause();
                setPlayingAudioId(null);
            }
            return;
        }

        if (playingAudioId && audioPlayerRef.current[playingAudioId]) {
            audioPlayerRef.current[playingAudioId].pause();
        }

        const audio = new Audio(audioSrc);
        audioPlayerRef.current[msgId] = audio;

        audio.onended = () => {
            setPlayingAudioId(null);
        };

        audio.play().then(() => {
            setPlayingAudioId(msgId);
        }).catch((e) => {
            console.warn('Audio playback notice:', e);
            setPlayingAudioId(null);
        });
    };

    return (
        <div style={{
            maxWidth: '1200px',
            margin: '0 auto',
            height: 'calc(100vh - 48px)',
            maxHeight: 'calc(100vh - 48px)',
            display: 'flex',
            flexDirection: 'column',
            boxSizing: 'border-box',
            position: 'relative'
        }}>
            {/* Header Plate */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '0.875rem',
                paddingBottom: '0.75rem',
                borderBottom: '1px solid var(--border-color)',
                flexShrink: 0
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                    <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '10px',
                        background: 'linear-gradient(135deg, #0D5254 0%, #2AAB91 100%)',
                        boxShadow: '0 2px 8px rgba(42, 171, 145, 0.25)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#FFFFFF'
                    }}>
                        <Bot size={22} />
                    </div>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <h1 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)', fontFamily: 'var(--heading-font)' }}>
                                Montera Co-Pilot
                            </h1>
                            <span style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                padding: '2px 8px',
                                borderRadius: '12px',
                                fontSize: '0.6875rem',
                                fontWeight: 600,
                                background: 'rgba(42, 171, 145, 0.15)',
                                color: '#2AAB91'
                            }}>
                                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#2AAB91' }} />
                                MicroMind Core
                            </span>
                        </div>
                        <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                            Financial AI Detective, Smart Receipt OCR & Voice Assistant
                        </p>
                    </div>
                </div>

                {messages.length > 0 && (
                    <button
                        onClick={() => setShowClearModal(true)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '0.5rem 0.875rem',
                            borderRadius: '8px',
                            background: 'var(--bg-surface)',
                            border: '1px solid var(--border-color)',
                            color: 'var(--text-secondary)',
                            fontSize: '0.8125rem',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.color = '#EF4444';
                            e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.3)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.color = 'var(--text-secondary)';
                            e.currentTarget.style.borderColor = 'var(--border-color)';
                        }}
                    >
                        <Trash2 size={14} />
                        <span>Clear Chat</span>
                    </button>
                )}
            </div>

            {/* Main Chat Box Container */}
            <div style={{
                flex: 1,
                minHeight: 0,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: '12px',
                boxShadow: 'var(--shadow-md)',
                position: 'relative'
            }}>
                {/* Message Scroll Area */}
                <div
                    ref={scrollContainerRef}
                    onScroll={handleScroll}
                    className="copilot-scroll"
                    style={{
                        flex: 1,
                        minHeight: 0,
                        overflowY: 'auto',
                        overflowX: 'hidden',
                        padding: '1.25rem 1.5rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1.25rem',
                        background: 'var(--bg-card)'
                    }}
                >
                    {/* Empty State: Suggested Prompts */}
                    {messages.length === 0 && (
                        <div style={{
                            margin: 'auto 0',
                            textAlign: 'center',
                            padding: '2rem 1rem'
                        }}>
                            <div style={{
                                width: '60px',
                                height: '60px',
                                borderRadius: '16px',
                                background: 'linear-gradient(135deg, rgba(13, 82, 84, 0.1) 0%, rgba(42, 171, 145, 0.15) 100%)',
                                border: '1px solid rgba(42, 171, 145, 0.3)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#0D5254',
                                margin: '0 auto 1rem auto'
                            }}>
                                <Sparkles size={30} color="#2AAB91" />
                            </div>

                            <h2 style={{ fontSize: '1.375rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.375rem' }}>
                                How can Montera assist you today?
                            </h2>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', maxWidth: '560px', margin: '0 auto 1.75rem auto' }}>
                                Ask questions about your spending, upload receipts or bank transfer screenshots to log transactions automatically, or use voice input.
                            </p>

                            {/* Suggested Prompts Grid */}
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                                gap: '0.75rem',
                                maxWidth: '800px',
                                margin: '0 auto',
                                textAlign: 'left'
                            }}>
                                {SUGGESTED_PROMPTS.map((item, idx) => {
                                    const Icon = item.icon;
                                    return (
                                        <div
                                            key={idx}
                                            onClick={() => handleSendMessage(item.prompt)}
                                            style={{
                                                padding: '0.875rem 1rem',
                                                borderRadius: '10px',
                                                background: 'var(--bg-surface)',
                                                border: '1px solid var(--border-color)',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s ease',
                                                display: 'flex',
                                                alignItems: 'flex-start',
                                                gap: '0.75rem',
                                                boxShadow: 'var(--shadow-sm)'
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.borderColor = '#2AAB91';
                                                e.currentTarget.style.transform = 'translateY(-2px)';
                                                e.currentTarget.style.boxShadow = '0 6px 16px rgba(42, 171, 145, 0.15)';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.borderColor = 'var(--border-color)';
                                                e.currentTarget.style.transform = 'translateY(0)';
                                                e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                                            }}
                                        >
                                            <div style={{
                                                width: '32px',
                                                height: '32px',
                                                borderRadius: '8px',
                                                background: 'rgba(42, 171, 145, 0.12)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: '#0D5254',
                                                flexShrink: 0
                                            }}>
                                                <Icon size={16} color="#0D5254" />
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '2px' }}>
                                                    {item.title}
                                                </div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                                    "{item.prompt}"
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Chat Messages */}
                    {messages.map((msg, index) => {
                        const isUser = msg.sender === 'user';
                        return (
                            <div
                                key={msg.id || index}
                                style={{
                                    display: 'flex',
                                    justifyContent: isUser ? 'flex-end' : 'flex-start',
                                    gap: '0.75rem',
                                    alignItems: 'flex-start'
                                }}
                            >
                                {!isUser && (
                                    <div style={{
                                        width: '32px',
                                        height: '32px',
                                        borderRadius: '8px',
                                        background: 'linear-gradient(135deg, #0D5254 0%, #2AAB91 100%)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: '#FFFFFF',
                                        flexShrink: 0,
                                        marginTop: '4px',
                                        boxShadow: '0 2px 6px rgba(42, 171, 145, 0.2)'
                                    }}>
                                        <Bot size={18} />
                                    </div>
                                )}

                                <div style={{
                                    maxWidth: '82%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: isUser ? 'flex-end' : 'flex-start'
                                }}>
                                    <div style={{
                                        padding: '0.875rem 1.125rem',
                                        borderRadius: isUser ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                                        background: isUser ? 'linear-gradient(135deg, #0D5254 0%, #1F8180 100%)' : 'var(--bg-surface)',
                                        color: isUser ? '#FFFFFF' : 'var(--text-primary)',
                                        border: isUser ? 'none' : '1px solid var(--border-color)',
                                        fontSize: '0.9375rem',
                                        lineHeight: 1.6,
                                        boxShadow: '0 2px 8px rgba(13, 82, 84, 0.08)',
                                        position: 'relative',
                                        wordBreak: 'break-word'
                                    }}>
                                        {/* User Attached Image Preview */}
                                        {isUser && msg.image && (
                                            <div style={{ marginBottom: '0.75rem' }}>
                                                <img
                                                    src={msg.image}
                                                    alt="Attached Receipt / Transfer"
                                                    style={{
                                                        maxWidth: '260px',
                                                        maxHeight: '220px',
                                                        borderRadius: '8px',
                                                        border: '2px solid rgba(255, 255, 255, 0.2)',
                                                        objectFit: 'cover',
                                                        display: 'block'
                                                    }}
                                                />
                                                {msg.imageName && (
                                                    <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.85)', marginTop: '4px' }}>
                                                        📄 {msg.imageName}
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* Voice Query Badge */}
                                        {isUser && msg.isVoice && (
                                            <div style={{
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '6px',
                                                padding: '2px 8px',
                                                borderRadius: '6px',
                                                background: 'rgba(255,255,255,0.18)',
                                                fontSize: '0.75rem',
                                                marginBottom: '0.5rem',
                                                fontWeight: 600
                                            }}>
                                                <Mic size={12} />
                                                <span>Voice Message</span>
                                            </div>
                                        )}

                                        {/* Message Text */}
                                        {isUser ? (
                                            <div style={{ fontWeight: 500 }}>{msg.text}</div>
                                        ) : (
                                            <div className="ai-markdown-content" style={{ overflowX: 'auto' }}>
                                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                    {msg.text}
                                                </ReactMarkdown>
                                            </div>
                                        )}

                                        {/* Auto-Created Transaction Confirmation Card */}
                                        {!isUser && msg.transactionCreated && (
                                            <div style={{
                                                marginTop: '1rem',
                                                padding: '1rem',
                                                borderRadius: '10px',
                                                background: 'linear-gradient(135deg, rgba(13, 82, 84, 0.08) 0%, rgba(42, 171, 145, 0.12) 100%)',
                                                border: '1px solid rgba(42, 171, 145, 0.35)',
                                                boxShadow: '0 4px 12px rgba(42, 171, 145, 0.1)'
                                            }}>
                                                <div style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '8px',
                                                    color: '#2AAB91',
                                                    fontWeight: 700,
                                                    fontSize: '0.9375rem',
                                                    marginBottom: '0.75rem'
                                                }}>
                                                    <CheckCircle2 size={18} color="#2AAB91" />
                                                    <span>Transaction added successfully.</span>
                                                </div>

                                                <div style={{
                                                    display: 'grid',
                                                    gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                                                    gap: '0.75rem',
                                                    backgroundColor: 'var(--bg-surface)',
                                                    padding: '0.75rem 1rem',
                                                    borderRadius: '8px',
                                                    border: '1px solid var(--border-color)',
                                                    marginBottom: '0.75rem'
                                                }}>
                                                    <div>
                                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Type</div>
                                                        <div style={{
                                                            display: 'inline-flex',
                                                            alignItems: 'center',
                                                            gap: '4px',
                                                            fontSize: '0.8125rem',
                                                            fontWeight: 700,
                                                            color: msg.transactionCreated.type === 'INCOME' ? '#2AAB91' : '#EF4444'
                                                        }}>
                                                            {msg.transactionCreated.type === 'INCOME' ? <ArrowDownRight size={14} /> : <ArrowUpRight size={14} />}
                                                            {msg.transactionCreated.type}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Amount</div>
                                                        <div style={{ fontWeight: 700, color: '#0D5254', fontSize: '1.05rem' }}>
                                                            ${Number(msg.transactionCreated.amount).toFixed(2)}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Party / Merchant</div>
                                                        <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.875rem' }}>
                                                            {msg.transactionCreated.merchant || 'Merchant'}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Category</div>
                                                        <div style={{
                                                            display: 'inline-flex',
                                                            alignItems: 'center',
                                                            gap: '4px',
                                                            padding: '2px 8px',
                                                            borderRadius: '4px',
                                                            background: 'rgba(42, 171, 145, 0.12)',
                                                            color: '#2AAB91',
                                                            fontSize: '0.75rem',
                                                            fontWeight: 600
                                                        }}>
                                                            <Tag size={10} />
                                                            {msg.transactionCreated.categoryName || 'Expense'}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Date</div>
                                                        <div style={{ fontSize: '0.8125rem', color: 'var(--text-primary)' }}>
                                                            {msg.transactionCreated.date}
                                                        </div>
                                                    </div>
                                                    {msg.transactionCreated.bank && (
                                                        <div>
                                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Bank / App</div>
                                                            <div style={{ fontSize: '0.8125rem', color: 'var(--text-primary)', fontWeight: 500 }}>
                                                                {msg.transactionCreated.bank}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

                                                <button
                                                    onClick={() => navigate('/transactions')}
                                                    style={{
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        gap: '6px',
                                                        padding: '6px 14px',
                                                        borderRadius: '6px',
                                                        border: 'none',
                                                        background: 'linear-gradient(135deg, #0D5254 0%, #2AAB91 100%)',
                                                        color: '#FFFFFF',
                                                        fontSize: '0.8125rem',
                                                        fontWeight: 600,
                                                        cursor: 'pointer',
                                                        boxShadow: '0 2px 6px rgba(42, 171, 145, 0.25)',
                                                        transition: 'transform 0.15s ease'
                                                    }}
                                                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateX(2px)'}
                                                    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateX(0)'}
                                                >
                                                    <span>View in Transactions</span>
                                                    <ArrowRight size={14} />
                                                </button>
                                            </div>
                                        )}

                                        {/* Audio Playback Controls */}
                                        {!isUser && msg.audio && (
                                            <div style={{
                                                marginTop: '0.75rem',
                                                padding: '0.5rem 0.75rem',
                                                borderRadius: '8px',
                                                background: 'rgba(42, 171, 145, 0.1)',
                                                border: '1px solid rgba(42, 171, 145, 0.2)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px'
                                            }}>
                                                <button
                                                    onClick={() => playAudioResponse(msg.id, msg.audio)}
                                                    style={{
                                                        width: '28px',
                                                        height: '28px',
                                                        borderRadius: '50%',
                                                        border: 'none',
                                                        background: '#2AAB91',
                                                        color: '#FFFFFF',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    {playingAudioId === msg.id ? <Pause size={14} /> : <Play size={14} />}
                                                </button>
                                                <Volume2 size={16} color="#2AAB91" />
                                                <span style={{ fontSize: '0.75rem', color: '#0D5254', fontWeight: 600 }}>
                                                    {playingAudioId === msg.id ? 'Playing Voice Response...' : 'Listen to Audio Response'}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Footer / Timestamp / Copy */}
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        marginTop: '4px',
                                        fontSize: '0.6875rem',
                                        color: 'var(--text-secondary)',
                                        padding: '0 4px'
                                    }}>
                                        <span>{msg.timestamp}</span>
                                        {!isUser && (
                                            <button
                                                onClick={() => handleCopyText(msg.text, index)}
                                                style={{
                                                    background: 'none',
                                                    border: 'none',
                                                    color: 'var(--text-secondary)',
                                                    cursor: 'pointer',
                                                    padding: '2px',
                                                    display: 'flex',
                                                    alignItems: 'center'
                                                }}
                                                title="Copy to clipboard"
                                            >
                                                {copiedIndex === index ? <Check size={12} style={{ color: '#2AAB91' }} /> : <Copy size={12} />}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    {/* Typing Loading State */}
                    {loading && (
                        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                            <div style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '8px',
                                background: 'linear-gradient(135deg, #0D5254 0%, #2AAB91 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#FFFFFF',
                                flexShrink: 0
                            }}>
                                <Bot size={18} />
                            </div>
                            <div style={{
                                padding: '0.875rem 1.125rem',
                                borderRadius: '14px 14px 14px 2px',
                                background: 'var(--bg-surface)',
                                border: '1px solid var(--border-color)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                boxShadow: 'var(--shadow-sm)'
                            }}>
                                <div style={{
                                    width: '18px',
                                    height: '18px',
                                    border: '2px solid rgba(42, 171, 145, 0.2)',
                                    borderTopColor: '#2AAB91',
                                    borderRadius: '50%',
                                    animation: 'mm-spin 0.8s linear infinite'
                                }} />
                                <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                    {loadingMessage}
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Error Banner */}
                    {error && (
                        <div style={{
                            padding: '0.875rem 1rem',
                            borderRadius: '8px',
                            background: 'rgba(239, 68, 68, 0.1)',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            color: 'var(--danger-color, #EF4444)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            fontSize: '0.875rem'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <AlertCircle size={16} />
                                <span>{error}</span>
                            </div>
                            <button
                                onClick={() => handleSendMessage(messages[messages.length - 1]?.text)}
                                style={{
                                    background: 'none',
                                    border: '1px solid rgba(239, 68, 68, 0.4)',
                                    color: 'var(--danger-color, #EF4444)',
                                    borderRadius: '6px',
                                    padding: '4px 10px',
                                    fontSize: '0.75rem',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px'
                                }}
                            >
                                <RefreshCw size={12} />
                                Retry
                            </button>
                        </div>
                    )}

                    <div ref={messagesEndRef} style={{ height: '1px' }} />
                </div>

                {/* Floating "Scroll to Bottom" button when scrolled up */}
                {showScrollBottom && (
                    <button
                        onClick={() => scrollToBottom(true)}
                        style={{
                            position: 'absolute',
                            right: '24px',
                            bottom: '80px',
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            background: '#0D5254',
                            border: '1px solid #2AAB91',
                            color: '#FFFFFF',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                            zIndex: 10,
                            transition: 'transform 0.15s ease'
                        }}
                        title="Scroll to latest messages"
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.08)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    >
                        <ChevronDown size={18} />
                    </button>
                )}

                {/* Input Bar */}
                <div style={{
                    padding: '0.875rem 1rem',
                    borderTop: '1px solid var(--border-color)',
                    background: 'var(--bg-surface)',
                    flexShrink: 0
                }}>
                    {/* Selected Image Thumbnail Preview Chip */}
                    {selectedImage && (
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            padding: '6px 12px',
                            background: 'rgba(42, 171, 145, 0.1)',
                            border: '1px solid rgba(42, 171, 145, 0.3)',
                            borderRadius: '8px',
                            marginBottom: '0.75rem',
                            width: 'fit-content'
                        }}>
                            <img
                                src={selectedImage.dataUrl}
                                alt="Receipt / Transfer Thumbnail"
                                style={{
                                    width: '36px',
                                    height: '36px',
                                    borderRadius: '4px',
                                    objectFit: 'cover'
                                }}
                            />
                            <div style={{ fontSize: '0.8125rem' }}>
                                <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{selectedImage.name}</div>
                                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{selectedImage.size} • Ready to analyze</div>
                            </div>
                            <button
                                onClick={handleRemoveSelectedImage}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: 'var(--text-secondary)',
                                    cursor: 'pointer',
                                    padding: '2px',
                                    display: 'flex',
                                    alignItems: 'center'
                                }}
                                title="Remove attachment"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    )}

                    {/* Active Voice Recording UI State */}
                    {isRecording ? (
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '0.75rem 1rem',
                            borderRadius: '10px',
                            background: 'rgba(239, 68, 68, 0.08)',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            animation: 'pulse 1.5s infinite'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={{
                                    width: '12px',
                                    height: '12px',
                                    borderRadius: '50%',
                                    background: '#EF4444',
                                    animation: 'mm-pulse 1s infinite'
                                }} />
                                <span style={{ fontWeight: 700, color: '#EF4444', fontSize: '0.875rem' }}>
                                    Listening... {formatTime(recordingTime)}
                                </span>
                                {liveTranscript && (
                                    <span style={{ fontSize: '0.8125rem', color: 'var(--text-primary)', fontStyle: 'italic', maxWidth: '350px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        "{liveTranscript}"
                                    </span>
                                )}
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <button
                                    type="button"
                                    onClick={cancelRecording}
                                    style={{
                                        padding: '6px 12px',
                                        borderRadius: '6px',
                                        border: '1px solid var(--border-color)',
                                        background: 'var(--bg-surface)',
                                        color: 'var(--text-secondary)',
                                        fontSize: '0.8125rem',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={() => stopRecording(true)}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        padding: '6px 16px',
                                        borderRadius: '6px',
                                        border: 'none',
                                        background: 'linear-gradient(135deg, #0D5254 0%, #2AAB91 100%)',
                                        color: '#FFFFFF',
                                        fontSize: '0.8125rem',
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                        boxShadow: '0 2px 8px rgba(42, 171, 145, 0.3)'
                                    }}
                                >
                                    <Send size={14} />
                                    Send Voice
                                </button>
                            </div>
                        </div>
                    ) : (
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                handleSendMessage();
                            }}
                            style={{
                                display: 'flex',
                                gap: '0.5rem',
                                alignItems: 'center'
                            }}
                        >
                            {/* Hidden File Input */}
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                style={{ display: 'none' }}
                            />

                            {/* Image / Attachment Button */}
                            <button
                                type="button"
                                onClick={handleFileClick}
                                disabled={loading}
                                style={{
                                    width: '42px',
                                    height: '42px',
                                    borderRadius: '10px',
                                    border: '1px solid var(--border-color)',
                                    background: selectedImage ? 'rgba(42, 171, 145, 0.15)' : 'var(--bg-surface)',
                                    color: selectedImage ? '#2AAB91' : 'var(--text-secondary)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: loading ? 'not-allowed' : 'pointer',
                                    transition: 'all 0.2s ease',
                                    flexShrink: 0
                                }}
                                title="Attach Receipt or Bank Transfer Screenshot"
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.borderColor = '#2AAB91';
                                    e.currentTarget.style.color = '#2AAB91';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.borderColor = selectedImage ? '#2AAB91' : 'var(--border-color)';
                                    e.currentTarget.style.color = selectedImage ? '#2AAB91' : 'var(--text-secondary)';
                                }}
                            >
                                <ImageIcon size={20} />
                            </button>

                            {/* Voice Input Button */}
                            <button
                                type="button"
                                onClick={startRecording}
                                disabled={loading}
                                style={{
                                    width: '42px',
                                    height: '42px',
                                    borderRadius: '10px',
                                    border: '1px solid var(--border-color)',
                                    background: 'var(--bg-surface)',
                                    color: 'var(--text-secondary)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: loading ? 'not-allowed' : 'pointer',
                                    transition: 'all 0.2s ease',
                                    flexShrink: 0
                                }}
                                title="Record Voice Message"
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.borderColor = '#2AAB91';
                                    e.currentTarget.style.color = '#2AAB91';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.borderColor = 'var(--border-color)';
                                    e.currentTarget.style.color = 'var(--text-secondary)';
                                }}
                            >
                                <Mic size={20} />
                            </button>

                            {/* Textarea */}
                            <textarea
                                ref={textareaRef}
                                rows={1}
                                placeholder={
                                    selectedImage
                                        ? "Receipt/screenshot attached. Press Send or add details..."
                                        : "Ask Montera, attach receipt image, or speak... (Enter to send)"
                                }
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={handleKeyDown}
                                disabled={loading}
                                style={{
                                    flex: 1,
                                    padding: '0.75rem 1rem',
                                    borderRadius: '10px',
                                    background: 'var(--bg-input, var(--bg-surface))',
                                    border: '1px solid var(--border-color)',
                                    color: 'var(--text-primary)',
                                    fontSize: '0.9375rem',
                                    resize: 'none',
                                    outline: 'none',
                                    maxHeight: '120px'
                                }}
                            />

                            {/* Send Button */}
                            <button
                                type="submit"
                                disabled={loading || (!inputValue.trim() && !selectedImage)}
                                style={{
                                    width: '44px',
                                    height: '44px',
                                    borderRadius: '10px',
                                    border: 'none',
                                    background: (inputValue.trim() || selectedImage) && !loading
                                        ? 'linear-gradient(135deg, #0D5254 0%, #2AAB91 100%)'
                                        : 'var(--bg-hover)',
                                    color: '#FFFFFF',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: (inputValue.trim() || selectedImage) && !loading ? 'pointer' : 'not-allowed',
                                    transition: 'all 0.2s ease',
                                    boxShadow: (inputValue.trim() || selectedImage) && !loading ? '0 2px 8px rgba(42, 171, 145, 0.3)' : 'none',
                                    flexShrink: 0
                                }}
                            >
                                <Send size={18} />
                            </button>
                        </form>
                    )}
                </div>
            </div>

            {/* Clear Chat Confirmation Modal */}
            {showClearModal && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.65)',
                    backdropFilter: 'blur(4px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 9999,
                    padding: '1rem'
                }}>
                    <div style={{
                        background: 'var(--bg-surface, #1E1E1E)',
                        border: '1px solid var(--border-color, #333)',
                        borderRadius: '14px',
                        padding: '1.5rem',
                        maxWidth: '420px',
                        width: '100%',
                        boxShadow: '0 12px 36px rgba(0, 0, 0, 0.4)',
                        animation: 'mm-scale-in 0.15s ease'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1rem' }}>
                            <div style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '10px',
                                background: 'rgba(239, 68, 68, 0.15)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#EF4444',
                                flexShrink: 0
                            }}>
                                <AlertTriangle size={22} />
                            </div>
                            <div>
                                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                                    Clear Conversation?
                                </h3>
                                <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                                    This action will remove all current messages.
                                </p>
                            </div>
                        </div>

                        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '1.25rem' }}>
                            Are you sure you want to clear your current conversation with Montera Co-Pilot? This cannot be undone and will start a new session.
                        </p>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                            <button
                                onClick={() => setShowClearModal(false)}
                                style={{
                                    padding: '0.625rem 1rem',
                                    borderRadius: '8px',
                                    border: '1px solid var(--border-color)',
                                    background: 'var(--bg-card)',
                                    color: 'var(--text-primary)',
                                    fontSize: '0.875rem',
                                    fontWeight: 500,
                                    cursor: 'pointer'
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmClearChat}
                                style={{
                                    padding: '0.625rem 1.25rem',
                                    borderRadius: '8px',
                                    border: 'none',
                                    background: '#EF4444',
                                    color: '#FFFFFF',
                                    fontSize: '0.875rem',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    boxShadow: '0 2px 8px rgba(239, 68, 68, 0.3)'
                                }}
                            >
                                Clear Chat
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default CoPilotsPage;
