import axios from "axios";
import { configKeys } from "../configKeys";

// WooCommerce API credentials
// const username = "ck_5ad4e89064fbbd6f12ea0acb480a1bdb6a0f830e";
// const password = "cs_b4c1b980811afbb7a130f4bd39c247c05ac3d738";

// Encode credentials in Base64
const basicAuth = `Basic ${btoa(`${configKeys.GEMINI_USER_NAME}:${configKeys.GEMINI_PASSWORD}`)}`;

// Create Axios instance with interceptors
const createAxiosInstance = (baseURL: string) => {
    const instance = axios.create({
        baseURL,
        headers: {
            Authorization: basicAuth,
        },
    });

    // 🔹 Request Interceptor: Attach headers, modify config if needed
    instance.interceptors.request.use(
        (config) => {
            return config;
        },
        (error) => {
            console.error("❌ Request error:", error);
            return Promise.reject(error);
        }
    );

    // 🔹 Response Interceptor: Handle success and errors
    instance.interceptors.response.use(
        (response) => {
            return response;
        },
        (error) => {
            if (error.response) {
                console.error(`❌ API Error [${error.response.status}]:`, error.response.data);
            } else {
                console.error("❌ Network/Unknown error:", error);
            }
            return Promise.reject(error);
        }
    );

    return instance;
};

const createNewAxiosInstance = (baseURL: string) => {
    // In the browser, we want to hit our own Next.js proxy to avoid CORS and use rewrites
    const actualBaseURL = typeof window !== 'undefined' ? '' : baseURL;

    const instance = axios.create({
        baseURL: actualBaseURL,
        timeout: 10000, // 10 seconds timeout
    });

    // 🔹 Request Interceptor: Attach headers, modify config if needed
    instance.interceptors.request.use(
        (config) => {
            config.headers["Apikey"] = configKeys.GEMINI_API_KEY;
            config.headers["Clientkey"] = configKeys.GEMINI_CLIENT_KEY;

            const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
            if (token) {
                config.headers["Authorization"] = `Bearer ${token}`;
            }

            console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`, {
                baseURL: config.baseURL,
                headers: config.headers
            });
            return config;
        },
        (error) => {
            console.error("❌ Request error:", error);
            return Promise.reject(error);
        }
    );

    // 🔹 Response Interceptor: Handle success and errors
    instance.interceptors.response.use(
        (response) => {
            console.log(`✅ API Response [${response.status}] for ${response.config.url}`, response.data);
            return response;
        },
        (error) => {
            if (error.response) {
                // Silently handle 401 for login to avoid red errors in console for expected failures
                if (error.response.status === 401 && error.config?.url?.includes('/login')) {
                    return Promise.reject(error);
                }
                console.error(`❌ API Error [${error.response.status}] for ${error.config?.url}:`, error.response.data);
            } else {
                console.error(`❌ Network/Unknown error for ${error.config?.url}:`, error);
            }
            return Promise.reject(error);
        }
    );

    return instance;
};

// Create WooCommerce Axios instance
// const productAxiosInstance = createAxiosInstance("https://geminiuae.com/wp-json/wc/v3/");
const productAxiosInstance = createAxiosInstance(configKeys.GEMINI_BASE_URL_V3);
const brandAxiosInstance = createAxiosInstance(configKeys.GEMINI_BASE_URL_V2);
const productAxiosInstanceWC = createAxiosInstance(configKeys.GEMINI_BASE_URL_WC_V2);
const v1AxiosInstance = createAxiosInstance(configKeys.GEMINI_BASE_URL_V1);
const newAxiosInstance = createNewAxiosInstance(configKeys.GEMINI_NEW_BASE_URL);
export { productAxiosInstance, brandAxiosInstance, v1AxiosInstance, productAxiosInstanceWC, newAxiosInstance };
