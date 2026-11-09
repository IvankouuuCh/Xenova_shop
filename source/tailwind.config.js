/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./*.html",
        "./src/**/*.{html,js}"
    ],
    theme: {
        extend: {
            colors: {
                'wh-red': '#d32f2f',
                'wh-dark': '#121212',
                'wh-card': '#1a1d20',
            }
        },
    },
    plugins: [],
}