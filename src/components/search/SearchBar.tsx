import React, { useState, useCallback, useRef } from 'react'
import { MagnifyingGlassIcon, XIcon } from '@phosphor-icons/react'
import styles from './SearchBar.module.css'

export interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  debounceMs?: number
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export function SearchBar({
  value,
  onChange,
  placeholder = 'Search...',
  debounceMs = 300,
  className,
  size = 'md',
}: SearchBarProps) {
  const [localValue, setLocalValue] = useState(value)
  const timeoutRef = useRef<NodeJS.Timeout>(null)

  const handleChange = useCallback(
    (newValue: string) => {
      setLocalValue(newValue)

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      timeoutRef.current = setTimeout(() => {
        onChange(newValue)
      }, debounceMs)
    },
    [onChange, debounceMs],
  )

  const handleClear = useCallback(() => {
    setLocalValue('')
    onChange('')
  }, [onChange])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Escape') {
        handleClear()
      }
    },
    [handleClear],
  )

  return (
    <div className={`${styles.searchBar} ${styles[size]} ${className || ''}`}>
      <MagnifyingGlassIcon
        className={styles.searchIcon}
        size={20}
        weight="bold"
      />
      <input
        type="text"
        value={localValue}
        onChange={(e) => handleChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={styles.input}
      />
      {localValue && (
        <button
          type="button"
          className={styles.clearButton}
          onClick={handleClear}
          aria-label="Clear search"
        >
          <XIcon size={18} weight="bold" />
        </button>
      )}
    </div>
  )
}
