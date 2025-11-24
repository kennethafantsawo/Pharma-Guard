
import { createServerClient } from '@supabase/ssr'
import type { Database } from './database.types'

// NOTE: This should be a singleton.
export const supabaseAdmin = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
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
    }
);
