
import { createBrowserClient } from '@supabase/ssr'
import type { Database as DbType } from './database.types'

export type Database = DbType;

// This is the single source of truth for the Supabase client.
// It's safe to use in the browser.
export const supabase = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!, 
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
