import { create } from 'zustand';
import { persist } from 'zustand/middleware';


export const useAuthStore = create()(
  persist(
    (set) => ({
      user,
      accessToken,
      isAuthenticated: false,

      setAuth: (user, accessToken) =>
        set({ user, accessToken, isAuthenticated: true }),

      setAccessToken: (accessToken) => set({ accessToken }),

      setUser: (user) => set({ user }),

      logout: () =>
        set({ user, accessToken, isAuthenticated: false }),
    }),
    {
      name: 'ff-auth',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
