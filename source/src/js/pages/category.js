import { CATEGORIES_DATA } from '../data/navigation.js';
import * as productsModule from '../data/products.js';

const CART_STORAGE_KEY = 'wh_cart';
const WISHLIST_STORAGE_KEY = 'wh_wishlist';

function inferCategorySlug(product) {
    if (product.categorySlug) return product.categorySlug;
    const cat = (product.category || '').toLowerCase();
    if (cat.includes('sigmar')) return 'age-of-sigmar';
    if (cat.includes('farb') || cat.includes('citadel') || cat.includes('nástroj')) return 'farby-a-nastroje';
    if (cat.includes('kill team')) return 'kill-team';
    if (cat.includes('príslušenstvo') || cat.includes('prislusenstvo')) return 'prislusenstvo';
    if (cat.includes('merch')) return 'merch';
    if (cat.includes('akci')) return 'akcie';
    return 'warhammer-40k';
}

function resolveProductsData(mod) {
    const directCandidates = [
        mod.PRODUCTS_DATA,
        mod.PRODUCTS,
        mod.CATALOG_PRODUCTS,
        mod.ALL_PRODUCTS,
        mod.CATEGORY_PRODUCTS,
        mod.default
    ];

    let rawList = directCandidates.find(item => Array.isArray(item) && item.length > 0);

    if (!rawList) {
        const seen = new Set();
        rawList = [];
        Object.values(mod).forEach(exportedVal => {
            if (Array.isArray(exportedVal)) {
                exportedVal.forEach(item => {
                    if (item && typeof item === 'object' && ('price' in item || 'title' in item || 'name' in item)) {
                        const key = item.id ?? item.title ?? item.name;
                        if (!seen.has(key)) {
                            seen.add(key);
                            rawList.push(item);
                        }
                    }
                });
            }
        });
    }

    return rawList.map((p, index) => ({
        ...p,
        id: p.id ?? index + 1,
        title: p.title || p.name || 'Produkt',
        category: p.category || 'Warhammer 40,000',
        categorySlug: inferCategorySlug(p),
        faction: p.faction || p.subcategory || 'space-marines',
        type: p.type || p.productType || 'Jednotky',
        price: Number(p.price) || 0,
        oldPrice: p.oldPrice ? Number(p.oldPrice) : null,
        inStock: typeof p.inStock === 'boolean' ? p.inStock : true,
        image: p.image || 'https://placehold.co/400x400/121212/dc2626?text=Warhammer',
        badge: p.badge || null,
        description: p.description || '',
        popular: Boolean(p.popular)
    }));
}

const PRODUCTS_DATA = resolveProductsData(productsModule);

function readStorage(key, fallback = []) {
    try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : fallback;
    } catch {
        return fallback;
    }
}

function writeStorage(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch {
        // Ігноруємо помилку квоти або приватного режиму
    }
}

export function categoryApp() {
    const params = new URLSearchParams(window.location.search);
    const initialCat = params.get('cat') || 'warhammer-40k';
    const initialSub = params.get('faction') || 'all';

    return {
        // Навігація та модальні вікна
        megaMenuOpen: false,
        activeCategory: 'wh40k',
        activeFaction: 'space-marines',
        mobileNavOpen: false,
        cartDrawerOpen: false,
        mobileFiltersOpen: false,

        // Сповіщення (Toast)
        toastVisible: false,
        toastMessage: '',
        _toastTimer: null,

        // Кошик, обране та пошук
        cart: readStorage(CART_STORAGE_KEY, []),
        wishlist: readStorage(WISHLIST_STORAGE_KEY, []),
        searchQuery: '',

        // Категорія, фільтри, сортування та пагінація
        currentCategorySlug: CATEGORIES_DATA[initialCat] ? initialCat : 'warhammer-40k',
        filterFactions: initialSub !== 'all' ? [initialSub] : [],
        filterAvailability: [],
        priceMin: 15,
        priceMax: 250,
        filterTypes: [],
        sortBy: 'popular',
        viewMode: 'grid',
        currentPage: 1,
        perPage: 12,

        init() {
            this.updateDocumentMeta();
        },

        // --- МЕГА-МЕНЮ ---
        toggleMegaMenu(categoryKey) {
            if (this.megaMenuOpen && this.activeCategory === categoryKey) {
                this.megaMenuOpen = false;
            } else {
                this.activeCategory = categoryKey;
                this.megaMenuOpen = true;
            }
        },

        // --- СПОВІЩЕННЯ ---
        showToast(message) {
            this.toastMessage = message;
            this.toastVisible = true;
            clearTimeout(this._toastTimer);
            this._toastTimer = setTimeout(() => {
                this.toastVisible = false;
            }, 3200);
        },

        hideToast() {
            this.toastVisible = false;
            clearTimeout(this._toastTimer);
        },

        // --- КОШИК ---
        get cartCount() {
            return this.cart.reduce((sum, item) => sum + (item.qty || 1), 0);
        },

        get cartTotal() {
            return this.cart.reduce((sum, item) => sum + item.price * (item.qty || 1), 0);
        },

        addToCart(product) {
            if (!product || !product.inStock) return;

            const existing = this.cart.find(item => item.id === product.id);
            if (existing) {
                existing.qty += 1;
            } else {
                this.cart.push({
                    id: product.id,
                    title: product.title,
                    price: product.price,
                    image: product.image,
                    qty: 1
                });
            }

            writeStorage(CART_STORAGE_KEY, this.cart);
            this.showToast(`Pridané do košíka: ${product.title}`);
        },

        removeFromCart(productId) {
            this.cart = this.cart.filter(item => item.id !== productId);
            writeStorage(CART_STORAGE_KEY, this.cart);
        },

        checkout() {
            if (this.cart.length === 0) {
                this.showToast('Váš košík je prázdny.');
                return;
            }
            this.cartDrawerOpen = false;
            this.showToast('Presmerovanie na pokladňu...');
        },

        // --- ОБРАНЕ (WISHLIST) ---
        isInWishlist(productId) {
            return this.wishlist.some(item => item.id === productId);
        },

        toggleWishlist(product) {
            const index = this.wishlist.findIndex(item => item.id === product.id);
            if (index > -1) {
                this.wishlist.splice(index, 1);
                this.showToast(`Odstránené z obľúbených: ${product.title}`);
            } else {
                this.wishlist.push({
                    id: product.id,
                    title: product.title,
                    price: product.price,
                    image: product.image
                });
                this.showToast(`Pridané do obľúbených: ${product.title}`);
            }
            writeStorage(WISHLIST_STORAGE_KEY, this.wishlist);
        },

        // --- КАТЕГОРІЇ ТА ТОВАРИ ---
        get currentCategory() {
            return CATEGORIES_DATA[this.currentCategorySlug] || CATEGORIES_DATA['warhammer-40k'];
        },

        get baseCategoryProducts() {
            if (this.currentCategorySlug === 'akcie') {
                return PRODUCTS_DATA.filter(p => p.categorySlug === 'akcie' || Boolean(p.oldPrice));
            }
            return PRODUCTS_DATA.filter(p => p.categorySlug === this.currentCategorySlug);
        },

        get availableProductTypes() {
            const countsMap = new Map();

            this.baseCategoryProducts.forEach(product => {
                const typeName = product.type || product.productType;
                if (!typeName) return;
                countsMap.set(typeName, (countsMap.get(typeName) || 0) + 1);
            });

            return Array.from(countsMap.entries()).map(([name, count]) => ({
                name,
                count
            }));
        },

        get activeSectionTitle() {
            if (this.filterFactions.length === 0) {
                return 'VŠETKY PRODUKTY';
            }
            if (this.filterFactions.length === 1) {
                const found = this.currentCategory.subcategories.find(s => s.slug === this.filterFactions[0]);
                return found ? found.name.toUpperCase() : 'VŠETKY PRODUKTY';
            }
            return `VYBRANÉ FRAKCIE (${this.filterFactions.length})`;
        },

        getSubcategoryCount(slug) {
            if (slug === 'all') return this.baseCategoryProducts.length;
            return this.baseCategoryProducts.filter(p => p.faction === slug).length;
        },

        get filteredProducts() {
            let list = [...this.baseCategoryProducts];

            // 1. Фракції
            if (this.filterFactions.length > 0) {
                list = list.filter(p => this.filterFactions.includes(p.faction));
            }

            // 2. Наявність
            if (this.filterAvailability.length > 0) {
                list = list.filter(p => {
                    if (this.filterAvailability.includes('in-stock') && p.inStock) return true;
                    if (this.filterAvailability.includes('on-order') && !p.inStock) return true;
                    return false;
                });
            }

            // 3. Діапазон цін
            const minPrice = Number(this.priceMin) || 0;
            const maxPrice = Number(this.priceMax) || 99999;
            list = list.filter(p => p.price >= minPrice && p.price <= maxPrice);

            // 4. Тип продукту
            if (this.filterTypes.length > 0) {
                list = list.filter(p => this.filterTypes.includes(p.type || p.productType));
            }

            // 5. Пошуковий запит
            const query = (this.searchQuery || '').trim().toLowerCase();
            if (query) {
                list = list.filter(p =>
                    (p.title && p.title.toLowerCase().includes(query)) ||
                    (p.category && p.category.toLowerCase().includes(query)) ||
                    (p.faction && p.faction.toLowerCase().includes(query)) ||
                    (p.description && p.description.toLowerCase().includes(query))
                );
            }

            // 6. Сортування
            switch (this.sortBy) {
                case 'price-asc':
                    list.sort((a, b) => a.price - b.price);
                    break;
                case 'price-desc':
                    list.sort((a, b) => b.price - a.price);
                    break;
                case 'name-asc':
                    list.sort((a, b) => a.title.localeCompare(b.title, 'sk'));
                    break;
                case 'popular':
                default:
                    list.sort((a, b) => (b.popular ? 1 : 0) - (a.popular ? 1 : 0));
                    break;
            }

            return list;
        },

        get totalPages() {
            return Math.max(1, Math.ceil(this.filteredProducts.length / this.perPage));
        },

        get paginatedProducts() {
            const safePage = Math.min(this.currentPage, this.totalPages);
            const start = (safePage - 1) * this.perPage;
            return this.filteredProducts.slice(start, start + this.perPage);
        },

        selectSubcategory(slug) {
            this.filterFactions = slug === 'all' ? [] : [slug];
            this.currentPage = 1;
            this.syncUrl();
        },

        resetFilters() {
            this.filterAvailability = [];
            this.priceMin = 15;
            this.priceMax = 250;
            this.filterTypes = [];
            this.filterFactions = [];
            this.searchQuery = '';
            this.currentPage = 1;
            this.syncUrl();
        },

        goToPage(page) {
            if (page < 1 || page > this.totalPages) return;
            this.currentPage = page;
            const topEl = document.getElementById('catalog-products-top');
            if (topEl) {
                topEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        },

        syncUrl() {
            const url = new URL(window.location);
            url.searchParams.set('cat', this.currentCategorySlug);
            if (this.filterFactions.length === 1) {
                url.searchParams.set('faction', this.filterFactions[0]);
            } else {
                url.searchParams.delete('faction');
            }
            window.history.replaceState({}, '', url);
            this.updateDocumentMeta();
        },

        updateDocumentMeta() {
            const activeSub = this.filterFactions.length === 1
                ? this.currentCategory.subcategories.find(s => s.slug === this.filterFactions[0])
                : null;

            const seoTitle = activeSub
                ? `${activeSub.name} – ${this.currentCategory.seoTitle}`
                : this.currentCategory.seoTitle;

            const seoDescription = activeSub
                ? `${activeSub.name} (${this.currentCategory.breadcrumb}) – oficiálne miniatúry a sady Games Workshop. Rýchle doručenie 1–2 pracovné dni po celom Slovensku.`
                : this.currentCategory.description;

            const cleanUrl = new URL('https://xenova-shop.vercel.app/category.html');
            cleanUrl.searchParams.set('cat', this.currentCategorySlug);
            if (activeSub) {
                cleanUrl.searchParams.set('faction', activeSub.slug);
            }
            const canonicalHref = cleanUrl.toString();

            document.title = seoTitle;

            const setMeta = (selector, attr, value) => {
                const el = document.querySelector(selector);
                if (el) el.setAttribute(attr, value);
            };

            setMeta('meta[name="description"]', 'content', seoDescription);
            setMeta('#canonical-url', 'href', canonicalHref);
            setMeta('#og-title', 'content', seoTitle);
            setMeta('#og-description', 'content', seoDescription);
            setMeta('#og-url', 'content', canonicalHref);
            setMeta('#twitter-title', 'content', seoTitle);
            setMeta('#twitter-description', 'content', seoDescription);

            const schemaEl = document.getElementById('category-schema');
            if (schemaEl) {
                const breadcrumbItems = [
                    {
                        '@type': 'ListItem',
                        position: 1,
                        name: 'Domov',
                        item: 'https://xenova-shop.vercel.app/index.html'
                    },
                    {
                        '@type': 'ListItem',
                        position: 2,
                        name: this.currentCategory.breadcrumb,
                        item: `https://xenova-shop.vercel.app/category.html?cat=${this.currentCategorySlug}`
                    }
                ];

                if (activeSub) {
                    breadcrumbItems.push({
                        '@type': 'ListItem',
                        position: 3,
                        name: activeSub.name,
                        item: canonicalHref
                    });
                }

                schemaEl.textContent = JSON.stringify({
                    '@context': 'https://schema.org',
                    '@graph': [
                        {
                            '@type': 'CollectionPage',
                            '@id': `${canonicalHref}#webpage`,
                            url: canonicalHref,
                            name: activeSub ? `${activeSub.name} – ${this.currentCategory.h1}` : this.currentCategory.h1,
                            description: seoDescription,
                            inLanguage: 'sk'
                        },
                        {
                            '@type': 'BreadcrumbList',
                            '@id': `${canonicalHref}#breadcrumb`,
                            itemListElement: breadcrumbItems
                        }
                    ]
                });
            }
        }
    };
}