import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import Favorite from '@/models/Favorite'
import User from '@/models/User'

export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get('userId')
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '20', 10)
    const search = searchParams.get('search') || ''
    const skip = (page - 1) * limit

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 })
    }

    await User.findOneAndUpdate(
      { userId },
      { username: `user_${userId}`, userId },
      { upsert: true, new: true },
    )

    const query: {
      userId: string
      'character.name'?: { $regex: string; $options: string }
    } = { userId }

    if (search) {
      query['character.name'] = { $regex: search, $options: 'i' }
    }

    const [favorites, total] = await Promise.all([
      Favorite.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Favorite.countDocuments(query),
    ])

    return NextResponse.json({
      favorites,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching favorites:', error)
    return NextResponse.json(
      { error: 'Failed to fetch favorites' },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const body = await request.json()
    const { userId, characterId, character } = body

    if (!userId || !characterId || !character) {
      return NextResponse.json(
        { error: 'userId, characterId, and character are required' },
        { status: 400 },
      )
    }

    await User.findOneAndUpdate(
      { userId },
      { username: `user_${userId}`, userId },
      { upsert: true, new: true },
    )

    const existingFavorite = await Favorite.findOne({ userId, characterId })
    if (existingFavorite) {
      return NextResponse.json(
        { error: 'Character already in favorites' },
        { status: 409 },
      )
    }

    const favorite = await Favorite.create({
      userId,
      characterId,
      character,
    })

    return NextResponse.json(favorite, { status: 201 })
  } catch (error: any) {
    console.error('Error creating favorite:', error)

    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'Character already in favorites' },
        { status: 409 },
      )
    }

    return NextResponse.json(
      { error: 'Failed to create favorite' },
      { status: 500 },
    )
  }
}
