import { CATEGORIES_DATA } from '../data/navigation.js';
import { ALL_PRODUCTS } from '../data/products.js';
import { extendShopApp } from '../core/store.js';

export function categoryApp() {
    const params = new URLSearchParams(window.location.search);
    const initialCat = params.get('cat') || 'all';
    const initialSub = params.get('faction') || '';
    const initialQuery = params.get('q') || '';

    // Перевіряємо чи валідна категорія, інакше падаємо на 'all' або 'warhammer-40k'
    const validCat = (initialCat === 'all' || CATEGORIES_DATA[initialCat]) ? initialCat : 'all';

    return extendShopApp({
        currentCategorySlug: validCat,
        filterFactions: initialSub ? [initialSub] : [],
        searchQuery: initialQuery,
        mobileFiltersOpen: false,

        // Стан фільтрів
        onlyInStock: false,
        minPrice: '',
        maxPrice: '',
        filterTypes: [],

        // Сортування
        sortBy: 'featured', // featured | price-asc | price-desc | name-asc

        init() {
            this.updateDocumentMeta();
        },

        get currentCategory() {
            return CATEGORIES_DATA[this.currentCategorySlug] || {
                name: 'Všetky produkty',
                seoTitle: 'Katalóg produktov Warhammer | Warhammer E-Shop Slovensko',
                description: 'Kompletný katalóg originálnych produktov Games Workshop na Slovensku.'
            };
        },

        get activeCategoryMeta() {
            if (window.XENOVA_CATEGORY_SEO && window.XENOVA_CATEGORY_SEO.categories[this.currentCategorySlug]) {
                return window.XENOVA_CATEGORY_SEO.categories[this.currentCategorySlug];
            }
            return window.XENOVA_CATEGORY_SEO?.categories['all'] || {
                name: 'Všetky produkty',
                subtitle: 'Kompletná ponuka miniatúr a potrieb Games Workshop.',
                seoHeading: 'Kompletný sortiment Warhammer',
                seoText1: 'V našom katalógu nájdete oficiálne wargamingové hry.',
                seoText2: 'Všetky skladové položky odosielame do 24 hodín.'
            };
        },

        get activeFactionName() {
            if (this.filterFactions.length === 1 && window.XENOVA_CATEGORY_SEO) {
                return window.XENOVA_CATEGORY_SEO.factions[this.filterFactions[0]] || '';
            }
            return '';
        },

        get pageHeading() {
            if (this.searchQuery.trim() !== '') {
                return `Výsledky vyhľadávania: „${this.searchQuery}“`;
            }
            if (this.activeFactionName) {
                return `${this.activeFactionName} – ${this.activeCategoryMeta.name}`;
            }
            return this.activeCategoryMeta.name;
        },

        get baseCategoryProducts() {
            if (this.currentCategorySlug === 'all') {
                return ALL_PRODUCTS;
            }
            if (this.currentCategorySlug === 'akcie') {
                return ALL_PRODUCTS.filter(p => p.oldPrice !== null && p.oldPrice !== undefined);
            }
            // Фільтрація за категорією або суміжними тегами
            return ALL_PRODUCTS.filter(p => {
                if (p.categorySlug === this.currentCategorySlug) return true;
                if (this.currentCategorySlug === 'warhammer-40k' && p.category && p.category.includes('40,000')) return true;
                if (this.currentCategorySlug === 'age-of-sigmar' && p.category && p.category.includes('Sigmar')) return true;
                if (this.currentCategorySlug === 'farby-a-nastroje' && p.category && (p.category.includes('Farby') || p.category.includes('Nástroje'))) return true;
                if (this.currentCategorySlug === 'kill-team' && p.category && p.category.includes('Kill Team')) return true;
                if (this.currentCategorySlug === 'prislusenstvo' && p.category && p.category.includes('Príslušenstvo')) return true;
                if (this.currentCategorySlug === 'merch' && p.category && p.category.includes('Merch')) return true;
                return false;
            });
        },

        get filteredProducts() {
            let list = [...this.baseCategoryProducts];

            // Пошук з хедера чи інпуту
            if (this.searchQuery.trim() !== '') {
                const q = this.searchQuery.toLowerCase().trim();
                list = list.filter(p =>
                    p.title.toLowerCase().includes(q) ||
                    (p.category && p.category.toLowerCase().includes(q)) ||
                    (p.faction && p.faction.toLowerCase().includes(q))
                );
            }

            // Фільтр за фракцією
            if (this.filterFactions.length > 0) {
                list = list.filter(p => this.filterFactions.includes(p.faction));
            }

            // Фільтр за наявністю (тільки склад)
            if (this.onlyInStock) {
                list = list.filter(p => p.inStock);
            }

            // Фільтр за ціною
            if (this.minPrice !== '' && !isNaN(this.minPrice)) {
                const min = Number(this.minPrice);
                list = list.filter(p => p.price >= min);
            }
            if (this.maxPrice !== '' && !isNaN(this.maxPrice)) {
                const max = Number(this.maxPrice);
                list = list.filter(p => p.price <= max);
            }

            // Сортування
            switch (this.sortBy) {
                case 'price-asc':
                    list.sort((a, b) => a.price - b.price);
                    break;
                case 'price-desc':
                    list.sort((a, b) => b.price - a.price);
                    break;
                case 'name-asc':
                    list.sort((a, b) => a.title.localeCompare(b.title));
                    break;
                default:
                    // 'featured'
                    list.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
            }

            // Автоматично оновлюємо мікророзмітку ItemList для SEO
            if (window.XENOVA_CATEGORY_SEO && typeof window.XENOVA_CATEGORY_SEO.updateSchema === 'function') {
                window.XENOVA_CATEGORY_SEO.updateSchema(list);
            }

            return list;
        },

        selectCategory(slug) {
            this.currentCategorySlug = slug;
            this.filterFactions = [];
            this.currentPage = 1;
            this.syncUrl();
            this.updateDocumentMeta();
        },

        selectFaction(factionSlug) {
            if (this.filterFactions.includes(factionSlug)) {
                this.filterFactions = this.filterFactions.filter(f => f !== factionSlug);
            } else {
                this.filterFactions = [factionSlug];
            }
            this.syncUrl();
        },

        resetFilters() {
            this.onlyInStock = false;
            this.minPrice = '';
            this.maxPrice = '';
            this.filterFactions = [];
            this.searchQuery = '';
            this.syncUrl();
        },

        syncUrl() {
            const url = new URL(window.location);
            if (this.currentCategorySlug && this.currentCategorySlug !== 'all') {
                url.searchParams.set('cat', this.currentCategorySlug);
            } else {
                url.searchParams.delete('cat');
            }

            if (this.filterFactions.length === 1) {
                url.searchParams.set('faction', this.filterFactions[0]);
            } else {
                url.searchParams.delete('faction');
            }

            if (this.searchQuery.trim() !== '') {
                url.searchParams.set('q', this.searchQuery.trim());
            } else {
                url.searchParams.delete('q');
            }

            window.history.replaceState({}, '', url);
            this.updateDocumentMeta();
        },

        updateDocumentMeta() {
            if (window.XENOVA_CATEGORY_SEO && typeof window.XENOVA_CATEGORY_SEO.applyHeadMeta === 'function') {
                window.XENOVA_CATEGORY_SEO.applyHeadMeta();
            } else {
                document.title = this.currentCategory.seoTitle || 'Warhammer E-Shop Slovensko';
                const metaDesc = document.querySelector('meta[name="description"]');
                if (metaDesc) metaDesc.setAttribute('content', this.currentCategory.description || '');
            }
        }
    });
}