'use client'

import { useState, useEffect } from 'react'
import { ThemeProvider } from '@/components/layout/ThemeProvider'
import { AuthProvider } from '@/context/AuthContext'
import { NotificationsProvider } from '@/components/layout/NotificationsContext'
import { FavoritesProvider } from '@/components/layout/FavoritesContext'
import { CartProvider } from '@/components/layout/CartContext'
import type { NotificationPrefs } from '@/components/layout/NotificationsPanel'

const DEFAULT_PREFS: NotificationPrefs = {
  emailOfertas: true,
  emailNuevas: false,
  emailResumen: true,
  pushMensajes: true,
  pushVentas: true,
  pushFavoritos: true,
}

export function AppProviders({ children }: { children: React.ReactNode }) {
  const [prefs, setPrefs] = useState<NotificationPrefs>(DEFAULT_PREFS)

  useEffect(() => {
    try {
      const saved = localStorage.getItem('vint_notif_prefs')
      if (saved) {
        const parsed = JSON.parse(saved)
        // Siempre forzamos pushFavoritos: true
        setPrefs({ ...parsed, pushFavoritos: true })
      }
    } catch {}
  }, [])

  return (
    <ThemeProvider>
      <AuthProvider>
        <NotificationsProvider prefs={prefs}>
          <FavoritesProvider>
            <CartProvider>
              {children}
            </CartProvider>
          </FavoritesProvider>
        </NotificationsProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}
