// Product types for the seafood store
export interface Product {
  id: string;
  name: string;
  nameTamil?: string;
  description: string;
  category: 'fresh-fish' | 'dry-fish' | 'seafood-specials';
  image: string;
  prices: {
    weight: string;
    price: number;
    originalPrice?: number;
  }[];
  inStock: boolean;
  isFresh?: boolean;
  isPopular?: boolean;
  rating?: number;
  reviews?: number;
}

export interface CartItem {
  product: Product;
  selectedWeight: string;
  quantity: number;
  price: number;
}

export interface Category {
  id: string;
  name: string;
  nameTamil: string;
  icon: string;
  description: string;
}
