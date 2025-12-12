
'use server';

import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { Database } from '@/lib/supabase/database.types';
import { z } from 'zod';
import { headers } from 'next/headers';

const emailSchema = z.string().email('L\'adresse e-mail doit être valide.');

export async function signInWithEmailAction(email: string): Promise<{ success: boolean; error?: string }> {
    const validatedEmail = emailSchema.safeParse(email);
    if (!validatedEmail.success) {
        return { success: false, error: 'Adresse e-mail invalide.' };
    }

    const supabase = createSupabaseServerClient();
    const origin = process.env.NEXT_PUBLIC_APP_URL;

    if (!origin) {
        return { success: false, error: "La configuration de l'application est incomplète. L'URL de l'application n'est pas définie." };
    }

    const { error } = await supabase.auth.signInWithOtp({
        email: validatedEmail.data,
        options: {
            // Le lien magique renverra l'utilisateur à la page de callback,
            // qui le redirigera ensuite vers le tableau de bord.
            emailRedirectTo: `${origin}/auth/callback?next=/pharmacist-dashboard`,
        },
    });

    if (error) {
        console.error("signInWithOtp (magic link) Error:", error);
        return { success: false, error: "Impossible d'envoyer le lien de connexion. Assurez-vous que l'e-mail est correct." };
    }
    return { success: true };
}


export async function getPharmacistProfile(): Promise<{
    user: Database['public']['Tables']['profiles']['Row'] | null, 
    profile: Database['public']['Tables']['profiles']['Row'] | null,
    error?: string
}> {
    const supabase = createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { user: null, profile: null, error: "Utilisateur non trouvé." };
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
    
    // First time login for this user, create a profile
    if (!profile) {
        const { data: newProfile, error } = await supabase
            .from('profiles')
            .insert({
                id: user.id,
                username: user.email || 'Nouveau Pharmacien',
                role: 'Pharmacien', // Assign 'Pharmacien' role
            })
            .select()
            .single();

        if (error) {
            console.error("Error creating pharmacist profile:", error);
            return { user: user as any, profile: null, error: "Erreur lors de la création du profil." };
        }
        return { user: user as any, profile: newProfile, error: undefined };
    }

    // If profile exists but role is not 'Pharmacien', update it
    if (profile.role !== 'Pharmacien') {
        const { data: updatedProfile, error } = await supabase
            .from('profiles')
            .update({ role: 'Pharmacien' })
            .eq('id', user.id)
            .select()
            .single();
        if (error) {
             console.error("Error updating pharmacist role:", error);
             return { user: user as any, profile, error: "Erreur de mise à jour du rôle." };
        }
        return { user: user as any, profile: updatedProfile, error: undefined };
    }
    
    return { user: user as any, profile, error: undefined };
}

export async function signOutAction() {
    const supabase = createSupabaseServerClient();
    await supabase.auth.signOut();
}
