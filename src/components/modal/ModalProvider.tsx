'use client'

import { ReactNode, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

export interface ModalPortalProps {
  children: ReactNode
  containerId?: string
}

export function ModalPortal({
  children,
  containerId = 'modal-root',
}: ModalPortalProps) {
  const [container, setContainer] = useState<HTMLElement | null>(null)

  useEffect(() => {
    let element = document.getElementById(containerId)

    if (!element) {
      element = document.createElement('div')
      element.id = containerId
      document.body.appendChild(element)
    }

    setContainer(element)

    return () => {
      if (element && element.parentNode === document.body) {
        document.body.removeChild(element)
      }
    }
  }, [containerId])

  if (!container) return null

  return createPortal(children, container)
}

export interface ModalProviderProps {
  children: ReactNode
}

export function ModalProvider({ children }: ModalProviderProps) {
  return <>{children}</>
}
