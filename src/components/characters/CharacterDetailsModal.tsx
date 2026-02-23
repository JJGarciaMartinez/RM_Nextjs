import { RMCharacter, RMStatus } from '@/types'
import { Modal, ModalBody, ModalFooter } from '@/components/modal'
import { Badge } from '@/components/ui'
import { Button } from '@/components/ui'
import { StarIcon } from '@phosphor-icons/react'
import styles from './CharacterDetailsModal.module.css'

export interface CharacterDetailsModalProps {
  character: RMCharacter | null
  open: boolean
  onClose: () => void
  isFavorite?: boolean
  onToggleFavorite?: (character: RMCharacter) => void
}

const statusConfig: Record<
  RMStatus,
  {
    label: string
    variant: 'success' | 'danger' | 'default' | 'info' | 'purple' | 'orange'
  }
> = {
  Alive: { label: 'Alive', variant: 'success' },
  Dead: { label: 'Dead', variant: 'danger' },
  unknown: { label: 'Unknown', variant: 'default' },
}

const typeColors: Record<
  string,
  'success' | 'danger' | 'default' | 'info' | 'purple' | 'orange' | 'warning'
> = {
  Human: 'info',
  Alien: 'purple',
  Robot: 'orange',
  Humanoid: 'info',
  Poopybutthole: 'purple',
  Animal: 'orange',
  'Mythological Creature': 'purple',
  Disease: 'danger',
  Parasite: 'warning',
  unknown: 'default',
}

export function CharacterDetailsModal({
  character,
  open,
  onClose,
  isFavorite = false,
  onToggleFavorite,
}: CharacterDetailsModalProps) {
  if (!character) return null

  const statusInfo = statusConfig[character.status]
  const typeVariant =
    typeColors[character.type] || typeColors[character.species] || 'info'

  const handleToggleFavorite = () => {
    onToggleFavorite?.(character)
  }

  return (
    <Modal open={open} onClose={onClose} size="lg">
      <ModalBody className={styles.modalBody}>
        <div className={styles.content}>
          <div className={styles.imageSection}>
            <img
              src={character.image}
              alt={character.name}
              className={styles.image}
            />
          </div>

          <div className={styles.detailsSection}>
            <div className={styles.detailsHeader}>
              <h2 className={styles.name}>{character.name}</h2>
              {onToggleFavorite && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleToggleFavorite}
                  className={`${styles.favoriteBtn} ${isFavorite ? styles.favorited : ''}`}
                  aria-label={
                    isFavorite ? 'Remove from favorites' : 'Add to favorites'
                  }
                >
                  <StarIcon
                    size={20}
                    weight={isFavorite ? 'fill' : 'regular'}
                  />
                </Button>
              )}
            </div>

            <div className={styles.badges}>
              <Badge size="sm" variant={statusInfo.variant}>
                {statusInfo.label}
              </Badge>
              <Badge size="sm" variant={typeVariant}>
                {character.species}
              </Badge>
              {character.type && (
                <Badge size="sm" variant="warning">
                  {character.type}
                </Badge>
              )}
              <Badge size="sm" variant="default">
                {character.gender}
              </Badge>
            </div>

            <div className={styles.info}>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Origin:</span>
                <span className={styles.infoValue}>
                  {character.origin.name}
                </span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Location:</span>
                <span className={styles.infoValue}>
                  {character.location.name}
                </span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Episodes:</span>
                <span className={styles.infoValue}>
                  {character.episode.length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </ModalBody>

      <ModalFooter align="end">
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
      </ModalFooter>
    </Modal>
  )
}
