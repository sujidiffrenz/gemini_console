import { newAxiosInstance } from './apiClient';
import { configKeys } from '../configKeys';
import { Blog, ServiceResponse, PaginatedResult } from '../types';


// Mock data removed (migrated to local API)


export const blogService = {
    async getAll(page: number = 1, page_size: number = 10): Promise<PaginatedResult<Blog>> {
        const url = `/api/blogs/?page=${page}&limit=${page_size}`;
        console.log(`📡 V3 Fetching blogs from: ${url}`);
        try {
            const response = await newAxiosInstance.get<any>(url);
            const data = response.data;
            console.log('Blogs API response:', data);

            // Standardize result extraction
            const result = data?.result !== undefined ? data.result : data;

            // 1. Handle Paginated Object Structure
            if (result && typeof result === 'object' && !Array.isArray(result)) {
                const items = Array.isArray(result.items) ? result.items : [];
                const total = typeof result.total === 'number' ? result.total : items.length;

                return {
                    items,
                    total,
                    page: result.page || page,
                    size: result.size || page_size,
                    pages: result.pages || Math.ceil(total / page_size)
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

            // 3. Fallback for empty/unexpected (like {})
            if (result && typeof result === 'object' && Object.keys(result).length === 0) {
                console.warn('Blogs API returned an empty object, returning empty results');
            } else if (result !== null && result !== undefined) {
                console.error('Unexpected blogs API response format:', result);
            }
        } catch (error) {
            console.error('Error fetching blogs:', error);
        }

        return { items: [], total: 0, page: page, size: page_size, pages: 0 };
    },

    async getById(id: string | number): Promise<Blog | null> {
        // Standard ID-based route
        const response = await newAxiosInstance.get<ServiceResponse<any>>(`/api/blogs/id/${id}`);
        return response.data.result;
    },

    async create(data: Partial<Blog>): Promise<Blog> {
        // OpenAPI: POST /api/blogs/
        const response = await newAxiosInstance.post<ServiceResponse<any>>(`/api/blogs`, data);
        return response.data.result;
    },

    async update(id: string | number, data: Partial<Blog>): Promise<Blog> {
        // OpenAPI: PUT /api/blogs/{blog_id}
        const response = await newAxiosInstance.put<ServiceResponse<any>>(`/api/blogs/${id}`, data);
        return response.data.result;
    },

    async delete(id: string | number): Promise<boolean> {
        // OpenAPI: DELETE /api/blogs/{blog_id}
        await newAxiosInstance.delete(`/api/blogs/${id}`);
        return true;
    },

    async uploadFile(file: File): Promise<string> {
        console.log("📤 Preparing upload for file:", {
            name: file.name,
            size: file.size,
            type: file.type
        });

        const formData = new FormData();
        formData.append('file', file);

        // Verify FormData
        for (let pair of (formData as any).entries()) {
            console.log("📦 FormData entry:", pair[0], pair[1]);
        }

        // Bypass Axios/apiClient and use raw fetch to determine if extra headers are the issue
        const fetchUrl = `/api/upload/?folder=blog`;
        console.log("🚀 Raw Fetch Upload Attempt:", fetchUrl);

        const fetchResponse = await fetch(fetchUrl, {
            method: 'POST',
            body: formData,
            headers: {
                'accept': 'application/json',
            }
            // DO NOT set Content-Type header, fetch will set it correctly with boundary
        });

        if (!fetchResponse.ok) {
            const errorText = await fetchResponse.text();
            throw new Error(`Upload failed with status ${fetchResponse.status}: ${errorText}`);
        }

        const responseData = await fetchResponse.json();
        const response = { data: responseData }; // Mock axios structure for logic below

        // Response format: { result: { url: "static/..." } }
        const relativeUrl = response.data.result?.url;
        console.log("Upload response relative URL:", relativeUrl);

        if (relativeUrl) {
            const baseUrl = configKeys.GEMINI_NEW_BASE_URL.replace(/\/$/, '');
            const cleanRelative = relativeUrl.startsWith('/') ? relativeUrl : `/${relativeUrl}`;
            return `${baseUrl}${cleanRelative}`;
        }

        // Fallback
        return response.data.result as string;
    }
};
