'use client'

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react'
import { createClient } from '@/lib/supabase/client'
import type { NotificationPrefs } from '@/components/layout/NotificationsPanel'

export interface RealtimeNotification {
  id: number
  tipo: string
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

interface NotificationsContextType {
  notifications: RealtimeNotification[]
  unreadCount: number
  loading: boolean
  markAllRead: () => Promise<void>
  dismiss: (id: number) => Promise<void>
  /** Agrega una notificación en memoria de forma inmediata (sin esperar Supabase Realtime) */
  addLocalNotification: (notif: Omit<RealtimeNotification, 'id' | 'created_at'>) => void
}

const NotificationsContext = createContext<NotificationsContextType>({
  notifications: [],
  unreadCount: 0,
  loading: true,
  markAllRead: async () => {},
  dismiss: async () => {},
  addLocalNotification: () => {},
})

export function NotificationsProvider({
  children,
  prefs,
}: {
  children: React.ReactNode
  prefs: NotificationPrefs
}) {
  const supabase = createClient()
  const [allNotifications, setAllNotifications] = useState<RealtimeNotification[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let userId: string | null = null
    let channel: ReturnType<typeof supabase.channel> | null = null

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
        setAllNotifications(data as RealtimeNotification[])
      }
      setLoading(false)

      // Suscripción Realtime
      channel = supabase
        .channel(`notifs-${userId}`)
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'notificaciones', filter: `usuario_id=eq.${userId}` },
          (payload: any) => {
            const newNotif = payload.new as RealtimeNotification
            // Evitar duplicados con notificaciones locales (mismo id o misma clave temporal)
            setAllNotifications(prev => {
              const exists = prev.some(n => n.id === newNotif.id)
              if (exists) return prev
              return [newNotif, ...prev]
            })
          }
        )
        .on(
          'postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'notificaciones', filter: `usuario_id=eq.${userId}` },
          (payload: any) => {
            setAllNotifications(prev =>
              prev.map(n => n.id === (payload.new as RealtimeNotification).id
                ? payload.new as RealtimeNotification
                : n
              )
            )
          }
        )
        .subscribe()
    }

    init()

    return () => {
      if (channel) supabase.removeChannel(channel)
    }
  }, [])

  /** Inserta inmediatamente en el estado local con un ID temporal negativo */
  const addLocalNotification = useCallback(
    (notif: Omit<RealtimeNotification, 'id' | 'created_at'>) => {
      const tempId = -(Date.now()) // ID temporal negativo para distinguirla
      setAllNotifications(prev => [
        {
          ...notif,
          id: tempId,
          created_at: new Date().toISOString(),
        },
        ...prev,
      ])
    },
    []
  )

  // Filtrar por preferencias activas
  const notifications = allNotifications.filter(n => {
    const prefKey = TIPO_A_PREF[n.tipo]
    return prefKey ? prefs[prefKey] : true
  })

  const unreadCount = notifications.filter(n => !n.leida).length

  const markAllRead = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase
      .from('notificaciones')
      .update({ leida: true })
      .eq('usuario_id', user.id)
      .eq('leida', false)
    setAllNotifications(prev => prev.map(n => ({ ...n, leida: true })))
  }, [supabase])

  const dismiss = useCallback(async (id: number) => {
    // Si es un ID temporal (negativo), solo lo quita localmente
    if (id < 0) {
      setAllNotifications(prev => prev.filter(n => n.id !== id))
      return
    }
    await supabase.from('notificaciones').delete().eq('id', id)
    setAllNotifications(prev => prev.filter(n => n.id !== id))
  }, [supabase])

  return (
    <NotificationsContext.Provider
      value={{ notifications, unreadCount, loading, markAllRead, dismiss, addLocalNotification }}
    >
      {children}
    </NotificationsContext.Provider>
  )
}

export function useNotificationsContext() {
  return useContext(NotificationsContext)
}
