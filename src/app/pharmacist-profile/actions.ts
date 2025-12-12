
'use server';

import { createSupabaseServerClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function getAllPharmacyNamesAction(): Promise<{
  success: boolean;
  data?: string[];
  error?: string;
}> {
  if (!supabaseAdmin) {
    return { success: false, error: 'Configuration serveur manquante.' };
  }
  try {
    const { data: pharmacies, error } = await supabaseAdmin
      .from('pharmacies')
      .select('nom');

    if (error) throw error;

    // Use a Set to get unique names, then convert back to an array
    const uniqueNames = [...new Set(pharmacies.map(p => p.nom))];
    
    return { success: true, data: uniqueNames.sort() };
  } catch (error) {
    console.error('Error fetching pharmacy names:', error);
    const message = error instanceof Error ? error.message : 'Une erreur est survenue.';
    return { success: false, error: message };
  }
}

export async function updatePharmacistProfileAction(pharmacyName: string): Promise<{
    success: boolean;
    error?: string;
}> {
    const supabase = createSupabaseServerClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { success: false, error: 'Utilisateur non authentifié.' };
    }

    const { error } = await supabase
        .from('profiles')
        .update({ pharmacy_name: pharmacyName })
        .eq('id', user.id);
    
    if (error) {
        console.error('Error updating profile:', error);
        return { success: false, error: 'Impossible de mettre à jour le profil.' };
    }

    return { success: true };
}

    