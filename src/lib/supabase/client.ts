
import { createBrowserClient } from '@supabase/ssr'
import type { Database as DbType } from './database.types'

export type Database = DbType;

// Redefined as a function to ensure a single instance is not shared across requests.
// This is important for server-side rendering and concurrent requests.
export const createSupabaseClient = () => createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
