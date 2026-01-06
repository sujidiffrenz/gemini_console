export interface ServiceResponse<T> {
    status: string;
    status_code: number;
    message: string;
    result: T;
}

export interface PaginatedResult<T> {
    items: T[];
    total: number;
    page: number;
    size: number;
    pages: number;
}

export interface User {
    id: number | string;
    user_name: string;
    email?: string;
    role: 'admin' | 'user' | string;
    status?: string;
    initials?: string;
    isActive?: boolean;
}

export interface Product {
    id: number | string;
    name: string;
    slug?: string;
    price: string;
    regular_price?: string;
    sale_price?: string;
    stock_status?: string;
    category?: string;
    categories?: string[];
    status?: string;
    images?: { src: string }[];
    icon?: string | React.ReactNode;
}

export interface Category {
    _id: number | string;
    name: string;
    description?: string;
    slug?: string;
    count?: number;
    product_count?: number;
    thumbnail?: string;
    parent?: number;
    status?: string;
    icon?: string | React.ReactNode;
    term_id?: number;
    tax_status?: string;
    tax_class?: string;
}


export interface SEOModel {
    meta_title: string;
    meta_description: string;
    keywords: string[];
    canonical_url?: string;
}

export interface ImageModel {
    url: string;
    alt?: string;
    caption?: string;
}

export interface Blog {
    _id?: string;
    id?: number | string;
    title: string;
    excerpt: string;
    content: string[];
    isLatest: boolean;
    content_category: string;
    seo: SEOModel;
    categories: string[];
    tags: string[];
    featured_image: ImageModel;
    content_image: ImageModel[];
    status: string;
    published_at?: string;
    slug?: string;
    created_at?: string;
    updated_at?: string;
    is_deleted?: boolean;
}

export interface QuoteProduct {
    product_id: string;
    name: string;
    slug: string;
    quantity: number;
}

export interface Quote {
    _id: string;
    id?: string; // Optional mapping
    name: string;
    email_address: string;
    phone_number: string;
    company_name: string;
    company_address: string;
    additional_information?: string;
    status: string;
    product_details: QuoteProduct[];
    created_at: string;
    updated_at: string;
}

export interface LoginResponse {
    access_token: string;
    token_type: string;
}
