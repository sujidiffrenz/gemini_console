import { newAxiosInstance } from './apiClient';
import { Quote, ServiceResponse, PaginatedResult } from '../types';

export const quoteService = {
    async getAll(page: number, page_size: number): Promise<PaginatedResult<Quote>> {
        const url = `/api/quotes?page=${page}&page_size=${page_size}`;
        console.log(`Fetching quotes from: ${url}`);
        try {
            const response = await newAxiosInstance.get<any>(url);
            const data = response.data;
            console.log('Quotes API response:', data);

            // Standardize result extraction
            const result = data?.result !== undefined ? data.result : data;

            // 1. Handle Paginated Object Structure
            if (result && typeof result === 'object' && !Array.isArray(result)) {
                const items = Array.isArray(result.items)
                    ? result.items.map((item: any) => ({ ...item, id: item._id || item.id }))
                    : [];
                const total = typeof result.total === 'number' ? result.total : items.length;

                return {
                    items,
                    total,
                    page: result.page || page,
                    size: result.page_size || result.size || page_size,
                    pages: result.total_pages || result.pages || Math.ceil(total / page_size)
                };
            }

            // 2. Handle Direct Array
            if (Array.isArray(result)) {
                return {
                    items: result.map((item: any) => ({ ...item, id: item._id || item.id })),
                    total: result.length,
                    page: 1,
                    size: result.length,
                    pages: 1
                };
            }

            // If we get here, the response format is unexpected
            console.warn('⚠️ Unexpected quotes API response format, returning empty result');
            return { items: [], total: 0, page, size: page_size, pages: 0 };
        } catch (err: any) {
            console.error('❌ Error in quoteService.getAll:', {
                message: err.message,
                url: err.config?.url,
                baseURL: err.config?.baseURL,
                response: err.response?.data,
                status: err.response?.status
            });

            // Provide more helpful error message
            if (err.code === 'ERR_NETWORK' || err.message?.includes('Network Error')) {
                throw new Error('Network Error: Unable to connect to the quotes API. Please check if the backend server is running.');
            }

            // Re-throw the error so it can be handled by the calling code
            throw err;
        }

        return {
            items: [],
            total: 0,
            page: page,
            size: page_size,
            pages: 0
        };
    },

    async getById(id: string | number): Promise<Quote | null> {
        const response = await newAxiosInstance.get<ServiceResponse<any>>(`/api/quotes/${id}`);
        return response.data.result;
    },

    async delete(id: string | number): Promise<boolean> {
        await newAxiosInstance.delete(`/api/quotes/${id}`);
        return true;
    }
};
