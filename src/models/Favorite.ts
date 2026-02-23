import mongoose, { Schema, Model, Document } from 'mongoose'
import type { RMCharacter } from '@/types'

export interface IFavorite extends Document {
  userId: string
  characterId: number
  character: RMCharacter
  createdAt: Date
  updatedAt: Date
}

const FavoriteSchema = new Schema<IFavorite>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    characterId: {
      type: Number,
      required: true,
    },
    character: {
      type: Object,
      required: true,
    },
  },
  {
    timestamps: true,
  },
)

FavoriteSchema.index({ userId: 1, characterId: 1 }, { unique: true })

const Favorite: Model<IFavorite> =
  mongoose.models.Favorite ||
  mongoose.model<IFavorite>('Favorite', FavoriteSchema)

export default Favorite
