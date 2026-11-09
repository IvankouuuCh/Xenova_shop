import { defineConfig } from 'vite';

export default defineConfig({
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