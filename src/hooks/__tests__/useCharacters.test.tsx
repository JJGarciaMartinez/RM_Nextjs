import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { useCharacters } from '@/hooks'
import type { RMCharacter } from '@/types'

global.fetch = vi.fn()

const mockCharacters: RMCharacter[] = [
  {
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
  },
  {
    id: 2,
    name: 'Morty Smith',
    status: 'Alive',
    species: 'Human',
    type: '',
    gender: 'Male',
    origin: { name: 'Earth', url: '' },
    location: { name: 'Earth', url: '' },
    image: 'https://rickandmortyapi.com/api/character/avatar/2.jpeg',
    episode: [],
    url: '',
    created: '',
  },
]

describe('useCharacters', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('fetch de personajes', () => {
    it('debería cargar personajes correctamente', async () => {
      const mockResponse = {
        results: mockCharacters,
        info: {
          count: 2,
          pages: 1,
          next: null,
          prev: null,
        },
      }

      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response)

      const { result } = renderHook(() => useCharacters())

      expect(result.current.loading).toBe(true)

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.characters).toEqual(mockCharacters)
      expect(result.current.error).toBe(null)
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/characters?page=1'),
      )
    })

    it('debería incluir query de búsqueda si se proporciona', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          results: [mockCharacters[0]],
          info: { count: 1, pages: 1, next: null, prev: null },
        }),
      } as Response)

      const { result } = renderHook(() =>
        useCharacters({ searchQuery: 'Rick' }),
      )

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('name=Rick'),
      )
    })

    it('debería manejar errores 429 (rate limit)', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: false,
        status: 429,
        json: async () => ({ error: 'Too many requests' }),
      } as Response)

      const { result } = renderHook(() => useCharacters())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.isRateLimited).toBe(true)
      expect(result.current.error).toBe('Too many requests')
    })

    it('debería manejar respuestas 404 (sin resultados)', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({
          results: [],
          info: { count: 0, pages: 0, next: null, prev: null },
        }),
      } as Response)

      const { result } = renderHook(() => useCharacters({ searchQuery: 'xyz' }))

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.characters).toEqual([])
      expect(result.current.error).toBe(null)
      expect(result.current.isRateLimited).toBe(false)
    })

    it('debería manejar errores genéricos', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: false,
        statusText: 'Internal Server Error',
      } as Response)

      const { result } = renderHook(() => useCharacters())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.error).toBeTruthy()
      expect(result.current.characters).toEqual([])
    })

    it('no debería hacer fetch si enabled es false', () => {
      renderHook(() => useCharacters({ enabled: false }))

      expect(global.fetch).not.toHaveBeenCalled()
    })
  })

  describe('paginación', () => {
    it('debería mantener la página inicial', () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          results: [],
          info: { count: 0, pages: 1, next: null, prev: null },
        }),
      } as Response)

      const { result } = renderHook(() => useCharacters({ initialPage: 3 }))

      expect(result.current.page).toBe(3)
    })

    it('debería ir a la siguiente página', async () => {
      vi.mocked(global.fetch)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            results: mockCharacters,
            info: { count: 40, pages: 2, next: '2', prev: null },
          }),
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            results: [],
            info: { count: 40, pages: 2, next: null, prev: '1' },
          }),
        } as Response)

      const { result } = renderHook(() => useCharacters())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      act(() => {
        result.current.nextPage()
      })

      // Esperar a que el fetch de la nueva página se complete
      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.page).toBe(2)
    })

    it('debería ir a la página anterior', async () => {
      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        json: async () => ({
          results: mockCharacters,
          info: { count: 40, pages: 2, next: null, prev: '1' },
        }),
      } as Response)

      const { result } = renderHook(() => useCharacters({ initialPage: 2 }))

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      act(() => {
        result.current.prevPage()
      })

      expect(result.current.page).toBe(1)
    })

    it('debería ir a una página específica', async () => {
      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        json: async () => ({
          results: mockCharacters,
          info: { count: 40, pages: 4, next: '4', prev: '2' },
        }),
      } as Response)

      const { result } = renderHook(() => useCharacters())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      act(() => {
        result.current.goToPage(3)
      })

      expect(result.current.page).toBe(3)
    })

    it('no debería ir a una página inválida', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          results: [],
          info: { count: 10, pages: 1, next: null, prev: null },
        }),
      } as Response)

      const { result } = renderHook(() => useCharacters())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      const originalPage = result.current.page

      act(() => {
        result.current.goToPage(99)
      })

      expect(result.current.page).toBe(originalPage)
    })
  })

  describe('cambio de búsqueda', () => {
    it('debería resetear a página 1 cuando cambia la búsqueda', async () => {
      vi.mocked(global.fetch)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            results: [],
            info: { count: 0, pages: 4, next: '2', prev: null },
          }),
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            results: [],
            info: { count: 0, pages: 4, next: '4', prev: '2' },
          }),
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            results: [mockCharacters[0]],
            info: { count: 1, pages: 1, next: null, prev: null },
          }),
        } as Response)

      const { result, rerender } = renderHook(
        ({ searchQuery }) => useCharacters({ searchQuery }),
        { initialProps: { searchQuery: '' } },
      )

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      act(() => {
        result.current.goToPage(3)
      })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.page).toBe(3)

      // Cambiamos la búsqueda
      rerender({ searchQuery: 'Rick' })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      // La página debería volver a 1
      expect(result.current.page).toBe(1)
      expect(result.current.isRateLimited).toBe(false)
    })
  })

  describe('retry', () => {
    it('debería tener función retry disponible', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          results: mockCharacters,
          info: { count: 2, pages: 1, next: null, prev: null },
        }),
      } as Response)

      const { result } = renderHook(() => useCharacters())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(typeof result.current.retry).toBe('function')
    })
  })

  describe('refetch', () => {
    it('debería tener función refetch disponible', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          results: [mockCharacters[0]],
          info: { count: 1, pages: 1, next: null, prev: null },
        }),
      } as Response)

      const { result } = renderHook(() => useCharacters())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(typeof result.current.refetch).toBe('function')
    })
  })
})
