import '../scss/main.css';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'notyf/notyf.min.css';

import Alpine from 'alpinejs';
import Swiper from 'swiper';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';

document.addEventListener('alpine:init', () => {
    Alpine.data('homepageApp', () => ({
        cartDrawerOpen: false,
        mobileNavOpen: false,
        megaMenuOpen: false,
        activeCategory: 'wh40k',
        activeFaction: 'space-marines',
        searchQuery: '',

        // Система власних сповіщень
        toastMessage: '',
        toastVisible: false,
        toastTimeout: null,

        showToast(message) {
            this.toastMessage = message;
            this.toastVisible = true;

            if (this.toastTimeout) clearTimeout(this.toastTimeout);

            // Автоматичне зникнення через 3.5 секунди
            this.toastTimeout = setTimeout(() => {
                this.toastVisible = false;
            }, 3500);
        },

        hideToast() {
            this.toastVisible = false;
            if (this.toastTimeout) clearTimeout(this.toastTimeout);
        },

        // Масив популярних товарів
        popularProducts: [
            {
                id: 1,
                badge: 'NOVINKA',
                category: 'SPACE MARINES',
                title: 'Primaris Intercessors',
                price: 45.00,
                oldPrice: null,
                inStock: true,
                image: 'https://placehold.co/300x300/141418/dc2626?text=Intercessors'
            },
            {
                id: 2,
                badge: null,
                category: 'SPACE MARINES',
                title: 'Redemptor Dreadnought',
                price: 85.00,
                oldPrice: null,
                inStock: true,
                image: 'https://placehold.co/300x300/141418/dc2626?text=Dreadnought'
            },
            {
                id: 3,
                badge: '-10%',
                category: 'AGE OF SIGMAR',
                title: 'Slaves to Darkness Warriors',
                price: 40.50,
                oldPrice: 45.00,
                inStock: true,
                image: 'https://placehold.co/300x300/141418/d97706?text=Slaves+to+Darkness'
            },
            {
                id: 4,
                badge: null,
                category: 'FARBY A NÁSTROJE',
                title: 'Citadel Paint Set Essentials',
                price: 35.00,
                oldPrice: null,
                inStock: true,
                image: 'https://placehold.co/300x300/141418/059669?text=Citadel+Paint+Set'
            },
            {
                id: 5,
                badge: null,
                category: 'KILL TEAM',
                title: 'Kill Team: Starter Set',
                price: 95.00,
                oldPrice: null,
                inStock: false,
                image: 'https://placehold.co/300x300/141418/2563eb?text=Kill+Team+Set'
            },
            {
                id: 6,
                badge: null,
                category: 'MERCH',
                title: 'Warhammer Tote Bag',
                price: 18.00,
                oldPrice: null,
                inStock: true,
                image: 'https://placehold.co/300x300/141418/dc2626?text=Tote+Bag'
            },
            {
                id: 7,
                badge: 'NOVINKA',
                category: 'SPACE MARINES',
                title: 'Bladeguard Veterans',
                price: 55.00,
                oldPrice: null,
                inStock: true,
                image: 'https://placehold.co/300x300/141418/dc2626?text=Bladeguard'
            }
        ],

        cart: [
            { id: 1, title: 'Primaris Intercessors', price: 45.00, qty: 1, image: 'https://placehold.co/400x400/121212/dc2626?text=Intercessors' }
        ],

        toggleMegaMenu(category) {
            if (this.megaMenuOpen && this.activeCategory === category) {
                this.megaMenuOpen = false;
            } else {
                this.activeCategory = category;
                this.megaMenuOpen = true;
            }
        },

        addToCart(product) {
            if (!product.inStock) return;
            const existing = this.cart.find(i => i.id === product.id);
            if (existing) {
                existing.qty++;
            } else {
                this.cart.push({ id: product.id, title: product.title, price: product.price, qty: 1, image: product.image });
            }
            this.showToast(`Pridané do košíka: ${product.title}`);
        },

        removeFromCart(id) {
            const item = this.cart.find(i => i.id === id);
            this.cart = this.cart.filter(i => i.id !== id);
            if (item) {
                this.showToast(`Odstrané z košíka: ${item.title}`);
            }
        },

        get cartCount() { return this.cart.reduce((sum, item) => sum + item.qty, 0); },
        get cartTotal() { return this.cart.reduce((sum, item) => sum + (item.price * item.qty), 0); },
        checkout() { alert('Presmerovanie na checkout'); }
    }));
});

window.Alpine = Alpine;
Alpine.start();

document.addEventListener('DOMContentLoaded', () => {
    new Swiper('.hero-swiper', {
        modules: [Navigation, Pagination, Autoplay],
        loop: true,
        autoplay: { delay: 4500, disableOnInteraction: false },
        navigation: { nextEl: '.hero-next', prevEl: '.hero-prev' },
        pagination: { el: '.hero-pagination', clickable: true },
    });

    new Swiper('.products-swiper', {
        modules: [Navigation, Autoplay],
        loop: true,
        slidesPerGroup: 1,
        slidesPerView: 1,
        spaceBetween: 16,
        autoplay: { delay: 4000, disableOnInteraction: false, pauseOnMouseEnter: true },
        navigation: { nextEl: '.products-next', prevEl: '.products-prev' },
        breakpoints: {
            480: { slidesPerView: 2, spaceBetween: 16 },
            768: { slidesPerView: 3, spaceBetween: 18 },
            1024: { slidesPerView: 4, spaceBetween: 20 },
            1280: { slidesPerView: 5, spaceBetween: 20 },
            1536: { slidesPerView: 6, spaceBetween: 20 },
        }
    });
});