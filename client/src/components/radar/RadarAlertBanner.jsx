import React from 'react';
import { Sparkles, ArrowRight, X, AlertTriangle, ArrowUpRight } from 'lucide-react';

function RadarAlertBanner({ alert, onInvestigate, onDismiss }) {
    if (!alert) return null;

    const data = alert.data || {};

    return (
        <div style={{
            padding: '1.125rem 1.375rem',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, rgba(13, 82, 84, 0.08) 0%, rgba(42, 171, 145, 0.14) 100%)',
            border: '1.5px solid rgba(42, 171, 145, 0.4)',
            boxShadow: '0 6px 20px rgba(13, 82, 84, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1.25rem',
            marginBottom: '1.5rem',
            position: 'relative',
            overflow: 'hidden',
            animation: 'mm-scale-in 0.2s ease'
        }}>
            {/* Left Accent Bar */}
            <div style={{
                position: 'absolute',
                left: 0,
                top: 0,
                bottom: 0,
                width: '5px',
                background: 'linear-gradient(180deg, #0D5254 0%, #2AAB91 100%)'
            }} />

            {/* Left Content */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', flex: 1 }}>
                <div style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #0D5254 0%, #2AAB91 100%)',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    boxShadow: '0 4px 12px rgba(42, 171, 145, 0.3)'
                }}>
                    <span style={{ fontSize: '1.25rem', lineHeight: 1 }}>🔎</span>
                </div>

                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <span style={{ fontSize: '1rem', fontWeight: 800, color: '#0D5254', letterSpacing: '-0.01em' }}>
                            {alert.title || 'I found something worth investigating'}
                        </span>
                        <span style={{
                            fontSize: '0.6875rem',
                            fontWeight: 700,
                            padding: '2px 8px',
                            borderRadius: '12px',
                            background: '#2AAB91',
                            color: '#FFFFFF',
                            textTransform: 'uppercase'
                        }}>
                            Radar Alert
                        </span>
                    </div>

                    <p style={{
                        margin: 0,
                        fontSize: '0.875rem',
                        color: 'var(--text-primary, #003F46)',
                        lineHeight: 1.5,
                        fontWeight: 500
                    }}>
                        {alert.message}
                    </p>
                </div>
            </div>

            {/* Right Action Buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                <button
                    type="button"
                    onClick={() => onInvestigate(alert.id)}
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '8px 18px',
                        borderRadius: '8px',
                        border: 'none',
                        background: 'linear-gradient(135deg, #0D5254 0%, #2AAB91 100%)',
                        color: '#FFFFFF',
                        fontSize: '0.875rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        boxShadow: '0 4px 12px rgba(42, 171, 145, 0.3)',
                        transition: 'transform 0.15s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                    <span>Investigate</span>
                    <ArrowUpRight size={16} />
                </button>

                {onDismiss && (
                    <button
                        type="button"
                        onClick={() => onDismiss(alert.id)}
                        style={{
                            padding: '8px 14px',
                            borderRadius: '8px',
                            border: '1px solid var(--border-color, #E0EBEB)',
                            background: 'var(--bg-surface, #FFFFFF)',
                            color: 'var(--text-secondary, #6B9192)',
                            fontSize: '0.8125rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.color = '#EF4444';
                            e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.3)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.color = 'var(--text-secondary, #6B9192)';
                            e.currentTarget.style.borderColor = 'var(--border-color, #E0EBEB)';
                        }}
                    >
                        Dismiss
                    </button>
                )}
            </div>
        </div>
    );
}

export default RadarAlertBanner;
