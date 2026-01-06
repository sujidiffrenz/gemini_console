import { newAxiosInstance } from './apiClient';
import { Product, ServiceResponse } from '../types';

export const productService = {
    async getAll(params: Record<string, any> = {}): Promise<Product[]> {
        const query = new URLSearchParams(params).toString();
        const url = `/api/products?${query}`;
        console.log(`Fetching products from: ${url}`);
        try {
            const response = await newAxiosInstance.get<any>(url);
            const data = response.data;
            console.log('Products API response:', data);

            // Standardize result extraction
            const result = data?.result !== undefined ? data.result : data;

            // 1. Handle Direct Array
            if (Array.isArray(result)) {
                return result;
            }

            // 2. Handle Paginated Object Structure (if products ever becomes paginated)
            if (result && typeof result === 'object' && Array.isArray(result.items)) {
                return result.items;
            }

            // 3. Fallback for empty/unexpected (like {})
            if (result && typeof result === 'object' && Object.keys(result).length === 0) {
                console.warn('Products API returned an empty object, returning empty list');
            } else if (result !== null && result !== undefined) {
                console.error('Unexpected products API response format:', result);
            }
        } catch (error) {
            console.error('Error fetching products:', error);
        }

        return [];
    },

    async getById(id: string): Promise<Product> {
        // OpenAPI: /api/products/{product_id}
        const response = await newAxiosInstance.get<ServiceResponse<Product>>(`/api/products/${id}`);
        return response.data.result;
    }
};
