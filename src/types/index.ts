export type RMStatus = 'Alive' | 'Dead' | 'unknown'
export type RMGender = 'Female' | 'Male' | 'Genderless' | 'unknown'

export interface RMCharacter {
  id: number
  name: string
  status: RMStatus
  species: string
  type: string
  gender: RMGender
  origin: {
    name: string
    url: string
  }
  location: {
    name: string
    url: string
  }
  image: string
  episode: string[]
  url: string
  created: string
}

export interface RMInfo {
  count: number
  pages: number
  next: string | null
  prev: string | null
}

export interface RMCharacterResponse {
  info: RMInfo
  results: RMCharacter[]
}

// Alias para compatibilidad
export type CharactersResponse = RMCharacterResponse

// MongoDB Types
export interface IUser {
  _id: string
  username: string
  createdAt: Date
  updatedAt: Date
}

export interface IFavorite {
  _id: string
  userId: string
  characterId: number
  character: RMCharacter
  createdAt: Date
  updatedAt: Date
}

export interface CreateFavoriteDto {
  userId: string
  characterId: number
}

export interface GetFavoritesParams {
  userId: string
  page?: number
  limit?: number
}
