/**
 * AgriPulse Field Vision & Crop Scanning API Service
 * 
 * Handles uploading aerial/field canopy images for YOLOv8 pathology inference,
 * returning bounding box detections and hydraulic pump correlations.
 */

import apiClient from './apiClient';
import { ENDPOINTS } from './endpoints';
import { withMockFallback } from './config';
import { mockCropScanHandler } from '../../mocks/mockHandlers';

export const cropScanService = {
    /**
     * Submit an image file for computer vision inference
     * @param {File | FormData} fileOrFormData 
     */
    analyzeCropImage: async (fileOrFormData) => {
        return withMockFallback(
            async () => {
                let body = fileOrFormData;
                let headers = {};

                if (fileOrFormData instanceof File) {
                    const formData = new FormData();
                    formData.append('image', fileOrFormData);
                    body = formData;
                    headers['Content-Type'] = 'multipart/form-data';
                }

                const response = await apiClient.post(ENDPOINTS.CROP_SCAN.ANALYZE, body, { headers });
                return response.data;
            },
            async () => {
                return await mockCropScanHandler.analyzeImage(fileOrFormData);
            },
            'analyzeCropImage'
        );
    },

    /**
     * Fetch benchmark preset samples for demonstration
     */
    getSampleBenchmarks: async () => {
        return withMockFallback(
            async () => {
                const response = await apiClient.get(ENDPOINTS.CROP_SCAN.BENCHMARKS);
                return response.data;
            },
            async () => {
                return await mockCropScanHandler.getSampleBenchmarks();
            },
            'getSampleBenchmarks'
        );
    }
};

export default cropScanService;
