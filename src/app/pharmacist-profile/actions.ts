
'use server';

import { createSupabaseServerClient, createSupabaseAdminClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

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
    // On récupère tous les noms de pharmacies distincts directement depuis la table des pharmacies.
    const { data: pharmacies, error } = await supabaseAdmin
      .from('pharmacies')
      .select('nom');

    if (error) throw error;

    // On s'assure que la liste ne contient que des noms uniques et on la trie.
    const uniqueNames = [...new Set(pharmacies.map(p => p.nom).filter(Boolean) as string[])];
    
    return { success: true, data: uniqueNames.sort() };
  } catch (error) {
    console.error('Error fetching pharmacy names:', error);
    const message = error instanceof Error ? error.message : 'Une erreur est survenue.';
    return { success: false, error: message };
  }
}

export async function updatePharmacistProfileAction(formData: FormData): Promise<{
    success: boolean;
    error?: string;
}> {
    const supabase = createSupabaseServerClient();
    const supabaseAdmin = createSupabaseAdminClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !supabaseAdmin) {
        return { success: false, error: 'Utilisateur non authentifié ou configuration admin manquante.' };
    }

    const newPassword = formData.get('newPassword') as string;
    const pharmacyName = formData.get('pharmacyName') as string;

    const updates: { pharmacy_name?: string; password?: string } = {};

    if (pharmacyName) {
        updates.pharmacy_name = pharmacyName;
    }
    if (newPassword) {
        updates.password = newPassword;
    }

    if (Object.keys(updates).length === 0) {
        return { success: true }; // No changes to make
    }

    // Mettre à jour le profil dans la table 'profiles'
    const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .update(updates)
        .eq('id', user.id);
    
    if (profileError) {
        console.error('Error updating profile:', profileError);
        return { success: false, error: 'Impossible de mettre à jour le profil.' };
    }

    // Si le mot de passe a été changé, mettre aussi à jour le mot de passe de l'utilisateur dans Supabase Auth
    if (newPassword) {
        const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
            password: newPassword,
        });

        if (authError) {
            console.error('Error updating auth user password:', authError);
            // On pourrait envisager une logique pour annuler la mise à jour du profil ici
            return { success: false, error: "Impossible de mettre à jour le mot de passe d'authentification." };
        }
    }
    
    revalidatePath('/pharmacist-dashboard');
    revalidatePath('/pharmacist-profile');
    return { success: true };
}

