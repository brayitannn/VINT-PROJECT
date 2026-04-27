# Estructura del Proyecto Vint (`src/`)

Esta estructura sigue las mejores prácticas y convenciones modernas para **Next.js con App Router**, asegurando que el proyecto sea escalable y fácil de mantener.

---

### 📁 `src/app/` — El enrutador principal (App Router)
Aquí es donde Next.js define las páginas y las rutas de la aplicación. **Solo** debe contener archivos especiales de Next.js (`page.tsx`, `layout.tsx`, `route.ts`, etc.).
- **Regla de oro:** No poner lógica compleja ni componentes pesados aquí. Los archivos `page.tsx` deben ser lo más limpios posible, limitándose a importar y renderizar componentes que viven en la carpeta `components/`.
- **`app/api/`**: Aquí viven todos los endpoints del backend (rutas que devuelven JSON en lugar de HTML).

---

### 📁 `src/components/` — Los bloques de construcción visuales
Aquí van todos los componentes de React que construyen la interfaz de usuario. Está subdividida por **características o dominios** para que sea fácil encontrar las cosas:
- **`components/ui/`**: Componentes base, genéricos y reutilizables en cualquier parte (botones, inputs, tarjetas, alertas). Son "tontos" (no tienen lógica de negocio ni llamadas a base de datos).
- **`components/layout/`**: Componentes estructurales que envuelven la aplicación y definen el marco visual (Navbar, Footer).
- **`components/[feature]/`**: Carpetas específicas para componentes de una funcionalidad particular (ej. `cart`, `dashboard`, `auth`, `products`, `favoritos`). Estos componentes sí pueden tener lógica de negocio o de estado específica de su dominio.

---

### 📁 `src/context/` — El estado global
Aquí viven todos los Contextos de React y sus Proveedores (Providers).
- Se utiliza para datos que necesitan ser accedidos por múltiples componentes en diferentes partes del árbol de la aplicación simultáneamente, evitando tener que pasarlos manualmente por "props" a través de muchos niveles.
- **Ejemplos:** `AuthContext.tsx` (sesión del usuario), `CartContext.tsx` (estado del carrito), `ThemeProvider.tsx` (tema visual).

---

### 📁 `src/hooks/` — Lógica reutilizable
Aquí van los Custom Hooks de React (nombres que empiezan con `use...`).
- Sirven para extraer lógica compleja de los componentes. Esto permite que el componente quede limpio, enfocado solo en renderizar la interfaz, y que la lógica extraída se pueda reutilizar en múltiples lugares.
- **Ejemplos:** `useProducts.ts`, `useNotifications.ts`, `useHover.ts`.

---

### 📁 `src/services/` — Comunicación con el exterior (Base de datos / APIs)
Aquí van las funciones que se encargan **exclusivamente de pedir o enviar datos**. 
- Todas las consultas a Supabase (`select`, `insert`, `update`, `delete`) deben vivir aquí y no mezclarse directamente dentro de los componentes.
- Si un componente necesita datos, llama a un servicio (o a un hook que a su vez llama a un servicio).
- **Ejemplos:** `estadisticas.ts`, `products.ts`, `favoritos.ts`.

---

### 📁 `src/lib/` — Configuración e infraestructura
Aquí van las configuraciones de herramientas externas, inicialización de clientes y funciones de utilidad genéricas.
- **`lib/supabase/`**: La configuración para conectar e inicializar el cliente de Supabase.
- **`lib/utils.ts`**: Funciones puras de ayuda general que formatean datos, concatenan clases (`cn`), etc. Son funciones que no tienen estado interno ni interactúan con bases de datos.

---

### 📁 `src/types/` — Definiciones de TypeScript
Aquí van las interfaces y tipos (`interfaces`, `types`) que definen cómo es la estructura exacta de los datos en tu aplicación.
- Mantener los tipos aquí permite que tanto los `services/` como los `components/` importen las mismas definiciones. Esto asegura que todas las capas del proyecto "hablen el mismo idioma" y TypeScript pueda detectar errores fácilmente.
- **Ejemplos:** `product.ts`, `dashboard.ts`.
