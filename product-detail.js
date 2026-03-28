// ========================================
// VRIKSHA - Product Detail Page
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    initProductDetail();
});

function initProductDetail() {
    // Get product ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');

    if (!productId || !window.PRODUCTS) {
        window.location.href = 'shop.html';
        return;
    }

    const product = window.getProductById(productId);
    if (!product) {
        window.location.href = 'shop.html';
        return;
    }

    // Populate product data
    populateProductData(product);
    initQuantityControls(product);
    initTabs();
    initAddToCart(product);
    loadRelatedProducts(product);
}

function populateProductData(product) {
    // Update page title
    document.title = `${product.name} | VRIKSHA`;

    // Main image
    const mainImage = document.getElementById('mainProductImage');
    if (product.image) {
        mainImage.src = product.image;
        mainImage.alt = product.name;
    } else {
        document.getElementById('mainImage').innerHTML = `
            <div class="product-placeholder" style="background: ${product.gradient}; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center;">
                <span style="font-size: 2rem; color: white; text-shadow: 0 2px 4px rgba(0,0,0,0.2);">${product.shortName}</span>
            </div>
        `;
    }

    // Thumbnails
    const thumbnailGrid = document.getElementById('thumbnailGrid');
    const images = [product.image, product.heroImage].filter(Boolean);
    if (images.length > 0) {
        thumbnailGrid.innerHTML = images.map((img, idx) => `
            <div class="thumbnail ${idx === 0 ? 'active' : ''}" data-image="${img}">
                <img src="${img}" alt="${product.name} ${idx + 1}">
            </div>
        `).join('');

        // Thumbnail click handler
        thumbnailGrid.querySelectorAll('.thumbnail').forEach(thumb => {
            thumb.addEventListener('click', () => {
                thumbnailGrid.querySelectorAll('.thumbnail').forEach(t => t.classList.remove('active'));
                thumb.classList.add('active');
                mainImage.src = thumb.dataset.image;
            });
        });
    }

    // Category
    const categoryMap = {
        'daily-wellness': 'Daily Wellness',
        'superfoods': 'Superfoods',
        'stress-energy': 'Stress & Energy',
        'digestion': 'Digestion'
    };
    document.getElementById('productCategory').textContent = categoryMap[product.category] || product.category;

    // Badges
    const badgesContainer = document.getElementById('productBadges');
    let badgesHTML = '<span class="badge badge-organic">100% Organic</span>';
    if (product.badge === 'bestseller') {
        badgesHTML += '<span class="badge badge-bestseller">Bestseller</span>';
    } else if (product.badge === 'new') {
        badgesHTML += '<span class="badge badge-new">New</span>';
    }
    badgesContainer.innerHTML = badgesHTML;

    // Title and subtitle
    document.getElementById('productTitle').textContent = product.name;
    document.getElementById('productSubtitle').textContent = product.weight + ' | Ayurvedic Supplement';

    // Rating
    document.getElementById('productStars').textContent = '★'.repeat(product.rating) + '☆'.repeat(5 - product.rating);
    document.getElementById('productRating').textContent = product.rating + '.0';
    document.getElementById('productReviews').textContent = product.reviews + ' reviews';

    // Pricing
    document.getElementById('productPrice').textContent = '₹' + product.price;
    document.getElementById('productOriginalPrice').textContent = '₹' + product.originalPrice;
    const discount = Math.round((1 - product.price / product.originalPrice) * 100);
    document.getElementById('productDiscount').textContent = discount + '% OFF';

    // Description
    document.getElementById('productDescription').textContent = product.description;

    // Benefits
    const benefitsList = document.getElementById('benefitsList');
    benefitsList.innerHTML = product.benefits.map(benefit => `
        <div class="benefit-item">
            <span class="benefit-icon">✓</span>
            <span>${benefit}</span>
        </div>
    `).join('');

    // Ingredients
    document.getElementById('productIngredients').textContent = product.ingredients;

    // Usage
    const usageSteps = document.getElementById('usageSteps');
    const usageText = product.usage.split('. ').filter(s => s.trim());
    usageSteps.innerHTML = usageText.map((step, idx) => `
        <div class="usage-step">
            <span class="step-num">${idx + 1}</span>
            <span class="step-text">${step}${step.endsWith('.') ? '' : '.'}</span>
        </div>
    `).join('');

    // Reviews summary
    document.getElementById('avgRating').textContent = product.rating + '.0';
    document.getElementById('totalReviews').textContent = `Based on ${product.reviews} reviews`;

    // Sample reviews
    const reviewsList = document.getElementById('reviewsList');
    const sampleReviews = [
        { name: 'Priya S.', date: '2 weeks ago', rating: 5, text: 'Excellent quality! I\'ve been using this for a month and can already feel the difference in my energy levels. Will definitely reorder.' },
        { name: 'Rahul M.', date: '1 month ago', rating: 5, text: 'The packaging is eco-friendly and the product is pure. Very happy with my purchase. Fast delivery too!' },
        { name: 'Anita K.', date: '1 month ago', rating: 4, text: 'Good product, tastes natural. Took some time to see results but worth the wait. Would recommend.' }
    ];

    reviewsList.innerHTML = sampleReviews.map(review => `
        <div class="review-card">
            <div class="review-header">
                <div class="reviewer-avatar">${review.name[0]}</div>
                <div class="reviewer-info">
                    <div class="reviewer-name">${review.name}</div>
                    <div class="review-date">${review.date}</div>
                </div>
                <div class="review-stars">${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}</div>
            </div>
            <p class="review-text">${review.text}</p>
            <span class="verified-purchase">✓ Verified Purchase</span>
        </div>
    `).join('');
}

function initQuantityControls(product) {
    const qtyInput = document.getElementById('qtyInput');
    const qtyMinus = document.getElementById('qtyMinus');
    const qtyPlus = document.getElementById('qtyPlus');

    qtyMinus.addEventListener('click', () => {
        const current = parseInt(qtyInput.value) || 1;
        if (current > 1) qtyInput.value = current - 1;
    });

    qtyPlus.addEventListener('click', () => {
        const current = parseInt(qtyInput.value) || 1;
        if (current < 10) qtyInput.value = current + 1;
    });

    qtyInput.addEventListener('change', () => {
        let val = parseInt(qtyInput.value) || 1;
        if (val < 1) val = 1;
        if (val > 10) val = 10;
        qtyInput.value = val;
    });
}

function initTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabId = btn.dataset.tab;

            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            btn.classList.add('active');
            document.getElementById('tab-' + tabId).classList.add('active');
        });
    });
}

function initAddToCart(product) {
    const addToCartBtn = document.getElementById('addToCartBtn');
    const buyNowBtn = document.getElementById('buyNowBtn');
    const qtyInput = document.getElementById('qtyInput');

    addToCartBtn.addEventListener('click', () => {
        const qty = parseInt(qtyInput.value) || 1;
        for (let i = 0; i < qty; i++) {
            window.cart.addItem(product, 1);
        }
        
        // Update button state
        const originalText = addToCartBtn.innerHTML;
        addToCartBtn.innerHTML = '✓ Added to Cart!';
        addToCartBtn.style.background = '#4caf50';
        setTimeout(() => {
            addToCartBtn.innerHTML = originalText;
            addToCartBtn.style.background = '';
        }, 2000);
    });

    buyNowBtn.addEventListener('click', () => {
        const qty = parseInt(qtyInput.value) || 1;
        // Clear cart and add this product
        window.cart.clearCart();
        for (let i = 0; i < qty; i++) {
            window.cart.addItem(product, 1);
        }
        // Go to checkout
        window.location.href = 'checkout.html';
    });
}

function loadRelatedProducts(currentProduct) {
    const container = document.getElementById('relatedProducts');
    if (!container || !window.PRODUCTS) return;

    // Get products from same category or featured, excluding current
    let related = window.PRODUCTS.filter(p => 
        p.id !== currentProduct.id && 
        (p.category === currentProduct.category || p.featured)
    ).slice(0, 4);

    container.innerHTML = related.map((product, index) => {
        const imageHTML = product.image 
            ? `<img src="${product.image}" alt="${product.name}" class="product-img" loading="lazy">`
            : `<div class="product-placeholder" style="background: ${product.gradient};"><span class="placeholder-text">${product.shortName.replace(' ', '<br>')}</span></div>`;

        return `
            <article class="product-card" data-product-id="${product.id}">
                <a href="product.html?id=${product.id}" class="product-link">
                    <div class="product-image">
                        ${imageHTML}
                        ${product.badge ? `<span class="product-badge ${product.badge}">${product.badge === 'bestseller' ? 'Bestseller' : 'New'}</span>` : ''}
                    </div>
                    <div class="product-info">
                        <span class="product-category">${formatCategory(product.category)}</span>
                        <h3 class="product-name">${product.name}</h3>
                        <p class="product-desc">${product.weight}</p>
                        <div class="product-rating">
                            <div class="stars">${'★'.repeat(product.rating)}${'☆'.repeat(5 - product.rating)}</div>
                            <span class="rating-count">(${product.reviews})</span>
                        </div>
                        <div class="product-footer">
                            <div class="product-price">
                                <span class="current-price">₹${product.price}</span>
                                ${product.originalPrice > product.price ? `<span class="original-price">₹${product.originalPrice}</span>` : ''}
                            </div>
                        </div>
                    </div>
                </a>
            </article>
        `;
    }).join('');
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
