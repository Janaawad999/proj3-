import api from './api';

/**
 * Financial Service (Phase 1 Foundation)
 * 
 * Centralized API client for transactions, categories, budgets, goals, and analytics.
 */
const financialService = {
    // Analytics & Overview
    getOverview: async (params = {}) => {
        const response = await api.get('/analytics/overview', { params });
        return response.data;
    },

    getCategoryBreakdown: async (params = {}) => {
        const response = await api.get('/analytics/categories', { params });
        return response.data;
    },

    getMonthlyTrends: async (params = {}) => {
        const response = await api.get('/analytics/trends', { params });
        return response.data;
    },

    getRecentTransactions: async (params = {}) => {
        const response = await api.get('/analytics/recent', { params });
        return response.data;
    },

    // Transactions
    getTransactions: async (params = {}) => {
        const response = await api.get('/transactions', { params });
        return response.data;
    },

    getTransaction: async (id) => {
        const response = await api.get(`/transactions/${id}`);
        return response.data;
    },

    createTransaction: async (data) => {
        const response = await api.post('/transactions', data);
        return response.data;
    },

    updateTransaction: async (id, data) => {
        const response = await api.put(`/transactions/${id}`, data);
        return response.data;
    },

    deleteTransaction: async (id) => {
        const response = await api.delete(`/transactions/${id}`);
        return response.data;
    },

    // Categories
    getCategories: async (params = {}) => {
        const response = await api.get('/categories', { params });
        return response.data;
    },

    createCategory: async (data) => {
        const response = await api.post('/categories', data);
        return response.data;
    },

    // Budgets
    getBudgets: async (params = {}) => {
        const response = await api.get('/budgets', { params });
        return response.data;
    },

    createOrUpdateBudget: async (data) => {
        const response = await api.post('/budgets', data);
        return response.data;
    },

    deleteBudget: async (id) => {
        const response = await api.delete(`/budgets/${id}`);
        return response.data;
    },

    // Financial Goals
    getGoals: async () => {
        const response = await api.get('/goals');
        return response.data;
    },

    createGoal: async (data) => {
        const response = await api.post('/goals', data);
        return response.data;
    },

    updateGoal: async (id, data) => {
        const response = await api.put(`/goals/${id}`, data);
        return response.data;
    },

    deleteGoal: async (id) => {
        const response = await api.delete(`/goals/${id}`);
        return response.data;
    }
};

export default financialService;
