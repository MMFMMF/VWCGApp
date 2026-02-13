/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: '#0f172a', // slate-900
                    foreground: '#f8fafc', // slate-50
                },
                secondary: {
                    DEFAULT: '#334155', // slate-700
                    foreground: '#f8fafc',
                },
                accent: {
                    DEFAULT: '#06b6d4', // cyan-500
                    foreground: '#f8fafc',
                },
                destruct: {
                    DEFAULT: '#ef4444', // red-500
                },
                report: {
                    navy: '#1B2A4A',        // Primary backgrounds, headers
                    charcoal: '#2D3436',    // Body text
                    warm: '#F8F7F4',        // Secondary backgrounds
                    blue: '#2E6EA6',        // Positive, strengths
                    amber: '#D4930D',       // Caution, moderate risk
                    red: '#C0392B',         // Critical risk
                    green: '#27864A',       // Growth, opportunity
                    gray: '#6B7280',        // Captions, labels
                }
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
                serif: ['"Source Serif 4"', 'Georgia', 'serif'],
            }
        },
    },
    plugins: [],
}
