export type ProductStatus = 'draft' | 'published' | 'archived'

export interface Product {
  id: string
  name: string
  description: string | null
  price: number
  stock: number
  sku: string
  category: string | null
  status: ProductStatus
  image_url: string | null
  created_at: string
  updated_at: string
  // If we have joined tables (like a seller), add them here:
  // seller?: any
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