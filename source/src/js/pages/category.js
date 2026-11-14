import { extendShopApp } from '../core/store.js';
import * as productsModule from '../data/products.js';

const RAW_PRODUCTS =
    productsModule.default ||
    productsModule.PRODUCTS ||
    productsModule.products ||
    productsModule.allProducts ||
    Object.values(productsModule).find((v) => Array.isArray(v)) ||
    [];

const CATEGORY_CONFIGS = {
    'warhammer-40k': {
        slug: 'warhammer-40k',
        breadcrumb: 'Warhammer 40,000',
        h1: 'WARHAMMER 40,000',
        description:
            'V temnej budúcnosti ďalekého 41. tisícročia existuje len vojna. Vyberte si svoju frakciu, zostavte armádu a ovládnite galaxiu.',
        bannerImage: 'https://placehold.co/1600x600/070a12/145CFF?text=WARHAMMER+40,000',
        subcategories: [
            { slug: 'all', name: 'Všetky produkty', image: 'https://placehold.co/300x200/0d1117/145CFF?text=40K+ALL' },
            { slug: 'space-marines', name: 'Space Marines', image: 'https://placehold.co/300x200/0d1117/145CFF?text=Space+Marines' },
            { slug: 'astra-militarum', name: 'Astra Militarum', image: 'https://placehold.co/300x200/0d1117/145CFF?text=Astra+Militarum' },
            { slug: 'necrons', name: 'Necrons', image: 'https://placehold.co/300x200/0d1117/52FF00?text=Necrons' },
            { slug: 'chaos', name: 'Chaos', image: 'https://placehold.co/300x200/0d1117/ef4444?text=Chaos' },
            { slug: 'xenos', name: 'Xenos', image: 'https://placehold.co/300x200/0d1117/a855f7?text=Xenos' },
            { slug: 'imperium', name: 'Imperium', image: 'https://placehold.co/300x200/0d1117/eab308?text=Imperium' },
            { slug: 'starter-sets', name: 'Starter Sets', image: 'https://placehold.co/300x200/0d1117/00E5FF?text=Starter+Sets' }
        ]
    },
    'age-of-sigmar': {
        slug: 'age-of-sigmar',
        breadcrumb: 'Age of Sigmar',
        h1: 'WARHAMMER AGE OF SIGMAR',
        description:
            'Epické bitky v Smrteľných ríšach. Velte silám Poriadku, Chaosu, Smrti alebo Skazy v dynamickej fantasy wargame.',
        bannerImage: 'https://placehold.co/1600x600/0b0f17/eab308?text=AGE+OF+SIGMAR',
        subcategories: [
            { slug: 'all', name: 'Všetky produkty', image: 'https://placehold.co/300x200/0d1117/eab308?text=AoS+ALL' },
            { slug: 'stormcast-eternals', name: 'Stormcast Eternals', image: 'https://placehold.co/300x200/0d1117/eab308?text=Stormcast' },
            { slug: 'skaven', name: 'Skaven', image: 'https://placehold.co/300x200/0d1117/52FF00?text=Skaven' },
            { slug: 'chaos', name: 'Slaves to Darkness', image: 'https://placehold.co/300x200/0d1117/ef4444?text=Chaos' },
            { slug: 'death', name: 'Grand Alliance Death', image: 'https://placehold.co/300x200/0d1117/00E5FF?text=Death' },
            { slug: 'destruction', name: 'Destruction', image: 'https://placehold.co/300x200/0d1117/22c55e?text=Destruction' },
            { slug: 'spearhead', name: 'Spearhead', image: 'https://placehold.co/300x200/0d1117/145CFF?text=Spearhead' },
            { slug: 'starter-sets', name: 'Starter Sets', image: 'https://placehold.co/300x200/0d1117/00E5FF?text=Starter+Sets' }
        ]
    },
    'farby-a-nastroje': {
        slug: 'farby-a-nastroje',
        breadcrumb: 'Farby & nástroje',
        h1: 'FARBY & NÁSTROJE CITADEL',
        description:
            'Kompletný sortiment farieb Citadel Colour, štetcov, sprejov a modelárskeho náradia pre dokonalý vzhľad vašich miniatúr.',
        bannerImage: 'https://placehold.co/1600x600/070d12/00E5FF?text=CITADEL+COLOUR',
        subcategories: [
            { slug: 'all', name: 'Všetko príslušenstvo', image: 'https://placehold.co/300x200/0d1117/00E5FF?text=Citadel+ALL' },
            { slug: 'base', name: 'Base farby', image: 'https://placehold.co/300x200/0d1117/145CFF?text=Base' },
            { slug: 'layer', name: 'Layer farby', image: 'https://placehold.co/300x200/0d1117/38bdf8?text=Layer' },
            { slug: 'shade', name: 'Shade & Washes', image: 'https://placehold.co/300x200/0d1117/a855f7?text=Shade' },
            { slug: 'contrast', name: 'Contrast farby', image: 'https://placehold.co/300x200/0d1117/52FF00?text=Contrast' },
            { slug: 'technical', name: 'Technical', image: 'https://placehold.co/300x200/0d1117/eab308?text=Technical' },
            { slug: 'brushes', name: 'Štetce Citadel', image: 'https://placehold.co/300x200/0d1117/f97316?text=Brushes' },
            { slug: 'tools', name: 'Náradie a lepidlá', image: 'https://placehold.co/300x200/0d1117/94a3b8?text=Tools' }
        ]
    },
    'kill-team': {
        slug: 'kill-team',
        breadcrumb: 'Kill Team',
        h1: 'WARHAMMER 40,000: KILL TEAM',
        description:
            'Rýchle taktické prestrelky elitných špeciálnych jednotiek v tesných koridoroch a ruinách 41. tisícročia.',
        bannerImage: 'https://placehold.co/1600x600/090c14/00E5FF?text=KILL+TEAM',
        subcategories: [
            { slug: 'all', name: 'Všetky Kill Teamy', image: 'https://placehold.co/300x200/0d1117/00E5FF?text=Kill+Team' },
            { slug: 'starter-sets', name: 'Starter Sets', image: 'https://placehold.co/300x200/0d1117/145CFF?text=Starter+Sets' },
            { slug: 'imperium', name: 'Imperium Teams', image: 'https://placehold.co/300x200/0d1117/38bdf8?text=Imperium' },
            { slug: 'chaos', name: 'Chaos Teams', image: 'https://placehold.co/300x200/0d1117/ef4444?text=Chaos' },
            { slug: 'xenos', name: 'Xenos Teams', image: 'https://placehold.co/300x200/0d1117/52FF00?text=Xenos' },
            { slug: 'killzones', name: 'Terén a Killzones', image: 'https://placehold.co/300x200/0d1117/eab308?text=Killzones' },
            { slug: 'datacards', name: 'Karty a pravidlá', image: 'https://placehold.co/300x200/0d1117/a855f7?text=Datacards' },
            { slug: 'accessories', name: 'Herné doplnky', image: 'https://placehold.co/300x200/0d1117/94a3b8?text=Doplnky' }
        ]
    },
    'akcie': {
        slug: 'akcie',
        breadcrumb: 'Akcie a zľavy',
        h1: 'AKCIOVÁ PONUKA',
        description:
            'Výhodné balenia, zľavnené štartovacie sady a špeciálne ponuky oficiálnych produktov Games Workshop.',
        bannerImage: 'https://placehold.co/1600x600/061209/52FF00?text=AKCIE+WARHAMMER',
        subcategories: CATEGORY_CONFIGS_BASE_SUBS()
    },
    'prislusenstvo': {
        slug: 'prislusenstvo',
        breadcrumb: 'Príslušenstvo',
        h1: 'HERNÉ PRÍSLUŠENSTVO',
        description:
            'Kocky, metre, herné podložky, prenosné kufre na miniatúry a všetko potrebné pre pohodlné hranie.',
        bannerImage: 'https://placehold.co/1600x600/0a0d14/145CFF?text=PRISLUSENSTVO',
        subcategories: CATEGORY_CONFIGS_BASE_SUBS()
    },
    'merch': {
        slug: 'merch',
        breadcrumb: 'Merch',
        h1: 'OFICIÁLNY WARHAMMER MERCH',
        description:
            'Zberateľské predmety, tričká, hrnčeky, kľúčenky a doplnky pre fanúšikov sveta Warhammer.',
        bannerImage: 'https://placehold.co/1600x600/0b0b12/00E5FF?text=WARHAMMER+MERCH',
        subcategories: CATEGORY_CONFIGS_BASE_SUBS()
    }
};

function CATEGORY_CONFIGS_BASE_SUBS() {
    return [
        { slug: 'all', name: 'Všetky produkty', image: 'https://placehold.co/300x200/0d1117/145CFF?text=40K+ALL' },
        { slug: 'space-marines', name: 'Space Marines', image: 'https://placehold.co/300x200/0d1117/145CFF?text=Space+Marines' },
        { slug: 'astra-militarum', name: 'Astra Militarum', image: 'https://placehold.co/300x200/0d1117/145CFF?text=Astra+Militarum' },
        { slug: 'necrons', name: 'Necrons', image: 'https://placehold.co/300x200/0d1117/52FF00?text=Necrons' },
        { slug: 'chaos', name: 'Chaos', image: 'https://placehold.co/300x200/0d1117/ef4444?text=Chaos' },
        { slug: 'xenos', name: 'Xenos', image: 'https://placehold.co/300x200/0d1117/a855f7?text=Xenos' },
        { slug: 'imperium', name: 'Imperium', image: 'https://placehold.co/300x200/0d1117/eab308?text=Imperium' },
        { slug: 'starter-sets', name: 'Starter Sets', image: 'https://placehold.co/300x200/0d1117/00E5FF?text=Starter+Sets' }
    ];
}

function inferCategorySlug(product) {
    if (product.categorySlug) return product.categorySlug;
    const cat = (product.category || '').toLowerCase();
    if (cat.includes('sigmar')) return 'age-of-sigmar';
    if (cat.includes('farb') || cat.includes('citadel') || cat.includes('nástroj') || cat.includes('paint')) return 'farby-a-nastroje';
    if (cat.includes('kill team')) return 'kill-team';
    if (cat.includes('príslušen') || cat.includes('accessor')) return 'prislusenstvo';
    if (cat.includes('merch')) return 'merch';
    return 'warhammer-40k';
}

function inferFactionSlug(product) {
    if (product.factionSlug) return product.factionSlug;
    const text = `${product.faction || ''} ${product.title || product.name || ''}`.toLowerCase();
    if (text.includes('starter') || text.includes('ultimate') || text.includes('introductory')) return 'starter-sets';
    if (text.includes('astra militarum') || text.includes('cadian') || text.includes('leman russ')) return 'astra-militarum';
    if (text.includes('necron')) return 'necrons';
    if (text.includes('chaos') || text.includes('heretic') || text.includes('khorne') || text.includes('nurgle')) return 'chaos';
    if (text.includes('tyranid') || text.includes('ork') || text.includes('aeldari') || text.includes('tau') || text.includes('xenos')) return 'xenos';
    if (text.includes('imperium') || text.includes('adepta') || text.includes('custodes') || text.includes('mechanicus')) return 'imperium';
    if (text.includes('stormcast')) return 'stormcast-eternals';
    if (text.includes('skaven')) return 'skaven';
    return 'space-marines';
}

function inferProductType(product) {
    if (product.type) return product.type;
    const text = `${product.title || product.name || ''} ${product.category || ''}`.toLowerCase();
    if (text.includes('starter') || text.includes('štartov')) return 'Štartovacie sady';
    if (text.includes('combat patrol')) return 'Combat Patrol';
    if (text.includes('farb') || text.includes('paint') || text.includes('citadel')) return 'Farby a sady';
    if (text.includes('dreadnought') || text.includes('tank') || text.includes('knight')) return 'Vozidlá a monštrá';
    return 'Jednotky a hrdinovia';
}

export function categoryApp() {
    return extendShopApp({
        mobileFiltersOpen: false,
        currentCategorySlug: 'warhammer-40k',

        // Aktívne filtre
        filterFactions: [],
        filterAvailability: [],
        filterTypes: [],
        priceMin: 15,
        priceMax: 250,

        // Triedenie, zobrazenie a stránkovanie
        sortBy: 'popular',
        viewMode: 'grid',
        currentPage: 1,
        itemsPerPage: 12,

        init() {
            const params = new URLSearchParams(window.location.search);
            const cat = params.get('cat');
            const faction = params.get('faction');
            const search = params.get('search');

            if (cat && CATEGORY_CONFIGS[cat]) {
                this.currentCategorySlug = cat;
            }

            if (faction && faction !== 'all') {
                this.filterFactions = [faction];
            }

            if (search) {
                this.searchQuery = search;
            }

            this.updateSeoMeta();
        },

        updateSeoMeta() {
            const cfg = this.currentCategory;
            document.title = `${cfg.breadcrumb} | Miniatúry & Armády | Warhammer E-Shop Slovensko`;
            const canonical = document.getElementById('canonical-url');
            if (canonical) {
                canonical.setAttribute('href', `https://xenova-shop.vercel.app/category.html?cat=${cfg.slug}`);
            }
        },

        get currentCategory() {
            return CATEGORY_CONFIGS[this.currentCategorySlug] || CATEGORY_CONFIGS['warhammer-40k'];
        },

        get normalizedProducts() {
            return RAW_PRODUCTS.map((p, index) => {
                const title = p.title || p.name || 'Warhammer Produkt';
                const image = p.image || p.img || 'https://placehold.co/500x500/121212/145CFF?text=Warhammer';
                return {
                    ...p,
                    id: p.id ?? index + 1,
                    title,
                    name: title,
                    image,
                    img: image,
                    category: p.category || 'Warhammer 40,000',
                    categorySlug: inferCategorySlug(p),
                    factionSlug: inferFactionSlug(p),
                    productType: inferProductType(p),
                    description:
                        p.description ||
                        'Oficiálna plastová stavebnica Games Workshop. Dodáva sa nezložená a nenafarbená.',
                    price: Number(p.price) || 0,
                    oldPrice: p.oldPrice ? Number(p.oldPrice) : null,
                    inStock: p.inStock !== false,
                    popularRank: p.popularRank ?? 100 - index
                };
            });
        },

        get baseCategoryProducts() {
            if (this.currentCategorySlug === 'akcie') {
                const discounted = this.normalizedProducts.filter((p) => p.oldPrice && p.oldPrice > p.price);
                return discounted.length > 0 ? discounted : this.normalizedProducts;
            }

            const matched = this.normalizedProducts.filter(
                (p) => p.categorySlug === this.currentCategorySlug
            );
            return matched.length > 0 ? matched : this.normalizedProducts;
        },

        get availableProductTypes() {
            const counts = {};
            this.baseCategoryProducts.forEach((p) => {
                counts[p.productType] = (counts[p.productType] || 0) + 1;
            });
            return Object.entries(counts).map(([name, count]) => ({ name, count }));
        },

        get activeSectionTitle() {
            if (this.filterFactions.length === 1) {
                const found = this.currentCategory.subcategories.find(
                    (s) => s.slug === this.filterFactions[0]
                );
                if (found) return found.name;
            }
            return this.currentCategory.h1;
        },

        get filteredProducts() {
            const query = (this.searchQuery || '').trim().toLowerCase();

            const list = this.baseCategoryProducts.filter((product) => {
                if (query) {
                    const inTitle = product.title.toLowerCase().includes(query);
                    const inCat = product.category.toLowerCase().includes(query);
                    const inDesc = product.description.toLowerCase().includes(query);
                    if (!inTitle && !inCat && !inDesc) return false;
                }

                if (this.filterFactions.length > 0 && !this.filterFactions.includes(product.factionSlug)) {
                    return false;
                }

                if (this.filterAvailability.length > 0) {
                    const status = product.inStock ? 'in-stock' : 'on-order';
                    if (!this.filterAvailability.includes(status)) return false;
                }

                if (this.filterTypes.length > 0 && !this.filterTypes.includes(product.productType)) {
                    return false;
                }

                const min = Math.max(15, Number(this.priceMin) || 15);
                const max = Math.min(250, Number(this.priceMax) || 250);
                if (product.price < min || product.price > max) {
                    return false;
                }

                return true;
            });

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
                    list.sort((a, b) => b.popularRank - a.popularRank);
                    break;
            }

            return list;
        },

        get totalPages() {
            return Math.max(1, Math.ceil(this.filteredProducts.length / this.itemsPerPage));
        },

        get paginatedProducts() {
            const safePage = Math.min(this.currentPage, this.totalPages);
            const start = (safePage - 1) * this.itemsPerPage;
            return this.filteredProducts.slice(start, start + this.itemsPerPage);
        },

        getSubcategoryCount(slug) {
            if (slug === 'all') return this.baseCategoryProducts.length;
            return this.baseCategoryProducts.filter((p) => p.factionSlug === slug).length;
        },

        selectSubcategory(slug) {
            if (slug === 'all') {
                this.filterFactions = [];
            } else if (this.filterFactions.length === 1 && this.filterFactions[0] === slug) {
                this.filterFactions = [];
            } else {
                this.filterFactions = [slug];
            }
            this.currentPage = 1;
            this.syncUrl();
        },

        resetFilters() {
            this.filterFactions = [];
            this.filterAvailability = [];
            this.filterTypes = [];
            this.priceMin = 15;
            this.priceMax = 250;
            this.searchQuery = '';
            this.currentPage = 1;
            this.syncUrl();
        },

        syncUrl() {
            const url = new URL(window.location.href);
            url.searchParams.set('cat', this.currentCategorySlug);
            if (this.filterFactions.length === 1) {
                url.searchParams.set('faction', this.filterFactions[0]);
            } else {
                url.searchParams.delete('faction');
            }
            window.history.replaceState({}, '', url);
        },

        goToPage(page) {
            if (page < 1 || page > this.totalPages) return;
            this.currentPage = page;
            const topEl = document.getElementById('catalog-products-top');
            if (topEl) {
                topEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }
    });
}

document.addEventListener('alpine:init', () => {
    Alpine.data('categoryApp', categoryApp);
});