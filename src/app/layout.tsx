/*
  layout.tsx — Layout raíz de la aplicación

  Este componente envuelve TODAS las páginas de VINT.
  Define el <html>, el <body>, y los proveedores globales.

  Aquí integramos:
  - ThemeProvider: para que toda la app tenga acceso al tema
  - Navbar: aparece en todas las páginas automáticamente
  - Metadata: título y descripción para SEO en Google
*/

import type { Metadata } from 'next'
import './globals.css'
import { ThemeProvider } from '@/components/layout/ThemeProvider'
import { Navbar } from '@/components/layout/Navbar'
import { RoleProvider } from '@/components/layout/RoleContext'
import { CartProvider } from '@/context/CartContext'
import { CartDrawer } from '@/components/cart/CartDrawer'


/* Next.js usa este objeto para generar automaticamente las etiquetas de <title> y el de <meta description> en el <head> esto es importante para que Google indexe bien el proyecto de VINT */

export const metadata: Metadata = {
  title: 'Vint — Ropa de Segunda Mano, Primer Nivel',
  description: 'Compra y vende ropa de segunda mano con estilo. Moda sostenible, precios reales y vendedores verificados en Colombia.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (

    /*
      suppressHydrationWarning en <html> es necesario con next-themes.
      El servidor no sabe el tema del usuario, pero el cliente sí.
      Esta prop le dice a React que ese atributo puede diferir entre
      servidor y cliente y que no lance advertencias por eso.
    */

    <html lang="es" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/logo-light.png" media="(prefers-color-scheme: light)" />
        <link rel="icon" href="/logo-dark.png" media="(prefers-color-scheme: dark)" />
      </head>
      <body>
        
        {/*
          ThemeProvider envuelve TODO para que cualquier componente
          hijo pueda acceder al tema usando el hook useTheme().
        */}

        <ThemeProvider>
          <RoleProvider>
            <CartProvider>
              <Navbar />
              <CartDrawer />
              {children}
            </CartProvider>
          </RoleProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}