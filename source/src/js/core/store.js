const CART_KEY = 'wh_cart';
const WISHLIST_KEY = 'wh_wishlist';

function normalizeCartItem(product, qty = 1) {
    const title = product.title || product.name || 'Produkt';
    const image = product.image || product.img || '';
    return {
        id: product.id,
        title,
        name: title,
        price: Number(product.price) || 0,
        oldPrice: product.oldPrice ? Number(product.oldPrice) : null,
        image,
        img: image,
        category: product.category || 'Warhammer',
        qty: Math.max(1, Number(qty) || 1)
    };
}

function readCartFromStorage() {
    try {
        const raw = localStorage.getItem(CART_KEY) || localStorage.getItem('xenova_cart');
        const parsed = raw ? JSON.parse(raw) : [];
        if (!Array.isArray(parsed)) return [];
        const normalized = parsed.map((item) => normalizeCartItem(item, item.qty || 1));
        if (!localStorage.getItem(CART_KEY) && normalized.length > 0) {
            localStorage.setItem(CART_KEY, JSON.stringify(normalized));
            localStorage.removeItem('xenova_cart');
        }
        return normalized;
    } catch {
        return [];
    }
}

function readWishlistFromStorage() {
    try {
        const raw = localStorage.getItem(WISHLIST_KEY);
        const parsed = raw ? JSON.parse(raw) : [];
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

export function extendShopApp(pageData = {}) {
    const base = {
        // Спільний стан UI
        mobileNavOpen: false,
        cartDrawerOpen: false,
        megaMenuOpen: false,
        activeCategory: 'wh40k',
        activeFaction: 'space-marines',
        searchQuery: '',

        // Сповіщення (Toast)
        toastVisible: false,
        toastMessage: '',
        _toastTimer: null,

        // Кошик та обране
        cart: [],
        wishlist: [],

        init() {
            this.cart = readCartFromStorage();
            this.wishlist = readWishlistFromStorage();

            window.addEventListener('storage', (e) => {
                if (e.key === CART_KEY) {
                    this.cart = readCartFromStorage();
                } else if (e.key === WISHLIST_KEY) {
                    this.wishlist = readWishlistFromStorage();
                }
            });
        },

        saveCart() {
            localStorage.setItem(CART_KEY, JSON.stringify(this.cart));
            if (window.Alpine && Alpine.store('shop')) {
                Alpine.store('shop').cart = [...this.cart];
            }
        },

        saveWishlist() {
            localStorage.setItem(WISHLIST_KEY, JSON.stringify(this.wishlist));
            if (window.Alpine && Alpine.store('shop')) {
                Alpine.store('shop').wishlist = [...this.wishlist];
            }
        },

        get cartCount() {
            return this.cart.reduce((sum, item) => sum + (Number(item.qty) || 1), 0);
        },

        get cartTotal() {
            return this.cart.reduce((sum, item) => sum + Number(item.price || 0) * (Number(item.qty) || 1), 0);
        },

        get wishlistCount() {
            return this.wishlist.length;
        },

        toggleMegaMenu(category) {
            if (this.megaMenuOpen && this.activeCategory === category) {
                this.megaMenuOpen = false;
            } else {
                this.activeCategory = category;
                this.megaMenuOpen = true;
            }
        },

        addToCart(product, qty = 1) {
            if (!product || product.inStock === false) return;

            const addQty = Math.max(1, Number(qty) || 1);
            const existing = this.cart.find((item) => item.id === product.id);
            const title = product.title || product.name || 'Produkt';

            if (existing) {
                existing.qty = (Number(existing.qty) || 1) + addQty;
            } else {
                this.cart.push(normalizeCartItem(product, addQty));
            }

            this.saveCart();
            this.showToast(`«${title}» pridané do košíka`);
        },

        updateQty(id, delta) {
            const index = this.cart.findIndex((item) => item.id === id);
            if (index === -1) return;

            const newQty = (Number(this.cart[index].qty) || 1) + Number(delta);
            if (newQty <= 0) {
                const removedTitle = this.cart[index].title || this.cart[index].name;
                this.cart.splice(index, 1);
                this.showToast(`«${removedTitle}» odstránené z košíka`);
            } else {
                this.cart[index].qty = newQty;
            }

            this.saveCart();
        },

        removeFromCart(id) {
            const index = this.cart.findIndex((item) => item.id === id);
            if (index === -1) return;

            const removedTitle = this.cart[index].title || this.cart[index].name;
            this.cart.splice(index, 1);
            this.saveCart();
            this.showToast(`«${removedTitle}» odstránené z košíka`);
        },

        clearCart() {
            this.cart = [];
            this.saveCart();
        },

        checkout() {
            if (this.cart.length === 0) {
                this.showToast('Váš košík je prázdny');
                return;
            }
            window.location.href = 'cart.html';
        },

        toggleWishlist(productOrId) {
            const id = typeof productOrId === 'object' && productOrId !== null ? productOrId.id : productOrId;
            if (id === undefined || id === null) return;

            const index = this.wishlist.indexOf(id);
            if (index === -1) {
                this.wishlist.push(id);
                this.showToast('Pridané do obľúbených');
            } else {
                this.wishlist.splice(index, 1);
                this.showToast('Odstránené z obľúbených');
            }
            this.saveWishlist();
        },

        isInWishlist(id) {
            return this.wishlist.includes(id);
        },

        formatPrice(price) {
            const num = Number(price);
            if (isNaN(num)) return '€0.00';
            return '€' + num.toFixed(2);
        },

        showToast(message) {
            this.toastMessage = message;
            this.toastVisible = true;

            if (this._toastTimer) {
                clearTimeout(this._toastTimer);
            }

            this._toastTimer = setTimeout(() => {
                this.toastVisible = false;
            }, 3000);
        },

        hideToast() {
            this.toastVisible = false;
            if (this._toastTimer) {
                clearTimeout(this._toastTimer);
            }
        }
    };

    const merged = {};
    Object.defineProperties(merged, Object.getOwnPropertyDescriptors(base));
    Object.defineProperties(merged, Object.getOwnPropertyDescriptors(pageData));

    const baseInit = base.init;
    const pageInit = pageData.init;
    merged.init = function () {
        if (typeof baseInit === 'function') baseInit.call(this);
        if (typeof pageInit === 'function') pageInit.call(this);
    };

    return merged;
}

// Спільний Alpine.store('shop') для сторінки кошика (cart.js)
document.addEventListener('alpine:init', () => {
    Alpine.store('shop', {
        cart: readCartFromStorage(),
        wishlist: readWishlistFromStorage(),
        searchQuery: '',
        toast: {
            show: false,
            message: ''
        },
        _toastTimer: null,

        init() {
            this.loadFromStorage();
            window.addEventListener('storage', (e) => {
                if (e.key === CART_KEY || e.key === WISHLIST_KEY) {
                    this.loadFromStorage();
                }
            });
        },

        loadFromStorage() {
            this.cart = readCartFromStorage();
            this.wishlist = readWishlistFromStorage();
        },

        saveCart() {
            localStorage.setItem(CART_KEY, JSON.stringify(this.cart));
        },

        saveWishlist() {
            localStorage.setItem(WISHLIST_KEY, JSON.stringify(this.wishlist));
        },

        get cartCount() {
            return this.cart.reduce((total, item) => total + (Number(item.qty) || 1), 0);
        },

        get cartTotal() {
            return this.cart.reduce((total, item) => total + Number(item.price || 0) * (Number(item.qty) || 1), 0);
        },

        get wishlistCount() {
            return this.wishlist.length;
        },

        addToCart(product, qty = 1) {
            if (!product || product.inStock === false) return;
            const addQty = Math.max(1, Number(qty) || 1);
            const existing = this.cart.find((item) => item.id === product.id);
            const title = product.title || product.name || 'Produkt';

            if (existing) {
                existing.qty = (Number(existing.qty) || 1) + addQty;
            } else {
                this.cart.push(normalizeCartItem(product, addQty));
            }

            this.saveCart();
            this.showToast(`«${title}» pridané do košíka`);
        },

        updateQty(id, delta) {
            const index = this.cart.findIndex((item) => item.id === id);
            if (index === -1) return;

            const newQty = (Number(this.cart[index].qty) || 1) + Number(delta);
            if (newQty <= 0) {
                const removedName = this.cart[index].title || this.cart[index].name;
                this.cart.splice(index, 1);
                this.showToast(`«${removedName}» odstránené z košíka`);
            } else {
                this.cart[index].qty = newQty;
            }

            this.saveCart();
        },

        removeFromCart(id) {
            const index = this.cart.findIndex((item) => item.id === id);
            if (index === -1) return;

            const removedName = this.cart[index].title || this.cart[index].name;
            this.cart.splice(index, 1);
            this.saveCart();
            this.showToast(`«${removedName}» odstránené z košíka`);
        },

        clearCart() {
            this.cart = [];
            this.saveCart();
        },

        toggleWishlist(id) {
            const index = this.wishlist.indexOf(id);
            if (index === -1) {
                this.wishlist.push(id);
                this.showToast('Pridané do obľúbených');
            } else {
                this.wishlist.splice(index, 1);
                this.showToast('Odstránené z obľúbených');
            }
            this.saveWishlist();
        },

        isInWishlist(id) {
            return this.wishlist.includes(id);
        },

        formatPrice(price) {
            const num = Number(price);
            if (isNaN(num)) return '€0.00';
            return '€' + num.toFixed(2);
        },

        showToast(message) {
            this.toast.message = message;
            this.toast.show = true;

            if (this._toastTimer) {
                clearTimeout(this._toastTimer);
            }

            this._toastTimer = setTimeout(() => {
                this.toast.show = false;
            }, 3000);
        }
    });
});