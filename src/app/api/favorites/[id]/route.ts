import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import Favorite from '@/models/Favorite'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await connectDB()

    const { id } = await params
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 })
    }

    const favorite = await Favorite.findOneAndDelete({
      _id: id,
      userId,
    })

    if (!favorite) {
      return NextResponse.json(
        {
          error: "Favorite not found or you don't have permission to delete it",
        },
        { status: 404 },
      )
    }

    return NextResponse.json({ message: 'Favorite removed successfully' })
  } catch (error) {
    console.error('Error deleting favorite:', error)
    return NextResponse.json(
      { error: 'Failed to delete favorite' },
      { status: 500 },
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await connectDB()

    const { id } = await params
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 })
    }

    const characterId = parseInt(id, 10)

    const favorite = await Favorite.findOne({
      userId,
      characterId,
    })

    return NextResponse.json({
      isFavorited: !!favorite,
      favorite: favorite || null,
    })
  } catch (error) {
    console.error('Error checking favorite:', error)
    return NextResponse.json(
      { error: 'Failed to check favorite' },
      { status: 500 },
    )
  }
}
