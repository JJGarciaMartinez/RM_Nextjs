import { ReactNode } from 'react'
import styles from './Card.module.css'

export interface CardProps {
  children: ReactNode
  className?: string
  variant?: 'default' | 'outlined' | 'elevated'
  hoverable?: boolean
  onClick?: () => void
}

export function Card({
  children,
  className,
  variant = 'default',
  hoverable = false,
  onClick,
}: CardProps) {
  return (
    <div
      className={`${styles.card} ${styles[variant]} ${hoverable ? styles.hoverable : ''} ${className || ''}`}
      onClick={onClick}
    >
      {children}
    </div>
  )
}

export interface CardHeaderProps {
  children: ReactNode
  className?: string
}

export function CardHeader({ children, className }: CardHeaderProps) {
  return <div className={`${styles.header} ${className || ''}`}>{children}</div>
}

export interface CardBodyProps {
  children: ReactNode
  className?: string
}

export function CardBody({ children, className }: CardBodyProps) {
  return <div className={`${styles.body} ${className || ''}`}>{children}</div>
}

export interface CardFooterProps {
  children: ReactNode
  className?: string
}

export function CardFooter({ children, className }: CardFooterProps) {
  return <div className={`${styles.footer} ${className || ''}`}>{children}</div>
}

export interface CardTitleProps {
  children: ReactNode
  className?: string
}

export function CardTitle({ children, className }: CardTitleProps) {
  return <h3 className={`${styles.title} ${className || ''}`}>{children}</h3>
}

export interface CardSubtitleProps {
  children: ReactNode
  className?: string
}

export function CardSubtitle({ children, className }: CardSubtitleProps) {
  return <p className={`${styles.subtitle} ${className || ''}`}>{children}</p>
}
