import { useCallback, useEffect, useRef, useState } from 'react'
import type { RMCharacter } from '@/types'
import { useFavoritesStore } from '@/store/favoritesStore'

interface AddFavoriteParams {
  userId: string
  characterId: number
  character: RMCharacter
}

export function useFavorites() {
  const {
    favorites,
    favoriteIds,
    loading,
    error,
    pagination,
    addFavorite,
    removeFavorite,
    fetchFavorites,
    checkFavorite,
    clearError,
  } = useFavoritesStore()

  const addFavoriteMutation = useCallback(
    async ({ userId, characterId, character }: AddFavoriteParams) => {
      try {
        const response = await fetch('/api/favorites', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, characterId, character }),
        })

        if (!response.ok) {
          const err = await response.json()
          throw new Error(err.error || 'Error adding favorite')
        }

        const data = await response.json()
        addFavorite(data)
        return { success: true, data }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error'
        return { success: false, error: message }
      }
    },
    [addFavorite],
  )

  const removeFavoriteMutation = useCallback(
    async (favoriteId: string, userId: string) => {
      try {
        const response = await fetch(
          `/api/favorites/${favoriteId}?userId=${encodeURIComponent(userId)}`,
          {
            method: 'DELETE',
          },
        )

        if (!response.ok) {
          const err = await response.json()
          throw new Error(err.error || 'Error removing favorite')
        }

        removeFavorite(favoriteId)
        return { success: true }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error'
        return { success: false, error: message }
      }
    },
    [removeFavorite],
  )

  const toggleFavorite = useCallback(
    async (userId: string, character: RMCharacter) => {
      const isFav = favoriteIds.has(character.id)

      if (isFav) {
        const favorite = favorites.find((f) => f.characterId === character.id)
        if (favorite) {
          return await removeFavoriteMutation(favorite._id, userId)
        }
      } else {
        return await addFavoriteMutation({
          userId,
          characterId: character.id,
          character,
        })
      }
    },
    [favoriteIds, favorites, addFavoriteMutation, removeFavoriteMutation],
  )

  const isFavorited = useCallback(
    (characterId: number) => favoriteIds.has(characterId),
    [favoriteIds],
  )

  return {
    favorites,
    favoriteIds,
    loading,
    error,
    pagination,
    addFavorite: addFavoriteMutation,
    removeFavorite: removeFavoriteMutation,
    toggleFavorite,
    isFavorited,
    fetchFavorites,
    checkFavorite,
    clearError,
  }
}

export function useUserFavorites(
  userId: string | null,
  page = 1,
  limit = 20,
  search = '',
) {
  const { favorites, loading, error, pagination, fetchFavorites } =
    useFavoritesStore()

  const [localFavorites, setLocalFavorites] = useState(favorites)
  const [localPagination, setLocalPagination] = useState(pagination)
  const [localLoading, setLocalLoading] = useState(loading)
  const [localError, setLocalError] = useState(error)

  const prevParams = useRef({ userId, page, limit, search })

  useEffect(() => {
    // Check if params changed
    const paramsChanged =
      prevParams.current.userId !== userId ||
      prevParams.current.page !== page ||
      prevParams.current.limit !== limit ||
      prevParams.current.search !== search

    if (paramsChanged && userId) {
      setLocalLoading(true)
      setLocalError(null)

      fetchFavorites(userId, page, limit, search)
        .then(() => {
          prevParams.current = { userId, page, limit, search }
        })
        .catch((err) => {
          setLocalError(err instanceof Error ? err.message : 'Unknown error')
        })
        .finally(() => {
          setLocalLoading(false)
        })
    }
  }, [userId, page, limit, search, fetchFavorites])

  useEffect(() => {
    setLocalFavorites(favorites)
    setLocalPagination(pagination)
    setLocalLoading(loading)
    setLocalError(error)
  }, [favorites, pagination, loading, error])

  return {
    favorites: localFavorites.filter((f) => f.userId === userId),
    loading: localLoading,
    error: localError,
    pagination: localPagination,
    refetch: () => {
      if (userId) {
        return fetchFavorites(userId, page, limit, search)
      }
    },
  }
}
