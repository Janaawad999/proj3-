import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Bell, Sparkles, AlertTriangle, ArrowUpRight, Check,
    Trash2, ExternalLink, RefreshCw, X, Tag
} from 'lucide-react';
import radarService from '../../services/radarService';

function RadarNotificationBell({ onInvestigateAlert }) {
    const { t } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const [alerts, setAlerts] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [scanning, setScanning] = useState(false);

    const dropdownRef = useRef(null);

    const fetchAlerts = async () => {
        try {
            const res = await radarService.getAlerts({ limit: 10 });
            if (res && res.success) {
                setAlerts(res.alerts || []);
                setUnreadCount(res.unreadCount || 0);
            }
        } catch (e) {
            console.warn('Failed to load radar alerts:', e);
        }
    };

    useEffect(() => {
        fetchAlerts();
        // Poll alerts every 30 seconds
        const interval = setInterval(fetchAlerts, 30000);
        return () => clearInterval(interval);
    }, []);

    // Close dropdown on click outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    const handleToggle = () => {
        setIsOpen(!isOpen);
        if (!isOpen) {
            fetchAlerts();
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await radarService.markAllAsRead();
            fetchAlerts();
        } catch (e) {
            console.error('Failed to mark all as read:', e);
        }
    };

    const handleDismissAlert = async (e, alertId) => {
        e.stopPropagation();
        try {
            await radarService.dismissAlert(alertId);
            fetchAlerts();
        } catch (e) {
            console.error('Failed to dismiss alert:', e);
        }
    };

    const handleScanRadar = async () => {
        setScanning(true);
        try {
            const res = await radarService.triggerRadarCheck();
            if (res && res.success) {
                setAlerts(res.alerts || []);
                setUnreadCount(res.unreadCount || 0);
            }
        } catch (e) {
            console.error('Failed to trigger radar check:', e);
        } finally {
            setScanning(false);
        }
    };

    const handleInvestigate = (alert) => {
        setIsOpen(false);
        if (onInvestigateAlert) {
            onInvestigateAlert(alert.id);
        }
    };

    return (
        <div style={{ position: 'relative' }} ref={dropdownRef}>
            {/* Bell Icon Button */}
            <button
                type="button"
                onClick={handleToggle}
                style={{
                    position: 'relative',
                    width: '38px',
                    height: '38px',
                    borderRadius: '10px',
                    border: '1px solid var(--border-color, #E0EBEB)',
                    background: isOpen ? 'var(--bg-hover)' : 'var(--bg-surface, #FFFFFF)',
                    color: unreadCount > 0 ? '#0D5254' : 'var(--text-secondary, #6B9192)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                }}
                title="Financial Radar Alerts"
                onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#2AAB91';
                    e.currentTarget.style.color = '#0D5254';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-color, #E0EBEB)';
                    e.currentTarget.style.color = unreadCount > 0 ? '#0D5254' : 'var(--text-secondary, #6B9192)';
                }}
            >
                <Bell size={18} />

                {/* Live Unread Badge */}
                {unreadCount > 0 && (
                    <span style={{
                        position: 'absolute',
                        top: '-4px',
                        right: '-4px',
                        minWidth: '18px',
                        height: '18px',
                        padding: '0 4px',
                        borderRadius: '9px',
                        background: '#2AAB91',
                        color: '#FFFFFF',
                        fontSize: '0.6875rem',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 2px 6px rgba(42, 171, 145, 0.4)',
                        animation: 'pulse 2s infinite'
                    }}>
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown Popover */}
            {isOpen && (
                <div style={{
                    position: 'absolute',
                    top: 'calc(100% + 8px)',
                    right: 0,
                    width: '380px',
                    maxWidth: '90vw',
                    background: 'var(--bg-surface, #FFFFFF)',
                    border: '1px solid var(--border-color, #E0EBEB)',
                    borderRadius: '14px',
                    boxShadow: '0 12px 36px rgba(0, 63, 70, 0.2)',
                    zIndex: 999,
                    overflow: 'hidden',
                    animation: 'mm-scale-in 0.15s ease'
                }}>
                    {/* Header */}
                    <div style={{
                        padding: '0.875rem 1rem',
                        borderBottom: '1px solid var(--border-color)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        background: 'linear-gradient(135deg, rgba(13, 82, 84, 0.05) 0%, rgba(42, 171, 145, 0.08) 100%)'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{
                                width: '8px',
                                height: '8px',
                                borderRadius: '50%',
                                background: '#2AAB91',
                                animation: 'mm-pulse 1.5s infinite'
                            }} />
                            <span style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text-primary)' }}>
                                Financial Radar
                            </span>
                            {unreadCount > 0 && (
                                <span style={{
                                    fontSize: '0.6875rem',
                                    padding: '1px 6px',
                                    borderRadius: '8px',
                                    background: 'rgba(42, 171, 145, 0.15)',
                                    color: '#2AAB91',
                                    fontWeight: 700
                                }}>
                                    {unreadCount} new
                                </span>
                            )}
                        </div>

                        {unreadCount > 0 && (
                            <button
                                onClick={handleMarkAllRead}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: '#2AAB91',
                                    fontSize: '0.75rem',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    padding: '2px 6px',
                                    borderRadius: '4px'
                                }}
                            >
                                Mark all read
                            </button>
                        )}
                    </div>

                    {/* Alerts List */}
                    <div style={{ maxHeight: '340px', overflowY: 'auto' }}>
                        {alerts.length === 0 ? (
                            <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                                <div style={{
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '50%',
                                    background: 'rgba(42, 171, 145, 0.12)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: '#2AAB91',
                                    margin: '0 auto 0.75rem'
                                }}>
                                    <Sparkles size={20} />
                                </div>
                                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                                    Radar is Clear
                                </div>
                                <div style={{ fontSize: '0.75rem' }}>
                                    No unusual spending surges or anomalies detected.
                                </div>
                            </div>
                        ) : (
                            alerts.map((alert) => {
                                const isUnread = alert.status === 'UNREAD';
                                const data = alert.data || {};
                                return (
                                    <div
                                        key={alert.id}
                                        onClick={() => handleInvestigate(alert)}
                                        style={{
                                            padding: '0.875rem 1rem',
                                            borderBottom: '1px solid var(--border-color)',
                                            background: isUnread ? 'rgba(42, 171, 145, 0.05)' : 'var(--bg-surface)',
                                            cursor: 'pointer',
                                            transition: 'background 0.15s ease',
                                            display: 'flex',
                                            gap: '10px',
                                            alignItems: 'flex-start'
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-hover)'}
                                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = isUnread ? 'rgba(42, 171, 145, 0.05)' : 'var(--bg-surface)'}
                                    >
                                        <div style={{
                                            width: '32px',
                                            height: '32px',
                                            borderRadius: '8px',
                                            background: isUnread ? 'rgba(239, 68, 68, 0.12)' : 'rgba(13, 82, 84, 0.08)',
                                            color: isUnread ? '#EF4444' : '#0D5254',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            flexShrink: 0,
                                            marginTop: '2px'
                                        }}>
                                            <AlertTriangle size={16} />
                                        </div>

                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2px' }}>
                                                <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                                                    {alert.title}
                                                </span>
                                                {isUnread && (
                                                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#2AAB91' }} />
                                                )}
                                            </div>

                                            <div style={{
                                                fontSize: '0.75rem',
                                                color: 'var(--text-secondary)',
                                                lineHeight: 1.4,
                                                marginBottom: '0.5rem',
                                                display: '-webkit-box',
                                                WebkitLineClamp: 2,
                                                WebkitBoxOrient: 'vertical',
                                                overflow: 'hidden'
                                            }}>
                                                {alert.message}
                                            </div>

                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleInvestigate(alert);
                                                    }}
                                                    style={{
                                                        padding: '3px 8px',
                                                        borderRadius: '6px',
                                                        border: 'none',
                                                        background: 'linear-gradient(135deg, #0D5254 0%, #2AAB91 100%)',
                                                        color: '#FFFFFF',
                                                        fontSize: '0.6875rem',
                                                        fontWeight: 700,
                                                        cursor: 'pointer',
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        gap: '4px'
                                                    }}
                                                >
                                                    <span>Investigate</span>
                                                    <ArrowUpRight size={12} />
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={(e) => handleDismissAlert(e, alert.id)}
                                                    style={{
                                                        background: 'none',
                                                        border: 'none',
                                                        color: 'var(--text-secondary)',
                                                        cursor: 'pointer',
                                                        padding: '2px 4px',
                                                        display: 'flex',
                                                        alignItems: 'center'
                                                    }}
                                                    title="Dismiss Alert"
                                                >
                                                    <Trash2 size={12} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {/* Footer with Manual Radar Scan */}
                    <div style={{
                        padding: '0.625rem 1rem',
                        borderTop: '1px solid var(--border-color)',
                        background: 'var(--bg-hover)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <button
                            type="button"
                            onClick={handleScanRadar}
                            disabled={scanning}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: '#0D5254',
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                cursor: scanning ? 'not-allowed' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px'
                            }}
                        >
                            <RefreshCw size={12} className={scanning ? 'animate-spin' : ''} />
                            <span>{scanning ? 'Scanning radar...' : 'Scan Radar Now'}</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default RadarNotificationBell;
