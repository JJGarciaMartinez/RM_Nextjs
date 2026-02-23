import { create } from 'zustand'

interface SearchState {
  searchQuery: string
  page: number

  setSearchQuery: (query: string) => void
  setPage: (page: number) => void
  reset: () => void
}

export const useFiltersStore = create<SearchState>((set) => ({
  searchQuery: '',
  page: 1,

  setSearchQuery: (query) => set({ searchQuery: query, page: 1 }),

  setPage: (page) => set({ page }),

  reset: () => set({ searchQuery: '', page: 1 }),
}))
