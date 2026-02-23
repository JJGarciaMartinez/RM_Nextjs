import { ReactNode, useEffect, useRef } from 'react'
import { XIcon } from '@phosphor-icons/react'
import { Button } from '@/components/ui'
import { ModalPortal } from './ModalProvider'
import styles from './Modal.module.css'

export interface ModalProps {
  open: boolean
  onClose: () => void
  children: ReactNode
  title?: string
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  showCloseButton?: boolean
  closeOnOverlayClick?: boolean
  closeOnEscape?: boolean
  className?: string
  contentClassName?: string
}

export function Modal({
  open,
  onClose,
  children,
  title,
  size = 'md',
  showCloseButton = true,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  className,
  contentClassName,
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)
  const previousActiveElement = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (open) {
      previousActiveElement.current = document.activeElement as HTMLElement
      const modal = modalRef.current
      if (modal) {
        modal.focus()
        focusTrap(modal)
      }
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
      if (previousActiveElement.current) {
        previousActiveElement.current.focus()
      }
    }

    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  useEffect(() => {
    if (!open || !closeOnEscape) return

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [open, closeOnEscape, onClose])

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      onClose()
    }
  }

  if (!open) return null

  return (
    <ModalPortal>
      <div
        className={styles.overlay}
        onClick={handleOverlayClick}
        aria-hidden="false"
      >
        <div
          ref={modalRef}
          className={`${styles.modal} ${styles[size]} ${className || ''}`}
          role="dialog"
          aria-modal="true"
          aria-labelledby={title ? 'modal-title' : undefined}
          tabIndex={-1}
        >
          {(title || showCloseButton) && (
            <div className={styles.header}>
              {title && (
                <h2 id="modal-title" className={styles.title}>
                  {title}
                </h2>
              )}
              {showCloseButton && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  aria-label="Close modal"
                  className={styles.closeButton}
                >
                  <XIcon size={20} weight="bold" />
                </Button>
              )}
            </div>
          )}
          <div className={`${styles.content} ${contentClassName || ''}`}>
            {children}
          </div>
        </div>
      </div>
    </ModalPortal>
  )
}

function focusTrap(element: HTMLElement) {
  const focusableElements = element.querySelectorAll(
    'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
  )

  const firstElement = focusableElements[0] as HTMLElement
  const lastElement = focusableElements[
    focusableElements.length - 1
  ] as HTMLElement

  const handleTabKey = (e: KeyboardEvent) => {
    if (e.key !== 'Tab') return

    if (e.shiftKey) {
      if (document.activeElement === firstElement) {
        e.preventDefault()
        lastElement?.focus()
      }
    } else {
      if (document.activeElement === lastElement) {
        e.preventDefault()
        firstElement?.focus()
      }
    }
  }

  element.addEventListener('keydown', handleTabKey)
  return () => element.removeEventListener('keydown', handleTabKey)
}

export interface ModalHeaderProps {
  children: ReactNode
  className?: string
}

export function ModalHeader({ children, className }: ModalHeaderProps) {
  return (
    <div className={`${styles.modalHeader} ${className || ''}`}>{children}</div>
  )
}

export interface ModalBodyProps {
  children: ReactNode
  className?: string
}

export function ModalBody({ children, className }: ModalBodyProps) {
  return (
    <div className={`${styles.modalBody} ${className || ''}`}>{children}</div>
  )
}

export interface ModalFooterProps {
  children: ReactNode
  className?: string
  align?: 'start' | 'center' | 'end' | 'space-between'
}

export function ModalFooter({
  children,
  className,
  align = 'end',
}: ModalFooterProps) {
  return (
    <div
      className={`${styles.modalFooter} ${styles[align]} ${className || ''}`}
    >
      {children}
    </div>
  )
}
