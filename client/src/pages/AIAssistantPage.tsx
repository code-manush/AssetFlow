import React, { useState } from 'react';
import { Sparkles, Send, Bot, User, Zap, BarChart3, Package, Wrench, ArrowLeftRight, Lock } from 'lucide-react';
import { apiFetch } from '../lib/api';
import { useAuth } from '../context/AuthContext';

const PREVIEW_FEATURES = [
    { icon: <Package size={20} />, color: '#6366F1', title: 'Asset Intelligence', desc: 'Ask natural language questions about your asset inventory and get instant answers.' },
    { icon: <BarChart3 size={20} />, color: '#22C55E', title: 'Predictive Analytics', desc: 'Forecast maintenance needs and asset replacement schedules before failures occur.' },
    { icon: <Wrench size={20} />, color: '#F59E0B', title: 'Auto-Triage', desc: 'AI automatically prioritizes and routes maintenance requests to the right technician.' },
    { icon: <ArrowLeftRight size={20} />, color: '#14B8A6', title: 'Smart Allocation', desc: 'Recommends optimal asset allocation based on usage patterns and team needs.' },
];

const SAMPLE_PROMPTS = [
    'Which assets are due for maintenance this month?',
    'Show me the utilization rate for Engineering department',
    'Which laptops have been idle for more than 30 days?',
    'Predict asset replacements needed in Q3',
];

interface Message {
    id: number;
    role: 'user' | 'assistant';
    text: string;
}

export default function AIAssistantPage() {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 0, role: 'assistant',
            text: "👋 Hi! I'm the AssetFlow AI Assistant. I'm currently in preview mode — full AI capabilities are coming soon. In the meantime, explore the sample prompts below to see what I'll be able to do!",
        },
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);

    const { user } = useAuth();

    async function sendMessage(text: string) {
        if (!text.trim()) return;
        const userMsg: Message = { id: Date.now(), role: 'user', text };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsTyping(true);

        try {
            const res = await apiFetch('/ai/chat', {
                method: 'POST',
                body: JSON.stringify({ query: text })
            });
            const reply: Message = {
                id: Date.now() + 1, role: 'assistant',
                text: res.message || 'I processed that successfully.',
            };
            setMessages(prev => [...prev, reply]);
        } catch (err: any) {
            const reply: Message = {
                id: Date.now() + 1, role: 'assistant',
                text: `Error: ${err.message}`,
            };
            setMessages(prev => [...prev, reply]);
        } finally {
            setIsTyping(false);
        }
    }

    if (user?.role === 'EMPLOYEE') {
        return (
            <div style={{ padding: 40, textAlign: 'center' }}>
                <h2>Access Denied</h2>
                <p>The AI Assistant is restricted to administrators and asset managers.</p>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

            {/* ── Header ─────────────────────────────────────── */}
            <div className="page-header">
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                        <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: 'var(--purple-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Sparkles size={18} color="var(--purple)" />
                        </div>
                        <h1 className="page-title">AI Assistant</h1>
                        <span style={{
                            fontSize: '0.68rem', fontWeight: 700, padding: '3px 8px',
                            borderRadius: 'var(--radius-full)', background: 'var(--warning-light)',
                            color: 'var(--warning)', letterSpacing: '0.04em',
                        }}>
                            PREVIEW
                        </span>
                    </div>
                    <p className="page-subtitle">
                        Natural language interface for your asset data — powered by AI (integration coming soon)
                    </p>
                </div>
            </div>

            {/* ── Coming soon banner ─────────────────────────── */}
            <div className="alert alert-accent" style={{ alignItems: 'center' }}>
                <Lock size={16} style={{ flexShrink: 0 }} />
                <div>
                    <strong>AI Integration Pending</strong> — The AI backend is being developed separately.
                    This page shows the complete UI that will be connected to your AI service.
                    The chat UI below is fully functional as a preview.
                </div>
            </div>

            {/* ── Feature preview grid ───────────────────────── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 14 }}>
                {PREVIEW_FEATURES.map(f => (
                    <div key={f.title} className="card" style={{ position: 'relative', overflow: 'hidden' }}>
                        <div style={{
                            position: 'absolute', top: 0, right: 0,
                            width: 80, height: 80,
                            background: `${f.color}08`,
                            borderRadius: '0 0 0 80px',
                        }} />
                        <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', background: `${f.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: f.color, marginBottom: 12 }}>
                            {f.icon}
                        </div>
                        <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>{f.title}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>{f.desc}</div>
                    </div>
                ))}
            </div>

            {/* ── Chat interface ─────────────────────────────── */}
            <div className="card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', height: 480 }}>

                {/* Chat header */}
                <div style={{
                    padding: '14px 20px', borderBottom: '1px solid var(--border)',
                    display: 'flex', alignItems: 'center', gap: 10,
                    background: 'var(--bg-elevated)',
                }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #6366F1, #A855F7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Bot size={18} color="white" />
                    </div>
                    <div>
                        <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>AssetFlow AI</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--warning)', display: 'inline-block' }} />
                            Preview Mode
                        </div>
                    </div>
                    <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        <Zap size={13} color="var(--accent)" />
                        Powered by AI
                    </div>
                </div>

                {/* Messages */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {messages.map(msg => (
                        <div key={msg.id} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', flexDirection: msg.role === 'user' ? 'row-reverse' : 'row' }}>
                            <div style={{
                                width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
                                background: msg.role === 'user' ? 'linear-gradient(135deg, #6366F1, #A855F7)' : 'var(--bg-elevated)',
                                border: msg.role === 'assistant' ? '1px solid var(--border)' : 'none',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                                {msg.role === 'user' ? <User size={14} color="white" /> : <Bot size={14} color="var(--accent)" />}
                            </div>
                            <div
                                className="ai-chat-bubble"
                                style={{
                                    background: msg.role === 'user' ? 'var(--accent)' : 'var(--bg-elevated)',
                                    color: msg.role === 'user' ? 'white' : 'var(--text-primary)',
                                    border: msg.role === 'assistant' ? '1px solid var(--border)' : 'none',
                                    borderBottomRightRadius: msg.role === 'user' ? 4 : 'var(--radius-lg)',
                                    borderBottomLeftRadius: msg.role === 'assistant' ? 4 : 'var(--radius-lg)',
                                    maxWidth: '75%',
                                }}
                            >
                                {msg.text}
                            </div>
                        </div>
                    ))}
                    {isTyping && (
                        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                            <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--bg-elevated)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Bot size={14} color="var(--accent)" />
                            </div>
                            <div style={{ display: 'flex', gap: 4, padding: '12px 16px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
                                {[0, 1, 2].map(i => (
                                    <div key={i} style={{
                                        width: 6, height: 6, borderRadius: '50%', background: 'var(--text-muted)',
                                        animation: `bounce 1.2s ${i * 0.2}s infinite`,
                                    }} />
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Sample prompts */}
                <div style={{ padding: '8px 20px', borderTop: '1px solid var(--border-subtle)', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {SAMPLE_PROMPTS.map(p => (
                        <button
                            key={p}
                            onClick={() => sendMessage(p)}
                            style={{
                                padding: '4px 10px', fontSize: '0.72rem', fontFamily: 'var(--font)',
                                background: 'var(--accent-light)', color: 'var(--accent)',
                                border: '1px solid rgba(99,102,241,0.25)', borderRadius: 'var(--radius-full)',
                                cursor: 'pointer', transition: 'all var(--transition)',
                            }}
                            onMouseEnter={e => (e.currentTarget.style.background = 'var(--accent)', e.currentTarget.style.color = 'white')}
                            onMouseLeave={e => (e.currentTarget.style.background = 'var(--accent-light)', e.currentTarget.style.color = 'var(--accent)')}
                        >
                            {p}
                        </button>
                    ))}
                </div>

                {/* Input */}
                <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border)', display: 'flex', gap: 10 }}>
                    <input
                        id="ai-input"
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage(input)}
                        placeholder="Ask anything about your assets…"
                        style={{
                            flex: 1, background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                            borderRadius: 'var(--radius-md)', padding: '9px 14px',
                            color: 'var(--text-primary)', fontFamily: 'var(--font)', fontSize: '0.875rem',
                            outline: 'none', transition: 'border-color var(--transition)',
                        }}
                        onFocus={e => (e.currentTarget.style.borderColor = 'var(--border-focus)')}
                        onBlur={e => (e.currentTarget.style.borderColor = 'var(--border)')}
                    />
                    <button
                        className="btn btn-primary btn-icon"
                        onClick={() => sendMessage(input)}
                        disabled={!input.trim() || isTyping}
                        id="ai-send-btn"
                    >
                        <Send size={16} />
                    </button>
                </div>
            </div>

            <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-6px); }
        }
      `}</style>
        </div>
    );
}
