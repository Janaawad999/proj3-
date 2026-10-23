/**
 * AgriPulse Maintenance & Work Orders API Service
 * 
 * Handles field dispatch, technician assignment, spare parts requisitions,
 * and Lockout/Tagout (LOTO) safety checklists.
 */

import apiClient from './apiClient';
import { ENDPOINTS } from './endpoints';
import { withMockFallback } from './config';
import { mockWorkOrderHandler } from '../../mocks/mockHandlers';

export const workOrderService = {
    /**
     * Fetch work orders list with optional status or pump filters
     */
    getWorkOrders: async (params = {}) => {
        return withMockFallback(
            async () => {
                const response = await apiClient.get(ENDPOINTS.WORK_ORDERS.LIST, { params });
                return response.data;
            },
            async () => {
                return await mockWorkOrderHandler.getWorkOrders(params);
            },
            'getWorkOrders'
        );
    },

    /**
     * Fetch work order details by ID
     */
    getWorkOrderById: async (id) => {
        return withMockFallback(
            async () => {
                const response = await apiClient.get(ENDPOINTS.WORK_ORDERS.DETAIL(id));
                return response.data;
            },
            async () => {
                const res = await mockWorkOrderHandler.getWorkOrders();
                const item = res.data?.find(o => o.id === id);
                if (!item) throw new Error(`Work order ${id} not found`);
                return { success: true, data: item };
            },
            `getWorkOrderById(${id})`
        );
    },

    /**
     * Create / Dispatch a new maintenance work order
     */
    createWorkOrder: async (orderData) => {
        return withMockFallback(
            async () => {
                const response = await apiClient.post(ENDPOINTS.WORK_ORDERS.CREATE, orderData);
                return response.data;
            },
            async () => {
                return await mockWorkOrderHandler.createWorkOrder(orderData);
            },
            'createWorkOrder'
        );
    },

    /**
     * Update an existing work order (status, technician, safety notes)
     */
    updateWorkOrder: async (id, updates) => {
        return withMockFallback(
            async () => {
                const response = await apiClient.put(ENDPOINTS.WORK_ORDERS.UPDATE(id), updates);
                return response.data;
            },
            async () => {
                return await mockWorkOrderHandler.updateWorkOrder(id, updates);
            },
            `updateWorkOrder(${id})`
        );
    },

    /**
     * Delete / Cancel a work order
     */
    deleteWorkOrder: async (id) => {
        return withMockFallback(
            async () => {
                const response = await apiClient.delete(ENDPOINTS.WORK_ORDERS.DELETE(id));
                return response.data;
            },
            async () => {
                return { success: true, message: `Work order ${id} cancelled successfully` };
            },
            `deleteWorkOrder(${id})`
        );
    }
};

export default workOrderService;
