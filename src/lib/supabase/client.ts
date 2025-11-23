
import { createBrowserClient } from '@supabase/ssr'
import type { Database as DbType } from './database.types'

export type Database = DbType;

function createSupabaseClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
        console.error('Supabase URL or Anon Key is not set. Client-side Supabase client could not be initialized.');
        return null;
    }

    return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);
}

// This is the single source of truth for the Supabase client.
// It's safe to use in the browser.
export const supabase = createSupabaseClient();
