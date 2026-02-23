import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface UserState {
  userId: string | null
  isAuthenticated: boolean

  setUserId: (userId: string) => void
  logout: () => void
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      userId: null,
      isAuthenticated: false,

      setUserId: (userId) =>
        set({
          userId,
          isAuthenticated: !!userId,
        }),

      logout: () =>
        set({
          userId: null,
          isAuthenticated: false,
        }),
    }),
    {
      name: 'rm-user-storage',
    },
  ),
)
