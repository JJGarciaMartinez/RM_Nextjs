'use client'

import styles from './page.module.css'
import { SearchBar } from '@/components/search'
import React, { useState } from 'react'
import { useCharacters, useUserId, useFavorites } from '@/hooks'
import { CharacterList } from '@/components/characters'
import { Button, Pagination } from '@/components/ui'
import { StarIcon } from '@phosphor-icons/react'
import { RMCharacter } from '@/types'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { CharacterDetailsModal } from '@/components/characters'

export default function Home() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [searchTerm, setSearchTerm] = useState(
    () => searchParams.get('search') || '',
  )
  const [currentPage, setCurrentPage] = useState(
    () => Number(searchParams.get('page')) || 1,
  )
  const [selectedCharacter, setSelectedCharacter] =
    useState<RMCharacter | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const userId = useUserId()

  const { characters, loading, info, page, goToPage, isRateLimited, retry } =
    useCharacters({
      searchQuery: searchTerm,
      initialPage: currentPage,
    })

  const { toggleFavorite, isFavorited } = useFavorites()

  const totalPages = info?.pages || 0

  const handleSearchChange = (newSearchTerm: string) => {
    const params = new URLSearchParams(searchParams.toString())

    if (newSearchTerm) {
      params.set('search', newSearchTerm)
    } else {
      params.delete('search')
    }
    params.delete('page')

    router.push(`${pathname}?${params.toString()}`)
    setSearchTerm(newSearchTerm)
    setCurrentPage(1)
  }

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return

    const params = new URLSearchParams(searchParams.toString())
    params.set('page', newPage.toString())

    router.push(`${pathname}?${params.toString()}`)
    goToPage(newPage)
    setCurrentPage(newPage)
  }

  const handleCharacterDetailsClick = (character: RMCharacter) => {
    setSelectedCharacter(character)
    setIsModalOpen(true)
  }

  const handleCharacterFavorite = async (character: RMCharacter) => {
    if (!userId) return

    await toggleFavorite(userId, character)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedCharacter(null)
  }

  const handleFavoriteButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    router.push('/favorites')
  }

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <header className={styles.header}>
          <div className={styles.headerTop}>
            <p className={styles.title}>Wubba lubba dub dub!</p>
            <p className={styles.subtitle}>
              Base de datos de personajes de Rick y Morty
            </p>
          </div>
          <span className={styles.headerActions}>
            <SearchBar
              placeholder="Buscar..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e)}
            />
            <Button
              className={styles.favoritesButton}
              variant="secondary"
              onClick={handleFavoriteButtonClick}
            >
              <p>Mis favoritos</p>
              <span>
                <StarIcon size={16} />
              </span>
            </Button>
          </span>
        </header>

        <CharacterList
          loading={loading}
          characters={characters}
          viewMode={'grid'}
          isRateLimited={isRateLimited}
          onRetry={retry}
          onCharacterClick={handleCharacterDetailsClick}
          onToggleFavorite={handleCharacterFavorite}
          isFavorite={isFavorited}
        />

        {!loading && !isRateLimited && totalPages > 1 && (
          <div className={styles.paginationWrapper}>
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </main>

      <CharacterDetailsModal
        character={selectedCharacter}
        open={isModalOpen}
        onClose={handleCloseModal}
        isFavorite={
          selectedCharacter ? isFavorited(selectedCharacter.id) : false
        }
        onToggleFavorite={handleCharacterFavorite}
      />
    </div>
  )
}
