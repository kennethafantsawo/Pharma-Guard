
import { createBrowserClient } from '@supabase/ssr'
import type { Database as DbType } from './database.types'

export type Database = DbType;

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Initialize client only if variables are set to prevent crashing the app.
export const supabase = 
    (supabaseUrl && supabaseAnonKey) 
        ? createBrowserClient<Database>(supabaseUrl, supabaseAnonKey) 
        : null;

if (!supabase) {
    console.warn('Supabase client is not initialized. Please check your environment variables: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY')
}
