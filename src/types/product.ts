export type ProductStatus = 'draft' | 'published' | 'archived' | 'sold'


/** Tallas de prendas */
export type ProductSize = 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL' | 'Única' | string

/** Estado/condición física de la prenda */
export type ProductCondition = 'NUEVO' | 'USADO' | 'nuevo' | 'como_nuevo' | 'buen_estado' | 'regular' | string

/** Género objetivo de la prenda */
export type ProductGender = 'Hombre' | 'Mujer' | 'Unisex' | 'HOMBRE' | 'MUJER' | 'UNISEX' | 'NIÑOS' | string

export interface Product {
  id: string
  name: string
  description: string | null
  price: number
  stock: number
  sku?: string | null
  category: string | null
  category_id: number | null
  id_marca?: number | null
  brand?: string | null
  status: ProductStatus
  image_url: string | null
  created_at: string
  updated_at: string
  // Campos físicos de la prenda
  size?: ProductSize | null
  color?: string | null
  gender?: ProductGender | null
  condition?: ProductCondition | null
}

export type ProductInsert = Omit<Product, 'id' | 'created_at' | 'updated_at'>
export type ProductUpdate = Partial<ProductInsert>

export interface ProductFilters {
  search?: string
  status?: ProductStatus | 'all'
  category?: string | 'all'
  sortBy?: keyof Product
  sortOrder?: 'asc' | 'desc'
}

export interface PaginationState {
  page: number
  pageSize: number
  total: number
}