
'use server';

import { supabaseAdmin } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';
import type { WeekSchedule } from '@/lib/types';

export async function updatePharmaciesAction(password: string, newSchedules: WeekSchedule[]): Promise<{ success: boolean; message: string }> {
  if (password !== process.env.NEXT_PUBLIC_ADMIN_PASSWORD) {
    return { success: false, message: 'Mot de passe incorrect.' };
  }

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
