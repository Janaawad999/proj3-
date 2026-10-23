/**
 * AgriPulse AI Diagnostic Assistant API Service
 * 
 * Handles RAG queries for pump diagnostics, ISO 10816 evaluation,
 * and technical OEM manual cross-referencing.
 */

import apiClient from './apiClient';
import { ENDPOINTS } from './endpoints';
import { withMockFallback } from './config';
import { mockAssistantHandler } from '../../mocks/mockHandlers';
import { RAG_TECHNICAL_DOCUMENTS } from '../../mocks/mockData';

export const assistantService = {
    /**
     * Send diagnostic prompt with contextual pump telemetry to the AI backend
     * @param {Object} payload - { question: string, pumpId: string, context?: Object }
     */
    sendChatMessage: async ({ question, pumpId, context }) => {
        return withMockFallback(
            async () => {
                const response = await apiClient.post(ENDPOINTS.ASSISTANT.CHAT, {
                    question,
                    pumpId,
                    context
                });
                return response.data;
            },
            async () => {
                return await mockAssistantHandler.sendChatMessage({ question, pumpId, context });
            },
            'sendChatMessage'
        );
    },

    /**
     * Fetch OEM reference technical documents available for RAG grounding
     */
    getTechnicalDocuments: async () => {
        return withMockFallback(
            async () => {
                const response = await apiClient.get(ENDPOINTS.ASSISTANT.DOCUMENTS);
                return response.data;
            },
            async () => {
                return {
                    success: true,
                    data: RAG_TECHNICAL_DOCUMENTS
                };
            },
            'getTechnicalDocuments'
        );
    }
};

export default assistantService;
