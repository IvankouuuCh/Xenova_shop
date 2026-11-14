// tailwind.config.js
export default {
    content: ["./index.html", "./category.html", "./src/**/*.{html,js}"],
    theme: {
        extend: {
            colors: {
                brand: {
                    blue: '#3b82f6',  // твій синій колір з лого
                    green: '#22c55e', // твій зелений неон
                    dark: '#030303',  // основний темний фон
                    card: '#08080a',  // фон карток
                    border: '#1e1e24' // колір рамок
                }
            }
        },
    },
    plugins: [],
}