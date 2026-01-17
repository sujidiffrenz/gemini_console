import { newAxiosInstance } from './apiClient';
import { Product, ServiceResponse, PaginatedResult } from '../types';
import { configKeys } from '../configKeys';

export const productService = {
    async getAll(page: number, page_size: number): Promise<PaginatedResult<Product>> {
        const url = `/api/products?page=${page}&page_size=${page_size}`;
        console.log(`Fetching products from: ${url}`);
        try {
            const response = await newAxiosInstance.get<any>(url);
            const data = response.data;
            console.log('Products API response:', data);

            // Standardize result extraction
            const result = data?.result !== undefined ? data.result : data;

            // 1. Handle Paginated Object Structure { items: [], total: 0, ... }
            if (result && typeof result === 'object' && !Array.isArray(result)) {

                const items = Array.isArray(result.items) ? result.items : [];
                // If items is not array, maybe it's under a different key or the structure is different
                // fallback to simple check

                const total = typeof result.total === 'number' ? result.total : items.length;

                return {
                    items,
                    total: total,
                    page: result.page || page,
                    size: result.size || result.page_size || page_size,
                    pages: result.pages || result.total_pages || Math.ceil(total / page_size)
                };
            }

            // 2. Handle Direct Array (Legacy or simple list)
            if (Array.isArray(result)) {
                return {
                    items: result,
                    total: result.length,
                    page: 1,
                    size: result.length,
                    pages: 1
                };
            }

            // 3. Fallback for empty/unexpected (like {})
            if (result && typeof result === 'object' && Object.keys(result).length === 0) {
                console.warn('Products API returned an empty object, returning empty results');
            } else if (result !== null && result !== undefined) {
                console.error('Unexpected products API response format:', result);
            }

        } catch (error) {
            console.error('Error fetching products:', error);
        }

        return { items: [], total: 0, page: page, size: page_size, pages: 0 };
    },

    async getById(id: string): Promise<Product> {
        // OpenAPI: /api/products/{product_id}
        const response = await newAxiosInstance.get<ServiceResponse<Product>>(`/api/products/${id}`);
        return response.data.result;
    },

    async delete(id: string | number): Promise<ServiceResponse<any>> {
        const response = await newAxiosInstance.delete<ServiceResponse<any>>(`/api/products/${id}`);
        return response.data;
    },

    async create(data: Partial<Product>): Promise<ServiceResponse<Product>> {
        // Use direct URL to ensure trailing slash is preserved and not stripped by Next.js proxy
        const baseUrl = configKeys.GEMINI_NEW_BASE_URL.replace(/\/$/, '');
        const url = `${baseUrl}/api/products/`;
        const response = await newAxiosInstance.post<ServiceResponse<Product>>(url, data);
        return response.data;
    },

    async update(id: string | number, data: Partial<Product>): Promise<ServiceResponse<Product>> {
        const response = await newAxiosInstance.put<ServiceResponse<Product>>(`/api/products/${id}`, data);
        return response.data;
    },

    async uploadFile(file: File): Promise<string> {
        const formData = new FormData();
        formData.append('file', file);
        const response = await newAxiosInstance.post<ServiceResponse<{ url: string }>>('/api/upload?folder=product', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data.result.url;
    }
};
