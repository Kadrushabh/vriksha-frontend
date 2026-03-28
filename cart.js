// ========================================
// VRIKSHA - Shopping Cart System
// ========================================

class ShoppingCart {
    constructor() {
        this.items = [];
        this.loadFromStorage();
        this.bindEvents();
        this.updateUI();
    }

    loadFromStorage() {
        const saved = localStorage.getItem('vriksha_cart');
        if (saved) {
            try {
                this.items = JSON.parse(saved);
            } catch (e) {
                this.items = [];
            }
        }
    }

    saveToStorage() {
        localStorage.setItem('vriksha_cart', JSON.stringify(this.items));
    }

    addItem(product, quantity = 1) {
        const existingIndex = this.items.findIndex(item => item.id === product.id);
        
        if (existingIndex > -1) {
            this.items[existingIndex].quantity += quantity;
        } else {
            this.items.push({
                id: product.id,
                name: product.name,
                price: product.price,
                weight: product.weight,
                image: product.image,
                gradient: product.gradient,
                quantity: quantity
            });
        }
        
        this.saveToStorage();
        this.updateUI();
        // ✅ FIX: Show toast only — do NOT open cart sidebar
        // Opening the sidebar covered the toast making it look stationary
        this.showToast(`${product.name} added to cart!`);
    }

    removeItem(productId) {
        this.items = this.items.filter(item => item.id !== productId);
        this.saveToStorage();
        this.updateUI();
    }

    updateQuantity(productId, quantity) {
        const item = this.items.find(item => item.id === productId);
        if (item) {
            if (quantity <= 0) {
                this.removeItem(productId);
            } else {
                item.quantity = quantity;
                this.saveToStorage();
                this.updateUI();
            }
        }
    }

    getTotalItems() {
        return this.items.reduce((sum, item) => sum + item.quantity, 0);
    }

    getSubtotal() {
        return this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    }

    clearCart() {
        this.items = [];
        this.saveToStorage();
        this.updateUI();
    }

    updateUI() {
        this.updateCartCount();
        this.updateCartSidebar();
    }

    updateCartCount() {
        const countElements = document.querySelectorAll('#cartCount, .cart-count');
        const count = this.getTotalItems();
        countElements.forEach(el => {
            el.textContent = count;
            el.style.display = count > 0 ? 'flex' : 'none';
        });
    }

    renderCartImage(item) {
        if (item.image) {
            return `<img src="${item.image}" alt="${item.name}" class="cart-item-img">`;
        } else {
            return `
                <div class="cart-item-placeholder" style="background: ${item.gradient};">
                    <span>${item.name.split(' ')[0]}</span>
                </div>
            `;
        }
    }

    updateCartSidebar() {
        const cartItems = document.getElementById('cartItems');
        const cartEmpty = document.getElementById('cartEmpty');
        const cartFooter = document.getElementById('cartFooter');
        const cartSubtotal = document.getElementById('cartSubtotal');

        if (!cartItems) return;

        if (this.items.length === 0) {
            cartItems.innerHTML = '';
            if (cartEmpty) cartEmpty.style.display = 'flex';
            if (cartFooter) cartFooter.style.display = 'none';
        } else {
            if (cartEmpty) cartEmpty.style.display = 'none';
            if (cartFooter) cartFooter.style.display = 'block';

            cartItems.innerHTML = this.items.map(item => `
                <div class="cart-item" data-id="${item.id}">
                    <div class="cart-item-image">
                        ${this.renderCartImage(item)}
                    </div>
                    <div class="cart-item-details">
                        <h4 class="cart-item-name">${item.name}</h4>
                        <p class="cart-item-weight">${item.weight}</p>
                        <p class="cart-item-price">₹${item.price}</p>
                    </div>
                    <div class="cart-item-actions">
                        <div class="quantity-control">
                            <button class="qty-btn qty-minus" data-id="${item.id}">−</button>
                            <span class="qty-value">${item.quantity}</span>
                            <button class="qty-btn qty-plus" data-id="${item.id}">+</button>
                        </div>
                        <button class="cart-item-remove" data-id="${item.id}">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
                            </svg>
                        </button>
                    </div>
                </div>
            `).join('');

            // Bind quantity buttons
            cartItems.querySelectorAll('.qty-minus').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const id = e.currentTarget.dataset.id;
                    const item = this.items.find(i => i.id === id);
                    if (item) this.updateQuantity(id, item.quantity - 1);
                });
            });

            cartItems.querySelectorAll('.qty-plus').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const id = e.currentTarget.dataset.id;
                    const item = this.items.find(i => i.id === id);
                    if (item) this.updateQuantity(id, item.quantity + 1);
                });
            });

            cartItems.querySelectorAll('.cart-item-remove').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const id = e.currentTarget.dataset.id;
                    this.removeItem(id);
                });
            });
        }

        if (cartSubtotal) {
            cartSubtotal.textContent = '₹' + this.getSubtotal().toLocaleString('en-IN');
        }
    }

    openCart() {
        const sidebar = document.getElementById('cartSidebar');
        const overlay = document.getElementById('cartOverlay');
        if (sidebar) sidebar.classList.add('active');
        if (overlay) overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    closeCart() {
        const sidebar = document.getElementById('cartSidebar');
        const overlay = document.getElementById('cartOverlay');
        if (sidebar) sidebar.classList.remove('active');
        if (overlay) overlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    showToast(message) {
        // Support both id="toastMessage" and id="toastMsg" across pages
        const toast = document.getElementById("toast");
        const toastMessage = document.getElementById("toastMessage") || document.getElementById("toastMsg");

        if (!toast) {
            // No toast element on page — create a temporary one
            const t = document.createElement("div");
            t.style.cssText = "position:fixed;bottom:5rem;left:50%;transform:translateX(-50%);z-index:99999;background:#1C2B1C;color:#fff;padding:.75rem 1.25rem;border-radius:8px;font-size:.8125rem;font-family:inherit;display:flex;align-items:center;gap:.5rem;box-shadow:0 4px 16px rgba(0,0,0,.2);white-space:nowrap;max-width:90vw;";
            t.innerHTML = "<span style=\"color:#4caf50;font-weight:700;\">✓</span><span>" + message + "</span>";
            document.body.appendChild(t);
            setTimeout(() => t.remove(), 3000);
            return;
        }

        if (toastMessage) toastMessage.textContent = message;

        // Clear any existing timer — prevents stuck toast on rapid adds
        if (this._toastTimer) clearTimeout(this._toastTimer);

        toast.classList.add("show");
        this._toastTimer = setTimeout(() => {
            toast.classList.remove("show");
            this._toastTimer = null;
        }, 3000);
    }

    bindEvents() {
        // Cart button
        document.addEventListener('click', (e) => {
            if (e.target.closest('#cartBtn')) {
                this.openCart();
            }
        });

        // Close cart
        document.addEventListener('click', (e) => {
            if (e.target.closest('#cartClose') || e.target.closest('#cartOverlay')) {
                this.closeCart();
            }
        });

        // Add to cart buttons
        document.addEventListener('click', (e) => {
            const addBtn = e.target.closest('.add-to-cart');
            if (addBtn) {
                e.preventDefault();
                const productId = addBtn.dataset.id;
                const product = window.getProductById ? window.getProductById(productId) : null;
                
                if (product) {
                    this.addItem(product);
                    
                    // Button animation
                    const originalHTML = addBtn.innerHTML;
                    addBtn.innerHTML = '<span>Added! ✓</span>';
                    addBtn.classList.add('added');
                    setTimeout(() => {
                        addBtn.innerHTML = originalHTML;
                        addBtn.classList.remove('added');
                    }, 1500);
                }
            }
        });

        // Checkout button
        document.addEventListener('click', (e) => {
            if (e.target.closest('#checkoutBtn')) {
                if (this.items.length > 0) {
                    window.location.href = 'checkout.html';
                } else {
                    this.showToast('Your cart is empty');
                }
            }
        });

        // Escape key to close cart
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeCart();
            }
        });
    }
}

// Initialize cart when DOM is ready
let cart;
document.addEventListener('DOMContentLoaded', () => {
    cart = new ShoppingCart();
    window.cart = cart;
});