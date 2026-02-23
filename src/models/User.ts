import mongoose, { Schema, Model } from 'mongoose'

export interface IUser {
  _id: mongoose.Types.ObjectId
  userId: string
  username: string
  createdAt: Date
  updatedAt: Date
}

const UserSchema = new Schema<IUser>(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
)

delete mongoose.models.User

const User: Model<IUser> = mongoose.model<IUser>('User', UserSchema)

export default User
