import { create } from 'zustand';
import { persist } from 'zustand/middleware';


export const useCartStore = create()(
  persist(
    (set, get) => ({
      restaurantId: null,
      restaurantName: null,
      items: [],
      couponCode: null,

      addItem: (restaurantId, restaurantName, item) => {
        const state = get();

        // If cart has items from a different restaurant, clear first
        if (state.restaurantId && state.restaurantId !== restaurantId) {
          set({ restaurantId, restaurantName, items: [item], couponCode: null });
          return;
        }

        const existing = state.items.find((i) => i.itemId === item.itemId);
        if (existing) {
          set({
            restaurantId,
            restaurantName,
            items: state.items.map((i) =>
              i.itemId === item.itemId ? { ...i, quantity: i.quantity + item.quantity } : i,
            ),
          });
        } else {
          set({ restaurantId, restaurantName, items: [...state.items, item] });
        }
      },

      updateQuantity: (itemId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(itemId);
          return;
        }
        set((s) => ({
          items: s.items.map((i) => (i.itemId === itemId ? { ...i, quantity } : i)),
        }));
      },

      removeItem: (itemId) => {
        set((s) => {
          const items = s.items.filter((i) => i.itemId !== itemId);
          if (items.length === 0) {
            return { items: [], restaurantId: null, restaurantName: null, couponCode: null };
          }
          return { items };
        });
      },

      clearCart: () =>
        set({ items: [], restaurantId: null, restaurantName: null, couponCode: null }),

      setCoupon: (code) => set({ couponCode: code }),

      itemCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

      subtotal: () =>
        get().items.reduce((sum, i) => {
          const modifierTotal = i.modifiers.reduce((m, mod) => m + mod.price, 0);
          return sum + (i.price + modifierTotal) * i.quantity;
        }, 0),
    }),
    { name: 'ff-cart' },
  ),
);
