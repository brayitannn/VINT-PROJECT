export type UserRole = 'comprador' | 'vendedor' | 'admin'

export interface MockUser {
  id: string
  name: string
  username: string
  email: string
  avatar: string
  role: UserRole
  joinedAt: string
  location: string
  preferencias: {
    categorias: string[]
    tallas: string[]
    presupuesto_max: number
    estilos: string[]
  }
  stats: {
    compras: number
    favoritos: number
    publicaciones: number
  }
}

export const MOCK_USER: MockUser = {
  id: 'mock-001',
  name: 'Bryan Calderón',
  username: 'bryancalderon',
  email: 'bryan@vint.co',
  avatar: '',
  role: 'comprador',
  joinedAt: '2025-01-15',
  location: 'Bogotá, Colombia',
  preferencias: {
    categorias: ['Camisetas', 'Jeans', 'Chaquetas'],
    tallas: ['M', 'L'],
    presupuesto_max: 80000,
    estilos: ['casual', 'streetwear', 'vintage'],
  },
  stats: {
    compras: 4,
    favoritos: 12,
    publicaciones: 3,
  },
}