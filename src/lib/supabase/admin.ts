import { createServerClient } from '@supabase/ssr'
import type { Database } from './database.types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Initialize admin client only if variables are set to prevent crashing the app.
export const supabaseAdmin = 
    (supabaseUrl && supabaseServiceKey)
        ? createServerClient<Database>(supabaseUrl, supabaseServiceKey, {
            auth: {
                autoRefreshToken: false,
                persistSession: false,
            },
             cookies: {},
        })
        : null;

if (!supabaseAdmin) {
    console.warn('Supabase admin client is not initialized. Please check your environment variables: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
}
