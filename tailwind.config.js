/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './views/**/*.ejs',
        './public/**/*.js'
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Plus Jakarta Sans', 'Noto Sans Thai', 'system-ui', '-apple-system', 'sans-serif'],
                display: ['Plus Jakarta Sans', 'Noto Sans Thai', 'sans-serif'],
                thai: ['Noto Sans Thai', 'sans-serif'],
            },
            colors: {
                primary: {
                    50: '#fef2f2',
                    100: '#fee2e2',
                    200: '#fecaca',
                    300: '#fca5a5',
                    400: '#f87171',
                    500: '#ef4444', // Red 500 (Main accent)
                    600: '#dc2626', // Red 600 (Primary)
                    700: '#b91c1c',
                    800: '#991b1b',
                    900: '#7f1d1d',
                    950: '#450a0a',
                },
                surface: {
                    50: '#f8fafc',
                    100: '#f1f5f9',
                    200: '#e2e8f0',
                    300: '#cbd5e1',
                    400: '#94a3b8',
                    500: '#64748b',
                    600: '#475569',
                    700: '#334155',
                    800: '#1e293b',
                    900: '#0f172a',
                }
            },
            boxShadow: {
                'soft': '0 10px 40px -10px rgba(239, 68, 68, 0.15)',
                'card': '0 1px 3px 0 rgba(0,0,0,0.1), 0 1px 2px -1px rgba(0,0,0,0.1)',
                'card-hover': '0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)',
                'glow': '0 0 20px rgba(239, 68, 68, 0.3)',
                'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
                'nav': '0 4px 30px rgba(0, 0, 0, 0.03)',
                'inner-soft': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)',
            },
            borderRadius: {
                '3xl': '1.5rem',
                '4xl': '2rem',
                '5xl': '2.5rem',
            },
            backdropBlur: {
                xs: '2px',
            },
            animation: {
                'fade-in': 'fadeIn 0.5s ease-out',
                'slide-up': 'slideUp 0.5s ease-out',
                'slide-down': 'slideDown 0.3s ease-out',
                'float': 'float 6s ease-in-out infinite',
                'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
                'shimmer': 'shimmer 2s linear infinite',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0', transform: 'translateY(10px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                slideUp: {
                    '0%': { opacity: '0', transform: 'translateY(20px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                slideDown: {
                    '0%': { opacity: '0', transform: 'translateY(-10px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-10px)' },
                },
                pulseSoft: {
                    '0%, 100%': { opacity: '1' },
                    '50%': { opacity: '0.7' },
                },
                shimmer: {
                    '0%': { backgroundPosition: '-200% 0' },
                    '100%': { backgroundPosition: '200% 0' },
                }
            },
            transitionDuration: {
                '400': '400ms',
            },
            spacing: {
                '18': '4.5rem',
                '72': '18rem',
                '84': '21rem',
                '96': '24rem',
            }
        },
    },
    plugins: [],
}
