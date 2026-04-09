'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { getFavoritos, addFavorito, removeFavorito } from '@/lib/favoritos'

interface FavoritesContextType {
  favoriteIds: Set<string>
  loading: boolean
  toggleFavorito: (id_prenda: string) => Promise<void>
  isFavorito: (id_prenda: string) => boolean
}

const FavoritesContext = createContext<FavoritesContextType>({
  favoriteIds: new Set(),
  loading: true,
  toggleFavorito: async () => {},
  isFavorito: () => false,
})

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)

  // Carga inicial desde Supabase
  useEffect(() => {
    getFavoritos().then((ids) => {
      setFavoriteIds(new Set(ids))
      setLoading(false)
    })
  }, [])

  const toggleFavorito = useCallback(async (id_prenda: string) => {
    const isCurrentlyFav = favoriteIds.has(id_prenda)

    // Optimistic update -- cambia la UI antes de esperar la respuesta
    setFavoriteIds((prev) => {
      const next = new Set(prev)
      if (isCurrentlyFav) {
        next.delete(id_prenda)
      } else {
        next.add(id_prenda)
      }
      return next
    })

    // Sync con Supabase
    const ok = isCurrentlyFav
      ? await removeFavorito(id_prenda)
      : await addFavorito(id_prenda)

    // Si falla, revertimos
    if (!ok) {
      setFavoriteIds((prev) => {
        const next = new Set(prev)
        if (isCurrentlyFav) {
          next.add(id_prenda)
        } else {
          next.delete(id_prenda)
        }
        return next
      })
    }
  }, [favoriteIds])

  const isFavorito = useCallback(
    (id_prenda: string) => favoriteIds.has(id_prenda),
    [favoriteIds]
  )

  return (
    <FavoritesContext.Provider value={{ favoriteIds, loading, toggleFavorito, isFavorito }}>
      {children}
    </FavoritesContext.Provider>
  )
}

export function useFavorites() {
  return useContext(FavoritesContext)
}
