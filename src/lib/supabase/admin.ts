import { createServerClient, type CookieOptions } from '@supabase/ssr'
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
            // The admin client is a server-side client that uses a service role key.
            // It doesn't need to manage user sessions, so we provide dummy cookie functions.
             cookies: {
                get: () => undefined,
                set: () => {},
                remove: () => {},
             },
        })
        : null;

if (!supabaseAdmin) {
    console.warn('Supabase admin client is not initialized. Please check your environment variables: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
}
