import { NextRequest, NextResponse } from 'next/server'
import { rickAndMortyApi } from '@/lib/rickAndMortyApi'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams

    const page = parseInt(searchParams.get('page') || '1', 10)
    const name = searchParams.get('name') || undefined
    const status = searchParams.get('status') || undefined
    const species = searchParams.get('species') || undefined
    const type = searchParams.get('type') || undefined
    const gender = searchParams.get('gender') || undefined

    const data = await rickAndMortyApi.getCharacters(page, {
      name,
      status,
      species,
      type,
      gender,
    })

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching characters:', error)

    if (error instanceof Error && error.message.includes('Rate limit')) {
      return NextResponse.json(
        {
          error: 'Too many requests. Please wait a moment before trying again.',
        },
        { status: 429 },
      )
    }

    if (
      error instanceof Error &&
      error.message.includes('No characters found')
    ) {
      return NextResponse.json(
        {
          error: 'No characters found with the given criteria.',
          results: [],
          info: { count: 0, pages: 0, next: null, prev: null },
        },
        { status: 404 },
      )
    }

    return NextResponse.json(
      { error: 'Failed to fetch characters from Rick and Morty API' },
      { status: 500 },
    )
  }
}
