import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { CartItem, Product } from '@/types/product';

interface CartState {
  items: CartItem[];
  total: number;
  itemCount: number;
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: { product: Product; weight: string; price: number } }
  | { type: 'REMOVE_ITEM'; payload: { productId: string; weight: string } }
  | { type: 'UPDATE_QUANTITY'; payload: { productId: string; weight: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'LOAD_CART'; payload: CartItem[] };

const CartContext = createContext<{
  state: CartState;
  addItem: (product: Product, weight: string, price: number) => void;
  removeItem: (productId: string, weight: string) => void;
  updateQuantity: (productId: string, weight: string, quantity: number) => void;
  clearCart: () => void;
} | null>(null);

const calculateTotal = (items: CartItem[]): number => {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
};

const calculateItemCount = (items: CartItem[]): number => {
  return items.reduce((sum, item) => sum + item.quantity, 0);
};

const cartReducer = (state: CartState, action: CartAction): CartState => {
  let newItems: CartItem[];

  switch (action.type) {
    case 'ADD_ITEM': {
      const existingIndex = state.items.findIndex(
        item => item.product.id === action.payload.product.id && item.selectedWeight === action.payload.weight
      );

      if (existingIndex > -1) {
        newItems = state.items.map((item, index) =>
          index === existingIndex ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        newItems = [
          ...state.items,
          {
            product: action.payload.product,
            selectedWeight: action.payload.weight,
            quantity: 1,
            price: action.payload.price,
          },
        ];
      }
      break;
    }

    case 'REMOVE_ITEM':
      newItems = state.items.filter(
        item => !(item.product.id === action.payload.productId && item.selectedWeight === action.payload.weight)
      );
      break;

    case 'UPDATE_QUANTITY':
      if (action.payload.quantity <= 0) {
        newItems = state.items.filter(
          item => !(item.product.id === action.payload.productId && item.selectedWeight === action.payload.weight)
        );
      } else {
        newItems = state.items.map(item =>
          item.product.id === action.payload.productId && item.selectedWeight === action.payload.weight
            ? { ...item, quantity: action.payload.quantity }
            : item
        );
      }
      break;

    case 'CLEAR_CART':
      newItems = [];
      break;

    case 'LOAD_CART':
      newItems = action.payload;
      break;

    default:
      return state;
  }

  const newState = {
    items: newItems,
    total: calculateTotal(newItems),
    itemCount: calculateItemCount(newItems),
  };

  // Save to localStorage
  localStorage.setItem('meenava-cart', JSON.stringify(newItems));

  return newState;
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    total: 0,
    itemCount: 0,
  });

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('meenava-cart');
    if (savedCart) {
      try {
        const items = JSON.parse(savedCart);
        dispatch({ type: 'LOAD_CART', payload: items });
      } catch (e) {
        console.error('Failed to load cart:', e);
      }
    }
  }, []);

  const addItem = (product: Product, weight: string, price: number) => {
    dispatch({ type: 'ADD_ITEM', payload: { product, weight, price } });
  };

  const removeItem = (productId: string, weight: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: { productId, weight } });
  };

  const updateQuantity = (productId: string, weight: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { productId, weight, quantity } });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  return (
    <CartContext.Provider value={{ state, addItem, removeItem, updateQuantity, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
