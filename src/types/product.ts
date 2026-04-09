export type ProductStatus = 'DISPONIBLE' | 'OCULTO' | 'VENDIDO'

export interface Product {
  id_prenda: string
  id_usuario: number
  id_categoria: number
  id_marca: number
  titulo: string
  descripcion: string | null
  talla: string | null
  color: string | null
  precio: number
  genero: string | null
  condicion: string | null
  estado_publicacion: ProductStatus
  fecha_publicacion: string
  
  // Virtual / Joined field
  imagen_url?: string | null
}

export type ProductInsert = Omit<Product, 'id_prenda' | 'fecha_publicacion'>
export type ProductUpdate = Partial<ProductInsert>

export interface ProductFilters {
  search?: string
  status?: ProductStatus | 'all'
  category?: number | 'all' // We could use id_categoria
  sortBy?: keyof Product
  sortOrder?: 'asc' | 'desc'
}

export interface PaginationState {
  page: number
  pageSize: number
  total: number
}