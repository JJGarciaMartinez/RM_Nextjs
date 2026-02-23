import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useFavoritesStore } from '@/store'
import type { RMCharacter } from '@/types'

global.fetch = vi.fn()

const mockCharacter: RMCharacter = {
  id: 1,
  name: 'Rick Sanchez',
  status: 'Alive',
  species: 'Human',
  type: '',
  gender: 'Male',
  origin: { name: 'Earth', url: '' },
  location: { name: 'Earth', url: '' },
  image: 'https://rickandmortyapi.com/api/character/avatar/1.jpeg',
  episode: [],
  url: '',
  created: '',
}

const mockFavorite = {
  _id: 'fav-123',
  userId: 'user-1',
  characterId: 1,
  character: mockCharacter,
  createdAt: '2024-01-01',
  updatedAt: '2024-01-01',
}

describe('favoritesStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    useFavoritesStore.getState().clearFavorites()
    vi.clearAllMocks()
  })

  describe('Estado inicial', () => {
    it('debería inicializar con estado vacío', () => {
      const state = useFavoritesStore.getState()

      expect(state.favorites).toEqual([])
      expect(state.favoriteIds).toEqual(new Set())
      expect(state.loading).toBe(false)
      expect(state.error).toBe(null)
      expect(state.pagination).toEqual({
        total: 0,
        page: 1,
        limit: 20,
        pages: 0,
      })
    })
  })

  describe('addFavorite', () => {
    it('debería añadir un favorito al estado', () => {
      const { addFavorite } = useFavoritesStore.getState()

      addFavorite(mockFavorite)

      const state = useFavoritesStore.getState()
      expect(state.favorites).toHaveLength(1)
      expect(state.favorites[0]).toEqual(mockFavorite)
      expect(state.favoriteIds.has(1)).toBe(true)
      expect(state.pagination.total).toBe(1)
    })

    it('debería añadir el characterId al Set de favoriteIds', () => {
      const { addFavorite } = useFavoritesStore.getState()

      addFavorite(mockFavorite)

      const state = useFavoritesStore.getState()
      expect(state.favoriteIds.has(mockFavorite.characterId)).toBe(true)
    })

    it('debería incrementar el total de paginación', () => {
      const { addFavorite } = useFavoritesStore.getState()

      addFavorite(mockFavorite)

      const state = useFavoritesStore.getState()
      expect(state.pagination.total).toBe(1)
    })

    it('debería añadir múltiples favoritos', () => {
      const { addFavorite } = useFavoritesStore.getState()

      const fav2 = { ...mockFavorite, _id: 'fav-2', characterId: 2 }
      addFavorite(mockFavorite)
      addFavorite(fav2)

      const state = useFavoritesStore.getState()
      expect(state.favorites).toHaveLength(2)
      expect(state.favoriteIds.has(1)).toBe(true)
      expect(state.favoriteIds.has(2)).toBe(true)
      expect(state.pagination.total).toBe(2)
    })
  })

  describe('removeFavorite', () => {
    beforeEach(() => {
      useFavoritesStore.getState().addFavorite(mockFavorite)
    })

    it('debería remover un favorito por su ID', () => {
      const { removeFavorite } = useFavoritesStore.getState()

      removeFavorite(mockFavorite._id)

      const state = useFavoritesStore.getState()
      expect(state.favorites).toHaveLength(0)
      expect(state.favoriteIds.has(mockFavorite.characterId)).toBe(false)
      expect(state.pagination.total).toBe(0)
    })

    it('debería mantener otros favoritos al remover uno', () => {
      const { addFavorite, removeFavorite } = useFavoritesStore.getState()

      const fav2 = { ...mockFavorite, _id: 'fav-2', characterId: 2 }
      addFavorite(fav2)

      removeFavorite(mockFavorite._id)

      const state = useFavoritesStore.getState()
      expect(state.favorites).toHaveLength(1)
      expect(state.favorites[0]._id).toBe('fav-2')
      expect(state.favoriteIds.has(2)).toBe(true)
    })

    it('no debería hacer nada si el favorito no existe (excepto decrementar total)', () => {
      const { removeFavorite } = useFavoritesStore.getState()
      const prevState = useFavoritesStore.getState()

      removeFavorite('inexistente-id')

      const state = useFavoritesStore.getState()
      expect(state.favorites).toEqual(prevState.favorites)
      expect(state.pagination.total).toBe(prevState.pagination.total - 1)
    })
  })

  describe('setFavorites', () => {
    it('debería reemplazar todos los favoritos', () => {
      const { setFavorites, addFavorite } = useFavoritesStore.getState()

      addFavorite(mockFavorite)

      const newFavorites = [
        { ...mockFavorite, _id: 'fav-2', characterId: 2 },
        { ...mockFavorite, _id: 'fav-3', characterId: 3 },
      ]

      setFavorites(newFavorites)

      const state = useFavoritesStore.getState()
      expect(state.favorites).toHaveLength(2)
      expect(state.favoriteIds.has(1)).toBe(false)
      expect(state.favoriteIds.has(2)).toBe(true)
      expect(state.favoriteIds.has(3)).toBe(true)
    })

    it('debería actualizar favoriteIds correctamente', () => {
      const { setFavorites } = useFavoritesStore.getState()

      const newFavorites = [
        { ...mockFavorite, _id: 'fav-2', characterId: 5 },
        { ...mockFavorite, _id: 'fav-3', characterId: 10 },
      ]

      setFavorites(newFavorites)

      const state = useFavoritesStore.getState()
      expect(state.favoriteIds.has(5)).toBe(true)
      expect(state.favoriteIds.has(10)).toBe(true)
    })
  })

  describe('fetchFavorites', () => {
    it('debería hacer fetch de favoritos desde la API', async () => {
      const mockResponse = {
        favorites: [mockFavorite],
        pagination: { total: 1, page: 1, limit: 20, pages: 1 },
      }

      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response)

      const { fetchFavorites } = useFavoritesStore.getState()

      await fetchFavorites('user-1', 1, 20)

      const state = useFavoritesStore.getState()
      expect(state.favorites).toEqual([mockFavorite])
      expect(state.favoriteIds.has(1)).toBe(true)
      expect(state.pagination).toEqual(mockResponse.pagination)
      expect(state.loading).toBe(false)
      expect(state.error).toBe(null)
    })

    it('debería construir los query params correctamente', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          favorites: [],
          pagination: { total: 0, page: 1, limit: 20, pages: 0 },
        }),
      } as Response)

      const { fetchFavorites } = useFavoritesStore.getState()

      await fetchFavorites('user-1', 2, 10, 'rick')

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('userId=user-1'),
      )
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('page=2'),
      )
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('limit=10'),
      )
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('search=rick'),
      )
    })

    it('debería manejar errores de la API', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: false,
        statusText: 'Not Found',
      } as Response)

      const { fetchFavorites } = useFavoritesStore.getState()

      await fetchFavorites('user-1')

      const state = useFavoritesStore.getState()
      expect(state.error).toBeTruthy()
      expect(state.loading).toBe(false)
    })

    it('debería setear loading a true durante el fetch', async () => {
      vi.mocked(global.fetch).mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            setTimeout(() => {
              resolve({
                ok: true,
                json: async () => ({
                  favorites: [],
                  pagination: { total: 0, page: 1, limit: 20, pages: 0 },
                }),
              } as Response)
            }, 100)
          }),
      )

      const { fetchFavorites } = useFavoritesStore.getState()

      const fetchPromise = fetchFavorites('user-1')

      expect(useFavoritesStore.getState().loading).toBe(true)

      await fetchPromise

      expect(useFavoritesStore.getState().loading).toBe(false)
    })
  })

  describe('checkFavorite', () => {
    it('debería retornar true si el personaje es favorito', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ isFavorited: true }),
      } as Response)

      const { checkFavorite } = useFavoritesStore.getState()

      const result = await checkFavorite('user-1', 1)

      const { favoriteIds } = useFavoritesStore.getState()
      expect(result).toBe(true)
      expect(favoriteIds.has(1)).toBe(true)
    })

    it('debería retornar false si no es favorito', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ isFavorited: false }),
      } as Response)

      const { checkFavorite } = useFavoritesStore.getState()

      const result = await checkFavorite('user-1', 1)

      expect(result).toBe(false)
    })

    it('debería retornar false si hay error', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: false,
      } as Response)

      const { checkFavorite } = useFavoritesStore.getState()

      const result = await checkFavorite('user-1', 1)

      expect(result).toBe(false)
    })
  })

  describe('clearError', () => {
    it('debería limpiar el estado de error', () => {
      const { clearError, fetchFavorites } = useFavoritesStore.getState()

      // Primero causamos un error
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: false,
        statusText: 'Error',
      } as Response)

      fetchFavorites('user-1').then(() => {
        expect(useFavoritesStore.getState().error).toBeTruthy()

        clearError()

        expect(useFavoritesStore.getState().error).toBe(null)
      })
    })
  })

  describe('clearFavorites', () => {
    it('debería limpiar todo el estado del store', () => {
      const { clearFavorites, addFavorite } = useFavoritesStore.getState()

      addFavorite(mockFavorite)

      clearFavorites()

      const state = useFavoritesStore.getState()
      expect(state.favorites).toEqual([])
      expect(state.favoriteIds).toEqual(new Set())
      expect(state.pagination).toEqual({
        total: 0,
        page: 1,
        limit: 20,
        pages: 0,
      })
    })
  })
})
