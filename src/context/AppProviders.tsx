'use client'

import { useState, useEffect } from 'react'
import { ThemeProvider } from '@/context/ThemeProvider'
import { AuthProvider } from '@/context/AuthContext'
import { NotificationsProvider } from '@/context/NotificationsContext'
import { FavoritesProvider } from '@/context/FavoritesContext'
import { CartProvider } from '@/context/CartContext'
import { OnboardingModal } from '@/components/onboarding/OnboardingModal'
import type { NotificationPrefs } from '@/components/notifications/NotificationsPanel'

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
          <CartProvider>
            <FavoritesProvider>
              {children}
              <OnboardingModal />
            </FavoritesProvider>
          </CartProvider>
        </NotificationsProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}
