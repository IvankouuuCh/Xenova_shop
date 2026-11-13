import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
    plugins: [
        tailwindcss(),
    ],
    build: {
        outDir: 'dist',
        rollupOptions: {
            input: {
                main: './index.html',
                category: './category.html',
                product: './product.html',
                cart: './cart.html',
            },
        },
    },
});