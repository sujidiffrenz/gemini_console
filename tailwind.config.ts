import type { Config } from 'tailwindcss'

const config: Config = {
    content: [
        './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
        './src/components/**/*.{js,ts,jsx,tsx,mdx}',
        './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            colors: {
                background: 'var(--background)',
                surface: 'var(--surface)',
                'surface-hover': 'var(--surface-hover)',
                border: 'var(--border)',
                primary: {
                    DEFAULT: 'var(--primary)',
                    hover: 'var(--primary-hover)',
                    glow: 'var(--primary-glow)',
                },
                'text-main': 'var(--text-main)',
                'text-muted': 'var(--text-muted)',
                success: 'var(--success)',
                error: 'var(--error)',
                warning: 'var(--warning)',
            },
            borderRadius: {
                sm: 'var(--radius-sm)',
                md: 'var(--radius-md)',
                lg: 'var(--radius-lg)',
            },
            spacing: {
                xs: 'var(--spacing-xs)',
                sm: 'var(--spacing-sm)',
                md: 'var(--spacing-md)',
                lg: 'var(--spacing-lg)',
                xl: 'var(--spacing-xl)',
            },
        },
    },
    plugins: [],
}
export default config
