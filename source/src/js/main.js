import '../scss/main.css';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

import Alpine from 'alpinejs';
import { homepageApp, initHomeSliders } from './pages/home.js';
import { categoryApp } from './pages/category.js';
import { productApp, initProductSliders } from './pages/product.js';
import { cartApp } from './pages/cart.js';

window.homepageApp = homepageApp;
window.categoryApp = categoryApp;
window.productApp = productApp;
window.cartApp = cartApp;

document.addEventListener('alpine:init', () => {
    Alpine.data('homepageApp', homepageApp);
    Alpine.data('categoryApp', categoryApp);
    Alpine.data('productApp', productApp);
    Alpine.data('cartApp', cartApp);
});

window.Alpine = Alpine;
Alpine.start();

document.addEventListener('DOMContentLoaded', () => {
    initHomeSliders();
    initProductSliders();
});