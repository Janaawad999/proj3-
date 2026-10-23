/**
 * Axios API Instance & Services Bridge
 * Re-exports the centralized apiClient and all domain API services
 */
import apiClient from './api/apiClient';

export * from './api/index';
export default apiClient;
