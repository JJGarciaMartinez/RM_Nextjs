import { useState, useEffect, useCallback, useRef } from 'react'
import type { RMCharacter, CharactersResponse } from '@/types'

interface UseCharactersOptions {
  searchQuery?: string
  initialPage?: number
  enabled?: boolean
}

export function useCharacters(options: UseCharactersOptions = {}) {
  const { searchQuery = '', initialPage = 1, enabled = true } = options

  const [characters, setCharacters] = useState<RMCharacter[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(initialPage)
  const [info, setInfo] = useState<CharactersResponse['info'] | null>(null)
  const [isRateLimited, setIsRateLimited] = useState(false)

  const prevSearchQuery = useRef(searchQuery)

  const fetchCharacters = useCallback(async () => {
    if (!enabled) return

    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams()
      params.append('page', page.toString())

      if (searchQuery) {
        params.append('name', searchQuery)
      }

      const response = await fetch(`/api/characters?${params.toString()}`)

      if (!response.ok) {
        // Handle rate limit specifically
        if (response.status === 429) {
          setIsRateLimited(true)
          const data = await response.json()
          throw new Error(
            data.error || 'Too many requests. Please wait a moment.',
          )
        }

        // Handle 404 (no results)
        if (response.status === 404) {
          const data = await response.json()
          setCharacters(data.results || [])
          setInfo(data.info || { count: 0, pages: 0, next: null, prev: null })
          setIsRateLimited(false)
          return
        }

        throw new Error(`Error fetching characters: ${response.statusText}`)
      }

      setIsRateLimited(false)
      const data: CharactersResponse = await response.json()
      setCharacters(data.results)
      setInfo(data.info)
    } catch (err) {
      if (err instanceof Error) {
        // Don't set error state for 404 (no results is a valid response)
        if (!err.message.includes('No characters found')) {
          setError(err.message)
        }
      } else {
        setError('Unknown error')
      }
      setCharacters([])
      setInfo(null)
    } finally {
      setLoading(false)
    }
  }, [page, searchQuery, enabled])

  // Reset page to 1 when search query changes
  useEffect(() => {
    if (prevSearchQuery.current !== searchQuery) {
      setPage(1)
      setIsRateLimited(false)
      prevSearchQuery.current = searchQuery
    }
  }, [searchQuery])

  useEffect(() => {
    fetchCharacters().then((r) => r)
  }, [fetchCharacters])

  const nextPage = useCallback(() => {
    if (info && info.next) {
      setPage((prev) => prev + 1)
    }
  }, [info])

  const prevPage = useCallback(() => {
    if (info && info.prev) {
      setPage((prev) => prev - 1)
    }
  }, [info])

  const goToPage = useCallback(
    (pageNumber: number) => {
      // Allow going to page 1 even if info is null yet
      if (
        pageNumber === 1 ||
        (info && pageNumber >= 1 && pageNumber <= info.pages)
      ) {
        setPage(pageNumber)
      }
    },
    [info],
  )

  const retry = useCallback(() => {
    setIsRateLimited(false)
    fetchCharacters()
  }, [fetchCharacters])

  return {
    characters,
    loading,
    error,
    page,
    info,
    nextPage,
    prevPage,
    goToPage,
    refetch: fetchCharacters,
    isRateLimited,
    retry,
  }
}
