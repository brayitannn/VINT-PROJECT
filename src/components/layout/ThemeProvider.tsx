'use client'

/* el ThemeProvider.tsx

    tecnicamente lo que hace es envolver la aplicación para darle en general el sistema de temas

    al usar next-themes que maneja dos cosas automáticamente:
  - Guardar la preferencia del usuario en localStorage
  - Aplicar el atributo data-theme al <html>

*/

import { ThemeProvider as NextThemesProvider } from 'next-themes'
import { ReactNode } from 'react'

interface Props {
    children: ReactNode
}

export function ThemeProvider({ children}: Props) {
    return (
        <NextThemesProvider
            attribute="data-theme"      /* lo que hace es aplicar el data-theme ya sea con el valor 'dark' o 'light' en el <html> */
            defaultTheme="light"        /* cada que el usuario entre a la aplicación la vista que tendra es con el tema por defecto que es 'light' */
            enableSystem={false}        /* se usa el light por defecto */
        >
            {children}
        </NextThemesProvider>
    )
}