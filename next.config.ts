import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    devIndicators: false,

    async rewrites() {
        // Standardizing on the same env var used in configKeys.ts
        const apiUrl = process.env.NEXT_PUBLIC_GEMINI_NEW_BASE_URL || 'http://127.0.0.1:8000';

        return [
            {
                source: '/api/login',
                destination: `${apiUrl}/login`,
            },
            {
                source: '/api/users/:path*',
                destination: `${apiUrl}/users/:path*`,
            },
            {
                source: '/api/:path*',
                destination: `${apiUrl}/api/:path*`,
            },
        ];
    },
};

export default nextConfig;
