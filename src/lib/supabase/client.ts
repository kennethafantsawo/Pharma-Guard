
import { createClient } from '@supabase/supabase-js'

// Add your Database type here. It's recommended to generate this with the Supabase CLI.
// For now, we'll use a simple generic.
export type Database = {
  public: {
    Tables: {
      weeks: {
        Row: {
          id: number
          semaine: string
        }
      }
      pharmacies: {
        Row: {
          id: number
          week_id: number
          nom: string
          localisation: string
          contact1: string
          contact2: string
        }
      }
      user_feedback: {
        Row: {
          id: number;
          type: string;
          content: string;
          created_at: string;
        },
        Insert: {
          type: string;
          content: string;
        }
      },
      profiles: {
        Row: {
          id: string; // Corresponds to auth.users.id
          phone: string;
          username: string;
          role: 'Client' | 'Pharmacien';
          pharmacyName: string | null;
          created_at: string;
        },
        Insert: {
          id: string;
          phone: string;
          username: string;
          role: 'Client' | 'Pharmacien';
          pharmacyName?: string | null;
        }
      }
    }
    Functions: {}
  }
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Initialize client only if variables are set to prevent crashing the app.
export const supabase = 
    (supabaseUrl && supabaseAnonKey) 
        ? createClient<Database>(supabaseUrl, supabaseAnonKey) 
        : null;

if (!supabase) {
    console.warn('Supabase client is not initialized. Please check your environment variables: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY')
}
