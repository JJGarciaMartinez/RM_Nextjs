import { NextRequest, NextResponse } from 'next/server'
import { rickAndMortyApi } from '@/lib/rickAndMortyApi'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const characterId = parseInt(id, 10)

    if (isNaN(characterId)) {
      return NextResponse.json(
        { error: 'Invalid character ID' },
        { status: 400 },
      )
    }

    const character = await rickAndMortyApi.getCharacter(characterId)

    return NextResponse.json(character)
  } catch (error) {
    console.error('Error fetching character:', error)
    return NextResponse.json(
      { error: 'Failed to fetch character from Rick and Morty API' },
      { status: 500 },
    )
  }
}
