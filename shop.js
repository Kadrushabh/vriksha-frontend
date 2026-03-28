// ========================================
// VRIKSHA - Shop Page JavaScript
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    initShopPage();
});

function initShopPage() {
    const productsGrid = document.getElementById('shopProducts');
    const resultsCount = document.getElementById('resultsCount');
    const sortSelect = document.getElementById('sortSelect');

    if (!productsGrid || !window.PRODUCTS) return;

    // Render all products
    renderProducts(window.PRODUCTS);

    // Sort functionality
    if (sortSelect) {
        sortSelect.addEventListener('change', () => {
            let sorted = [...window.PRODUCTS];
            
            switch (sortSelect.value) {
                case 'price-low':
                    sorted.sort((a, b) => a.price - b.price);
                    break;
                case 'price-high':
                    sorted.sort((a, b) => b.price - a.price);
                    break;
                case 'newest':
                    sorted.reverse();
                    break;
                case 'rating':
                    sorted.sort((a, b) => b.rating - a.rating);
                    break;
                default:
                    sorted = sorted.filter(p => p.featured).concat(sorted.filter(p => !p.featured));
            }
            
            renderProducts(sorted);
        });
    }

    function renderProductImage(product) {
        if (product.image) {
            return `<img src="${product.image}" alt="${product.name}" class="product-img" loading="lazy">`;
        } else {
            return `
                <div class="product-placeholder" style="background: ${product.gradient};">
                    <span class="placeholder-text">${product.shortName.replace(' ', '<br>')}</span>
                </div>
            `;
        }
    }

    function formatCategory(category) {
        const categories = {
            'daily-wellness': 'Daily Wellness',
            'superfoods': 'Superfoods',
            'stress-energy': 'Stress & Energy',
            'digestion': 'Digestion'
        };
        return categories[category] || category;
    }

    function renderProducts(products) {
        if (resultsCount) resultsCount.textContent = products.length;

        productsGrid.innerHTML = products.map((product, index) => `
            <article class="product-card reveal-up" style="--delay: ${index * 0.05}s" data-product-id="${product.id}">
                <a href="product.html?id=${product.id}" class="product-link">
                    <div class="product-image">
                        ${renderProductImage(product)}
                        ${product.badge ? `<span class="product-badge ${product.badge}">${product.badge === 'bestseller' ? 'Bestseller' : 'New'}</span>` : ''}
                    </div>
                </a>
                <div class="product-actions-overlay">
                    <button class="action-btn wishlist" aria-label="Add to wishlist">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                            <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
                        </svg>
                    </button>
                    <a href="product.html?id=${product.id}" class="action-btn quick-view" aria-label="Quick view">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                            <circle cx="12" cy="12" r="3"/>
                        </svg>
                    </a>
                </div>
                <div class="product-info">
                    <span class="product-category">${formatCategory(product.category)}</span>
                    <h3 class="product-name"><a href="product.html?id=${product.id}">${product.name}</a></h3>
                    <p class="product-desc">${product.weight} | ${product.description.substring(0, 60)}...</p>
                    <div class="product-rating">
                        <div class="stars">${'★'.repeat(product.rating)}${'☆'.repeat(5 - product.rating)}</div>
                        <span class="rating-count">(${product.reviews} reviews)</span>
                    </div>
                    <div class="product-footer">
                        <div class="product-price">
                            <span class="current-price">₹${product.price}</span>
                            ${product.originalPrice > product.price ? `<span class="original-price">₹${product.originalPrice}</span>` : ''}
                        </div>
                        <button class="add-to-cart" data-id="${product.id}">
                            <span>Add</span>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M12 5v14M5 12h14"/>
                            </svg>
                        </button>
                    </div>
                </div>
            </article>
        `).join('');

        // Trigger reveal animations
        setTimeout(() => {
            productsGrid.querySelectorAll('.reveal-up').forEach(el => {
                el.classList.add('revealed');
            });
        }, 100);
    }
}
