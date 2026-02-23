import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { CharacterCard } from '../CharacterCard'
import type { RMCharacter } from '@/types'
import '@testing-library/jest-dom'
import React from 'react'

vi.mock('@/components/ui', () => ({
  Card: ({
    children,
    className,
    onClick,
  }: {
    children: React.ReactNode
    className?: string
    onClick?: () => void
  }) => (
    <div className={className} onClick={onClick} data-testid="card">
      {children}
    </div>
  ),
  CardBody: ({
    children,
    className,
  }: {
    children: React.ReactNode
    className?: string
  }) => <div className={className}>{children}</div>,
  CardFooter: ({
    children,
    className,
  }: {
    children: React.ReactNode
    className?: string
  }) => <div className={className}>{children}</div>,
  Badge: ({
    children,
    variant,
    size,
  }: {
    children: React.ReactNode
    variant?: string
    size?: string
  }) => (
    <span data-variant={variant} data-size={size}>
      {children}
    </span>
  ),
}))

const mockCharacter: RMCharacter = {
  id: 1,
  name: 'Rick Sanchez',
  status: 'Alive',
  species: 'Human',
  type: '',
  gender: 'Male',
  origin: { name: 'Earth', url: '' },
  location: { name: 'Earth', url: '' },
  image: 'https://rickandmortyapi.com/api/character/avatar/1.jpeg',
  episode: [],
  url: '',
  created: '',
}

const mockCharacterDead: RMCharacter = {
  ...mockCharacter,
  id: 2,
  name: 'Dead Character',
  status: 'Dead',
}

const mockCharacterUnknown: RMCharacter = {
  ...mockCharacter,
  id: 3,
  name: 'Unknown Character',
  status: 'unknown',
}

describe('CharacterCard', () => {
  describe('renderizado básico - variante default', () => {
    it('debería renderizar la información del personaje', () => {
      render(<CharacterCard character={mockCharacter} />)

      expect(screen.getByText('Rick Sanchez')).toBeInTheDocument()
      expect(screen.getByAltText('Rick Sanchez')).toBeInTheDocument()
    })

    it('debería mostrar la imagen del personaje', () => {
      render(<CharacterCard character={mockCharacter} />)

      const img = screen.getByAltText('Rick Sanchez')
      expect(img).toHaveAttribute(
        'src',
        'https://rickandmortyapi.com/api/character/avatar/1.jpeg',
      )
    })

    it('debería tener loading="lazy" en la imagen', () => {
      render(<CharacterCard character={mockCharacter} />)

      const img = screen.getByAltText('Rick Sanchez')
      expect(img).toHaveAttribute('loading', 'lazy')
    })

    it('debería tener botón de favorito', () => {
      render(<CharacterCard character={mockCharacter} />)

      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThan(0)
    })

    it('debería llamar onToggleFavorite al hacer click en el botón de favorito', () => {
      const onToggleFavorite = vi.fn()

      render(
        <CharacterCard
          character={mockCharacter}
          onToggleFavorite={onToggleFavorite}
        />,
      )

      const buttons = screen.getAllByRole('button')
      fireEvent.click(buttons[0])

      expect(onToggleFavorite).toHaveBeenCalled()
    })

    it('no debería propagar el click al hacer click en favorito', () => {
      const onToggleFavorite = vi.fn()
      const onClick = vi.fn()

      render(
        <CharacterCard
          character={mockCharacter}
          onToggleFavorite={onToggleFavorite}
          onClick={onClick}
        />,
      )

      const buttons = screen.getAllByRole('button')
      fireEvent.click(buttons[0])

      expect(onToggleFavorite).toHaveBeenCalled()
      expect(onClick).not.toHaveBeenCalled()
    })
  })

  describe('click en la tarjeta', () => {
    it('debería llamar onClick al hacer click en la tarjeta', () => {
      const onClick = vi.fn()

      render(<CharacterCard character={mockCharacter} onClick={onClick} />)

      const card = screen.getByTestId('card')
      fireEvent.click(card)

      expect(onClick).toHaveBeenCalledWith(mockCharacter)
    })

    it('no debería lanzar error si onClick no se proporciona', () => {
      render(<CharacterCard character={mockCharacter} />)

      const card = screen.getByTestId('card')
      expect(() => fireEvent.click(card)).not.toThrow()
    })
  })

  describe('variante compact', () => {
    it('debería renderizar en variante compact', () => {
      render(<CharacterCard character={mockCharacter} variant="compact" />)

      expect(screen.getByText('Rick Sanchez')).toBeInTheDocument()
      expect(screen.getByText('Human')).toBeInTheDocument()
      expect(screen.getByText('Alive')).toBeInTheDocument()
    })

    it('debería mostrar la especie en variante compact', () => {
      render(<CharacterCard character={mockCharacter} variant="compact" />)

      expect(screen.getByText('Human')).toBeInTheDocument()
    })

    it('debería mostrar el badge de estado correcto', () => {
      const { rerender } = render(
        <CharacterCard character={mockCharacter} variant="compact" />,
      )

      expect(screen.getByText('Alive')).toHaveAttribute(
        'data-variant',
        'success',
      )

      rerender(
        <CharacterCard character={mockCharacterDead} variant="compact" />,
      )
      expect(screen.getByText('Dead')).toHaveAttribute('data-variant', 'danger')

      rerender(
        <CharacterCard character={mockCharacterUnknown} variant="compact" />,
      )
      expect(screen.getByText('Unknown')).toHaveAttribute(
        'data-variant',
        'default',
      )
    })

    it('debería mostrar corazón cuando no es favorito', () => {
      render(
        <CharacterCard
          character={mockCharacter}
          variant="compact"
          isFavorite={false}
        />,
      )

      expect(screen.getByText('♡')).toBeInTheDocument()
    })

    it('debería mostrar corazón relleno cuando es favorito', () => {
      render(
        <CharacterCard
          character={mockCharacter}
          variant="compact"
          isFavorite={true}
        />,
      )

      expect(screen.getByText('♥')).toBeInTheDocument()
    })

    it('debería tener aria-label correcto cuando no es favorito (compact)', () => {
      render(
        <CharacterCard
          character={mockCharacter}
          variant="compact"
          isFavorite={false}
        />,
      )

      const buttons = screen.getAllByRole('button')
      const favButton = buttons.find((b) =>
        b.getAttribute('aria-label')?.includes('favorite'),
      )
      expect(favButton?.getAttribute('aria-label')).toBe('Add to favorites')
    })

    it('debería tener aria-label correcto cuando es favorito (compact)', () => {
      render(
        <CharacterCard
          character={mockCharacter}
          variant="compact"
          isFavorite={true}
        />,
      )

      const buttons = screen.getAllByRole('button')
      const favButton = buttons.find((b) =>
        b.getAttribute('aria-label')?.includes('favorite'),
      )
      expect(favButton?.getAttribute('aria-label')).toBe(
        'Remove from favorites',
      )
    })
  })

  describe('accesibilidad', () => {
    it('debería tener alt text correcto en la imagen', () => {
      render(<CharacterCard character={mockCharacter} />)

      const img = screen.getByAltText('Rick Sanchez')
      expect(img).toBeInTheDocument()
    })
  })

  describe('variantes de status', () => {
    it('debería mostrar status Alive con badge success', () => {
      render(<CharacterCard character={mockCharacter} variant="compact" />)

      expect(screen.getByText('Alive')).toHaveAttribute(
        'data-variant',
        'success',
      )
    })

    it('debería mostrar status Dead con badge danger', () => {
      render(<CharacterCard character={mockCharacterDead} variant="compact" />)

      expect(screen.getByText('Dead')).toHaveAttribute('data-variant', 'danger')
    })

    it('debería mostrar status unknown con badge default', () => {
      render(
        <CharacterCard character={mockCharacterUnknown} variant="compact" />,
      )

      expect(screen.getByText('Unknown')).toHaveAttribute(
        'data-variant',
        'default',
      )
    })
  })
})
