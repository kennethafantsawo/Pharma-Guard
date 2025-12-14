
'use server';

import { createSupabaseServerClient, createSupabaseAdminClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export async function getAllPharmacyNamesAction(): Promise<{
  success: boolean;
  data?: string[];
  error?: string;
}> {
  const supabaseAdmin = createSupabaseAdminClient();
  if (!supabaseAdmin) {
    return { success: false, error: 'Configuration serveur manquante.' };
  }
  try {
    const { data: profiles, error } = await supabaseAdmin
      .from('profiles')
      .select('pharmacy_name')
      .not('pharmacy_name', 'is', null);

    if (error) throw error;

    // Use a Set to get unique names, then convert back to an array
    const uniqueNames = [...new Set(profiles.map(p => p.pharmacy_name).filter(Boolean) as string[])];
    
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

    redirect('/pharmacist-dashboard');
}
