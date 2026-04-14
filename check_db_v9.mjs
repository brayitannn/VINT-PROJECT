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
  // Common table names for products/clothes
  const tables = ['prendas', 'productos', 'products', 'articulos', 'items', 'catalogo', 'v_catalogo_publico']
  
  for (const t of tables) {
    console.log(`Checking ${t}...`)
    const { data, error } = await supabase.from(t).select('*').limit(1)
    if (error) {
      console.log(`  - ${t} error: ${error.message} (${error.code})`)
    } else {
      console.log(`  - ${t} found! Columns:`, Object.keys(data[0] || {}))
    }
  }
}

check()
