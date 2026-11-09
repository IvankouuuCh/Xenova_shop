
import { defineConfig } from 'vite';

export default defineConfig({
    build: {
        outDir: 'dist',
        rollupOptions: {
            input: {
                category: './category.html',
                product: './product.html',
                cart: './cart.html',
            },
        },
    },
});