import { createClient as createSupabaseClient } from '@supabase/supabase-js'

// Cookieless client — safe for use in generateStaticParams and build-time calls
export function createStaticClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
