'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { NotificationPrefs } from '@/components/layout/NotificationsPanel'

export interface RealtimeNotification {
  id: number
  tipo: string            // 'mensaje' | 'venta' | 'favorito' | 'oferta' | 'nuevas'
  titulo: string
  cuerpo: string
  leida: boolean
  created_at: string
}

// Mapeo tipo → prefKey
const TIPO_A_PREF: Record<string, keyof NotificationPrefs> = {
  mensaje:  'pushMensajes',
  venta:    'pushVentas',
  favorito: 'pushFavoritos',
  oferta:   'emailOfertas',
  nuevas:   'emailNuevas',
  resumen:  'emailResumen',
}

export function useNotifications(prefs: NotificationPrefs) {
  const supabase = createClient()
  const [notifications, setNotifications] = useState<RealtimeNotification[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let userId: string | null = null

    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }
      userId = user.id

      // Fetch inicial
      const { data, error } = await supabase
        .from('notificaciones')
        .select('*')
        .eq('usuario_id', userId)
        .order('created_at', { ascending: false })
        .limit(30)

      if (!error && data) {
        setNotifications(data as RealtimeNotification[])
      }
      setLoading(false)

      // Suscripción Realtime
      const channel = supabase
        .channel(`notifs-${userId}`)
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'notificaciones', filter: `usuario_id=eq.${userId}` },
          (payload) => {
            setNotifications(prev => [payload.new as RealtimeNotification, ...prev])
          }
        )
        .on(
          'postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'notificaciones', filter: `usuario_id=eq.${userId}` },
          (payload) => {
            setNotifications(prev =>
              prev.map(n => n.id === (payload.new as RealtimeNotification).id ? payload.new as RealtimeNotification : n)
            )
          }
        )
        .subscribe()

      return () => { supabase.removeChannel(channel) }
    }

    init()
  }, [])

  // Filtrar por preferencias activas
  const filtered = notifications.filter(n => {
    const prefKey = TIPO_A_PREF[n.tipo]
    return prefKey ? prefs[prefKey] : true
  })

  const unreadCount = filtered.filter(n => !n.leida).length

  async function markAllRead() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase
      .from('notificaciones')
      .update({ leida: true })
      .eq('usuario_id', user.id)
      .eq('leida', false)
    setNotifications(prev => prev.map(n => ({ ...n, leida: true })))
  }

  async function dismiss(id: number) {
    await supabase.from('notificaciones').delete().eq('id', id)
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  return { notifications: filtered, unreadCount, loading, markAllRead, dismiss }
}
