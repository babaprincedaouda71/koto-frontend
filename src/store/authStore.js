import { create } from 'zustand'

const useAuthStore = create((set) => ({
    user: null,
    isInitialized: false,

    setUser: (user) => set({ user, isInitialized: true }),
    setInitialized: () => set({ isInitialized: true }),
    logout: () => set({ user: null }),
}))

export default useAuthStore
