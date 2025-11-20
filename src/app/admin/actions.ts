
'use server'

import { supabaseAdmin } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export async function updatePharmaciesAction(password: string, newSchedules: any[]): Promise<{ success: boolean; message: string }> {
  if (!supabaseAdmin) {
    return { 
      success: false, 
      message: "Échec de la connexion : La configuration côté serveur est manquante. Assurez-vous que les variables d'environnement NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY sont correctement configurées." 
    }
  }

  if (password !== 'kenneth18') {
    return { success: false, message: 'Mot de passe incorrect.' }
  }

  try {
    const { error: deletePharmaciesError } = await supabaseAdmin.from('pharmacies').delete().gt('id', -1);
    if (deletePharmaciesError) throw new Error(`Erreur lors de la suppression des pharmacies: ${deletePharmaciesError.message}`);

    const { error: deleteWeeksError } = await supabaseAdmin.from('weeks').delete().gt('id', -1);
    if (deleteWeeksError) throw new Error(`Erreur lors de la suppression des semaines: ${deleteWeeksError.message}`);

    for (const schedule of newSchedules) {
      const { data: weekData, error: weekError } = await supabaseAdmin
        .from('weeks')
        .insert({ semaine: schedule.semaine })
        .select('id')
        .single()

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
    
    revalidatePath('/')
    return { success: true, message: 'Les données des pharmacies ont été mises à jour avec succès.' }
  } catch (error) {
    console.error('Error in updatePharmaciesAction:', error)
    let errorMessage = error instanceof Error ? error.message : 'Une erreur inconnue est survenue.'
    if (String(errorMessage).includes('does not exist')) {
        errorMessage = `La table requise n'existe pas. Veuillez exécuter le script SQL de création. [Message original: ${errorMessage}]`
    }
    return { success: false, message: `Échec de la mise à jour : ${errorMessage}` }
  }
}
