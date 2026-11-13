import Swiper from 'swiper';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import { ALL_PRODUCTS } from '../data/products.js';
import { extendShopApp } from '../core/store.js';

export function homepageApp() {
    return extendShopApp({
        popularProducts: ALL_PRODUCTS.filter(product => product.isPopular)
    });
}

export function initHomeSliders() {
    if (document.querySelector('.hero-swiper')) {
        new Swiper('.hero-swiper', {
            modules: [Navigation, Pagination, Autoplay],
            loop: true,
            autoplay: { delay: 4500, disableOnInteraction: false },
            navigation: { nextEl: '.hero-next', prevEl: '.hero-prev' },
            pagination: { el: '.hero-pagination', clickable: true },
        });
    }

    if (document.querySelector('.products-swiper')) {
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
    }
}