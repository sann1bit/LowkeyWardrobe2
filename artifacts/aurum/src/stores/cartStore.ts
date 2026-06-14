import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Product } from '../data/products';

export interface CartItem {
  id: string;
  productId: number;
  name: string;
  brand: string;
  price: number;
  size: string;
  colorHex: string;
  figType: string;
  bgGradient: string;
  figColorA: string;
  figColorB: string;
  imageUrl?: string;
  quantity: number;
  sku: string;
}

export interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  addItem: (product: Product, size: string, color: string) => void;
  removeItem: (productId: number, size: string) => void;
  updateQty: (productId: number, size: string, delta: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  total: () => number;
  itemCount: () => number;
  shipping: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      addItem: (product: Product, size: string, color: string) => {
        set((state) => {
          const existingItemIndex = state.items.findIndex(
            (i) => i.productId === product.id && i.size === size && i.colorHex === color
          );

          if (existingItemIndex > -1) {
            const newItems = [...state.items];
            newItems[existingItemIndex].quantity += 1;
            return { items: newItems, isOpen: true };
          }

          const newItem: CartItem = {
            id: `${product.id}-${size}-${color}`,
            productId: product.id,
            name: product.name,
            brand: product.brand,
            price: product.price,
            size,
            colorHex: color,
            figType: product.figType,
            bgGradient: product.bgGradient,
            figColorA: product.figColorA,
            figColorB: product.figColorB,
            imageUrl: product.imageUrl,
            quantity: 1,
            sku: product.sku,
          };
          return { items: [...state.items, newItem], isOpen: true };
        });
      },
      removeItem: (productId: number, size: string) => {
        set((state) => ({
          items: state.items.filter((i) => !(i.productId === productId && i.size === size)),
        }));
      },
      updateQty: (productId: number, size: string, delta: number) => {
        set((state) => ({
          items: state.items
            .map((item) => {
              if (item.productId === productId && item.size === size) {
                const newQty = Math.max(0, item.quantity + delta);
                return { ...item, quantity: newQty };
              }
              return item;
            })
            .filter((item) => item.quantity > 0),
        }));
      },
      clearCart: () => set({ items: [] }),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      total: () => {
        const { items } = get();
        return items.reduce((acc, item) => acc + item.price * item.quantity, 0);
      },
      itemCount: () => {
        const { items } = get();
        return items.reduce((acc, item) => acc + item.quantity, 0);
      },
      shipping: () => {
        const { total } = get();
        return total() >= 50000 ? 0 : 1500;
      },
    }),
    {
      name: 'lowkey-cart',
    }
  )
);
