import { newAxiosInstance } from './apiClient';
import { User, ServiceResponse } from '../types';

export const userService = {
    async getAll(): Promise<User[]> {
        const url = `/api/users/`;
        console.log(`Fetching users from: ${url}`);
        try {
            const response = await newAxiosInstance.get<any>(url);
            const data = response.data;
            console.log('Users API response:', data);

            // Standardize result extraction
            const result = data?.result !== undefined ? data.result : data;

            // 1. Handle Direct Array
            if (Array.isArray(result)) {
                return result;
            }

            // 2. Handle Paginated Object Structure (if users ever becomes paginated)
            if (result && typeof result === 'object' && Array.isArray(result.items)) {
                return result.items;
            }

            // 3. Fallback for empty/unexpected (like {})
            if (result && typeof result === 'object' && Object.keys(result).length === 0) {
                console.warn('Users API returned an empty object, returning empty list');
            } else if (result !== null && result !== undefined) {
                console.error('Unexpected users API response format:', result);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
        }

        return [];
    },

    async getById(id: string): Promise<User> {
        const response = await newAxiosInstance.get<ServiceResponse<User>>(`/api/users/${id}`);
        return response.data.result;
    }
};
