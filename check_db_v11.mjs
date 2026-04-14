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
  console.log('--- Searching for id_prenda column in public schema ---')
  
  // We try to query information_schema. Since we might not have permissions,
  // we try an alternative: checking v_catalogo_publico's underlying tables if possible,
  // or just querying the most likely table names again but with more care.
  
  const tables = ['prenda', 'prendas', 'products', 'productor', 'catalogo', 'items', 'articulos']
  for (const t of tables) {
    const { data, error } = await supabase.from(t).select('id_prenda').limit(1)
    if (!error) {
      console.log(`Found table with id_prenda: ${t}`)
    }
  }
}

check()
