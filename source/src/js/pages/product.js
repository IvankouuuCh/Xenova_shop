import { CATEGORIES_DATA } from '../data/navigation.js';
import { ALL_PRODUCTS } from '../data/products.js';
import { extendShopApp } from '../core/store.js';

export function productApp() {
    const params = new URLSearchParams(window.location.search);
    const rawId = params.get('id');

    // Якщо id не передано в URL, відкриваємо перший товар; якщо передано — шукаємо точний збіг
    const foundProduct = rawId === null
        ? (ALL_PRODUCTS[0] || null)
        : (ALL_PRODUCTS.find(p => String(p.id) === String(rawId)) || null);

    return extendShopApp({
        product: foundProduct,
        activeImage: foundProduct ? foundProduct.image : '',
        quantity: 1,
        activeTab: 'description',

        init() {
            this.updateDocumentSeo();
        },

        get categorySlug() {
            if (!this.product) return 'warhammer-40k';
            if (this.product.categorySlug) return this.product.categorySlug;

            const cat = (this.product.category || '').toLowerCase();
            if (cat.includes('sigmar')) return 'age-of-sigmar';
            if (cat.includes('farby') || cat.includes('nástroje') || cat.includes('citadel')) return 'farby-a-nastroje';
            if (cat.includes('kill team')) return 'kill-team';
            if (cat.includes('príslušenstvo')) return 'prislusenstvo';
            if (cat.includes('merch')) return 'merch';
            return 'warhammer-40k';
        },

        get categoryName() {
            if (!this.product) return 'Katalóg';
            if (CATEGORIES_DATA[this.categorySlug]?.name) {
                return CATEGORIES_DATA[this.categorySlug].name;
            }
            return this.product.category || 'Warhammer 40,000';
        },

        get categoryUrl() {
            return `category.html?cat=${encodeURIComponent(this.categorySlug)}`;
        },

        get productSku() {
            if (!this.product) return '';
            return this.product.sku || `GW-${String(this.product.id).padStart(4, '0')}`;
        },

        get productDescription() {
            if (!this.product) return '';
            if (this.product.description) return this.product.description;
            return `Originálna stavebnica a herné príslušenstvo ${this.product.title} zo série ${this.categoryName} od Games Workshop. Detailne spracované komponenty ideálne pre zberateľov aj turnajových hráčov.`;
        },

        get galleryImages() {
            if (!this.product) return [];
            if (Array.isArray(this.product.images) && this.product.images.length > 0) {
                return this.product.images;
            }
            return [this.product.image];
        },

        get relatedProducts() {
            if (!this.product) return [];
            const sameGroup = ALL_PRODUCTS.filter(p =>
                p.id !== this.product.id &&
                ((this.product.faction && p.faction === this.product.faction) ||
                    p.categorySlug === this.categorySlug ||
                    p.category === this.product.category)
            );
            const fallback = ALL_PRODUCTS.filter(p => p.id !== this.product.id);
            const pool = sameGroup.length >= 4 ? sameGroup : [...sameGroup, ...fallback];

            const seen = new Set();
            return pool.filter(item => {
                if (seen.has(item.id)) return false;
                seen.add(item.id);
                return true;
            }).slice(0, 4);
        },

        prevImage() {
            const imgs = this.galleryImages;
            if (imgs.length <= 1) return;
            const idx = imgs.indexOf(this.activeImage);
            const prevIdx = idx <= 0 ? imgs.length - 1 : idx - 1;
            this.activeImage = imgs[prevIdx];
        },

        nextImage() {
            const imgs = this.galleryImages;
            if (imgs.length <= 1) return;
            const idx = imgs.indexOf(this.activeImage);
            const nextIdx = idx < 0 || idx >= imgs.length - 1 ? 0 : idx + 1;
            this.activeImage = imgs[nextIdx];
        },

        incrementQty() {
            if (this.quantity < 20) {
                this.quantity += 1;
            }
        },

        decrementQty() {
            if (this.quantity > 1) {
                this.quantity -= 1;
            }
        },

        addProductWithQty() {
            if (!this.product || !this.product.inStock) return;
            for (let i = 0; i < this.quantity; i++) {
                this.addToCart(this.product);
            }
            this.showToast(`Pridané do košíka: ${this.product.title} (${this.quantity} ks)`);
        },

        updateDocumentSeo() {
            if (window.XENOVA_PRODUCT_SEO && typeof window.XENOVA_PRODUCT_SEO.updateProductSeo === 'function') {
                window.XENOVA_PRODUCT_SEO.updateProductSeo(this.product, this.categoryName, this.categorySlug);
            }
        }
    });
}

// Заглушка для запобігання помилкам імпорту в main.js
export function initProductSliders() {
    // Необов'язково для сітки товарів, але усуває помилку збирання
}