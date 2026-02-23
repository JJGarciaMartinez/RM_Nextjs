import { Skeleton } from '@/components/ui'
import styles from './CharacterCardSkeleton.module.css'

export function CharacterCardSkeleton() {
  return (
    <div className={styles.skeletonCard}>
      <div className={styles.imageContainer}>
        <Skeleton variant="rectangular" className={styles.imageSkeleton} />
      </div>
      <div className={styles.body}>
        <div className={styles.header}>
          <Skeleton variant="text" width="70%" height={22} />
          <Skeleton variant="rectangular" width={60} height={24} />
        </div>
        <div className={styles.info}>
          <div className={styles.infoItem}>
            <Skeleton variant="text" width={60} height={16} />
            <Skeleton variant="text" width={80} height={16} />
          </div>
        </div>
      </div>
    </div>
  )
}

export function CharacterCardSkeletonCompact() {
  return (
    <div className={styles.compactSkeleton}>
      <Skeleton variant="rounded" width={64} height={64} />
      <div className={styles.compactInfo}>
        <Skeleton variant="text" width="75%" height={20} />
        <Skeleton variant="text" width="50%" height={16} />
      </div>
      <Skeleton variant="circular" width={40} height={40} />
    </div>
  )
}
