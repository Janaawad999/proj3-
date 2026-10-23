import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    X, AlertTriangle, TrendingUp, ArrowUpRight, ArrowDownRight,
    Calendar, Tag, Receipt, Store, Bot, Sparkles, Check, DollarSign,
    Layers, ExternalLink
} from 'lucide-react';
import radarService from '../../services/radarService';

function RadarInvestigationModal({ alertId, onClose, onAlertUpdated }) {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('current'); // 'current' | 'previous'

    useEffect(() => {
        if (!alertId) return;
        loadInvestigation();
    }, [alertId]);

    const loadInvestigation = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await radarService.getInvestigation(alertId);
            setData(res);
            // Mark alert as read automatically upon investigation
            if (res.alert && res.alert.status === 'UNREAD') {
                await radarService.markAsRead(alertId).catch(() => {});
                if (onAlertUpdated) onAlertUpdated();
            }
        } catch (err) {
            console.error('Failed to load investigation:', err);
            setError(err.message || 'Failed to load investigation data');
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (val) => {
        const num = Number(val || 0);
        return `${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} EGP`;
    };

    const handleAskCopilot = () => {
        if (!data || !data.investigation) return;
        const inv = data.investigation;
        const categoryName = inv.category?.name || 'Category';
        const pct = inv.summary?.percentageIncrease || 0;
        const diff = inv.summary?.difference || 0;

        const promptText = `Please investigate my ${categoryName} spending surge. It increased by ${pct}% (+${formatCurrency(diff)}) this month (${inv.summary?.currentPeriod}) compared to last month (${inv.summary?.previousPeriod}). What patterns do you see and how can I optimize this budget?`;

        onClose();
        navigate('/copilots', { state: { prefilledPrompt: promptText } });
    };

    if (!alertId) return null;

    const inv = data?.investigation;
    const alert = data?.alert;

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 26, 29, 0.75)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '1.25rem'
        }}>
            <div style={{
                background: 'var(--bg-surface, #FFFFFF)',
                border: '1px solid var(--border-color, #E0EBEB)',
                borderRadius: '16px',
                width: '100%',
                maxWidth: '840px',
                maxHeight: '90vh',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 20px 50px rgba(0, 63, 70, 0.3)',
                animation: 'mm-scale-in 0.2s ease',
                overflow: 'hidden'
            }}>
                {/* Modal Header */}
                <div style={{
                    padding: '1.25rem 1.5rem',
                    borderBottom: '1px solid var(--border-color)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: 'linear-gradient(135deg, rgba(13, 82, 84, 0.06) 0%, rgba(42, 171, 145, 0.1) 100%)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                            width: '44px',
                            height: '44px',
                            borderRadius: '12px',
                            background: 'linear-gradient(135deg, #0D5254 0%, #2AAB91 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#FFFFFF',
                            boxShadow: '0 4px 12px rgba(42, 171, 145, 0.3)'
                        }}>
                            <Sparkles size={22} />
                        </div>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                                    Financial Radar Investigation
                                </h2>
                                <span style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    padding: '2px 8px',
                                    borderRadius: '12px',
                                    fontSize: '0.6875rem',
                                    fontWeight: 700,
                                    background: alert?.severity === 'WARNING' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(42, 171, 145, 0.15)',
                                    color: alert?.severity === 'WARNING' ? '#EF4444' : '#2AAB91'
                                }}>
                                    {alert?.severity || 'SURGE DETECTED'}
                                </span>
                            </div>
                            <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                                Deterministic breakdown and pattern analysis from real verified transactions
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--text-secondary)',
                            cursor: 'pointer',
                            padding: '6px',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.15s ease'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
                            e.currentTarget.style.color = 'var(--text-primary)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                            e.currentTarget.style.color = 'var(--text-secondary)';
                        }}
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Modal Body */}
                <div style={{
                    padding: '1.5rem',
                    overflowY: 'auto',
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1.5rem'
                }}>
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-secondary)' }}>
                            <div style={{
                                margin: '0 auto 1rem',
                                width: '36px',
                                height: '36px',
                                border: '3px solid rgba(42, 171, 145, 0.2)',
                                borderTopColor: '#2AAB91',
                                borderRadius: '50%',
                                animation: 'mm-spin 0.8s linear infinite'
                            }} />
                            <p>Analyzing transactions and compiling radar metrics...</p>
                        </div>
                    ) : error ? (
                        <div style={{
                            padding: '1rem',
                            borderRadius: '10px',
                            background: 'rgba(239, 68, 68, 0.1)',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            color: '#EF4444',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px'
                        }}>
                            <AlertTriangle size={20} />
                            <span>{error}</span>
                        </div>
                    ) : inv ? (
                        <>
                            {/* Category Banner & Narrative */}
                            <div style={{
                                padding: '1rem 1.25rem',
                                borderRadius: '12px',
                                background: 'var(--bg-card, #FFFFFF)',
                                border: '1px solid var(--border-color)',
                                boxShadow: 'var(--shadow-sm)'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.5rem' }}>
                                    <Tag size={16} color="#2AAB91" />
                                    <span style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text-primary)' }}>
                                        {inv.category?.name} Spending Anomaly
                                    </span>
                                </div>
                                <p style={{
                                    margin: 0,
                                    fontSize: '0.875rem',
                                    lineHeight: 1.6,
                                    color: 'var(--text-primary)',
                                    whiteSpace: 'pre-line'
                                }}>
                                    {inv.narrative}
                                </p>
                            </div>

                            {/* 4 Metric KPI Cards */}
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
                                gap: '0.875rem'
                            }}>
                                {/* Current Month */}
                                <div style={{
                                    padding: '1rem',
                                    borderRadius: '12px',
                                    background: 'var(--bg-surface)',
                                    border: '1px solid var(--border-color)',
                                    boxShadow: 'var(--shadow-sm)'
                                }}>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                                        Current Month ({inv.summary?.currentPeriod})
                                    </div>
                                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                                        {formatCurrency(inv.summary?.currentAmount)}
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                                        {inv.summary?.currentTxCount} transaction{inv.summary?.currentTxCount === 1 ? '' : 's'}
                                    </div>
                                </div>

                                {/* Previous Month */}
                                <div style={{
                                    padding: '1rem',
                                    borderRadius: '12px',
                                    background: 'var(--bg-surface)',
                                    border: '1px solid var(--border-color)',
                                    boxShadow: 'var(--shadow-sm)'
                                }}>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                                        Previous Month ({inv.summary?.previousPeriod})
                                    </div>
                                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-secondary)' }}>
                                        {formatCurrency(inv.summary?.previousAmount)}
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                                        {inv.summary?.prevTxCount} transaction{inv.summary?.prevTxCount === 1 ? '' : 's'}
                                    </div>
                                </div>

                                {/* Absolute Difference */}
                                <div style={{
                                    padding: '1rem',
                                    borderRadius: '12px',
                                    background: 'rgba(239, 68, 68, 0.06)',
                                    border: '1px solid rgba(239, 68, 68, 0.25)',
                                    boxShadow: 'var(--shadow-sm)'
                                }}>
                                    <div style={{ fontSize: '0.75rem', color: '#EF4444', marginBottom: '4px', fontWeight: 600 }}>
                                        Spending Increase
                                    </div>
                                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#EF4444' }}>
                                        +{formatCurrency(inv.summary?.difference)}
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                                        Extra spend vs normal
                                    </div>
                                </div>

                                {/* Percentage Surge */}
                                <div style={{
                                    padding: '1rem',
                                    borderRadius: '12px',
                                    background: 'rgba(239, 68, 68, 0.06)',
                                    border: '1px solid rgba(239, 68, 68, 0.25)',
                                    boxShadow: 'var(--shadow-sm)'
                                }}>
                                    <div style={{ fontSize: '0.75rem', color: '#EF4444', marginBottom: '4px', fontWeight: 600 }}>
                                        Surge Ratio
                                    </div>
                                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#EF4444', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <ArrowUpRight size={20} />
                                        <span>+{inv.summary?.percentageIncrease}%</span>
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                                        Period-over-period
                                    </div>
                                </div>
                            </div>

                            {/* Top Spending Drivers & Largest Transaction */}
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                                gap: '1rem'
                            }}>
                                {/* Top Merchants */}
                                {inv.topMerchants && inv.topMerchants.length > 0 && (
                                    <div style={{
                                        padding: '1.125rem',
                                        borderRadius: '12px',
                                        background: 'var(--bg-surface)',
                                        border: '1px solid var(--border-color)'
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '0.875rem' }}>
                                            <Store size={16} color="#0D5254" />
                                            <span style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                                                Top Spending Drivers (Merchants)
                                            </span>
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                                            {inv.topMerchants.map((m, idx) => (
                                                <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem' }}>
                                                        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{m.merchant} ({m.count} tx)</span>
                                                        <span style={{ fontWeight: 700, color: '#0D5254' }}>{formatCurrency(m.totalAmount)} ({m.percentageOfCategory}%)</span>
                                                    </div>
                                                    <div style={{ height: '6px', background: 'var(--bg-input)', borderRadius: '3px', overflow: 'hidden' }}>
                                                        <div style={{ height: '100%', width: `${Math.min(100, m.percentageOfCategory)}%`, background: 'linear-gradient(90deg, #0D5254, #2AAB91)', borderRadius: '3px' }} />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Largest Transaction Spike */}
                                {inv.largestTransaction && (
                                    <div style={{
                                        padding: '1.125rem',
                                        borderRadius: '12px',
                                        background: 'var(--bg-surface)',
                                        border: '1px solid var(--border-color)',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        justifyContent: 'space-between'
                                    }}>
                                        <div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '0.875rem' }}>
                                                <TrendingUp size={16} color="#2AAB91" />
                                                <span style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                                                    Largest Single Expense Spike
                                                </span>
                                            </div>
                                            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0D5254', marginBottom: '4px' }}>
                                                {formatCurrency(inv.largestTransaction.amount)}
                                            </div>
                                            <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                                                {inv.largestTransaction.merchant}
                                            </div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                                                Date: {inv.largestTransaction.date}
                                                {inv.largestTransaction.description && ` • ${inv.largestTransaction.description}`}
                                            </div>
                                        </div>

                                        <div style={{
                                            marginTop: '1rem',
                                            padding: '0.5rem 0.75rem',
                                            borderRadius: '6px',
                                            background: 'rgba(42, 171, 145, 0.1)',
                                            fontSize: '0.75rem',
                                            color: '#0D5254',
                                            fontWeight: 600
                                        }}>
                                            💡 Represents {toNum((inv.largestTransaction.amount / inv.summary.currentAmount) * 100)}% of this month's total category spend.
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Transactions Table with Period Tabs */}
                            <div style={{
                                borderRadius: '12px',
                                background: 'var(--bg-surface)',
                                border: '1px solid var(--border-color)',
                                overflow: 'hidden'
                            }}>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    padding: '0.75rem 1rem',
                                    borderBottom: '1px solid var(--border-color)',
                                    background: 'var(--bg-hover)'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <Receipt size={16} color="#0D5254" />
                                        <span style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                                            Relevant Transactions
                                        </span>
                                    </div>

                                    {/* Tabs */}
                                    <div style={{ display: 'flex', gap: '4px' }}>
                                        <button
                                            onClick={() => setActiveTab('current')}
                                            style={{
                                                padding: '4px 10px',
                                                borderRadius: '6px',
                                                border: 'none',
                                                background: activeTab === 'current' ? '#0D5254' : 'transparent',
                                                color: activeTab === 'current' ? '#FFFFFF' : 'var(--text-secondary)',
                                                fontSize: '0.75rem',
                                                fontWeight: 600,
                                                cursor: 'pointer'
                                            }}
                                        >
                                            Current Month ({inv.currentTransactions?.length || 0})
                                        </button>
                                        <button
                                            onClick={() => setActiveTab('previous')}
                                            style={{
                                                padding: '4px 10px',
                                                borderRadius: '6px',
                                                border: 'none',
                                                background: activeTab === 'previous' ? '#0D5254' : 'transparent',
                                                color: activeTab === 'previous' ? '#FFFFFF' : 'var(--text-secondary)',
                                                fontSize: '0.75rem',
                                                fontWeight: 600,
                                                cursor: 'pointer'
                                            }}
                                        >
                                            Previous Month ({inv.previousTransactions?.length || 0})
                                        </button>
                                    </div>
                                </div>

                                <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                                    {((activeTab === 'current' ? inv.currentTransactions : inv.previousTransactions) || []).length === 0 ? (
                                        <div style={{ padding: '1.5rem', textAlign: 'center', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                                            No transactions recorded for this period.
                                        </div>
                                    ) : (
                                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8125rem' }}>
                                            <thead>
                                                <tr style={{ textAlign: 'left', color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-surface)' }}>
                                                    <th style={{ padding: '8px 12px' }}>Date</th>
                                                    <th style={{ padding: '8px 12px' }}>Merchant / Description</th>
                                                    <th style={{ padding: '8px 12px' }}>Method</th>
                                                    <th style={{ padding: '8px 12px', textAlign: 'right' }}>Amount</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {((activeTab === 'current' ? inv.currentTransactions : inv.previousTransactions) || []).map((tx) => (
                                                    <tr key={tx.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                                        <td style={{ padding: '8px 12px', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{tx.date}</td>
                                                        <td style={{ padding: '8px 12px', fontWeight: 600, color: 'var(--text-primary)' }}>
                                                            {tx.merchant}
                                                            {tx.description && <span style={{ fontWeight: 400, color: 'var(--text-secondary)', marginLeft: '6px' }}>({tx.description})</span>}
                                                        </td>
                                                        <td style={{ padding: '8px 12px', color: 'var(--text-secondary)' }}>{tx.paymentMethod}</td>
                                                        <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 700, color: '#EF4444', whiteSpace: 'nowrap' }}>
                                                            -{formatCurrency(tx.amount)}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    )}
                                </div>
                            </div>
                        </>
                    ) : null}
                </div>

                {/* Modal Footer */}
                <div style={{
                    padding: '1rem 1.5rem',
                    borderTop: '1px solid var(--border-color)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: 'var(--bg-surface)'
                }}>
                    <button
                        onClick={onClose}
                        style={{
                            padding: '0.625rem 1.125rem',
                            borderRadius: '8px',
                            border: '1px solid var(--border-color)',
                            background: 'var(--bg-surface)',
                            color: 'var(--text-secondary)',
                            fontSize: '0.875rem',
                            fontWeight: 600,
                            cursor: 'pointer'
                        }}
                    >
                        Close
                    </button>

                    <button
                        onClick={handleAskCopilot}
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '0.625rem 1.25rem',
                            borderRadius: '8px',
                            border: 'none',
                            background: 'linear-gradient(135deg, #0D5254 0%, #2AAB91 100%)',
                            color: '#FFFFFF',
                            fontSize: '0.875rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            boxShadow: '0 4px 14px rgba(42, 171, 145, 0.35)',
                            transition: 'transform 0.15s ease'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                        <Bot size={18} />
                        <span>Ask Montera Co-Pilot to Investigate</span>
                    </button>
                </div>
            </div>
        </div>
    );
}

function toNum(val) {
    if (!val) return 0;
    return Math.round(Number(val) * 100) / 100;
}

export default RadarInvestigationModal;
