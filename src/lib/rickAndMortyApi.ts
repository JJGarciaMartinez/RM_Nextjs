import type { RMCharacter, RMCharacterResponse } from '@/types'

const API_BASE_URL = 'https://rickandmortyapi.com/api'

const cache = new Map<
  string,
  { data: RMCharacterResponse; timestamp: number }
>()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

function getCacheKey(
  page: number,
  filters?: {
    name?: string
    status?: string
    species?: string
    type?: string
    gender?: string
  },
): string {
  const filtersStr = filters ? JSON.stringify(filters) : ''
  return `characters-${page}-${filtersStr}`
}

function getFromCache(key: string): RMCharacterResponse | null {
  const cached = cache.get(key)
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data
  }
  if (cached) {
    cache.delete(key)
  }
  return null
}

function setCache(key: string, data: RMCharacterResponse): void {
  cache.set(key, { data, timestamp: Date.now() })
}

export class RickAndMortyAPI {
  private readonly baseUrl: string

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl
  }

  async getCharacters(
    page: number = 1,
    filters?: {
      name?: string
      status?: string
      species?: string
      type?: string
      gender?: string
    },
  ): Promise<RMCharacterResponse> {
    const cacheKey = getCacheKey(page, filters)
    const cached = getFromCache(cacheKey)

    if (cached) {
      console.log('Returning cached data for:', cacheKey)
      return cached
    }

    const params = new URLSearchParams({ page: page.toString() })

    if (filters?.name) params.append('name', filters.name)
    if (filters?.status) params.append('status', filters.status)
    if (filters?.species) params.append('species', filters.species)
    if (filters?.type) params.append('type', filters.type)
    if (filters?.gender) params.append('gender', filters.gender)

    const response = await fetch(
      `${this.baseUrl}/character?${params.toString()}`,
    )

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error(
          'Rate limit exceeded. Please wait a moment before trying again.',
        )
      }
      if (response.status === 404) {
        throw new Error('No characters found with the given criteria.')
      }
      throw new Error(`API error: ${response.status}`)
    }

    const data = await response.json()
    setCache(cacheKey, data)
    return data
  }

  async getCharacter(id: number): Promise<RMCharacter> {
    const cacheKey = `character-${id}`
    const cached = cache.get(cacheKey) as
      | { data: RMCharacter; timestamp: number }
      | undefined

    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data
    }

    const response = await fetch(`${this.baseUrl}/character/${id}`)

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error(
          'Rate limit exceeded. Please wait a moment before trying again.',
        )
      }
      if (response.status === 404) {
        throw new Error('Character not found.')
      }
      throw new Error(`API error: ${response.status}`)
    }

    const data = await response.json()
    cache.set(cacheKey, { data, timestamp: Date.now() })
    return data
  }
}

export const rickAndMortyApi = new RickAndMortyAPI()
