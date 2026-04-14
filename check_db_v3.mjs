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
  console.log('--- Checking table: prendas ---')
  const { data: pData, error: pError } = await supabase.from('prendas').select('*').limit(1)
  if (pError) console.error('Error prendas:', pError.message)
  else console.log('Sample prendas:', pData[0])

  console.log('\n--- Checking table: categories ---')
  const { data: cData, error: cError } = await supabase.from('categories').select('*').limit(1)
  if (cError) console.error('Error categories:', cError.message)
  else console.log('Sample categories:', cData[0])
}

check()
