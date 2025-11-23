'use server';

import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { Database } from '@/lib/supabase/database.types';

type SearchWithResponses = Database['public']['Tables']['searches']['Row'] & {
  responses: Database['public']['Tables']['responses']['Row'][];
};

export async function getAllSearchesAction(): Promise<{
  success: boolean;
  data?: SearchWithResponses[];
  error?: string;
}> {
  const supabase = createSupabaseServerClient();
  
  // First, check if the user is a pharmacist
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: 'Accès non autorisé.' };
  }
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();
    
  if (profile?.role !== 'Pharmacien') {
    return { success: false, error: 'Accès réservé aux pharmaciens.' };
  }

  // If they are a pharmacist, fetch all searches
  try {
    const { data, error } = await supabase
      .from('searches')
      .select(`
        *,
        responses ( * )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return { success: true, data: data as SearchWithResponses[] };
  } catch (error) {
    console.error('Error fetching searches:', error);
    const message = error instanceof Error ? error.message : 'Une erreur est survenue.';
    return { success: false, error: message };
  }
}
