
import { createBrowserClient } from '@supabase/ssr'
import type { Database as DbType } from './database.types'

export type Database = DbType;

// NOTE: The client needs to be a singleton.
export const supabase = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
