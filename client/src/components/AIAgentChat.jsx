import React, { useState, useRef, useEffect } from 'react';
import { useTranslation, Trans } from 'react-i18next';
// import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { BarChart, Bar, PieChart, Pie, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import CustomSelect from '../components/CustomSelect';
import { Layers } from 'lucide-react';

// Component to render authenticated images
const AuthenticatedImage = ({ src, alt, style, chatId, filename, chatflowId }) => {
    const { t } = useTranslation();
    const [imageSrc, setImageSrc] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const objectUrlRef = useRef(null);

    useEffect(() => {
        let isMounted = true;
        const fetchImage = async () => {
            try {
                // Centralize image fetching through our backend proxy which handles multi-bot logic
                const token = localStorage.getItem('token');
                const proxyUrl = src.includes('?')
                    ? `${src}&chatflowId=${chatflowId}`
                    : `${src}?chatflowId=${chatflowId}`;

                console.log('🔗 Fetching image through proxy:', proxyUrl);

                const response = await fetch(proxyUrl, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    throw new Error(`Failed to load image: ${response.status}`);
                }

                const blob = await response.blob();
                const objectUrl = URL.createObjectURL(blob);
                if (isMounted) {
                    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
                    objectUrlRef.current = objectUrl;
                    setImageSrc(objectUrl);
                    setLoading(false);
                } else {
                    URL.revokeObjectURL(objectUrl);
                }
            } catch (err) {
                if (isMounted) {
                    console.error('Error loading authenticated image:', err);
                    setError(err.message);
                    setLoading(false);
                }
            }
        };

        fetchImage();

        // Cleanup on unmount or dep change
        return () => {
            isMounted = false;
            // distinct cleanup logic handled by ref tracking
        };
    }, [src, chatId, filename, chatflowId]);

    // Cleanup on component unmount (separate effect for ref cleanup)
    useEffect(() => {
        return () => {
            if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
        };
    }, []);

    if (loading) {
        return (
            <div style={{ ...style, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f1f5f9' }}>
                <div style={{ color: '#64748b' }}>{t('aiChat.messages.loadingImage')}</div>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ ...style, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fee2e2', color: '#ef4444', padding: '1rem', borderRadius: '8px' }}>
                ⚠️ {t('aiChat.messages.imageError', { error })}
            </div>
        );
    }

    return <img src={imageSrc} alt={alt} style={style} />;
};

const AIAgentChat = () => {
    const { t } = useTranslation();

    const getContextLabel = (ctx) => {
        switch (ctx) {
            case 'Report Generation': return t('aiChat.context.scopes.visitAudit');
            case 'Collector Data': return t('aiChat.context.scopes.collections');
            case 'Weekly Planning': return t('aiChat.context.scopes.weeklyPlanning');
            case 'Daily Actions': return t('aiChat.context.scopes.dailyActions');
            case 'General Inquiry': return t('aiChat.context.scopes.general');
            default: return ctx;
        }
    };

    const getModeLabel = (m) => t(`aiChat.context.modes.${m.toLowerCase()}`);
    // const navigate = useNavigate();
    const [sessions, setSessions] = useState([]);
    const [currentSessionId, setCurrentSessionId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [loading, setLoading] = useState(false);

    // Context State
    const [taskContext, setTaskContext] = useState('Report Generation');
    const [activeMode, setActiveMode] = useState('Conversation');

    // Map context to AI Agent IDs
    // Configure these in your organization's AI settings or environment variables
    const getChatflowId = (context) => {
        // Default: use a single AI Agent for all contexts
        // Customize this mapping when you have multiple specialized agents
        switch (context) {
            case 'Report Generation':
                return null; // Uses default AI Agent from backend
            case 'Collector Data':
                return null; // Configure: specialized data analysis agent
            case 'Weekly Planning':
                return null; // Configure: planning assistant agent
            case 'Daily Actions':
                return null; // Configure: daily operations agent
            case 'General Inquiry':
            default:
                return null; // Uses default AI Agent from backend
        }
    };

    // Menu state for chat options
    const [menuOpenForSession, setMenuOpenForSession] = useState(null);
    const [editingSessionId, setEditingSessionId] = useState(null);
    const [editingTitle, setEditingTitle] = useState('');

    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Load Sessions on Mount
    useEffect(() => {
        loadSessions();
    }, []);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = () => {
            if (menuOpenForSession) setMenuOpenForSession(null);
        };
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, [menuOpenForSession]);

    const loadSessions = async () => {
        // Sessions are now managed locally, no need to load from backend
        // You can add localStorage persistence here if needed
    };

    const handleNewChat = async (initialMessage = null) => {
        try {
            // Create a local session without backend call
            const newSession = {
                id: `session-${Date.now()}`,
                title: t('aiChat.history.untitled'),
                context: JSON.stringify({ task: taskContext, mode: activeMode }),
                createdAt: new Date().toISOString()
            };

            setSessions([newSession, ...sessions]);
            setCurrentSessionId(newSession.id);

            // Initial AI Greeting
            const greeting = {
                id: 'welcome',
                sender: 'ai',
                text: t('aiChat.messages.greeting', { context: getContextLabel(taskContext), mode: getModeLabel(activeMode) }),
                timestamp: new Date().toISOString()
            };
            setMessages([greeting]);

            // If an initial message was provided (clicked from prompts), send it immediately
            if (initialMessage) {
                await sendMessageToSession(newSession.id, initialMessage, [greeting]);
            }

        } catch (error) {
            console.error('Failed to create session', error);
            alert(t('common.error'));
        }
    };

    const handleSelectSession = async (sessionId) => {
        try {
            const session = sessions.find(s => s.id === sessionId);
            if (!session) {
                console.error('Session not found');
                return;
            }

            setCurrentSessionId(session.id);

            // Parse context if exists
            if (session.context) {
                const ctx = JSON.parse(session.context);
                setTaskContext(ctx.task || 'Report Generation');
                setActiveMode(ctx.mode || 'Conversation');
            }

            // For now, start with a fresh greeting when selecting a session
            // You can add message persistence to localStorage if needed
            const greeting = {
                id: 'welcome',
                sender: 'ai',
                text: t('aiChat.messages.welcomeBack', { context: getContextLabel(taskContext) }),
                timestamp: new Date().toISOString()
            };
            setMessages([greeting]);
        } catch (error) {
            console.error('Failed to load session', error);
        }
    };

    // Helper to send message to a specific session
    const sendMessageToSession = async (sessionId, text, currentMessages) => {
        let textToSend = text;

        // Message Amendment Logic based on Mode
        if (activeMode === 'Conversation') {
            const allMessages = currentMessages || messages;
            const hasUserMessages = allMessages.some(m => m.sender === 'user');
            const lastAiMessage = [...allMessages].reverse().find(m => m.sender === 'ai');

            // Only amend if there's a history of user interaction
            if (lastAiMessage && hasUserMessages) {
                textToSend = `your last response was to the user request: ${lastAiMessage.text}\n\nUser Request: ${text}`;
            }
        } else if (activeMode === 'Reports') {
            textToSend = `${text} in a tabular format all dates.`;
        } else if (activeMode === 'Analysis') {
            textToSend = `${text}. this required for analysis provide comparisons on the proper chart view whenever possible.`;
        }

        const tempId = Date.now();
        // Optimistic update - Add user message
        setMessages(prev => [...(currentMessages || prev), {
            id: tempId,
            sender: 'user',
            text: text, // Show original text to user
            timestamp: new Date().toISOString()
        }]);
        setLoading(true);

        try {
            console.log('📤 Sending amended request to backend:', textToSend);

            // Call our backend API which proxies to MicroMind Core
            const token = localStorage.getItem('token');
            const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
            const chatEndpoint = apiBase.endsWith('/api') ? `${apiBase}/v1/ai/chat/micromind` : `${apiBase}/api/v1/ai/chat/micromind`;

            const response = await fetch(
                chatEndpoint,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        ...(token ? { "Authorization": `Bearer ${token}` } : {})
                    },
                    body: JSON.stringify({
                        question: textToSend,
                        chatflowId: getChatflowId(taskContext)
                    })
                }
            );

            console.log('📥 Backend response status:', response.status);

            if (!response.ok) {
                let errorMessage = `API request failed with status ${response.status}`;
                try {
                    const errorData = await response.json();
                    console.error('Error response data:', errorData);
                    errorMessage = errorData.message || errorData.error || errorMessage;
                } catch (e) {
                    console.error('Error parsing error response:', e);
                    const errorText = await response.text();
                    console.error('Error response text:', errorText);
                    if (errorText) errorMessage = errorText;
                }
                throw new Error(errorMessage);
            }

            // Extract the AI response text
            let aiResponseText = '';
            if (typeof result === 'string') {
                aiResponseText = result;
            } else if (result && typeof result === 'object') {
                aiResponseText = result.text || result.answer || result.response || result.result || (result.message && typeof result.message === 'string' ? result.message : '') || (result.data ? JSON.stringify(result.data, null, 2) : '');
            }

            // Process artifacts - URLs are already backend proxy URLs
            let messageArtifacts = [];
            if (result.artifacts && Array.isArray(result.artifacts)) {
                const serverOrigin = apiBase.replace(/\/api\/?$/, '');
                messageArtifacts = result.artifacts.map(artifact => {
                    let artifactUrl = artifact.url;
                    if (artifactUrl && !artifactUrl.startsWith('http')) {
                        artifactUrl = `${serverOrigin}${artifactUrl}`;
                    }
                    return {
                        ...artifact,
                        url: artifactUrl
                    };
                });
            }
            console.log('✅ Processed artifacts:', messageArtifacts);

            // Update messages with confirmed user message and AI response
            setMessages(prev => {
                const filtered = prev.filter(m => m.id !== tempId);
                return [...filtered,
                {
                    id: `user-${tempId}`,
                    sender: 'user',
                    text: text,
                    timestamp: new Date().toISOString()
                },
                {
                    id: `ai-${Date.now()}`,
                    sender: 'ai',
                    text: aiResponseText || t('aiChat.messages.visualization'),
                    artifacts: messageArtifacts,
                    timestamp: new Date().toISOString()
                }
                ];
            });

        } catch (error) {
            console.error('Failed to send message', error);

            // Extract a user-friendly error message
            let userMessage = t('aiChat.messages.error');

            if (error.message.includes('500')) {
                userMessage = `⚠️ ${t('aiChat.messages.serverError')}`;
            } else if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
                userMessage = `⚠️ ${t('aiChat.messages.networkError')}`;
            } else if (error.message) {
                userMessage = `⚠️ Error: ${error.message}`;
            }

            setMessages(prev => [...prev, {
                id: Date.now(),
                sender: 'ai',
                text: userMessage,
                timestamp: new Date().toISOString(),
                isError: true
            }]);
        } finally {
            setLoading(false);
        }
    };

    const handleSendMessage = async (e, manualText = null) => {
        if (e) e.preventDefault();
        const textToSend = manualText || inputValue;
        if (!textToSend.trim() || !currentSessionId) return;

        setInputValue('');
        await sendMessageToSession(currentSessionId, textToSend, null);
    };

    const toggleMode = (mode) => {
        setActiveMode(mode);
    };

    // Handle renaming a session
    const handleRenameSession = (sessionId, currentTitle) => {
        setEditingSessionId(sessionId);
        setEditingTitle(currentTitle || t('aiChat.history.untitled'));
        setMenuOpenForSession(null);
    };

    const saveRename = (sessionId) => {
        setSessions(prev => prev.map(s =>
            s.id === sessionId ? { ...s, title: editingTitle } : s
        ));
        setEditingSessionId(null);
        setEditingTitle('');
    };

    const cancelRename = () => {
        setEditingSessionId(null);
        setEditingTitle('');
    };

    // Handle deleting a session
    const handleDeleteSession = (sessionId) => {
        if (confirm(t('aiChat.history.confirmDelete'))) {
            setSessions(prev => prev.filter(s => s.id !== sessionId));
            if (currentSessionId === sessionId) {
                setCurrentSessionId(null);
                setMessages([]);
            }
        }
        setMenuOpenForSession(null);
    };

    // Fast Start Prompts based on Context
    const getPrompts = () => {
        // Weekly Planning Specific Prompts (Based on VW_WEEKLY_PLANNING_UNIFIED)
        if (taskContext === 'Weekly Planning') {
            if (activeMode === 'Analysis') {
                return [
                    t('aiChat.prompts.weeklyPlanning.aging'),
                    t('aiChat.prompts.weeklyPlanning.balance'),
                    t('aiChat.prompts.weeklyPlanning.efficiency')
                ];
            }
            if (activeMode === 'Reports') {
                return [
                    t('aiChat.prompts.weeklyPlanning.gap'),
                    t('aiChat.prompts.weeklyPlanning.efficiency'),
                    t('aiChat.prompts.weeklyPlanning.location')
                ];
            }
            // Conversation (Default)
            return [
                t('aiChat.prompts.weeklyPlanning.gap'),
                t('aiChat.prompts.weeklyPlanning.location'),
                t('aiChat.prompts.weeklyPlanning.balance')
            ];
        }

        // Daily Actions Specific Prompts (Based on VW_DAILY_ACTIONS_UNIFIED)
        if (taskContext === 'Daily Actions') {
            if (activeMode === 'Analysis') {
                return [
                    t('aiChat.prompts.dailyActions.efficiency'),
                    t('aiChat.prompts.dailyActions.cash'),
                    t('aiChat.prompts.dailyActions.compliance')
                ];
            }
            if (activeMode === 'Reports') {
                return [
                    t('aiChat.prompts.dailyActions.closed'),
                    t('aiChat.prompts.dailyActions.reschedule'),
                    t('aiChat.prompts.dailyActions.stalled')
                ];
            }
            // Conversation (Default)
            return [
                t('aiChat.prompts.dailyActions.progress'),
                t('aiChat.prompts.dailyActions.risk'),
                t('aiChat.prompts.dailyActions.stalled')
            ];
        }

        // Default categories based on mode
        if (activeMode === 'Reports') {
            return [t('aiChat.prompts.reports.visits'), t('aiChat.prompts.reports.failed'), t('aiChat.prompts.reports.rate')];
        }
        if (activeMode === 'Conversation') {
            return [t('aiChat.prompts.conversation.recent'), t('aiChat.prompts.conversation.team'), t('aiChat.prompts.conversation.risk')];
        }
        return [t('aiChat.prompts.analysis.trends'), t('aiChat.prompts.analysis.efficiency')];
    };

    return (
        <div style={{ display: 'flex', height: '700px', backgroundColor: 'var(--bg-surface)', fontFamily: "'Inter', sans-serif", borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border)' }}>

            {/* SIDEBAR */}
            <div style={{
                width: '300px',
                backgroundColor: 'var(--bg-surface)',
                borderRight: '1px solid var(--border)',
                display: 'flex',
                flexDirection: 'column',
                zIndex: 20
            }}>
                <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                        {/* Back button removed */}
                        <h2 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-primary)' }}>{t('aiChat.title')}</h2>
                    </div>

                    <button
                        onClick={() => handleNewChat()}
                        style={{
                            width: '100%',
                            padding: '0.75rem',
                            background: 'linear-gradient(135deg, #0D5254 0%, #2AAB91 100%)',
                            color: '#FFFFFF',
                            border: 'none',
                            borderRadius: '8px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem',
                            boxShadow: '0 2px 6px rgba(42, 171, 145, 0.25)'
                        }}
                    >
                        <span>+</span> {t('aiChat.newChat')}
                    </button>
                </div>

                <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
                    {/* Context Configuration */}
                    <div style={{ marginBottom: '2rem' }}>
                        <h3 style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em', marginBottom: '1rem' }}>{t('aiChat.context.title')}</h3>

                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>{t('aiChat.context.scope')}</label>
                            <CustomSelect
                                value={taskContext}
                                onChange={(val) => setTaskContext(val)}
                                options={[
                                    { value: "Report Generation", label: t('aiChat.context.scopes.visitAudit') },
                                    { value: "Collector Data", label: t('aiChat.context.scopes.collections') },
                                    { value: "Weekly Planning", label: t('aiChat.context.scopes.weeklyPlanning') },
                                    { value: "Daily Actions", label: t('aiChat.context.scopes.dailyActions') },
                                    { value: "General Inquiry", label: t('aiChat.context.scopes.general') }
                                ]}
                                icon={Layers}
                                style={{
                                    backgroundColor: 'var(--bg-hover)',
                                }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>{t('aiChat.context.mode')}</label>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                {['Conversation', 'Reports', 'Analysis'].map(mode => (
                                    <button
                                        key={mode}
                                        onClick={() => toggleMode(mode)}
                                        style={{
                                            padding: '0.25rem 0.75rem',
                                            borderRadius: '9999px',
                                            border: '1px solid',
                                            borderColor: activeMode === mode ? '#2AAB91' : 'var(--border)',
                                            backgroundColor: activeMode === mode ? '#2AAB91' : 'var(--bg-hover)',
                                            color: activeMode === mode ? '#FFFFFF' : 'var(--text-muted)',
                                            fontSize: '0.75rem',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        {t(`aiChat.context.modes.${mode.toLowerCase()}`)}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* History */}
                    <div>
                        <h3 style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em', marginBottom: '1rem' }}>{t('aiChat.history.title')}</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {sessions.map(session => (
                                <div
                                    key={session.id}
                                    style={{
                                        position: 'relative',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        padding: '0.75rem',
                                        backgroundColor: currentSessionId === session.id ? 'var(--bg-hover)' : 'transparent',
                                        borderRadius: '8px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    {editingSessionId === session.id ? (
                                        <div style={{ flex: 1, display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                            <input
                                                type="text"
                                                value={editingTitle}
                                                onChange={(e) => setEditingTitle(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') saveRename(session.id);
                                                    if (e.key === 'Escape') cancelRename();
                                                }}
                                                autoFocus
                                                style={{
                                                    flex: 1,
                                                    padding: '0.25rem 0.5rem',
                                                    border: '1px solid #2563eb',
                                                    borderRadius: '4px',
                                                    fontSize: '0.9rem',
                                                    outline: 'none'
                                                }}
                                            />
                                            <button
                                                onClick={() => saveRename(session.id)}
                                                style={{
                                                    padding: '0.25rem 0.5rem',
                                                    backgroundColor: '#2563eb',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '4px',
                                                    fontSize: '0.75rem',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                ✓
                                            </button>
                                            <button
                                                onClick={cancelRename}
                                                style={{
                                                    padding: '0.25rem 0.5rem',
                                                    backgroundColor: '#64748b',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '4px',
                                                    fontSize: '0.75rem',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            <div
                                                onClick={() => handleSelectSession(session.id)}
                                                style={{
                                                    flex: 1,
                                                    color: currentSessionId === session.id ? '#2AAB91' : 'var(--text-muted)',
                                                    fontSize: '0.9rem',
                                                    whiteSpace: 'nowrap',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis'
                                                }}
                                            >
                                                {session.title || t('aiChat.history.untitled')}
                                            </div>
                                            <div style={{ position: 'relative' }}>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setMenuOpenForSession(menuOpenForSession === session.id ? null : session.id);
                                                    }}
                                                    style={{
                                                        background: 'none',
                                                        border: 'none',
                                                        color: '#64748b',
                                                        cursor: 'pointer',
                                                        padding: '0.25rem',
                                                        fontSize: '1rem',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center'
                                                    }}
                                                >
                                                    ⋮
                                                </button>

                                                {menuOpenForSession === session.id && (
                                                    <div
                                                        style={{
                                                            position: 'absolute',
                                                            right: 0,
                                                            top: '100%',
                                                            marginTop: '0.25rem',
                                                            backgroundColor: 'var(--bg-surface)',
                                                            border: '1px solid var(--border)',
                                                            borderRadius: '8px',
                                                            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                                                            zIndex: 50,
                                                            minWidth: '120px',
                                                            overflow: 'hidden'
                                                        }}
                                                    >
                                                        <button
                                                            onClick={() => handleRenameSession(session.id, session.title)}
                                                            style={{
                                                                width: '100%',
                                                                padding: '0.5rem 0.75rem',
                                                                textAlign: 'left',
                                                                background: 'none',
                                                                border: 'none',
                                                                cursor: 'pointer',
                                                                fontSize: '0.85rem',
                                                                color: 'var(--text-primary)',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: '0.5rem'
                                                            }}
                                                            onMouseEnter={(e) => e.target.style.backgroundColor = '#f1f5f9'}
                                                            onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                                                        >
                                                            ✏️ {t('aiChat.history.rename')}
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteSession(session.id)}
                                                            style={{
                                                                width: '100%',
                                                                padding: '0.5rem 0.75rem',
                                                                textAlign: 'left',
                                                                background: 'none',
                                                                border: 'none',
                                                                cursor: 'pointer',
                                                                fontSize: '0.85rem',
                                                                color: '#ef4444',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: '0.5rem'
                                                            }}
                                                            onMouseEnter={(e) => e.target.style.backgroundColor = '#fee2e2'}
                                                            onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                                                        >
                                                            🗑️ {t('aiChat.history.delete')}
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* MAIN CHAT AREA */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', backgroundColor: 'var(--bg-surface)' }}>
                {!currentSessionId ? (
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                        <div style={{ marginBottom: '1.5rem' }}>
                            <img src="/assets/logo.png" alt="MONTERA Logo" style={{ width: '64px', height: '64px', objectFit: 'contain' }} />
                        </div>
                        <h2 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>{t('aiChat.welcome.title')}</h2>
                        <p style={{ marginBottom: '2rem', textAlign: 'center' }}>
                            {t('aiChat.messages.greeting', { context: getContextLabel(taskContext), mode: getModeLabel(activeMode) })}
                        </p>

                        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center', maxWidth: '600px' }}>
                            {getPrompts().map((prompt, i) => (
                                <button
                                    key={i}
                                    onClick={() => handleNewChat(prompt)}
                                    style={{
                                        padding: '0.75rem 1.5rem',
                                        backgroundColor: 'var(--bg-hover)',
                                        border: '1px solid var(--border)',
                                        borderRadius: '9999px',
                                        color: '#0D5254',
                                        fontWeight: '500',
                                        cursor: 'pointer',
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                                        transition: 'all 0.2s'
                                    }}
                                    onMouseEnter={(e) => { e.target.style.borderColor = '#2AAB91'; e.target.style.transform = 'translateY(-2px)'; }}
                                    onMouseLeave={(e) => { e.target.style.borderColor = 'var(--border)'; e.target.style.transform = 'translateY(0)'; }}
                                >
                                    {prompt}
                                </button>
                            ))}
                        </div>

                        <div style={{ marginTop: '2rem' }}>
                            <button
                                onClick={() => handleNewChat()}
                                style={{
                                    padding: '0.75rem 2rem',
                                    background: 'linear-gradient(135deg, #0D5254 0%, #2AAB91 100%)',
                                    color: '#FFFFFF',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    boxShadow: '0 2px 8px rgba(42, 171, 145, 0.25)'
                                }}
                            >
                                {t('aiChat.welcome.startBlank')}
                            </button>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Messages */}
                        <div style={{ flex: 1, overflowY: 'auto', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            {messages.map((msg) => (
                                <div
                                    key={msg.id}
                                    style={{
                                        display: 'flex',
                                        justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                                        alignItems: 'flex-start',
                                        gap: '1rem'
                                    }}
                                >
                                    {msg.sender === 'ai' && (
                                        <div style={{ width: '32px', height: '32px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <img src="/assets/logo.png" alt="AI" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                        </div>
                                    )}
                                    <div style={{
                                        maxWidth: msg.sender === 'user' ? '70%' : '90%',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '0.75rem',
                                        width: msg.sender === 'user' ? 'auto' : '100%'
                                    }}>
                                        {/* Message Text Bubble */}
                                        <div
                                            className={msg.sender === 'user' ? 'ai-user-bubble-gold' : ''}
                                            style={{
                                                padding: '1rem 1.25rem',
                                                borderRadius: '16px',
                                                borderTopLeftRadius: msg.sender === 'ai' ? '4px' : '16px',
                                                borderTopRadius: msg.sender === 'user' ? '4px' : '16px',
                                                backgroundColor: msg.sender === 'user' ? 'transparent' : 'var(--bg-hover)',
                                                color: 'var(--text-primary)',
                                                boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                                                lineHeight: '1.5',
                                                width: 'fit-content',
                                                maxWidth: '100%',
                                                overflowX: 'auto'
                                            }}>
                                            {msg.sender === 'ai' ? (
                                                <>
                                                    {/* Render artifacts (images) at the TOP before text */}
                                                    {msg.artifacts && msg.artifacts.length > 0 && (
                                                        <div style={{ marginBottom: '1rem' }}>
                                                            {console.log('Rendering artifacts for message:', msg.id, msg.artifacts)}
                                                            {msg.artifacts.map((artifact, idx) => {
                                                                console.log(`Rendering artifact ${idx}:`, artifact);
                                                                // Check if it's an image type (including 'png', 'jpg', 'jpeg', 'gif', 'image')
                                                                const isImage = artifact.url && (
                                                                    artifact.type === 'image' ||
                                                                    artifact.type === 'png' ||
                                                                    artifact.type === 'jpg' ||
                                                                    artifact.type === 'jpeg' ||
                                                                    artifact.type === 'gif' ||
                                                                    artifact.format === 'png' ||
                                                                    artifact.format === 'jpg' ||
                                                                    artifact.format === 'jpeg' ||
                                                                    artifact.format === 'gif'
                                                                );

                                                                return (
                                                                    <div key={idx} style={{ marginBottom: idx < msg.artifacts.length - 1 ? '1rem' : 0 }}>
                                                                        {isImage ? (
                                                                            <>
                                                                                {console.log('Rendering image with URL:', artifact.url)}
                                                                                <AuthenticatedImage
                                                                                    src={artifact.url}
                                                                                    chatId={artifact.chatId}
                                                                                    filename={artifact.originalFilename}
                                                                                    chatflowId={getChatflowId(taskContext)}
                                                                                    alt="Generated visualization"
                                                                                    style={{
                                                                                        width: '100%',
                                                                                        borderRadius: '8px',
                                                                                        maxHeight: '400px',
                                                                                        objectFit: 'contain',
                                                                                        display: 'block'
                                                                                    }}
                                                                                />
                                                                            </>
                                                                        ) : (
                                                                            <div style={{ color: '#ef4444', padding: '0.5rem', backgroundColor: '#fee2e2', borderRadius: '6px', fontSize: '0.85rem' }}>
                                                                                {console.log('Unsupported artifact type:', artifact)}
                                                                                ⚠️ Unsupported artifact type: {artifact.type || 'unknown'}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    )}

                                                    <ReactMarkdown
                                                        remarkPlugins={[remarkGfm]}
                                                        components={{
                                                            table: ({ ...props }) => (
                                                                <table style={{
                                                                    width: '100%',
                                                                    borderCollapse: 'collapse',
                                                                    marginTop: '0.5rem',
                                                                    marginBottom: '0.5rem',
                                                                    fontSize: '0.9rem'
                                                                }} {...props} />
                                                            ),
                                                            thead: ({ ...props }) => (
                                                                <thead style={{
                                                                    backgroundColor: 'var(--bg-hover)',
                                                                    borderBottom: '2px solid var(--border)'
                                                                }} {...props} />
                                                            ),
                                                            th: ({ ...props }) => (
                                                                <th style={{
                                                                    padding: '0.75rem',
                                                                    textAlign: 'left',
                                                                    fontWeight: '600',
                                                                    color: 'var(--text-muted)',
                                                                    borderBottom: '1px solid var(--border)'
                                                                }} {...props} />
                                                            ),
                                                            td: ({ ...props }) => (
                                                                <td style={{
                                                                    padding: '0.75rem',
                                                                    borderBottom: '1px solid var(--border)',
                                                                    color: 'var(--text-primary)'
                                                                }} {...props} />
                                                            ),
                                                            tr: ({ ...props }) => (
                                                                <tr style={{
                                                                    borderBottom: '1px solid var(--border)'
                                                                }} {...props} />
                                                            ),
                                                            code: ({ inline, ...props }) => (
                                                                inline ?
                                                                    <code style={{
                                                                        backgroundColor: 'var(--bg-hover)',
                                                                        padding: '0.2rem 0.4rem',
                                                                        borderRadius: '4px',
                                                                        fontSize: '0.9em',
                                                                        color: '#2AAB91'
                                                                    }} {...props} /> :
                                                                    <code style={{
                                                                        display: 'block',
                                                                        backgroundColor: '#001A1D',
                                                                        color: '#F8FAFA',
                                                                        padding: '1rem',
                                                                        borderRadius: '8px',
                                                                        overflowX: 'auto',
                                                                        marginTop: '0.5rem',
                                                                        marginBottom: '0.5rem'
                                                                    }} {...props} />
                                                            ),
                                                            p: ({ ...props }) => (
                                                                <p style={{ margin: '0.5rem 0' }} {...props} />
                                                            ),
                                                            strong: ({ ...props }) => (
                                                                <strong style={{ fontWeight: '600', color: '#0D5254' }} {...props} />
                                                            )
                                                        }}
                                                    >
                                                        {msg.text}
                                                    </ReactMarkdown>
                                                </>
                                            ) : (
                                                msg.text
                                            )}
                                        </div>
                                    </div>

                                    {msg.sender === 'user' && (
                                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--bg-hover)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-primary)', flexShrink: 0 }}>👤</div>
                                    )}
                                </div>
                            ))}
                            {loading && (
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <div style={{ width: '32px', height: '32px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <img
                                            src="/assets/logo.png"
                                            alt="MONTERA Logo"
                                            style={{
                                                width: '100%',
                                                height: '100%',
                                                objectFit: 'contain',
                                                animation: 'mm-spin 2s linear infinite'
                                            }}
                                        />
                                    </div>
                                    <div style={{ padding: '1rem', backgroundColor: 'var(--bg-hover)', borderRadius: '16px', borderTopLeftRadius: '4px', color: 'var(--text-muted)' }}>
                                        {t('aiChat.messages.thinking')}
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div style={{ padding: '1.5rem 2rem', backgroundColor: 'var(--bg-surface)', borderTop: '1px solid var(--border)' }}>
                            {/* Fast Start Prompts */}
                            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                                {getPrompts().map((prompt, i) => (
                                    <button
                                        key={i}
                                        onClick={() => handleSendMessage(null, prompt)}
                                        style={{
                                            padding: '0.5rem 1rem',
                                            borderRadius: '9999px',
                                            border: '1px solid var(--border)',
                                            backgroundColor: 'var(--bg-hover)',
                                            color: 'var(--text-primary)',
                                            fontSize: '0.85rem',
                                            cursor: 'pointer',
                                            whiteSpace: 'nowrap',
                                            transition: 'all 0.2s',
                                            fontWeight: '500'
                                        }}
                                        onMouseEnter={(e) => { e.target.style.borderColor = '#2AAB91'; }}
                                        onMouseLeave={(e) => { e.target.style.borderColor = 'var(--border)'; }}
                                    >
                                        {prompt}
                                    </button>
                                ))}
                            </div>

                            <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '1rem' }}>
                                <input
                                    type="text"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    placeholder={t('aiChat.input.placeholder')}
                                    style={{
                                        flex: 1,
                                        padding: '1rem 1.5rem',
                                        borderRadius: '12px',
                                        border: '1px solid var(--border)',
                                        backgroundColor: 'var(--bg-hover)',
                                        color: 'var(--text-primary)',
                                        fontSize: '1rem',
                                        outline: 'none'
                                    }}
                                />
                                <button
                                    type="submit"
                                    disabled={!inputValue.trim() || loading}
                                    style={{
                                        padding: '0 1.5rem',
                                        borderRadius: '12px',
                                        border: 'none',
                                        background: 'linear-gradient(135deg, #0D5254 0%, #2AAB91 100%)',
                                        color: '#FFFFFF',
                                        fontWeight: 'bold',
                                        cursor: inputValue.trim() ? 'pointer' : 'not-allowed',
                                        opacity: inputValue.trim() ? 1 : 0.5,
                                        boxShadow: inputValue.trim() ? '0 2px 8px rgba(42, 171, 145, 0.25)' : 'none'
                                    }}
                                >
                                    {t('aiChat.input.send')}
                                </button>
                            </form>
                        </div>
                    </>
                )}
            </div>
            <style>{`
                @keyframes mm-spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default AIAgentChat;
