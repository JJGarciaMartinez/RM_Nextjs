import React from 'react'
import styles from './Pagination.module.css'
import { Button } from './Button'
import {
  CaretDoubleLeftIcon,
  CaretDoubleRightIcon,
  CaretLeftIcon,
  CaretRightIcon,
} from '@phosphor-icons/react'

export interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  showFirstLast?: boolean
  maxVisiblePages?: number
  className?: string
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  showFirstLast = true,
  maxVisiblePages = 5,
  className,
}: PaginationProps) {
  const getVisiblePages = () => {
    const pages: (number | string)[] = []
    const halfVisible = Math.floor(maxVisiblePages / 2)

    let startPage = Math.max(1, currentPage - halfVisible)
    let endPage = Math.min(totalPages, currentPage + halfVisible)

    if (currentPage <= halfVisible) {
      endPage = Math.min(totalPages, maxVisiblePages)
    }

    if (currentPage + halfVisible >= totalPages) {
      startPage = Math.max(1, totalPages - maxVisiblePages + 1)
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i)
    }

    if (startPage > 1) {
      if (startPage > 2) {
        pages.unshift('...')
      }
      pages.unshift(1)
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push('...')
      }
      pages.push(totalPages)
    }

    return pages
  }

  if (totalPages < 1) return null

  const visiblePages = getVisiblePages()

  return (
    <div className={`${styles.pagination} ${className || ''}`}>
      {showFirstLast && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          aria-label="First page"
        >
          <CaretDoubleLeftIcon />
        </Button>
      )}

      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="Previous page"
      >
        <CaretLeftIcon />
      </Button>

      <div className={styles.pages}>
        {visiblePages.map((page, index) =>
          typeof page === 'number' ? (
            <button
              key={index}
              className={`${styles.pageButton} ${page === currentPage ? styles.active : ''}`}
              onClick={() => onPageChange(page)}
              aria-label={`Page ${page}`}
            >
              {page}
            </button>
          ) : (
            <span key={index} className={styles.ellipsis}>
              {page}
            </span>
          ),
        )}
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="Next page"
      >
        <CaretRightIcon />
      </Button>

      {showFirstLast && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          aria-label="Last page"
        >
          <CaretDoubleRightIcon />
        </Button>
      )}
    </div>
  )
}
