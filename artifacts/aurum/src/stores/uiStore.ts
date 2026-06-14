import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface UIStore {
  searchOpen: boolean;
  activeTab: string;
  toastMessage: string;
  toastVisible: boolean;
  openSearch: () => void;
  closeSearch: () => void;
  setTab: (tab: string) => void;
  showToast: (message: string) => void;
  hideToast: () => void;
}

export const useUIStore = create<UIStore>((set) => ({
  searchOpen: false,
  activeTab: 'all',
  toastMessage: '',
  toastVisible: false,
  openSearch: () => set({ searchOpen: true }),
  closeSearch: () => set({ searchOpen: false }),
  setTab: (tab: string) => set({ activeTab: tab }),
  showToast: (message: string) => {
    set({ toastMessage: message, toastVisible: true });
    setTimeout(() => {
      set({ toastVisible: false });
    }, 3000);
  },
  hideToast: () => set({ toastVisible: false }),
}));