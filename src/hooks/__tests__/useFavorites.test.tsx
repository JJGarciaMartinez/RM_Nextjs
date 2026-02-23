import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { useFavorites, useUserFavorites } from '@/hooks'
import { useFavoritesStore } from '@/store/favoritesStore'
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

describe('useFavorites', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useFavoritesStore.getState().clearFavorites()
  })

  describe('addFavorite', () => {
    it('debería añadir un favorito exitosamente', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ ...mockFavorite, _id: 'new-fav' }),
      } as Response)

      const { result } = renderHook(() => useFavorites())

      const response = await act(async () => {
        return await result.current.addFavorite({
          userId: 'user-1',
          characterId: 1,
          character: mockCharacter,
        })
      })

      expect(response.success).toBe(true)
      expect(useFavoritesStore.getState().favorites).toHaveLength(1)
      expect(useFavoritesStore.getState().favoriteIds.has(1)).toBe(true)
    })

    it('debería manejar errores al añadir favorito', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Error al crear favorito' }),
      } as Response)

      const { result } = renderHook(() => useFavorites())

      const response = await act(async () => {
        return await result.current.addFavorite({
          userId: 'user-1',
          characterId: 1,
          character: mockCharacter,
        })
      })

      expect(response.success).toBe(false)
      expect(response.error).toBe('Error al crear favorito')
    })
  })

  describe('removeFavorite', () => {
    beforeEach(() => {
      useFavoritesStore.getState().addFavorite(mockFavorite)
    })

    it('debería remover un favorito exitosamente', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      } as Response)

      const { result } = renderHook(() => useFavorites())

      const response = await act(async () => {
        return await result.current.removeFavorite(mockFavorite._id, 'user-1')
      })

      expect(response.success).toBe(true)
      expect(useFavoritesStore.getState().favorites).toHaveLength(0)
      expect(useFavoritesStore.getState().favoriteIds.has(1)).toBe(false)
    })

    it('debería manejar errores al remover favorito', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Error al eliminar' }),
      } as Response)

      const { result } = renderHook(() => useFavorites())

      const response = await act(async () => {
        return await result.current.removeFavorite(mockFavorite._id, 'user-1')
      })

      expect(response.success).toBe(false)
      expect(response.error).toBe('Error al eliminar')
    })
  })

  describe('toggleFavorite', () => {
    it('debería añadir favorito si no existe', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ ...mockFavorite, _id: 'new-fav' }),
      } as Response)

      const { result } = renderHook(() => useFavorites())

      const response = await act(async () => {
        return await result.current.toggleFavorite('user-1', mockCharacter)
      })

      expect(response?.success).toBe(true)
      expect(useFavoritesStore.getState().favoriteIds.has(1)).toBe(true)
    })

    it('debería remover favorito si ya existe', async () => {
      useFavoritesStore.getState().addFavorite(mockFavorite)

      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      } as Response)

      const { result } = renderHook(() => useFavorites())

      const response = await act(async () => {
        return await result.current.toggleFavorite('user-1', mockCharacter)
      })

      expect(response?.success).toBe(true)
      expect(useFavoritesStore.getState().favoriteIds.has(1)).toBe(false)
    })
  })

  describe('isFavorited', () => {
    it('debería retornar true si el personaje es favorito', () => {
      useFavoritesStore.getState().addFavorite(mockFavorite)

      const { result } = renderHook(() => useFavorites())

      expect(result.current.isFavorited(1)).toBe(true)
    })

    it('debería retornar false si el personaje no es favorito', () => {
      const { result } = renderHook(() => useFavorites())

      expect(result.current.isFavorited(1)).toBe(false)
    })
  })

  describe('checkFavorite', () => {
    it('debería verificar si un personaje es favorito vía API', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ isFavorited: true }),
      } as Response)

      const { result } = renderHook(() => useFavorites())

      const isFav = await act(async () => {
        return await result.current.checkFavorite('user-1', 1)
      })

      expect(isFav).toBe(true)
    })
  })

  describe('fetchFavorites', () => {
    it('debería cargar favoritos desde el store', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          favorites: [mockFavorite],
          pagination: { total: 1, page: 1, limit: 20, pages: 1 },
        }),
      } as Response)

      const { result } = renderHook(() => useFavorites())

      await act(async () => {
        await result.current.fetchFavorites('user-1')
      })

      const state = useFavoritesStore.getState()
      expect(state.favorites).toHaveLength(1)
    })
  })

  describe('clearError', () => {
    it('debería limpiar el error del store', () => {
      useFavoritesStore.setState({ error: 'Some error' })

      const { result } = renderHook(() => useFavorites())

      act(() => {
        result.current.clearError()
      })

      expect(useFavoritesStore.getState().error).toBe(null)
    })
  })
})

describe('useUserFavorites', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useFavoritesStore.getState().clearFavorites()
  })

  it('debería cargar favoritos del usuario', async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        favorites: [mockFavorite],
        pagination: { total: 1, page: 1, limit: 20, pages: 1 },
      }),
    } as Response)

    const { result } = renderHook(() => useUserFavorites('user-1', 1, 20, ''))

    await waitFor(
      () => {
        expect(result.current.loading).toBe(false)
      },
      { timeout: 5000 },
    )
  })

  it('debería filtrar favoritos por userId', async () => {
    const fav2 = { ...mockFavorite, _id: 'fav-2', userId: 'user-2' }

    useFavoritesStore.setState({
      favorites: [mockFavorite, fav2],
      pagination: { total: 2, page: 1, limit: 20, pages: 1 },
    })

    const { result } = renderHook(() => useUserFavorites('user-1'))

    // Solo debería retornar los favoritos del user-1
    expect(result.current.favorites).toHaveLength(1)
    expect(result.current.favorites[0].userId).toBe('user-1')
  })

  it('no debería hacer fetch si userId es null', () => {
    renderHook(() => useUserFavorites(null))

    expect(global.fetch).not.toHaveBeenCalled()
  })

  it('debería hacer fetch cuando cambian los parámetros', async () => {
    vi.mocked(global.fetch)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          favorites: [mockFavorite],
          pagination: { total: 1, page: 1, limit: 20, pages: 1 },
        }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          favorites: [],
          pagination: { total: 0, page: 1, limit: 20, pages: 0 },
        }),
      } as Response)

    const { result, rerender } = renderHook(
      ({ userId, page, limit, search }) =>
        useUserFavorites(userId, page, limit, search),
      {
        initialProps: { userId: 'user-1', page: 1, limit: 20, search: '' },
      },
    )

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    rerender({ userId: 'user-1', page: 1, limit: 20, search: 'rick' })

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(global.fetch).toHaveBeenCalled()
  })

  it('debería proporcionar función refetch', async () => {
    vi.mocked(global.fetch)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          favorites: [mockFavorite],
          pagination: { total: 1, page: 1, limit: 20, pages: 1 },
        }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          favorites: [],
          pagination: { total: 0, page: 1, limit: 20, pages: 0 },
        }),
      } as Response)

    const { result } = renderHook(() => useUserFavorites('user-1'))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    await act(async () => {
      await result.current.refetch()
    })

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
  })

  it('debería terminar loading incluso con error', async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: false,
      statusText: 'Error',
    } as Response)

    const { result } = renderHook(() => useUserFavorites('user-1'))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
  })
})
