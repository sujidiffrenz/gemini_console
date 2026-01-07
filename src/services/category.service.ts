import { newAxiosInstance } from './apiClient';
import { Category, ServiceResponse, PaginatedResult } from '../types';
import { configKeys } from '../configKeys';


export const categoryService = {
    async getAll(page: number, page_size: number): Promise<PaginatedResult<Category>> {
        const url = `/api/categories/paginated?page=${page}&page_size=${page_size}`;
        console.log(`📡 V3 Fetching categories from: ${url}`);
        const response = await newAxiosInstance.get<any>(url);
        const data = response.data;
        console.log('Categories API response:', data);

        // Standardize result extraction
        const result = data?.result !== undefined ? data.result : data;

        // 1. Handle Paginated Object Structure { items: [], total: 0, ... }
        if (result && typeof result === 'object' && !Array.isArray(result)) {
            const items = Array.isArray(result.items) ? result.items : [];
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
            console.warn('Category API returned an empty object, returning empty results');
        } else if (result !== null && result !== undefined) {
            console.error('Unexpected category API response format:', result);
        }

        return { items: [], total: 0, page: page, size: page_size, pages: 0 };
    },

    // OpenAPI: /api/categories/hierarchy
    async getHierarchy(): Promise<Category[]> {
        const response = await newAxiosInstance.get<ServiceResponse<any>>(`/api/categories/hierarchy`);
        return response.data.result;
    },

    async getParents(): Promise<Category[]> {
        const response = await newAxiosInstance.get<ServiceResponse<any>>(`/api/categories/parent`);
        return response.data.result;
    },

    async getById(id: string | number): Promise<Category | null> {
        const response = await newAxiosInstance.get<ServiceResponse<any>>(`/api/categories/${id}`);
        return response.data.result;
    },

    async create(data: Partial<Category>): Promise<Category> {
        const response = await newAxiosInstance.post<ServiceResponse<any>>(`/api/categories/`, data);
        return response.data.result;
    },

    async update(id: string | number, data: Partial<Category>): Promise<Category> {
        const response = await newAxiosInstance.put<ServiceResponse<any>>(`/api/categories/${id}`, data);
        return response.data.result;
    },

    async delete(id: string | number): Promise<boolean> {
        await newAxiosInstance.delete(`/api/categories/${id}`);
        return true;
    },

    async uploadFile(file: File): Promise<string> {
        console.log("📤 V3 Category Upload:", file.name);
        const formData = new FormData();
        formData.append('file', file);

        // Try direct backend access to bypass potential Next.js proxy body limits/issues
        const baseUrl = configKeys.GEMINI_NEW_BASE_URL.replace(/\/$/, '');
        const url = `${baseUrl}/api/upload?folder=categories`;

        console.log("🚀 V3 Category Direct Axios Upload Attempt:", url);

        try {
            const response = await newAxiosInstance.post<ServiceResponse<any>>(url, formData);

            const responseData = response.data;
            console.log("✅ V3 Category Upload Response:", responseData);

            // Handle both { result: { url: "..." } } and { result: "/path/to/file" }
            let relativeUrl = responseData.result?.url;
            if (!relativeUrl && typeof responseData.result === 'string') {
                relativeUrl = responseData.result;
            }

            if (relativeUrl) {
                const baseUrl = configKeys.GEMINI_NEW_BASE_URL.replace(/\/$/, '');
                const cleanRelative = relativeUrl.startsWith('/') ? relativeUrl : `/${relativeUrl}`;
                // If it's already a full URL, don't prepend
                if (cleanRelative.startsWith('http')) {
                    return cleanRelative;
                }
                return `${baseUrl}${cleanRelative}`;
            }

            return '';
        } catch (error) {
            console.error("❌ Upload failed:", error);
            throw error;
        }
    }
};
