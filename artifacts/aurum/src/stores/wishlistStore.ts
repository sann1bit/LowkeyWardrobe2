import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface WishlistStore {
  items: number[]; // product ids
  toggle: (id: number) => void;
  isInWishlist: (id: number) => boolean;
  count: () => number;
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],
      toggle: (id: number) => {
        set((state) => {
          if (state.items.includes(id)) {
            return { items: state.items.filter((itemId) => itemId !== id) };
          }
          return { items: [...state.items, id] };
        });
      },
      isInWishlist: (id: number) => {
        return get().items.includes(id);
      },
      count: () => {
        return get().items.length;
      },
    }),
    {
      name: 'aurum-wishlist',
    }
  )
);