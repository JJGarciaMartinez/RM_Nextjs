import { useState, useEffect } from 'react'
import type { RMCharacter } from '@/types'

export function useCharacter(id: number | string | null | undefined) {
  const [character, setCharacter] = useState<RMCharacter | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) {
      setCharacter(null)
      setError(null)
      return
    }

    const fetchCharacter = async () => {
      setLoading(true)
      setError(null)

      try {
        const response = await fetch(`/api/characters/${id}`)

        if (!response.ok) {
          new Error(`Error fetching character: ${response.statusText}`)
        }

        const data: RMCharacter = await response.json()
        setCharacter(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
        setCharacter(null)
      } finally {
        setLoading(false)
      }
    }

    fetchCharacter().then()
  }, [id])

  return { character, loading, error }
}
