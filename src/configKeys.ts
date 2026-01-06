export const configKeys = {
    GEMINI_USER_NAME: process.env.NEXT_PUBLIC_GEMINI_USER_NAME || '',
    GEMINI_PASSWORD: process.env.NEXT_PUBLIC_GEMINI_PASSWORD || '',
    GEMINI_API_KEY: process.env.NEXT_PUBLIC_GEMINI_API_KEY || '',
    GEMINI_CLIENT_KEY: process.env.NEXT_PUBLIC_GEMINI_CLIENT_KEY || '',

    GEMINI_BASE_URL_V3: process.env.NEXT_PUBLIC_GEMINI_BASE_URL_V3 || 'https://geminiuae.com/wp-json/wc/v3/',
    GEMINI_BASE_URL_V2: process.env.NEXT_PUBLIC_GEMINI_BASE_URL_V2 || 'https://geminiuae.com/wp-json/wc/v2/',
    GEMINI_BASE_URL_WC_V2: process.env.NEXT_PUBLIC_GEMINI_BASE_URL_WC_V2 || 'https://geminiuae.com/wp-json/wc/v2/',
    GEMINI_BASE_URL_V1: process.env.NEXT_PUBLIC_GEMINI_BASE_URL_V1 || 'https://geminiuae.com/wp-json/wc/v1/',
    GEMINI_NEW_BASE_URL: process.env.NEXT_PUBLIC_GEMINI_NEW_BASE_URL || 'http://127.0.0.1:8000',
};
