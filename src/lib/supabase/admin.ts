import { createClient } from "@supabase/supabase-js";

/**
 * Cliente administrativo de Supabase con permisos de Service Role.
 * ¡IMPORTANTE! Este cliente solo debe usarse en Server Actions o API Routes.
 */
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);
