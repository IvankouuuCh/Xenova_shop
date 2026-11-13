function loadFromStorage(key, fallback) {
    try {
        const raw = localStorage.getItem(key);
        return raw !== null ? JSON.parse(raw) : fallback;
    } catch {
        return fallback;
    }
}

function saveToStorage(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch {
        // Ігноруємо помилки в режимі обмеженого сховища
    }
}

export function createShopBase() {
    const defaultCart = [
        {
            id: 1,
            title: 'Primaris Intercessors',
            price: 45.00,
            qty: 1,
            image: 'https://placehold.co/400x400/121212/dc2626?text=Intercessors'
        }
    ];

    return {
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

        // Кошик та обране (зберігаються між сторінками)
        cart: loadFromStorage('wh_cart', defaultCart),
        wishlist: loadFromStorage('wh_wishlist', []),

        showToast(message) {
            this.toastMessage = message;
            this.toastVisible = true;

            if (this.toastTimeout) clearTimeout(this.toastTimeout);
            this.toastTimeout = setTimeout(() => {
                this.toastVisible = false;
            }, 3500);
        },

        hideToast() {
            this.toastVisible = false;
            if (this.toastTimeout) clearTimeout(this.toastTimeout);
        },

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
                this.cart.push({
                    id: product.id,
                    title: product.title,
                    price: product.price,
                    qty: 1,
                    image: product.image
                });
            }
            saveToStorage('wh_cart', this.cart);
            this.showToast(`Pridané do košíka: ${product.title}`);
        },

        removeFromCart(id) {
            const item = this.cart.find(i => i.id === id);
            this.cart = this.cart.filter(i => i.id !== id);
            saveToStorage('wh_cart', this.cart);
            if (item) {
                this.showToast(`Odstránené z košíka: ${item.title}`);
            }
        },

        toggleWishlist(product) {
            const exists = this.wishlist.includes(product.id);
            if (exists) {
                this.wishlist = this.wishlist.filter(id => id !== product.id);
                this.showToast(`Odstránené z obľúbených: ${product.title}`);
            } else {
                this.wishlist.push(product.id);
                this.showToast(`Pridané do obľúbených: ${product.title}`);
            }
            saveToStorage('wh_wishlist', this.wishlist);
        },

        isInWishlist(id) {
            return this.wishlist.includes(id);
        },

        get cartCount() {
            return this.cart.reduce((sum, item) => sum + item.qty, 0);
        },

        get cartTotal() {
            return this.cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
        },

        checkout() {
            window.location.href = 'cart.html';
        }
    };
}

// Допоміжна функція для об'єднання спільного стану та стану конкретної сторінки зі збереженням реактивних getter-ів
export function extendShopApp(pageState) {
    const app = {};
    Object.defineProperties(app, Object.getOwnPropertyDescriptors(createShopBase()));
    Object.defineProperties(app, Object.getOwnPropertyDescriptors(pageState));
    return app;
}