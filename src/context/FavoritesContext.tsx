'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { getFavoritos, addFavorito, removeFavorito } from '@/services/favoritos'
import { createClient } from '@/lib/supabase/client'
import { useNotificationsContext } from '@/context/NotificationsContext'
import { useAuth } from '@/context/AuthContext'
import { useTracker } from '@/hooks/useTracker'

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
  isFavorito: () => false
})

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const { addLocalNotification } = useNotificationsContext()
  const { track } = useTracker()

  // Carga inicial desde Supabase
  useEffect(() => {
    if (user) {
      getFavoritos(user.id).then((ids) => {
        setFavoriteIds(new Set(ids))
        setLoading(false)
      })
    } else {
      setFavoriteIds(new Set())
      setLoading(false)
    }
  }, [user])

  const toggleFavorito = useCallback(async (id_prenda: string) => {
    if (!user) return

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
      ? await removeFavorito(user.id, id_prenda)
      : await addFavorito(user.id, id_prenda)

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

    // Si se agregó exitosamente, registrar evento de comportamiento + notificación
    if (!isCurrentlyFav && ok) {
      track('favorito', { id_prenda })
      try {
        const supabase = createClient()
        const { data: { user: currentUser } } = await supabase.auth.getUser()
        if (currentUser) {
          await supabase.from('notificaciones').insert({
            usuario_id: currentUser.id,
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
  }, [favoriteIds, user, addLocalNotification])

  const isFavorito = useCallback(
    (id_prenda: string) => favoriteIds.has(id_prenda),
    [favoriteIds]
  )

  return (
    <FavoritesContext.Provider value={{ 
      favoriteIds, loading, toggleFavorito, isFavorito
    }}>
      {children}
    </FavoritesContext.Provider>
  )
}

export function useFavorites() {
  return useContext(FavoritesContext)
}
