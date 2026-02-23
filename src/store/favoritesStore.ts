import { create } from 'zustand'
import type { RMCharacter } from '@/types'

interface Favorite {
  _id: string
  userId: string
  characterId: number
  character: RMCharacter
  createdAt: string
  updatedAt: string
}

interface PaginationInfo {
  total: number
  page: number
  limit: number
  pages: number
}

interface FavoritesState {
  favorites: Favorite[]
  favoriteIds: Set<number>
  loading: boolean
  error: string | null
  pagination: PaginationInfo

  addFavorite: (favorite: Favorite) => void
  removeFavorite: (favoriteId: string) => void
  setFavorites: (favorites: Favorite[]) => void
  fetchFavorites: (
    userId: string,
    page?: number,
    limit?: number,
    search?: string,
  ) => Promise<void>
  checkFavorite: (userId: string, characterId: number) => Promise<boolean>
  clearError: () => void
  clearFavorites: () => void
}

const initialPagination: PaginationInfo = {
  total: 0,
  page: 1,
  limit: 20,
  pages: 0,
}

export const useFavoritesStore = create<FavoritesState>((set) => ({
  favorites: [],
  favoriteIds: new Set<number>(),
  loading: false,
  error: null,
  pagination: initialPagination,

  addFavorite: (favorite) =>
    set((state) => ({
      favorites: [favorite, ...state.favorites],
      favoriteIds: new Set([...state.favoriteIds, favorite.characterId]),
      pagination: {
        ...state.pagination,
        total: state.pagination.total + 1,
      },
    })),

  removeFavorite: (favoriteId) =>
    set((state) => {
      const favorite = state.favorites.find((f) => f._id === favoriteId)
      return {
        favorites: state.favorites.filter((f) => f._id !== favoriteId),
        favoriteIds: favorite
          ? new Set(
              [...state.favoriteIds].filter(
                (id) => id !== favorite.characterId,
              ),
            )
          : state.favoriteIds,
        pagination: {
          ...state.pagination,
          total: Math.max(0, state.pagination.total - 1),
        },
      }
    }),

  setFavorites: (favorites) =>
    set(() => ({
      favorites,
      favoriteIds: new Set(favorites.map((f) => f.characterId)),
    })),

  fetchFavorites: async (userId, page = 1, limit = 20, search = '') => {
    set({ loading: true, error: null })
    try {
      const params = new URLSearchParams({
        userId,
        page: page.toString(),
        limit: limit.toString(),
      })

      if (search) {
        params.append('search', search)
      }

      const response = await fetch(`/api/favorites?${params.toString()}`)
      if (!response.ok) {
        new Error(`Error: ${response.statusText}`)
        console.error(response.statusText)
      }

      const data = await response.json()
      set({
        favorites: data.favorites,
        favoriteIds: new Set(
          data.favorites.map((f: Favorite) => f.characterId),
        ),
        pagination: data.pagination,
        loading: false,
      })
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Unknown error',
        loading: false,
      })
    }
  },

  checkFavorite: async (userId, characterId) => {
    try {
      const response = await fetch(
        `/api/favorites/${characterId}?userId=${encodeURIComponent(userId)}`,
      )
      if (!response.ok) return false

      const data = await response.json()
      if (data.isFavorited) {
        set((state) => ({
          favoriteIds: new Set([...state.favoriteIds, characterId]),
        }))
        return true
      }
      return false
    } catch {
      return false
    }
  },

  clearError: () => set({ error: null }),

  clearFavorites: () =>
    set({
      favorites: [],
      favoriteIds: new Set<number>(),
      pagination: initialPagination,
    }),
}))
