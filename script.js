// ========================================
// VRIKSHA - Main JavaScript
// ========================================

// DOM Elements — resolved after DOM is ready
let preloader, header, backToTopBtn;

// ===== Preloader =====
window.addEventListener('load', () => {
    setTimeout(() => {
        preloader = preloader || document.getElementById('preloader');
        if (preloader) {
            preloader.classList.add('loaded');
        }
        document.body.style.overflow = '';
        initRevealAnimations();
        initCounterAnimations();
    }, 800);
});

// ===== Header Scroll Effect =====
let lastScrollY = 0;
window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    
    if (header) {
        if (scrollY > 100) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    }

    if (backToTopBtn) {
        if (scrollY > 500) {
            backToTopBtn.classList.add('visible');
        } else {
            backToTopBtn.classList.remove('visible');
        }
    }

    lastScrollY = scrollY;
});

// ===== Mobile Menu =====
(function() {
    const btn = document.getElementById('mobileMenuBtn');
    const nav = document.getElementById('mobileNav');
    const overlay = document.getElementById('mobileNavOverlay');

    function openMenu() {
        if (btn) btn.classList.add('active');
        if (nav) nav.classList.add('active');
        if (overlay) overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeMenu() {
        if (btn) btn.classList.remove('active');
        if (nav) nav.classList.remove('active');
        if (overlay) overlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    if (btn) {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            nav && nav.classList.contains('active') ? closeMenu() : openMenu();
        });
    }

    if (overlay) overlay.addEventListener('click', closeMenu);

    if (nav) {
        nav.querySelectorAll('.mobile-nav-link').forEach(link => {
            link.addEventListener('click', closeMenu);
        });
    }
})();

// ===== Back to Top =====
document.addEventListener('DOMContentLoaded', () => {
    backToTopBtn = document.getElementById('backToTop');
    header = document.getElementById('header');
    if (backToTopBtn) {
        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
});

// ===== Reveal Animations =====
function initRevealAnimations() {
    const revealElements = document.querySelectorAll('.reveal-up');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    revealElements.forEach(el => observer.observe(el));
}

// ===== Counter Animations =====
function initCounterAnimations() {
    const counters = document.querySelectorAll('.stat-number[data-count]');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const counter = entry.target;
                const target = parseInt(counter.getAttribute('data-count'));
                animateCounter(counter, target);
                observer.unobserve(counter);
            }
        });
    }, { threshold: 0.5 });

    counters.forEach(counter => observer.observe(counter));
}

function animateCounter(element, target) {
    const duration = 2000;
    const start = 0;
    const startTime = performance.now();

    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const current = Math.floor(start + (target - start) * easeOut);
        
        element.textContent = current;
        
        if (progress < 1) {
            requestAnimationFrame(update);
        } else {
            element.textContent = target;
        }
    }
    
    requestAnimationFrame(update);
}

// ===== Smooth Scroll =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        
        const target = document.querySelector(targetId);
        if (target) {
            e.preventDefault();
            const headerHeight = header ? header.offsetHeight : 0;
            const targetPosition = target.getBoundingClientRect().top + window.scrollY - headerHeight;
            window.scrollTo({ top: targetPosition, behavior: 'smooth' });
        }
    });
});

// ===== Newsletter Form =====
const newsletterForm = document.getElementById('newsletterForm');
if (newsletterForm) {
    newsletterForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = newsletterForm.querySelector('input[type="email"]');
        const btn = newsletterForm.querySelector('button[type="submit"]');
        
        if (email && email.value) {
            btn.textContent = 'Subscribed! ✓';
            btn.style.background = '#4caf50';
            email.value = '';
            
            setTimeout(() => {
                btn.textContent = 'Subscribe';
                btn.style.background = '';
            }, 3000);
        }
    });
}

// ===== Wishlist Toggle =====
document.addEventListener('click', (e) => {
    const wishlistBtn = e.target.closest('.wishlist');
    if (wishlistBtn) {
        e.preventDefault();
        wishlistBtn.classList.toggle('active');
        
        if (wishlistBtn.classList.contains('active')) {
            wishlistBtn.style.background = '#fce4ec';
            wishlistBtn.style.color = '#e91e63';
        } else {
            wishlistBtn.style.background = '';
            wishlistBtn.style.color = '';
        }
    }
});

// ===== Render Product Image =====
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

// ===== Format Category =====
function formatCategory(category) {
    const categories = {
        'daily-wellness': 'Daily Wellness',
        'superfoods': 'Superfoods',
        'stress-energy': 'Stress & Energy',
        'digestion': 'Digestion'
    };
    return categories[category] || category;
}

// ===== Render Featured Products on Homepage =====
function renderFeaturedProducts() {
    const container = document.getElementById('featuredProducts');
    if (!container || !window.PRODUCTS) return;

    const featured = window.PRODUCTS.filter(p => p.featured).slice(0, 4);
    
    container.innerHTML = featured.map((product, index) => `
        <article class="product-card reveal-up" style="--delay: ${(index + 1) * 0.1}s" data-product-id="${product.id}">
            <div class="product-image">
                ${renderProductImage(product)}
                ${product.badge ? `<span class="product-badge ${product.badge}">${product.badge === 'bestseller' ? 'Bestseller' : 'New'}</span>` : ''}
                <div class="product-actions">
                    <button class="action-btn wishlist" aria-label="Add to wishlist">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                            <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
                        </svg>
                    </button>
                </div>
            </div>
            <div class="product-info">
                <span class="product-category">${formatCategory(product.category)}</span>
                <h3 class="product-name">${product.name}</h3>
                <p class="product-desc">${product.weight} | ${product.description.substring(0, 50)}...</p>
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
        container.querySelectorAll('.reveal-up').forEach(el => el.classList.add('revealed'));
    }, 500);
}

// Make functions globally available
window.renderProductImage = renderProductImage;
window.formatCategory = formatCategory;

// Initialize featured products
document.addEventListener('DOMContentLoaded', () => {
    renderFeaturedProducts();
});

// ===== Parallax Effect =====
const heroContent = document.querySelector('.hero-content');
const heroVisual = document.querySelector('.hero-visual');

if (heroContent && heroVisual) {
    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY;
        if (scrollY < window.innerHeight) {
            heroContent.style.transform = `translateY(${scrollY * 0.3}px)`;
            heroVisual.style.transform = `translateY(calc(-50% + ${scrollY * 0.15}px))`;
        }
    });
}

// ===== Collection Cards Click =====
document.querySelectorAll('.collection-card').forEach(card => {
    card.addEventListener('click', (e) => {
        e.preventDefault();
        const category = card.dataset.category;
        if (category) {
            window.location.href = `shop.html?category=${category}`;
        }
    });
});

console.log('🌿 VRIKSHA - Website initialized');

// ===== Update mobile bottom nav cart count =====
// ✅ FIX: Replaced setInterval (fired every 1s, caused toast re-triggers)
// with a proper custom event listener that fires only when cart actually changes
function updateBottomNavCart() {
    const badge = document.getElementById('bottomCartBadge');
    if (!badge) return;
    const cartData = JSON.parse(localStorage.getItem('vriksha_cart') || '[]');
    const count = cartData.reduce((s, i) => s + (i.quantity || 0), 0);
    badge.textContent = count;
    badge.style.display = count > 0 ? 'flex' : 'none';
}

// Run once on load
document.addEventListener('DOMContentLoaded', updateBottomNavCart);

// Update when cart changes via localStorage (cross-tab)
window.addEventListener('storage', (e) => {
    if (e.key === 'vriksha_cart') updateBottomNavCart();
});

// Update badge every 500ms — lightweight, no localStorage patching
setInterval(updateBottomNavCart, 500);

// ===== User Account Button Handler =====
document.addEventListener('click', (e) => {
    const userBtn = e.target.closest('[data-action="account"]');
    if (userBtn) {
        e.preventDefault();
        if (window.auth && window.auth.isLoggedIn) {
            window.location.href = 'account.html';
        } else if (window.auth) {
            window.auth.showLoginModal();
        }
    }
});