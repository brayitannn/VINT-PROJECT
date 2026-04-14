import fs from 'fs'
import dotenv from 'dotenv'

if (fs.existsSync('.env.local')) {
  dotenv.config({ path: '.env.local' })
} else {
  dotenv.config()
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

async function getOpenAPI() {
  try {
    const res = await fetch(`${supabaseUrl}/rest/v1/?apikey=${supabaseAnonKey}`)
    const json = await res.json()
    
    fs.writeFileSync('openapi-spec.json', JSON.stringify(json, null, 2))
    
    console.log('OpenAPI spec retrieved and saved to openapi-spec.json')
    
    // Extract definitions (tables and views)
    if (json.definitions) {
      console.log('\n--- Available Tables & Views ---')
      for (const [key, value] of Object.entries(json.definitions)) {
        console.log(`\nTable/View: ${key}`)
        const props = value.properties ? Object.keys(value.properties) : []
        console.log(`Columns: ${props.join(', ')}`)
      }
    } else {
      console.log('No definitions found in OpenAPI spec.')
    }
  } catch (err) {
    console.error('Error fetching OpenAPI spec:', err)
  }
}

getOpenAPI()
