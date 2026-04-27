'use client'

import { ThemeProvider as NextThemesProvider, useTheme } from 'next-themes'
export { useTheme }
import { ReactNode } from 'react'

// Silenciar la advertencia inofensiva de React 19/Next.js turbopack sobre el script de next-themes
if (process.env.NODE_ENV === 'development') {
  const origError = console.error;
  console.error = (...args) => {
    if (typeof args[0] === 'string' && args[0].includes('Encountered a script tag')) {
      return;
    }
    origError.apply(console, args);
  };
}

interface Props {
    children: ReactNode
}

export function ThemeProvider({ children}: Props) {
    return (
        <NextThemesProvider
            attribute="data-theme"      
            /* lo que hace es aplicar el data-theme ya sea con el valor 'dark' o 'light' en el <html> */
            defaultTheme="light"        
            /* cada que el usuario entre a la aplicación la vista que tendra es con el tema por defecto que es 'light' */
            enableSystem={false}        
            /* se usa el light por defecto */
        >
            {children}
        </NextThemesProvider>
    )
}