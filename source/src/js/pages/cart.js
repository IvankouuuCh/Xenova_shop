import { extendShopApp } from '../core/store.js';

export function cartApp() {
    return extendShopApp({
        shippingMethod: 'packeta', // 'packeta' | 'courier' | 'pickup'
        paymentMethod: 'card',     // 'card' | 'cod' | 'bank'
        freeShippingThreshold: 70,

        form: {
            fullName: '',
            email: '',
            phone: '',
            street: '',
            city: '',
            zip: '',
            agreeTerms: false
        },
        formError: '',
        orderSubmitted: false,
        lastOrderNumber: '',
        lastOrderTotal: 0,

        get amountToFreeShipping() {
            const diff = this.freeShippingThreshold - this.cartTotal;
            return diff > 0 ? diff : 0;
        },

        get freeShippingPercent() {
            if (this.cartTotal <= 0) return 0;
            const pct = Math.round((this.cartTotal / this.freeShippingThreshold) * 100);
            return Math.min(100, pct);
        },

        get shippingCost() {
            if (this.shippingMethod === 'pickup') return 0;
            if (this.cartTotal >= this.freeShippingThreshold) return 0;
            return this.shippingMethod === 'courier' ? 4.5 : 3.2;
        },

        get paymentCost() {
            return this.paymentMethod === 'cod' ? 1.5 : 0;
        },

        get grandTotal() {
            return this.cartTotal + this.shippingCost + this.paymentCost;
        },

        get selectedShippingLabel() {
            const labels = {
                packeta: 'Packeta',
                courier: 'Kuriér GLS / DPD',
                pickup: 'Osobný odber'
            };
            return labels[this.shippingMethod] || 'Packeta';
        },

        get selectedPaymentLabel() {
            const labels = {
                card: 'Karta online',
                cod: 'Dobierka',
                bank: 'Bankový prevod'
            };
            return labels[this.paymentMethod] || 'Karta online';
        },

        formatPrice(value) {
            return '€' + Number(value || 0).toFixed(2).replace('.', ',');
        },

        persistCart() {
            try {
                // Синхронізуємо з localStorage (підтримуємо стандартні ключі сховища)
                localStorage.setItem('xenova_cart', JSON.stringify(this.cart));
                localStorage.setItem('cart', JSON.stringify(this.cart));
            } catch (e) {
                // Ігноруємо помилки доступу до сховища
            }
        },

        increaseItemQty(id) {
            const item = this.cart.find(i => i.id === id);
            if (item && item.qty < 20) {
                item.qty += 1;
                this.persistCart();
            }
        },

        decreaseItemQty(id) {
            const item = this.cart.find(i => i.id === id);
            if (!item) return;
            if (item.qty > 1) {
                item.qty -= 1;
                this.persistCart();
            } else {
                this.removeFromCart(id);
            }
        },

        clearAllCart() {
            this.cart.splice(0, this.cart.length);
            this.persistCart();
            this.showToast('Nákupný košík bol vyprázdnený.');
        },

        submitOrder() {
            this.formError = '';

            if (!this.form.fullName.trim() || this.form.fullName.trim().length < 3) {
                this.formError = 'Zadajte prosím vaše meno a priezvisko.';
                return;
            }
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(this.form.email.trim())) {
                this.formError = 'Zadajte prosím platnú e-mailovú adresu.';
                return;
            }
            if (!this.form.phone.trim() || this.form.phone.trim().length < 6) {
                this.formError = 'Zadajte prosím kontaktné telefónne číslo.';
                return;
            }
            if (this.shippingMethod !== 'pickup') {
                if (!this.form.street.trim() || !this.form.city.trim() || !this.form.zip.trim()) {
                    this.formError = 'Vyplňte prosím kompletnú dodaciu adresu (ulica, mesto, PSČ).';
                    return;
                }
            }
            if (!this.form.agreeTerms) {
                this.formError = 'Pre dokončenie objednávky je potrebný súhlas s obchodnými podmienkami.';
                return;
            }

            const randomDigits = Math.floor(100000 + Math.random() * 900000);
            this.lastOrderNumber = `WH-2026-${randomDigits}`;
            this.lastOrderTotal = this.grandTotal;
            this.orderSubmitted = true;

            this.cart.splice(0, this.cart.length);
            this.persistCart();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    });
}