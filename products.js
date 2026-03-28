// ========================================
// VRIKSHA - Product Data
// ========================================

const PRODUCTS = [
    {
        id: 'wheatgrass-tablets',
        name: 'Organic Wheatgrass Tablets',
        shortName: 'Wheatgrass Tablets',
        category: 'daily-wellness',
        price: 549,
        originalPrice: 699,
        weight: '200g | 60 Tablets',
        description: 'Natural detox & immunity booster with chlorophyll-rich superfood. Made from 100% organic young wheat plant leaves.',
        benefits: [
            'Supports natural detoxification',
            'Boosts immunity & energy',
            'Rich in chlorophyll & vitamins',
            'Improves digestion'
        ],
        ingredients: 'Organic Wheatgrass (Triticum aestivum) leaf powder',
        usage: 'Take 2 tablets twice daily with water, preferably on an empty stomach.',
        rating: 5,
        reviews: 128,
        badge: 'bestseller',
        image: 'images/wheatgrass-product.png',
        heroImage: 'images/wheatgrass-hero.png',
        gradient: 'linear-gradient(145deg, #a5d6a7 0%, #66bb6a 100%)',
        inStock: true,
        featured: true
    },
    {
        id: 'moringa-tablets',
        name: 'Pure Moringa Leaf Tablets',
        shortName: 'Moringa Tablets',
        category: 'superfoods',
        price: 449,
        originalPrice: 549,
        weight: '200g | 60 Tablets',
        description: 'Nutrient-dense superfood for energy, immunity & overall vitality. The "Miracle Tree" packed with 90+ nutrients.',
        benefits: [
            'Boosts energy naturally',
            'Supports immune function',
            'Rich in vitamins A, C, E, K',
            'Contains all essential amino acids'
        ],
        ingredients: 'Organic Moringa (Moringa oleifera) leaf powder',
        usage: 'Take 2 tablets twice daily with water.',
        rating: 5,
        reviews: 96,
        badge: 'new',
        image: 'images/moringa-product.png',
        heroImage: 'images/moringa-hero.png',
        gradient: 'linear-gradient(145deg, #c5e1a5 0%, #9ccc65 100%)',
        inStock: true,
        featured: true
    },
    {
        id: 'ashwagandha-tablets',
        name: 'Ashwagandha Tablets',
        shortName: 'Ashwagandha Tablets',
        category: 'stress-energy',
        price: 699,
        originalPrice: 899,
        weight: '200g | 60 Tablets',
        description: 'Clinically proven adaptogen for stress relief & vitality support. Made with premium root extract.',
        benefits: [
            'Reduces stress & anxiety',
            'Improves sleep quality',
            'Enhances mental clarity',
            'Boosts stamina & vitality'
        ],
        ingredients: 'Organic Ashwagandha (Withania somnifera) root extract',
        usage: 'Take 1 tablet twice daily with warm milk or water.',
        rating: 5,
        reviews: 214,
        badge: null,
        image: 'images/ashwagandha-product.png',
        heroImage: 'images/ashwagandha-hero.png',
        gradient: 'linear-gradient(145deg, #ffcc80 0%, #ffa726 100%)',
        inStock: true,
        featured: true
    },
    {
        id: 'spirulina-tablets',
        name: 'Organic Spirulina Tablets',
        shortName: 'Spirulina Tablets',
        category: 'superfoods',
        price: 599,
        originalPrice: 749,
        weight: '200g | 60 Tablets',
        description: 'Blue-green algae superfood for strength & immunity. Nature\'s multivitamin with complete protein.',
        benefits: [
            'Complete plant protein',
            'Boosts energy levels',
            'Supports detoxification',
            'Rich in B-vitamins & iron'
        ],
        ingredients: 'Organic Spirulina (Arthrospira platensis) powder',
        usage: 'Take 2 tablets daily with water or smoothie.',
        rating: 5,
        reviews: 72,
        badge: null,
        image: 'images/spirulina-product.png',
        heroImage: 'images/spirulina-hero.png',
        gradient: 'linear-gradient(145deg, #4dd0e1 0%, #00acc1 100%)',
        inStock: true,
        featured: true
    }
];

// Make products available globally
window.PRODUCTS = PRODUCTS;

// Helper functions
function getProductById(id) {
    return PRODUCTS.find(p => p.id === id);
}

function getFeaturedProducts() {
    return PRODUCTS.filter(p => p.featured);
}

function getProductsByCategory(category) {
    if (category === 'all') return PRODUCTS;
    return PRODUCTS.filter(p => p.category === category);
}

function formatPrice(price) {
    return '₹' + price.toLocaleString('en-IN');
}

// Export functions
window.getProductById = getProductById;
window.getFeaturedProducts = getFeaturedProducts;
window.getProductsByCategory = getProductsByCategory;
window.formatPrice = formatPrice;
