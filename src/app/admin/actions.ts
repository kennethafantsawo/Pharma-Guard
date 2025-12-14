'use server';

import { createSupabaseAdminClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { WeekSchedule } from '@/lib/types';
import crypto from 'crypto';

export async function updatePharmaciesAction(password: string, newSchedules: WeekSchedule[]): Promise<{ success: boolean; message: string }> {
  if (password !== process.env.NEXT_PUBLIC_ADMIN_PASSWORD) {
    return { success: false, message: 'Mot de passe incorrect.' };
  }
  
  const supabaseAdmin = createSupabaseAdminClient();

  if (!supabaseAdmin) {
    return { 
      success: false, 
      message: "Échec de la connexion : La configuration côté serveur de Supabase est manquante. Vérifiez les variables d'environnement." 
    };
  }

  try {
    // We use a transaction to ensure all operations succeed or fail together
    await supabaseAdmin.rpc('delete_all_pharmacy_data');

    for (const schedule of newSchedules) {
      const { data: weekData, error: weekError } = await supabaseAdmin
        .from('weeks')
        .insert({ semaine: schedule.semaine })
        .select('id')
        .single();

      if (weekError) throw new Error(`Erreur lors de l'insertion de la semaine '${schedule.semaine}': ${weekError.message}`);
      
      const weekId = weekData.id;

      if (schedule.pharmacies && schedule.pharmacies.length > 0) {
        const pharmaciesToInsert = schedule.pharmacies.map((p: any) => ({
          nom: p.nom,
          localisation: p.localisation,
          contact1: p.contact1,
          contact2: p.contact2,
          week_id: weekId,
        }));

        const { error: pharmacyError } = await supabaseAdmin.from('pharmacies').insert(pharmaciesToInsert);
        if (pharmacyError) throw new Error(`Erreur lors de l'insertion des pharmacies pour la semaine '${schedule.semaine}': ${pharmacyError.message}`);
      }
    }
    
    revalidatePath('/');
    revalidatePath('/admin');
    return { success: true, message: 'Les données des pharmacies ont été mises à jour avec succès.' };
  } catch (error) {
    console.error('Error in updatePharmaciesAction:', error);
    let errorMessage = error instanceof Error ? error.message : 'Une erreur inconnue est survenue.';
    if (String(errorMessage).includes('does not exist')) {
        errorMessage = `La table ou la fonction requise n'existe pas. Veuillez exécuter le script SQL de création. [Message original: ${errorMessage}]`;
    }
    return { success: false, message: `Échec de la mise à jour : ${errorMessage}` };
  }
}

export async function generatePharmacyPasswordAction(adminPassword: string, pharmacyName: string): Promise<{ success: boolean; error?: string; password?: string }> {
    if (adminPassword !== process.env.NEXT_PUBLIC_ADMIN_PASSWORD) {
        return { success: false, error: 'Accès non autorisé.' };
    }

    const supabaseAdmin = createSupabaseAdminClient();
    if (!supabaseAdmin) {
        return { success: false, error: 'Configuration Supabase Admin manquante.' };
    }

    try {
        const email = `${pharmacyName.toLowerCase().replace(/\s+/g, '.')}@pharmaguard.app`;
        const newPassword = crypto.randomBytes(4).toString('hex'); // 8-char hex string

        // Check if a profile and user already exist
        const { data: existingProfile } = await supabaseAdmin
            .from('profiles')
            .select('id')
            .eq('pharmacy_name', pharmacyName)
            .single();

        if (existingProfile) {
            // User exists, update their password
            const { error: updateUserError } = await supabaseAdmin.auth.admin.updateUserById(
                existingProfile.id,
                { password: newPassword }
            );
            if (updateUserError) throw updateUserError;
            
            const { error: updateProfileError } = await supabaseAdmin
                .from('profiles')
                .update({ password: newPassword })
                .eq('id', existingProfile.id);
            if (updateProfileError) throw updateProfileError;

        } else {
            // User does not exist, create them
            const { data: newUser, error: createUserError } = await supabaseAdmin.auth.admin.createUser({
                email,
                password: newPassword,
                email_confirm: true, // Auto-confirm email
                user_metadata: {
                    username: pharmacyName,
                    pharmacy_name: pharmacyName,
                    role: 'Pharmacien',
                },
            });
            if (createUserError) throw createUserError;
            if (!newUser.user) throw new Error("La création de l'utilisateur a échoué.");

            // Create the profile
            const { error: createProfileError } = await supabaseAdmin
                .from('profiles')
                .insert({
                    id: newUser.user.id,
                    username: pharmacyName,
                    pharmacy_name: pharmacyName,
                    role: 'Pharmacien',
                    password: newPassword,
                });
            if (createProfileError) {
                // Cleanup: delete the auth user if profile creation fails
                await supabaseAdmin.auth.admin.deleteUser(newUser.user.id);
                throw createProfileError;
            }
        }
        
        revalidatePath('/admin');
        return { success: true, password: newPassword };

    } catch (error) {
        console.error("Error in generatePharmacyPasswordAction:", error);
        const message = error instanceof Error ? error.message : 'Une erreur est survenue.';
        if (message.includes('duplicate key value')) {
            return { success: false, error: 'Un profil pour cette pharmacie existe déjà mais une erreur est survenue.' };
        }
        return { success: false, error: message };
    }
}
