'use client'

import { useEffect, useCallback, useRef } from 'react'
import { useAuth } from '@/context/AuthContext'

type EventoTipo = 'vista' | 'busqueda' | 'favorito' | 'carrito'

interface TrackPayload {
  id_prenda?: string
  termino?: string
  categoria?: string
}

export function useTracker() {
  const { user } = useAuth()
  const timerRefs = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())

  // Cleanup timers al desmontar
  useEffect(() => {
    const timers = timerRefs.current
    return () => {
      timers.forEach(t => clearTimeout(t))
      timers.clear()
    }
  }, [])

  const track = useCallback(
    async (tipo: EventoTipo, payload: TrackPayload = {}) => {
      if (!user) return
      // Fire-and-forget: nunca bloquea la UI
      try {
        fetch('/api/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tipo, ...payload, id_usuario: user.id }),
        }).catch(() => {}) // ignorar errores de red silenciosamente
      } catch {
        // silencioso
      }
    },
    [user]
  )

  /**
   * Rastrea una "vista" con debounce: solo registra si el usuario
   * permanece en esa prenda más de `delayMs` milisegundos (default 2s).
   * Cancela el registro si el usuario hace hover-out antes del tiempo.
   */
  const trackVistaDebounced = useCallback(
    (id_prenda: string, categoria?: string, delayMs = 2000) => {
      // Cancelar timer previo para esta prenda si existe
      const existing = timerRefs.current.get(id_prenda)
      if (existing) clearTimeout(existing)

      const t = setTimeout(() => {
        track('vista', { id_prenda, categoria })
        timerRefs.current.delete(id_prenda)
      }, delayMs)

      timerRefs.current.set(id_prenda, t)
    },
    [track]
  )

  const cancelTrackVista = useCallback((id_prenda: string) => {
    const t = timerRefs.current.get(id_prenda)
    if (t) {
      clearTimeout(t)
      timerRefs.current.delete(id_prenda)
    }
  }, [])

  return { track, trackVistaDebounced, cancelTrackVista }
}
