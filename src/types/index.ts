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
    id?: number | string;
    _id?: string;
    user_name: string;
    email?: string;
    role: 'admin' | 'user' | string;
    status?: string;
    initials?: string;
    isActive?: boolean;
    password?: string;
    created_at?: string;
    updated_at?: string;
}

export interface Product {
    _id?: number | string;
    id?: number | string;
    post_title: string;
    post_name: string;
    post_content: string;
    post_excerpt: string;
    post_status: string;
    post_date?: string;
    post_author?: number;
    menu_order?: number;
    comment_status?: string;

    // Inventory & Shipping
    stock_status?: string;
    manage_stock?: string; // 'yes' | 'no'
    backorders?: string;
    sold_individually?: string;

    // Digital
    downloadable?: string;
    virtual?: string;
    download_limit?: string | number;
    download_expiry?: string | number;

    // Prices & Tax
    price?: string;
    regular_price?: string;
    sale_price?: string;
    tax_status?: string;
    tax_class?: string;

    // Images & Display
    images?: string | string[] | { src: string }[];
    icon?: string | React.ReactNode;

    // Meta & Attributes
    meta?: Record<string, any>;
    attributes?: Record<string, any>;

    // Categories
    category?: string[] | string;
    category_value?: string;
    categories?: string[];

    // Legacy/Computed?
    name?: string;
    slug?: string;
    status?: string;
}

export interface ContentSection {
    title: string;
    description: string;
}

export interface Category {
    _id: number | string;
    id?: number | string;
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
    category_content_title?: string;
    category_content_description?: string;
    sub_content_category?: ContentSection[];
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

export interface Contact {
    _id: string;
    name: string;
    email: string;
    phone: string;
    company_name: string;
    company_address: string;
    message: string;
    created_at: string;
    updated_at: string;
}
