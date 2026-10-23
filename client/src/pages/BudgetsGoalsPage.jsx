import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MMCard, MMButton } from '@sdk';
import {
    Target, Plus, AlertTriangle, CheckCircle, Trash2,
    Edit2, Calendar, PiggyBank, DollarSign, X
} from 'lucide-react';
import financialService from '../services/financialService';

function BudgetsGoalsPage() {
    const { t } = useTranslation();

    const [budgetData, setBudgetData] = useState(null);
    const [goals, setGoals] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    // Budget Modal
    const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
    const [budgetForm, setBudgetForm] = useState({
        categoryId: '',
        amount: '',
        alertThreshold: 0.8
    });

    // Goal Modal
    const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
    const [editingGoal, setEditingGoal] = useState(null);
    const [goalForm, setGoalForm] = useState({
        title: '',
        targetAmount: '',
        currentAmount: '',
        targetDate: '',
        category: ''
    });

    const [formError, setFormError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [bData, gData, catData] = await Promise.all([
                financialService.getBudgets(),
                financialService.getGoals(),
                financialService.getCategories({ type: 'EXPENSE' })
            ]);
            setBudgetData(bData);
            setGoals(gData || []);
            setCategories(catData || []);
        } catch (err) {
            console.error('Failed to load budgets and goals:', err);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (val) => {
        const num = Number(val || 0);
        return `${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} EGP`;
    };

    // Budget Handlers
    const handleOpenBudgetModal = (budget = null) => {
        setFormError('');
        if (budget) {
            setBudgetForm({
                categoryId: budget.categoryId,
                amount: budget.budgetAmount.toString(),
                alertThreshold: budget.alertThreshold || 0.8
            });
        } else {
            setBudgetForm({
                categoryId: categories.length > 0 ? categories[0].id : '',
                amount: '',
                alertThreshold: 0.8
            });
        }
        setIsBudgetModalOpen(true);
    };

    const handleBudgetSubmit = async (e) => {
        e.preventDefault();
        setFormError('');

        const amt = parseFloat(budgetForm.amount);
        if (isNaN(amt) || amt <= 0) {
            setFormError(t('budgets.validAmount', 'Please enter a valid positive budget amount.'));
            return;
        }

        setSubmitting(true);
        try {
            await financialService.createOrUpdateBudget({
                ...budgetForm,
                amount: amt
            });
            setIsBudgetModalOpen(false);
            loadData();
        } catch (err) {
            setFormError(err.response?.data?.message || t('common.errorOccurred', 'An error occurred.'));
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteBudget = async (id) => {
        if (!window.confirm(t('budgets.confirmDelete', 'Delete this budget?'))) return;
        try {
            await financialService.deleteBudget(id);
            loadData();
        } catch (err) {
            console.error('Delete budget failed:', err);
        }
    };

    // Goal Handlers
    const handleOpenGoalModal = (goal = null) => {
        setFormError('');
        setEditingGoal(goal);
        if (goal) {
            setGoalForm({
                title: goal.title,
                targetAmount: goal.targetAmount.toString(),
                currentAmount: goal.currentAmount.toString(),
                targetDate: goal.targetDate ? goal.targetDate.split('T')[0] : '',
                category: goal.category || ''
            });
        } else {
            const nextYear = new Date();
            nextYear.setMonth(nextYear.getMonth() + 6);
            setGoalForm({
                title: '',
                targetAmount: '',
                currentAmount: '0',
                targetDate: nextYear.toISOString().split('T')[0],
                category: ''
            });
        }
        setIsGoalModalOpen(true);
    };

    const handleGoalSubmit = async (e) => {
        e.preventDefault();
        setFormError('');

        const targetAmt = parseFloat(goalForm.targetAmount);
        const currentAmt = parseFloat(goalForm.currentAmount || 0);

        if (isNaN(targetAmt) || targetAmt <= 0) {
            setFormError(t('goals.validTarget', 'Target amount must be a positive number.'));
            return;
        }

        setSubmitting(true);
        try {
            if (editingGoal) {
                await financialService.updateGoal(editingGoal.id, {
                    ...goalForm,
                    targetAmount: targetAmt,
                    currentAmount: currentAmt
                });
            } else {
                await financialService.createGoal({
                    ...goalForm,
                    targetAmount: targetAmt,
                    currentAmount: currentAmt
                });
            }
            setIsGoalModalOpen(false);
            loadData();
        } catch (err) {
            setFormError(err.response?.data?.message || t('common.errorOccurred', 'An error occurred.'));
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteGoal = async (id) => {
        if (!window.confirm(t('goals.confirmDelete', 'Delete this savings goal?'))) return;
        try {
            await financialService.deleteGoal(id);
            loadData();
        } catch (err) {
            console.error('Delete goal failed:', err);
        }
    };

    if (loading) {
        return (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                <div style={{ margin: '3rem auto', width: '36px', height: '36px', border: '3px solid rgba(42, 171, 145, 0.2)', borderTopColor: '#2AAB91', borderRadius: '50%', animation: 'mm-spin 1s linear infinite' }} />
                <p>{t('common.loading', 'Loading budgets and goals...')}</p>
            </div>
        );
    }

    return (
        <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.875rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.375rem', fontFamily: 'var(--heading-font)' }}>
                        {t('budgetsGoals.title', 'Budgets & Financial Goals')}
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
                        {t('budgetsGoals.subtitle', 'Set monthly category limits and track deterministic timeline progress on savings goals.')}
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <MMButton variant="ghost" onClick={() => handleOpenBudgetModal()}>
                        <Plus size={16} style={{ marginInlineEnd: '6px' }} />
                        {t('budgets.newBudget', 'Set Budget')}
                    </MMButton>
                    <MMButton variant="primary" onClick={() => handleOpenGoalModal()}>
                        <Target size={16} style={{ marginInlineEnd: '6px' }} />
                        {t('goals.newGoal', 'New Goal')}
                    </MMButton>
                </div>
            </div>

            {/* Top Budget Summary Bar */}
            <MMCard style={{ padding: '1.5rem', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                        <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                            {t('budgets.currentMonthOverview', 'Current Month Budget Overview')}
                        </h2>
                        <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                            {t('budgets.totalBudgeted', 'Total Budgeted')}: {formatCurrency(budgetData?.totalBudgeted)} | {t('budgets.totalSpent', 'Total Spent')}: {formatCurrency(budgetData?.totalSpent)}
                        </span>
                    </div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 700, color: budgetData?.overallPercentageUsed > 100 ? 'var(--danger-color, #EF4444)' : 'var(--primary)' }}>
                        {budgetData?.overallPercentageUsed || 0}% {t('budgets.utilized', 'Utilized')}
                    </div>
                </div>

                <div style={{ height: '10px', background: 'var(--bg-hover)', borderRadius: '5px', overflow: 'hidden' }}>
                    <div style={{
                        height: '100%',
                        width: `${Math.min(100, budgetData?.overallPercentageUsed || 0)}%`,
                        background: budgetData?.overallPercentageUsed > 100 ? 'var(--danger-color, #EF4444)' : 'var(--primary)',
                        borderRadius: '5px'
                    }} />
                </div>
            </MMCard>

            {/* Category Budgets Grid */}
            <div style={{ marginBottom: '3rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem' }}>
                    {t('budgets.categoryBudgets', 'Category Budgets')}
                </h2>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
                    {budgetData?.budgets?.map((b) => (
                        <MMCard key={b.id} style={{ padding: '1.25rem', border: b.isOverBudget ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid var(--border-color)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                                <div>
                                    <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 4px 0' }}>
                                        {b.categoryName}
                                    </h3>
                                    <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                                        {formatCurrency(b.spentAmount)} {t('budgets.of', 'of')} {formatCurrency(b.budgetAmount)}
                                    </span>
                                </div>
                                <div style={{ display: 'flex', gap: '0.25rem' }}>
                                    <button
                                        onClick={() => handleOpenBudgetModal(b)}
                                        style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '4px' }}
                                        title={t('common.edit', 'Edit')}
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteBudget(b.id)}
                                        style={{ background: 'none', border: 'none', color: 'var(--danger-color, #EF4444)', cursor: 'pointer', padding: '4px' }}
                                        title={t('common.delete', 'Delete')}
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>

                            <div style={{ height: '8px', background: 'var(--bg-hover)', borderRadius: '4px', overflow: 'hidden', marginBottom: '0.5rem' }}>
                                <div style={{
                                    height: '100%',
                                    width: `${Math.min(100, b.percentageUsed)}%`,
                                    background: b.isOverBudget ? 'var(--danger-color, #EF4444)' : (b.isNearLimit ? 'var(--warning-color, #F59E0B)' : 'var(--primary)')
                                }} />
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                <span>{b.percentageUsed}% used</span>
                                <span style={{ color: b.isOverBudget ? 'var(--danger-color, #EF4444)' : 'var(--success)', fontWeight: 600 }}>
                                    {b.isOverBudget ? `${formatCurrency(b.spentAmount - b.budgetAmount)} over limit` : `${formatCurrency(b.remainingAmount)} remaining`}
                                </span>
                            </div>
                        </MMCard>
                    ))}
                </div>
            </div>

            {/* Financial Goals Section */}
            <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem' }}>
                    {t('goals.financialGoals', 'Financial Savings Goals')}
                </h2>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.25rem' }}>
                    {goals.map((g) => (
                        <MMCard key={g.id} style={{ padding: '1.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(42, 171, 145, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2AAB91' }}>
                                        <Target size={22} />
                                    </div>
                                    <div>
                                        <h3 style={{ fontSize: '1.0625rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                                            {g.title}
                                        </h3>
                                        <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                                            {t('goals.targetDate', 'Target')}: {new Date(g.targetDate).toLocaleDateString()} ({g.monthsRemaining} {t('goals.monthsLeft', 'months left')})
                                        </span>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '0.25rem' }}>
                                    <button
                                        onClick={() => handleOpenGoalModal(g)}
                                        style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '4px' }}
                                        title={t('common.edit', 'Edit')}
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteGoal(g.id)}
                                        style={{ background: 'none', border: 'none', color: 'var(--danger-color, #EF4444)', cursor: 'pointer', padding: '4px' }}
                                        title={t('common.delete', 'Delete')}
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>

                            <div style={{ marginBottom: '1rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.375rem' }}>
                                    <span style={{ color: 'var(--text-secondary)' }}>{t('goals.saved', 'Saved')}: <strong>{formatCurrency(g.currentAmount)}</strong></span>
                                    <span style={{ color: 'var(--primary)', fontWeight: 700 }}>{g.progressPercentage}%</span>
                                </div>
                                <div style={{ height: '8px', background: 'var(--bg-hover)', borderRadius: '4px', overflow: 'hidden' }}>
                                    <div style={{ height: '100%', width: `${g.progressPercentage}%`, background: 'var(--primary)' }} />
                                </div>
                            </div>

                            <div style={{ padding: '0.75rem', background: 'var(--bg-surface)', borderRadius: '8px', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem' }}>
                                <span style={{ color: 'var(--text-secondary)' }}>{t('goals.requiredMonthly', 'Required Monthly')}:</span>
                                <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{formatCurrency(g.requiredMonthlySaving)}/mo</span>
                            </div>
                        </MMCard>
                    ))}
                </div>
            </div>

            {/* Budget Modal */}
            {isBudgetModalOpen && (
                <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem' }}>
                    <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '12px', width: '100%', maxWidth: '440px', padding: '1.75rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                                {t('budgets.modalTitle', 'Set Monthly Category Budget')}
                            </h2>
                            <button onClick={() => setIsBudgetModalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                                <X size={20} />
                            </button>
                        </div>

                        {formError && (
                            <div style={{ padding: '0.75rem', borderRadius: '6px', background: 'rgba(239,68,68,0.15)', color: 'var(--danger-color, #EF4444)', fontSize: '0.875rem', marginBottom: '1rem' }}>
                                {formError}
                            </div>
                        )}

                        <form onSubmit={handleBudgetSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '0.375rem' }}>
                                    {t('transactions.category', 'Category')} *
                                </label>
                                <select
                                    required
                                    value={budgetForm.categoryId}
                                    onChange={(e) => setBudgetForm(prev => ({ ...prev, categoryId: e.target.value }))}
                                    style={{ width: '100%', padding: '0.625rem 0.75rem', borderRadius: '8px', background: 'var(--bg-input, var(--bg-surface))', border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontSize: '0.875rem' }}
                                >
                                    {categories.map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '0.375rem' }}>
                                    {t('budgets.monthlyLimit', 'Monthly Budget Amount (EGP)')} *
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    required
                                    placeholder="5000"
                                    value={budgetForm.amount}
                                    onChange={(e) => setBudgetForm(prev => ({ ...prev, amount: e.target.value }))}
                                    style={{ width: '100%', padding: '0.625rem 0.75rem', borderRadius: '8px', background: 'var(--bg-input, var(--bg-surface))', border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontSize: '1rem', fontWeight: 600 }}
                                />
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                                <MMButton type="button" variant="ghost" onClick={() => setIsBudgetModalOpen(false)}>
                                    {t('common.cancel', 'Cancel')}
                                </MMButton>
                                <MMButton type="submit" variant="primary" disabled={submitting}>
                                    {submitting ? t('common.saving', 'Saving...') : t('common.save', 'Save Budget')}
                                </MMButton>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Goal Modal */}
            {isGoalModalOpen && (
                <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem' }}>
                    <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '12px', width: '100%', maxWidth: '480px', padding: '1.75rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                                {editingGoal ? t('goals.editModalTitle', 'Edit Financial Goal') : t('goals.addModalTitle', 'Create Financial Goal')}
                            </h2>
                            <button onClick={() => setIsGoalModalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                                <X size={20} />
                            </button>
                        </div>

                        {formError && (
                            <div style={{ padding: '0.75rem', borderRadius: '6px', background: 'rgba(239,68,68,0.15)', color: 'var(--danger-color, #EF4444)', fontSize: '0.875rem', marginBottom: '1rem' }}>
                                {formError}
                            </div>
                        )}

                        <form onSubmit={handleGoalSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '0.375rem' }}>
                                    {t('goals.titleLabel', 'Goal Title')} *
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Emergency Fund, New Laptop"
                                    value={goalForm.title}
                                    onChange={(e) => setGoalForm(prev => ({ ...prev, title: e.target.value }))}
                                    style={{ width: '100%', padding: '0.625rem 0.75rem', borderRadius: '8px', background: 'var(--bg-input, var(--bg-surface))', border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontSize: '0.875rem' }}
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '0.375rem' }}>
                                        {t('goals.targetAmount', 'Target Amount (EGP)')} *
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        required
                                        placeholder="30000"
                                        value={goalForm.targetAmount}
                                        onChange={(e) => setGoalForm(prev => ({ ...prev, targetAmount: e.target.value }))}
                                        style={{ width: '100%', padding: '0.625rem 0.75rem', borderRadius: '8px', background: 'var(--bg-input, var(--bg-surface))', border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontSize: '0.875rem' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '0.375rem' }}>
                                        {t('goals.alreadySaved', 'Already Saved (EGP)')}
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        placeholder="0"
                                        value={goalForm.currentAmount}
                                        onChange={(e) => setGoalForm(prev => ({ ...prev, currentAmount: e.target.value }))}
                                        style={{ width: '100%', padding: '0.625rem 0.75rem', borderRadius: '8px', background: 'var(--bg-input, var(--bg-surface))', border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontSize: '0.875rem' }}
                                    />
                                </div>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '0.375rem' }}>
                                    {t('goals.targetDate', 'Target Date')} *
                                </label>
                                <input
                                    type="date"
                                    required
                                    value={goalForm.targetDate}
                                    onChange={(e) => setGoalForm(prev => ({ ...prev, targetDate: e.target.value }))}
                                    style={{ width: '100%', padding: '0.625rem 0.75rem', borderRadius: '8px', background: 'var(--bg-input, var(--bg-surface))', border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontSize: '0.875rem' }}
                                />
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                                <MMButton type="button" variant="ghost" onClick={() => setIsGoalModalOpen(false)}>
                                    {t('common.cancel', 'Cancel')}
                                </MMButton>
                                <MMButton type="submit" variant="primary" disabled={submitting}>
                                    {submitting ? t('common.saving', 'Saving...') : t('common.save', 'Save Goal')}
                                </MMButton>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default BudgetsGoalsPage;
