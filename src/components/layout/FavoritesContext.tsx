'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { getFavoritos, addFavorito, removeFavorito } from '@/lib/favoritos'
import { createClient } from '@/lib/supabase/client'
import { useNotificationsContext } from '@/components/layout/NotificationsContext'

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
  const { addLocalNotification } = useNotificationsContext()

  // Carga inicial desde Supabase
  useEffect(() => {
    getFavoritos().then((ids) => {
      setFavoriteIds(new Set(ids))
      setLoading(false)
    })
  }, [])

  const toggleFavorito = useCallback(async (id_prenda: string) => {
    const isCurrentlyFav = favoriteIds.has(id_prenda)

    // Optimistic update — cambia la UI antes de esperar la respuesta
    setFavoriteIds((prev) => {
      const next = new Set(prev)
      if (isCurrentlyFav) {
        next.delete(id_prenda)
      } else {
        next.add(id_prenda)
      }
      return next
    })

    // Si se está AGREGANDO: mostrar notificación inmediatamente (antes de confirmar Supabase)
    if (!isCurrentlyFav) {
      addLocalNotification({
        tipo: 'favorito',
        titulo: '❤️ Prenda añadida a favoritos',
        cuerpo: 'La prenda fue guardada en tu lista de favoritos. Puedes verla en Mis Favoritos.',
        leida: false,
      })
    }

    // Sync con Supabase
    const ok = isCurrentlyFav
      ? await removeFavorito(id_prenda)
      : await addFavorito(id_prenda)

    // Si falla, revertimos el estado optimista
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
      return
    }

    // Si se agregó exitosamente, también la persistimos en Supabase para el historial
    if (!isCurrentlyFav && ok) {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          await supabase.from('notificaciones').insert({
            usuario_id: user.id,
            tipo: 'favorito',
            titulo: '❤️ Prenda añadida a favoritos',
            cuerpo: 'La prenda fue guardada en tu lista de favoritos. Puedes verla en Mis Favoritos.',
            leida: false,
          })
        }
      } catch (err) {
        // Silencioso — la notificación local ya fue mostrada
        console.warn('[FavoritesContext] No se pudo persistir la notificación:', err)
      }
    }
  }, [favoriteIds, addLocalNotification])

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
