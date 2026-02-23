'use client'

import styles from './page.module.css'
import { useState } from 'react'
import { useUserId, useUserFavorites, useFavorites } from '@/hooks'
import { CharacterList } from '@/components/characters'
import { Button, Pagination } from '@/components/ui'
import { ArrowLeftIcon } from '@phosphor-icons/react'
import { RMCharacter } from '@/types'
import { useRouter } from 'next/navigation'
import { SearchBar } from '@/components/search'

export default function FavoritesPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  const userId = useUserId()
  const router = useRouter()

  const { favorites, loading, pagination, refetch } = useUserFavorites(
    userId,
    currentPage,
    20,
    searchTerm,
  )

  const { toggleFavorite, isFavorited } = useFavorites()

  const totalPages = pagination?.pages || 0

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage)
    }
  }

  const handleCharacterClick = async (character: RMCharacter) => {
    if (!userId) return

    await toggleFavorite(userId, character)
    refetch()
  }

  const handleBackClick = () => {
    router.push('/')
  }

  const handleSearchChange = (value: string) => {
    setSearchTerm(value)
    setCurrentPage(1)
  }

  const favoriteCharacters: RMCharacter[] = favorites.map((f) => f.character)

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <header className={styles.header}>
          <div className={styles.headerTop}>
            <p className={styles.title}>Mis Favoritos</p>
            <p className={styles.subtitle}>
              Personajes de Rick y Morty guardados
            </p>
          </div>

          <div className={styles.headerActions}>
            <Button variant="outline" onClick={handleBackClick}>
              <ArrowLeftIcon size={16} />
              Volver
            </Button>
          </div>
        </header>

        <div className={styles.controls}>
          <div className={styles.searchContainer}>
            <SearchBar
              value={searchTerm}
              onChange={(e) => handleSearchChange(e)}
            />
          </div>
          {favorites && favorites.length > 0 && (
            <div className={styles.favoritesInfo}>
              <span className={styles.favoritesCount}>
                {pagination.total} personaje{pagination.total !== 1 ? 's' : ''}{' '}
                guardado{pagination.total !== 1 ? 's' : ''}
                {searchTerm && ' (filtrados)'}
              </span>
            </div>
          )}
        </div>

        <CharacterList
          loading={loading}
          characters={favoriteCharacters}
          viewMode={'grid'}
          onCharacterClick={handleCharacterClick}
          onToggleFavorite={handleCharacterClick}
          isFavorite={isFavorited}
          emptyMessage={
            searchTerm
              ? 'No se encontraron favoritos con ese nombre.'
              : 'No tienes favoritos aún. Explora y añade tus personajes favoritos.'
          }
          errorMessage="Error al cargar favoritos"
        />

        <div className={styles.paginationWrapper}>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      </main>
    </div>
  )
}
