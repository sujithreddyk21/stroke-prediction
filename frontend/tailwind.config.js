/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'brand-blue': '#0052CC',
                'brand-red': '#E11D48',
                'brand-green': '#10B981',
            },
        },
    },
    plugins: [],
}
