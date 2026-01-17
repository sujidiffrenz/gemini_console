import { newAxiosInstance } from './apiClient';
import { Contact, ServiceResponse } from '../types';

export const contactService = {
    async getAll(): Promise<Contact[]> {
        const url = '/api/contacts';
        console.log(`📡 Fetching contacts from: ${url}`);
        try {
            const response = await newAxiosInstance.get<ServiceResponse<Contact[]>>(url);
            console.log('Contacts API response:', response.data);

            // Handle ServiceResponse format: { status, status_code, message, result }
            const result = response.data?.result;
            if (Array.isArray(result)) {
                return result;
            }

            // Fallback: try data.data (legacy format) or direct array
            if (Array.isArray(response.data)) {
                return response.data;
            }

            // Try nested data.data
            if (response.data && typeof response.data === 'object' && 'data' in response.data) {
                const nestedData = (response.data as any).data;
                if (Array.isArray(nestedData)) {
                    return nestedData;
                }
            }

            console.warn('⚠️ Unexpected contacts API response format, returning empty array');
            return [];
        } catch (err: any) {
            console.error('❌ Error in contactService.getAll:', {
                message: err.message,
                url: err.config?.url,
                baseURL: err.config?.baseURL,
                response: err.response?.data,
                status: err.response?.status
            });

            // Provide more helpful error message
            if (err.code === 'ERR_NETWORK' || err.message?.includes('Network Error')) {
                throw new Error('Network Error: Unable to connect to the contacts API. Please check if the backend server is running.');
            }

            throw err;
        }
    },

    async delete(id: string): Promise<boolean> {
        try {
            await newAxiosInstance.delete(`/api/contacts/${id}`);
            return true;
        } catch (err: any) {
            console.error('❌ Error deleting contact:', err);
            throw err;
        }
    }
};
