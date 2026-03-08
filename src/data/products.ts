import { Product, Category } from '@/types/product';

// Import product images
import freshSnapper from '@/assets/products/fresh-snapper.jpg';
import tigerPrawns from '@/assets/products/tiger-prawns.jpg';
import dryFish from '@/assets/products/dry-fish.jpg';
import blueCrab from '@/assets/products/blue-crab.jpg';
import pomfret from '@/assets/products/pomfret.jpg';
import squid from '@/assets/products/squid.jpg';
import kingFish from '@/assets/products/king-fish.jpg';

export const categories: Category[] = [
  {
    id: 'fresh-fish',
    name: 'Fresh Fish',
    nameTamil: 'புதிய மீன்',
    icon: '🐟',
    description: 'Caught fresh daily from Kanyakumari waters',
  },
  {
    id: 'dry-fish',
    name: 'Dry Fish',
    nameTamil: 'காய்ந்த மீன்',
    icon: '🐠',
    description: 'Traditional sun-dried seafood',
  },
  {
    id: 'seafood-specials',
    name: 'Seafood Specials',
    nameTamil: 'கடல் உணவு',
    icon: '🦐',
    description: 'Premium prawns, crabs & more',
  },
  {
    id: 'pickles',
    name: 'Pickles',
    nameTamil: 'ஊறுகாய்',
    icon: '🫙',
    description: 'Homemade seafood pickles from Kanyakumari',
  },
];

export const products: Product[] = [
  {
    id: '1',
    name: 'Red Snapper',
    nameTamil: 'சங்கரா மீன்',
    description: 'Fresh Red Snapper caught daily from the pristine waters of Kanyakumari. Perfect for frying or curry.',
    category: 'fresh-fish',
    image: freshSnapper,
    prices: [
      { weight: '250g', price: 199 },
      { weight: '500g', price: 379, originalPrice: 398 },
      { weight: '1kg', price: 699, originalPrice: 798 },
    ],
    inStock: true,
    isFresh: true,
    isPopular: true,
    rating: 4.8,
    reviews: 124,
  },
  {
    id: '2',
    name: 'Tiger Prawns',
    nameTamil: 'கருவாடு இறால்',
    description: 'Large, succulent tiger prawns. Excellent for grilling, curries, or biryani. Cleaned and deveined on request.',
    category: 'seafood-specials',
    image: tigerPrawns,
    prices: [
      { weight: '250g', price: 349 },
      { weight: '500g', price: 649, originalPrice: 698 },
      { weight: '1kg', price: 1199, originalPrice: 1396 },
    ],
    inStock: true,
    isFresh: true,
    isPopular: true,
    rating: 4.9,
    reviews: 89,
  },
  {
    id: '3',
    name: 'Dry Anchovies',
    nameTamil: 'நெத்திலி கருவாடு',
    description: 'Traditional sun-dried anchovies from Kanyakumari. Rich in flavor, perfect for chutneys and fry dishes.',
    category: 'dry-fish',
    image: dryFish,
    prices: [
      { weight: '100g', price: 129 },
      { weight: '250g', price: 299 },
      { weight: '500g', price: 549, originalPrice: 598 },
    ],
    inStock: true,
    rating: 4.7,
    reviews: 156,
  },
  {
    id: '4',
    name: 'Blue Swimming Crab',
    nameTamil: 'நண்டு',
    description: 'Fresh blue crabs, perfect for crab curry or pepper crab. Sweet, tender meat that melts in your mouth.',
    category: 'seafood-specials',
    image: blueCrab,
    prices: [
      { weight: '500g', price: 449 },
      { weight: '1kg', price: 849, originalPrice: 898 },
    ],
    inStock: true,
    isFresh: true,
    rating: 4.6,
    reviews: 67,
  },
  {
    id: '5',
    name: 'Silver Pomfret',
    nameTamil: 'வாவல் மீன்',
    description: 'Premium silver pomfret, a delicacy from the Arabian Sea. Best for frying or steaming with mild spices.',
    category: 'fresh-fish',
    image: pomfret,
    prices: [
      { weight: '250g', price: 329 },
      { weight: '500g', price: 599, originalPrice: 658 },
      { weight: '1kg', price: 1099, originalPrice: 1316 },
    ],
    inStock: true,
    isFresh: true,
    isPopular: true,
    rating: 4.9,
    reviews: 203,
  },
  {
    id: '6',
    name: 'Fresh Squid',
    nameTamil: 'கணவாய்',
    description: 'Tender squid rings and tentacles, cleaned and ready to cook. Ideal for grilling, frying, or curry.',
    category: 'seafood-specials',
    image: squid,
    prices: [
      { weight: '250g', price: 229 },
      { weight: '500g', price: 429, originalPrice: 458 },
      { weight: '1kg', price: 799, originalPrice: 916 },
    ],
    inStock: true,
    isFresh: true,
    rating: 4.5,
    reviews: 78,
  },
  {
    id: '7',
    name: 'King Fish (Seer Fish)',
    nameTamil: 'வஞ்சிரம்',
    description: 'Premium king fish steaks, the king of Indian seafood. Rich, flavorful meat perfect for fry or curry.',
    category: 'fresh-fish',
    image: kingFish,
    prices: [
      { weight: '250g', price: 399 },
      { weight: '500g', price: 749, originalPrice: 798 },
      { weight: '1kg', price: 1399, originalPrice: 1596 },
    ],
    inStock: true,
    isFresh: true,
    isPopular: true,
    rating: 4.9,
    reviews: 312,
  },
  {
    id: '8',
    name: 'Fish Pickle',
    nameTamil: 'மீன் ஊறுகாய்',
    description: 'Authentic Kanyakumari-style fish pickle made with fresh seer fish, traditional spices, and gingelly oil. Perfect with rice or roti.',
    category: 'pickles',
    image: kingFish,
    prices: [
      { weight: '100g', price: 149 },
      { weight: '250g', price: 329, originalPrice: 372 },
      { weight: '500g', price: 599, originalPrice: 745 },
    ],
    inStock: true,
    isPopular: true,
    rating: 4.8,
    reviews: 95,
  },
  {
    id: '9',
    name: 'Prawn Pickle',
    nameTamil: 'இறால் ஊறுகாய்',
    description: 'Spicy prawn pickle with hand-picked prawns and aromatic spices. A true Kanyakumari delicacy.',
    category: 'pickles',
    image: tigerPrawns,
    prices: [
      { weight: '100g', price: 179 },
      { weight: '250g', price: 399, originalPrice: 447 },
      { weight: '500g', price: 749, originalPrice: 895 },
    ],
    inStock: true,
    rating: 4.7,
    reviews: 68,
  },
  {
    id: '10',
    name: 'Dry Fish Pickle',
    nameTamil: 'கருவாடு ஊறுகாய்',
    description: 'Traditional dry fish pickle with sun-dried anchovies and fiery red chillies. A staple in every South Indian home.',
    category: 'pickles',
    image: dryFish,
    prices: [
      { weight: '100g', price: 119 },
      { weight: '250g', price: 269, originalPrice: 297 },
      { weight: '500g', price: 499, originalPrice: 595 },
    ],
    inStock: true,
    rating: 4.6,
    reviews: 112,
  },
];

export const getProductsByCategory = (categoryId: string): Product[] => {
  return products.filter(p => p.category === categoryId);
};

export const getPopularProducts = (): Product[] => {
  return products.filter(p => p.isPopular);
};

export const getFreshProducts = (): Product[] => {
  return products.filter(p => p.isFresh);
};
