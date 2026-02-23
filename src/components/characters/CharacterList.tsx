import { RMCharacter } from '@/types'
import { CharacterCard } from './CharacterCard'
import {
  CharacterCardSkeleton,
  CharacterCardSkeletonCompact,
} from './CharacterCardSkeleton'
import styles from './CharacterList.module.css'
import { Button } from '@/components/ui'

export type ViewMode = 'grid' | 'list'

export interface CharacterListProps {
  characters: RMCharacter[]
  loading?: boolean
  error?: string | null
  isRateLimited?: boolean
  onRetry?: () => void
  viewMode?: ViewMode
  onCharacterClick?: (character: RMCharacter) => void
  onToggleFavorite?: (character: RMCharacter) => void
  isFavorite?: (characterId: number) => boolean
  emptyMessage?: string
  errorMessage?: string
  className?: string
}

export function CharacterList({
  characters,
  loading = false,
  error = null,
  isRateLimited = false,
  onRetry,
  viewMode = 'grid',
  onCharacterClick,
  onToggleFavorite,
  isFavorite,
  emptyMessage = 'No characters found',
  errorMessage = 'Failed to load characters',
  className,
}: CharacterListProps) {
  if (isRateLimited) {
    return (
      <div className={`${styles.container} ${className || ''}`}>
        <div className={styles.error}>
          <p className={styles.errorText}>{errorMessage}</p>
          <p className={styles.errorSubtext}>
            Too many requests. The Rick and Morty API has a rate limit. Please
            wait a moment and try again.
          </p>
          {onRetry && (
            <Button onClick={onRetry} variant="primary" size="md">
              Retry
            </Button>
          )}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`${styles.container} ${className || ''}`}>
        <div className={styles.error}>
          <p className={styles.errorText}>{errorMessage}</p>
          <p className={styles.errorSubtext}>{error}</p>
          {onRetry && (
            <Button onClick={onRetry} variant="outline" size="md">
              Retry
            </Button>
          )}
        </div>
      </div>
    )
  }

  if (loading && characters && characters?.length === 0) {
    const skeletonCount = viewMode === 'grid' ? 8 : 5
    const SkeletonComponent =
      viewMode === 'grid' ? CharacterCardSkeleton : CharacterCardSkeletonCompact

    return (
      <div
        className={`${styles.container} ${styles[viewMode]} ${className || ''}`}
      >
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <SkeletonComponent key={i} />
        ))}
      </div>
    )
  }

  if (characters && characters?.length === 0) {
    return (
      <div className={`${styles.container} ${className || ''}`}>
        <div className={styles.empty}>
          <p className={styles.emptyText}>{emptyMessage}</p>
        </div>
      </div>
    )
  }

  return (
    <div
      className={`${styles.container} ${styles[viewMode]} ${className || ''}`}
    >
      {characters &&
        characters.map((character) => {
          const favorite = isFavorite?.(character.id)

          return (
            <CharacterCard
              key={character.id}
              character={character}
              variant={'default'}
              onClick={onCharacterClick}
              onToggleFavorite={onToggleFavorite}
              isFavorite={favorite}
            />
          )
        })}
    </div>
  )
}
