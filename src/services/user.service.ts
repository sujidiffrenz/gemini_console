import { newAxiosInstance } from './apiClient';
import { User, ServiceResponse, PaginatedResult } from '../types';

export const userService = {
    async getAll(page = 1, limit = 10): Promise<PaginatedResult<User>> {
        const url = `/api/users/?page=${page}&limit=${limit}`;
        console.log(`📡 Fetching users from: ${url}`);
        try {
            const response = await newAxiosInstance.get<any>(url);
            const data = response.data;
            console.log('Users API response:', data);

            // Handle new structure: result.data and result.pagination
            if (data?.result && typeof data.result === 'object') {
                const res = data.result;
                const items = Array.isArray(res.data) ? res.data : [];
                const pag = res.pagination || {};

                return {
                    items,
                    total: typeof pag.total === 'number' ? pag.total : items.length,
                    page: typeof pag.page === 'number' ? pag.page : page,
                    size: typeof pag.limit === 'number' ? pag.limit : limit,
                    pages: typeof pag.pages === 'number' ? pag.pages : 1
                };
            }

            // Fallback for direct result extraction (backwards compatibility)
            const result = data?.result !== undefined ? data.result : data;

            // 1. Handle Paginated Object Structure
            if (result && typeof result === 'object' && !Array.isArray(result)) {
                const items = Array.isArray(result.items) ? result.items :
                    Array.isArray(result.data) ? result.data : [];
                const total = typeof result.total === 'number' ? result.total : items.length;

                return {
                    items,
                    total: total,
                    page: result.page || page,
                    size: result.size || result.page_size || result.limit || limit,
                    pages: result.pages || result.total_pages || Math.ceil(total / limit)
                };
            }

            // 2. Handle Direct Array
            if (Array.isArray(result)) {
                return {
                    items: result,
                    total: result.length,
                    page: 1,
                    size: result.length,
                    pages: 1
                };
            }

            // If we get here, the response format is unexpected
            console.warn('⚠️ Unexpected users API response format, returning empty result');
            return { items: [], total: 0, page, size: limit, pages: 0 };
        } catch (err: any) {
            console.error('❌ Error in userService.getAll:', {
                message: err.message,
                url: err.config?.url,
                baseURL: err.config?.baseURL,
                response: err.response?.data,
                status: err.response?.status
            });

            // Provide more helpful error message
            if (err.code === 'ERR_NETWORK' || err.message?.includes('Network Error')) {
                throw new Error('Network Error: Unable to connect to the users API. Please check if the backend server is running.');
            }

            // Re-throw the error so it can be handled by the calling code
            throw err;
        }
    },

    async getById(id: string): Promise<User> {
        const response = await newAxiosInstance.get<ServiceResponse<User>>(`/api/users/${id}/`);
        return response.data.result;
    },

    async create(data: Partial<User>): Promise<ServiceResponse<User>> {
        const response = await newAxiosInstance.post<ServiceResponse<User>>('/api/users/', data);
        return response.data;
    },

    async update(id: string | number, data: Partial<User>): Promise<ServiceResponse<User>> {
        // Use PATCH for partial updates, and add trailing slash for consistency
        const response = await newAxiosInstance.put<ServiceResponse<User>>(`/api/users/${id}`, data);
        return response.data;
    },

    async delete(id: string | number): Promise<ServiceResponse<any>> {
        const response = await newAxiosInstance.delete<ServiceResponse<any>>(`/api/users/${id}/`);
        return response.data;
    }
};
