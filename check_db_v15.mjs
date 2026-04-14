import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import fs from 'fs'

if (fs.existsSync('.env.local')) {
  dotenv.config({ path: '.env.local' })
} else {
  dotenv.config()
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function check() {
  const tables = [
    'productos', 'product', 'products', 'prendas', 'prenda', 'articulos', 'ropa', 'inventario', 'catalogo_prendas', 'prendas_publicas',
    'public_prendas', 'Product', 'Products', 'Prendas', 'Prenda', 'Productos'
  ]
  console.log('Testing possible table names...')
  for (const t of tables) {
    const { error } = await supabase.from(t).select('id').limit(1)
    if (error) {
      if (error.code !== 'PGRST205' && error.code !== 'PGRST116') {
        console.log(`${t} exists but failed: ${error.code}`)
      }
    } else {
      console.log(`FOUND TABLE: ${t}`)
    }
  }
}

check()
