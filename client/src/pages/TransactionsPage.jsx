import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MMCard, MMButton, MMInput, MMSelect } from '@sdk';
import {
    Plus, Search, Filter, Trash2, Edit2, Calendar,
    ArrowUpRight, ArrowDownRight, Tag, CreditCard, X
} from 'lucide-react';
import financialService from '../services/financialService';

function TransactionsPage() {
    const { t } = useTranslation();

    const [transactions, setTransactions] = useState([]);
    const [categories, setCategories] = useState([]);
    const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });
    const [loading, setLoading] = useState(true);

    // Filters
    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [paymentFilter, setPaymentFilter] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTx, setEditingTx] = useState(null);
    const [modalForm, setModalForm] = useState({
        amount: '',
        type: 'EXPENSE',
        categoryId: '',
        merchant: '',
        date: new Date().toISOString().split('T')[0],
        paymentMethod: 'CARD',
        description: '',
        isRecurring: false
    });
    const [formError, setFormError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        loadCategories();
    }, []);

    useEffect(() => {
        loadTransactions(1);
    }, [typeFilter, categoryFilter, paymentFilter, startDate, endDate]);

    const loadCategories = async () => {
        try {
            const data = await financialService.getCategories();
            setCategories(data || []);
        } catch (err) {
            console.error('Failed to load categories:', err);
        }
    };

    const loadTransactions = async (page = 1) => {
        setLoading(true);
        try {
            const params = {
                page,
                limit: 20,
                search: search.trim() || undefined,
                type: typeFilter || undefined,
                categoryId: categoryFilter || undefined,
                paymentMethod: paymentFilter || undefined,
                startDate: startDate || undefined,
                endDate: endDate || undefined
            };
            const result = await financialService.getTransactions(params);
            setTransactions(result.data || []);
            setPagination(result.pagination || { page: 1, limit: 20, total: 0, totalPages: 1 });
        } catch (err) {
            console.error('Failed to load transactions:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        loadTransactions(1);
    };

    const handleOpenCreateModal = () => {
        setEditingTx(null);
        setModalForm({
            amount: '',
            type: 'EXPENSE',
            categoryId: categories.length > 0 ? categories[0].id : '',
            merchant: '',
            date: new Date().toISOString().split('T')[0],
            paymentMethod: 'CARD',
            description: '',
            isRecurring: false
        });
        setFormError('');
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (tx) => {
        setEditingTx(tx);
        setModalForm({
            amount: tx.amount.toString(),
            type: tx.type,
            categoryId: tx.categoryId,
            merchant: tx.merchant || '',
            date: tx.date ? tx.date.split('T')[0] : '',
            paymentMethod: tx.paymentMethod || 'CARD',
            description: tx.description || '',
            isRecurring: Boolean(tx.isRecurring)
        });
        setFormError('');
        setIsModalOpen(true);
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setFormError('');

        const amt = parseFloat(modalForm.amount);
        if (isNaN(amt) || amt <= 0) {
            setFormError(t('transactions.validAmount', 'Please enter a valid positive amount.'));
            return;
        }

        if (!modalForm.categoryId) {
            setFormError(t('transactions.selectCategory', 'Please select a category.'));
            return;
        }

        setSubmitting(true);
        try {
            if (editingTx) {
                await financialService.updateTransaction(editingTx.id, {
                    ...modalForm,
                    amount: amt
                });
            } else {
                await financialService.createTransaction({
                    ...modalForm,
                    amount: amt
                });
            }
            setIsModalOpen(false);
            loadTransactions(pagination.page);
        } catch (err) {
            setFormError(err.response?.data?.message || t('common.errorOccurred', 'An error occurred.'));
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm(t('transactions.confirmDelete', 'Are you sure you want to delete this transaction?'))) {
            return;
        }
        try {
            await financialService.deleteTransaction(id);
            loadTransactions(pagination.page);
        } catch (err) {
            console.error('Delete failed:', err);
        }
    };

    const formatCurrency = (val) => {
        const num = Number(val || 0);
        return `${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} EGP`;
    };

    return (
        <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.875rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.375rem', fontFamily: 'var(--heading-font)' }}>
                        {t('transactions.title', 'Transactions')}
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
                        {t('transactions.subtitle', 'Manage, filter, and track your verified personal finances.')}
                    </p>
                </div>
                <MMButton variant="primary" onClick={handleOpenCreateModal}>
                    <Plus size={16} style={{ marginInlineEnd: '6px' }} />
                    {t('transactions.newTransaction', 'Add Transaction')}
                </MMButton>
            </div>

            {/* Filter Bar */}
            <MMCard style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
                    {/* Search Input */}
                    <form onSubmit={handleSearchSubmit} style={{ display: 'flex', flex: '1 1 250px', gap: '0.5rem' }}>
                        <div style={{ position: 'relative', width: '100%' }}>
                            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                            <input
                                type="text"
                                placeholder={t('transactions.searchPlaceholder', 'Search merchant or notes...')}
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '0.625rem 0.75rem 0.625rem 2.25rem',
                                    borderRadius: '8px',
                                    background: 'var(--bg-input, var(--bg-surface))',
                                    border: '1px solid var(--border-color)',
                                    color: 'var(--text-primary)',
                                    fontSize: '0.875rem'
                                }}
                            />
                        </div>
                        <MMButton type="submit" variant="ghost">
                            {t('common.search', 'Search')}
                        </MMButton>
                    </form>

                    {/* Type Filter */}
                    <select
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                        style={{
                            padding: '0.625rem 1rem',
                            borderRadius: '8px',
                            background: 'var(--bg-input, var(--bg-surface))',
                            border: '1px solid var(--border-color)',
                            color: 'var(--text-primary)',
                            fontSize: '0.875rem'
                        }}
                    >
                        <option value="">{t('transactions.allTypes', 'All Types')}</option>
                        <option value="EXPENSE">{t('transactions.expense', 'Expenses')}</option>
                        <option value="INCOME">{t('transactions.income', 'Income')}</option>
                    </select>

                    {/* Category Filter */}
                    <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        style={{
                            padding: '0.625rem 1rem',
                            borderRadius: '8px',
                            background: 'var(--bg-input, var(--bg-surface))',
                            border: '1px solid var(--border-color)',
                            color: 'var(--text-primary)',
                            fontSize: '0.875rem'
                        }}
                    >
                        <option value="">{t('transactions.allCategories', 'All Categories')}</option>
                        {categories.map(c => (
                            <option key={c.id} value={c.id}>{c.name} ({c.type})</option>
                        ))}
                    </select>

                    {/* Payment Method Filter */}
                    <select
                        value={paymentFilter}
                        onChange={(e) => setPaymentFilter(e.target.value)}
                        style={{
                            padding: '0.625rem 1rem',
                            borderRadius: '8px',
                            background: 'var(--bg-input, var(--bg-surface))',
                            border: '1px solid var(--border-color)',
                            color: 'var(--text-primary)',
                            fontSize: '0.875rem'
                        }}
                    >
                        <option value="">{t('transactions.allPaymentMethods', 'All Payment Methods')}</option>
                        <option value="CARD">Card</option>
                        <option value="CASH">Cash</option>
                        <option value="BANK_TRANSFER">Bank Transfer</option>
                        <option value="E_WALLET">E-Wallet</option>
                    </select>
                </div>
            </MMCard>

            {/* Transactions Table Card */}
            <MMCard style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                        {t('transactions.showing', 'Showing')} {transactions.length} {t('transactions.of', 'of')} {pagination.total} {t('transactions.items', 'transactions')}
                    </span>
                </div>

                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left', color: 'var(--text-secondary)' }}>
                                <th style={{ padding: '0.75rem 1rem' }}>{t('transactions.date', 'Date')}</th>
                                <th style={{ padding: '0.75rem 1rem' }}>{t('transactions.type', 'Type')}</th>
                                <th style={{ padding: '0.75rem 1rem' }}>{t('transactions.merchant', 'Merchant / Payee')}</th>
                                <th style={{ padding: '0.75rem 1rem' }}>{t('transactions.category', 'Category')}</th>
                                <th style={{ padding: '0.75rem 1rem' }}>{t('transactions.description', 'Description')}</th>
                                <th style={{ padding: '0.75rem 1rem' }}>{t('transactions.paymentMethod', 'Method')}</th>
                                <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>{t('transactions.amount', 'Amount')}</th>
                                <th style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>{t('common.actions', 'Actions')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transactions.map((tx) => {
                                const isIncome = tx.type === 'INCOME';
                                return (
                                    <tr key={tx.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                        <td style={{ padding: '0.875rem 1rem', color: 'var(--text-secondary)' }}>
                                            {new Date(tx.date).toLocaleDateString()}
                                        </td>
                                        <td style={{ padding: '0.875rem 1rem' }}>
                                            <span style={{
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '4px',
                                                padding: '2px 8px',
                                                borderRadius: '4px',
                                                fontSize: '0.75rem',
                                                fontWeight: 600,
                                                background: isIncome ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                                                color: isIncome ? 'var(--success)' : 'var(--danger-color, #EF4444)'
                                            }}>
                                                {isIncome ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                                                {tx.type}
                                            </span>
                                        </td>
                                        <td style={{ padding: '0.875rem 1rem', color: 'var(--text-primary)', fontWeight: 500 }}>
                                            {tx.merchant || '—'}
                                        </td>
                                        <td style={{ padding: '0.875rem 1rem' }}>
                                            <span style={{
                                                display: 'inline-block',
                                                padding: '2px 8px',
                                                borderRadius: '4px',
                                                fontSize: '0.75rem',
                                                background: `${tx.categoryColor || '#2AAB91'}20`,
                                                color: tx.categoryColor || 'var(--primary)',
                                                fontWeight: 500
                                            }}>
                                                {tx.categoryName}
                                            </span>
                                        </td>
                                        <td style={{ padding: '0.875rem 1rem', color: 'var(--text-secondary)', maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {tx.description || '—'}
                                        </td>
                                        <td style={{ padding: '0.875rem 1rem', color: 'var(--text-secondary)' }}>
                                            {tx.paymentMethod}
                                        </td>
                                        <td style={{
                                            padding: '0.875rem 1rem',
                                            textAlign: 'right',
                                            fontWeight: 700,
                                            color: isIncome ? 'var(--success)' : 'var(--text-primary)'
                                        }}>
                                            {isIncome ? '+' : '-'}{formatCurrency(tx.amount)}
                                        </td>
                                        <td style={{ padding: '0.875rem 1rem', textAlign: 'center' }}>
                                            <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                                                <button
                                                    onClick={() => handleOpenEditModal(tx)}
                                                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: '4px' }}
                                                    title={t('common.edit', 'Edit')}
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(tx.id)}
                                                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger-color, #EF4444)', padding: '4px' }}
                                                    title={t('common.delete', 'Delete')}
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>

                    {transactions.length === 0 && !loading && (
                        <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-secondary)' }}>
                            <p>{t('transactions.noResults', 'No transactions found matching your filter criteria.')}</p>
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1.5rem' }}>
                        <MMButton
                            variant="ghost"
                            disabled={pagination.page <= 1}
                            onClick={() => loadTransactions(pagination.page - 1)}
                        >
                            {t('common.previous', 'Previous')}
                        </MMButton>
                        <span style={{ display: 'flex', alignItems: 'center', padding: '0 1rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                            {pagination.page} / {pagination.totalPages}
                        </span>
                        <MMButton
                            variant="ghost"
                            disabled={pagination.page >= pagination.totalPages}
                            onClick={() => loadTransactions(pagination.page + 1)}
                        >
                            {t('common.next', 'Next')}
                        </MMButton>
                    </div>
                )}
            </MMCard>

            {/* Add / Edit Transaction Modal */}
            {isModalOpen && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    backgroundColor: 'rgba(0,0,0,0.65)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 9999,
                    padding: '1rem'
                }}>
                    <div style={{
                        background: 'var(--bg-surface)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '12px',
                        width: '100%',
                        maxWidth: '520px',
                        padding: '1.75rem',
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                                {editingTx ? t('transactions.editModalTitle', 'Edit Transaction') : t('transactions.addModalTitle', 'Add New Transaction')}
                            </h2>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {formError && (
                            <div style={{ padding: '0.75rem', borderRadius: '6px', background: 'rgba(239,68,68,0.15)', color: 'var(--danger-color, #EF4444)', fontSize: '0.875rem', marginBottom: '1rem' }}>
                                {formError}
                            </div>
                        )}

                        <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {/* Type Toggle */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                                <button
                                    type="button"
                                    onClick={() => setModalForm(prev => ({ ...prev, type: 'EXPENSE' }))}
                                    style={{
                                        padding: '0.625rem',
                                        borderRadius: '8px',
                                        border: modalForm.type === 'EXPENSE' ? '2px solid var(--danger-color, #EF4444)' : '1px solid var(--border-color)',
                                        background: modalForm.type === 'EXPENSE' ? 'rgba(239, 68, 68, 0.15)' : 'var(--bg-hover)',
                                        color: 'var(--text-primary)',
                                        fontWeight: 600,
                                        cursor: 'pointer'
                                    }}
                                >
                                    {t('transactions.expense', 'Expense')}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setModalForm(prev => ({ ...prev, type: 'INCOME' }))}
                                    style={{
                                        padding: '0.625rem',
                                        borderRadius: '8px',
                                        border: modalForm.type === 'INCOME' ? '2px solid var(--success)' : '1px solid var(--border-color)',
                                        background: modalForm.type === 'INCOME' ? 'rgba(16, 185, 129, 0.15)' : 'var(--bg-hover)',
                                        color: 'var(--text-primary)',
                                        fontWeight: 600,
                                        cursor: 'pointer'
                                    }}
                                >
                                    {t('transactions.income', 'Income')}
                                </button>
                            </div>

                            {/* Amount */}
                            <div>
                                <label style={{ display: 'block', fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '0.375rem' }}>
                                    {t('transactions.amountLabel', 'Amount (EGP)')} *
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    required
                                    placeholder="0.00"
                                    value={modalForm.amount}
                                    onChange={(e) => setModalForm(prev => ({ ...prev, amount: e.target.value }))}
                                    style={{
                                        width: '100%',
                                        padding: '0.625rem 0.75rem',
                                        borderRadius: '8px',
                                        background: 'var(--bg-input, var(--bg-surface))',
                                        border: '1px solid var(--border-color)',
                                        color: 'var(--text-primary)',
                                        fontSize: '1rem',
                                        fontWeight: 600
                                    }}
                                />
                            </div>

                            {/* Category & Date */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '0.375rem' }}>
                                        {t('transactions.category', 'Category')} *
                                    </label>
                                    <select
                                        required
                                        value={modalForm.categoryId}
                                        onChange={(e) => setModalForm(prev => ({ ...prev, categoryId: e.target.value }))}
                                        style={{
                                            width: '100%',
                                            padding: '0.625rem 0.75rem',
                                            borderRadius: '8px',
                                            background: 'var(--bg-input, var(--bg-surface))',
                                            border: '1px solid var(--border-color)',
                                            color: 'var(--text-primary)',
                                            fontSize: '0.875rem'
                                        }}
                                    >
                                        {categories
                                            .filter(c => c.type === modalForm.type)
                                            .map(c => (
                                                <option key={c.id} value={c.id}>{c.name}</option>
                                            ))
                                        }
                                    </select>
                                </div>

                                <div>
                                    <label style={{ display: 'block', fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '0.375rem' }}>
                                        {t('transactions.date', 'Date')} *
                                    </label>
                                    <input
                                        type="date"
                                        required
                                        value={modalForm.date}
                                        onChange={(e) => setModalForm(prev => ({ ...prev, date: e.target.value }))}
                                        style={{
                                            width: '100%',
                                            padding: '0.625rem 0.75rem',
                                            borderRadius: '8px',
                                            background: 'var(--bg-input, var(--bg-surface))',
                                            border: '1px solid var(--border-color)',
                                            color: 'var(--text-primary)',
                                            fontSize: '0.875rem'
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Merchant & Payment Method */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '0.375rem' }}>
                                        {t('transactions.merchantLabel', 'Merchant / Payee')}
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Carrefour, Netflix"
                                        value={modalForm.merchant}
                                        onChange={(e) => setModalForm(prev => ({ ...prev, merchant: e.target.value }))}
                                        style={{
                                            width: '100%',
                                            padding: '0.625rem 0.75rem',
                                            borderRadius: '8px',
                                            background: 'var(--bg-input, var(--bg-surface))',
                                            border: '1px solid var(--border-color)',
                                            color: 'var(--text-primary)',
                                            fontSize: '0.875rem'
                                        }}
                                    />
                                </div>

                                <div>
                                    <label style={{ display: 'block', fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '0.375rem' }}>
                                        {t('transactions.paymentMethod', 'Payment Method')}
                                    </label>
                                    <select
                                        value={modalForm.paymentMethod}
                                        onChange={(e) => setModalForm(prev => ({ ...prev, paymentMethod: e.target.value }))}
                                        style={{
                                            width: '100%',
                                            padding: '0.625rem 0.75rem',
                                            borderRadius: '8px',
                                            background: 'var(--bg-input, var(--bg-surface))',
                                            border: '1px solid var(--border-color)',
                                            color: 'var(--text-primary)',
                                            fontSize: '0.875rem'
                                        }}
                                    >
                                        <option value="CARD">Card</option>
                                        <option value="CASH">Cash</option>
                                        <option value="BANK_TRANSFER">Bank Transfer</option>
                                        <option value="E_WALLET">E-Wallet</option>
                                    </select>
                                </div>
                            </div>

                            {/* Description / Notes */}
                            <div>
                                <label style={{ display: 'block', fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '0.375rem' }}>
                                    {t('transactions.descriptionLabel', 'Notes / Description')}
                                </label>
                                <textarea
                                    rows={2}
                                    placeholder="Optional notes..."
                                    value={modalForm.description}
                                    onChange={(e) => setModalForm(prev => ({ ...prev, description: e.target.value }))}
                                    style={{
                                        width: '100%',
                                        padding: '0.625rem 0.75rem',
                                        borderRadius: '8px',
                                        background: 'var(--bg-input, var(--bg-surface))',
                                        border: '1px solid var(--border-color)',
                                        color: 'var(--text-primary)',
                                        fontSize: '0.875rem'
                                    }}
                                />
                            </div>

                            {/* Buttons */}
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                                <MMButton type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
                                    {t('common.cancel', 'Cancel')}
                                </MMButton>
                                <MMButton type="submit" variant="primary" disabled={submitting}>
                                    {submitting ? t('common.saving', 'Saving...') : (editingTx ? t('common.saveChanges', 'Save Changes') : t('transactions.create', 'Create Transaction'))}
                                </MMButton>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default TransactionsPage;
