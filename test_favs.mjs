import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function test() {
  const { data: favs, error: favsErr } = await supabase.from('favoritos').select('*')
  console.log("All favoritos rows:", favs, favsErr)

  if (favs && favs.length > 0) {
    const ids = favs.map(f => f.id_prenda)
    console.log("Found ids:", ids)
    const { data: prods, error: prodsErr } = await supabase
      .from('v_catalogo_publico')
      .select('id_prenda, titulo')
      .in('id_prenda', ids)
    
    console.log("Products from view:", prods, prodsErr)
  }
}

test()
