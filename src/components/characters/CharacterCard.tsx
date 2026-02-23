import { RMCharacter, RMStatus } from '@/types'
import { Card, CardBody, CardFooter } from '@/components/ui'
import { Badge } from '@/components/ui'
import styles from './CharacterCard.module.css'
import React from 'react'
import { StarIcon } from '@phosphor-icons/react'

export interface CharacterCardProps {
  character: RMCharacter
  isFavorite?: boolean
  onToggleFavorite?: (character: RMCharacter) => void
  onClick?: (character: RMCharacter) => void
  variant?: 'default' | 'compact'
}

const statusConfig: Record<
  RMStatus,
  { label: string; variant: 'success' | 'danger' | 'default' }
> = {
  Alive: { label: 'Alive', variant: 'success' },
  Dead: { label: 'Dead', variant: 'danger' },
  unknown: { label: 'Unknown', variant: 'default' },
}

export function CharacterCard({
  character,
  isFavorite = false,
  onToggleFavorite,
  onClick,
  variant = 'default',
}: CharacterCardProps) {
  const statusInfo = statusConfig[character.status]

  const handleClick = () => {
    onClick?.(character)
  }

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onToggleFavorite?.(character)
  }

  if (variant === 'compact') {
    return (
      <Card
        className={`${styles.compactCard} ${isFavorite ? styles.favorited : ''}`}
        hoverable={!!onClick}
        onClick={handleClick}
      >
        <CardBody className={styles.compactBody}>
          <img
            src={character.image}
            alt={character.name}
            className={styles.compactImage}
            loading="lazy"
          />
          <div className={styles.compactInfo}>
            <div className={styles.compactHeader}>
              <h3 className={styles.compactName}>{character.name}</h3>
              <Badge size="sm" variant={statusInfo.variant}>
                {statusInfo.label}
              </Badge>
            </div>
            <p className={styles.compactSpecies}>{character.species}</p>
          </div>

          <button
            className={`${styles.favoriteButton} ${isFavorite ? styles.active : ''}`}
            onClick={handleFavoriteClick}
            aria-label={
              isFavorite ? 'Remove from favorites' : 'Add to favorites'
            }
          >
            <span className={styles.heartIcon}>{isFavorite ? '♥' : '♡'}</span>
          </button>
        </CardBody>
      </Card>
    )
  }

  return (
    <Card
      className={`${styles.card} ${isFavorite ? styles.favorited : ''}`}
      hoverable={!!onClick}
      onClick={handleClick}
    >
      <div className={styles.imageContainer}>
        <img
          src={character.image}
          alt={character.name}
          className={styles.image}
          loading="lazy"
        />
      </div>

      <CardFooter className={styles.footer}>
        <span className={styles.characterNameContainer}>
          <h3 className={styles.name}>{character.name}</h3>
        </span>
        <button className={styles.favoriteButton} onClick={handleFavoriteClick}>
          <span className={styles.heartIcon}>
            {isFavorite ? (
              <StarIcon size={14} weight="fill" />
            ) : (
              <StarIcon size={14} weight="regular" />
            )}
          </span>
        </button>
      </CardFooter>
    </Card>
  )
}
