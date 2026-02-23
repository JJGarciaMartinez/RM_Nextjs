import React from 'react'
import styles from './Skeleton.module.css'

export interface SkeletonProps {
  className?: string
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded'
  width?: string | number
  height?: string | number
  animation?: 'pulse' | 'wave' | 'none'
}

export function Skeleton({
  className,
  variant = 'rectangular',
  width,
  height,
  animation = 'pulse',
}: SkeletonProps) {
  const style: React.CSSProperties = {
    width: width ?? undefined,
    height: height ?? undefined,
  }

  return (
    <div
      className={`${styles.skeleton} ${styles[variant]} ${styles[animation]} ${className || ''}`}
      style={style}
    />
  )
}

export interface SkeletonTextProps {
  lines?: number
  className?: string
}

export function SkeletonText({ lines = 3, className }: SkeletonTextProps) {
  return (
    <div className={`${styles.textContainer} ${className || ''}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          variant="text"
          height={16}
          style={{ width: i === lines - 1 ? '60%' : '100%' }}
        />
      ))}
    </div>
  )
}

export interface SkeletonCardProps {
  className?: string
}

export function SkeletonCard({ className }: SkeletonCardProps) {
  return (
    <div className={`${styles.card} ${className || ''}`}>
      <Skeleton
        variant="rectangular"
        height={200}
        className={styles.cardImage}
      />
      <div className={styles.cardContent}>
        <Skeleton
          variant="text"
          width="80%"
          height={24}
          className={styles.cardTitle}
        />
        <Skeleton variant="text" width="60%" height={16} />
        <div className={styles.cardActions}>
          <Skeleton variant="rectangular" width={80} height={32} />
          <Skeleton variant="circular" width={32} height={32} />
        </div>
      </div>
    </div>
  )
}
