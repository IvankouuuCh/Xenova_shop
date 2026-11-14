import { extendShopApp } from '../core/store.js';

export function cartApp() {
    return extendShopApp({
        // Промокод
        promoCode: '',
        appliedPromo: null, // { code: 'XENOVA10', percent: 10, label: '-10%' }
        promoError: '',

        // Спосіб доставки та оплати
        deliveryMethod: 'packeta', // 'packeta' | 'courier' | 'pickup'
        paymentMethod: 'card',     // 'card' | 'apple-google' | 'cod'

        // Дані покупця
        form: {
            firstName: '',
            lastName: '',
            email: '',
            phone: '',
            city: '',
            zip: '',
            warehouse: '',
            address: '',
            comment: '',
            agreeTerms: true
        },
        errors: {},

        // Стан оформлення замовлення
        isSubmitting: false,
        orderSubmitted: false,
        orderNumber: '',
        submittedOrderSummary: null,

        // Позиції кошика зі спільного стану extendShopApp
        get items() {
            return this.cart;
        },

        get totalItemsCount() {
            return this.cartCount;
        },

        get subtotal() {
            return this.cartTotal;
        },

        // Розмір знижки за промокодом
        get discountAmount() {
            if (!this.appliedPromo) return 0;
            return +(this.subtotal * (this.appliedPromo.percent / 100)).toFixed(2);
        },

        // Поріг безкоштовної доставки (€70 — як у верхньому банері сайту)
        get freeShippingThreshold() {
            return 70;
        },

        get amountToFreeShipping() {
            const afterDiscount = Math.max(0, this.subtotal - this.discountAmount);
            return Math.max(0, +(this.freeShippingThreshold - afterDiscount).toFixed(2));
        },

        get freeShippingProgress() {
            const afterDiscount = Math.max(0, this.subtotal - this.discountAmount);
            return Math.min(100, Math.round((afterDiscount / this.freeShippingThreshold) * 100));
        },

        // Вартість доставки
        get shippingCost() {
            if (this.items.length === 0) return 0;
            if (this.deliveryMethod === 'pickup') return 0;
            if (this.amountToFreeShipping === 0) return 0;
            return this.deliveryMethod === 'courier' ? 6.90 : 3.90;
        },

        // Фінальна сума до сплати
        get grandTotal() {
            const total = this.subtotal - this.discountAmount + this.shippingCost;
            return Math.max(0, +total.toFixed(2));
        },

        get deliveryMethodLabel() {
            const map = {
                'packeta': 'Packeta (výdajné miesto / Z-BOX)',
                'courier': 'Kuriér na adresu (GLS / DPD)',
                'pickup': 'Osobný odber (Bratislava)'
            };
            return map[this.deliveryMethod] || this.deliveryMethod;
        },

        get paymentMethodLabel() {
            const map = {
                'card': 'Platobná karta online (Visa / Mastercard)',
                'apple-google': 'Apple Pay / Google Pay',
                'cod': 'Dobierka pri prevzatí'
            };
            return map[this.paymentMethod] || this.paymentMethod;
        },

        increaseQty(id) {
            this.updateQty(id, 1);
        },

        decreaseQty(id) {
            this.updateQty(id, -1);
        },

        removeItem(id) {
            this.removeFromCart(id);
        },

        resetCart() {
            if (this.cart.length === 0) return;
            this.clearCart();
            this.appliedPromo = null;
            this.promoCode = '';
            this.promoError = '';
            this.showToast('Košík bol vyprázdnený');
        },

        applyPromo() {
            this.promoError = '';
            const code = this.promoCode.trim().toUpperCase();

            if (!code) {
                this.promoError = 'Zadajte zľavový kód';
                return;
            }

            const validPromos = {
                'XENOVA10': { percent: 10, label: '-10%' },
                'WARHAMMER15': { percent: 15, label: '-15%' },
                'IMPERIUM20': { percent: 20, label: '-20%' }
            };

            if (validPromos[code]) {
                this.appliedPromo = {
                    code,
                    percent: validPromos[code].percent,
                    label: validPromos[code].label
                };
                this.promoCode = '';
                this.showToast(`Zľavový kód ${code} bol uplatnený (${this.appliedPromo.label})`);
            } else {
                this.promoError = 'Neplatný alebo neaktívny zľavový kód';
            }
        },

        removePromo() {
            this.appliedPromo = null;
            this.promoError = '';
        },

        validateForm() {
            const errs = {};

            if (!this.form.firstName.trim()) {
                errs.firstName = 'Zadajte vaše meno';
            }
            if (!this.form.lastName.trim()) {
                errs.lastName = 'Zadajte vaše priezvisko';
            }
            if (!this.form.email.trim()) {
                errs.email = 'Zadajte e-mailovú adresu';
            } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.form.email.trim())) {
                errs.email = 'Neplatný formát e-mailu';
            }
            if (!this.form.phone.trim()) {
                errs.phone = 'Zadajte telefónne číslo';
            } else if (this.form.phone.replace(/\D/g, '').length < 9) {
                errs.phone = 'Zadajte platné telefónne číslo';
            }

            if (this.deliveryMethod !== 'pickup') {
                if (!this.form.city.trim()) {
                    errs.city = 'Zadajte mesto doručenia';
                }
                if (this.deliveryMethod === 'packeta' && !this.form.warehouse.trim()) {
                    errs.warehouse = 'Vyberte výdajné miesto alebo Z-BOX';
                }
                if (this.deliveryMethod === 'courier' && !this.form.address.trim()) {
                    errs.address = 'Zadajte ulicu a číslo domu';
                }
            }

            if (!this.form.agreeTerms) {
                errs.agreeTerms = 'Je potrebné súhlasiť s obchodnými podmienkami';
            }

            this.errors = errs;
            return Object.keys(errs).length === 0;
        },

        submitOrder() {
            if (this.items.length === 0) return;

            if (!this.validateForm()) {
                this.showToast('Skontrolujte prosím povinné polia vo formulári');
                const firstErrorEl = document.querySelector('[data-field-error="true"]');
                if (firstErrorEl) {
                    firstErrorEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
                return;
            }

            this.isSubmitting = true;

            setTimeout(() => {
                const randomNum = Math.floor(100000 + Math.random() * 900000);
                this.orderNumber = `WH-${randomNum}`;

                this.submittedOrderSummary = {
                    orderNumber: this.orderNumber,
                    customerName: `${this.form.firstName.trim()} ${this.form.lastName.trim()}`,
                    email: this.form.email.trim(),
                    phone: this.form.phone.trim(),
                    delivery: this.deliveryMethodLabel,
                    deliveryDetails:
                        this.deliveryMethod === 'pickup'
                            ? 'Showroom Warhammer E-Shop, Bratislava'
                            : `${this.form.city.trim()}, ${this.deliveryMethod === 'packeta'
                                ? this.form.warehouse.trim()
                                : this.form.address.trim()
                            }`,
                    payment: this.paymentMethodLabel,
                    itemsCount: this.totalItemsCount,
                    total: this.grandTotal
                };

                this.clearCart();
                this.appliedPromo = null;
                this.isSubmitting = false;
                this.orderSubmitted = true;

                window.scrollTo({ top: 0, behavior: 'smooth' });
            }, 450);
        },

        placeOrder() {
            this.submitOrder();
        }
    });
}