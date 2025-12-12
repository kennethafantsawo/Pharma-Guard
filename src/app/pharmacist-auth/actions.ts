'use server';

import { createSupabaseServerClient } from '@/lib/supabase/server';
import { headers } from 'next/headers';
import type { Database } from '@/lib/supabase/database.types';
import { z } from 'zod';

const phoneSchema = z.string().min(8, 'Le numéro de téléphone doit être valide.');
const tokenSchema = z.string().min(6, 'Le code doit contenir 6 chiffres.');

export async function signInWithPhoneAction(phone: string): Promise<{ success: boolean; error?: string }> {
    const validatedPhone = phoneSchema.safeParse(phone);
    if (!validatedPhone.success) {
        return { success: false, error: 'Numéro de téléphone invalide.' };
    }

    const supabase = createSupabaseServerClient();
    const { error } = await supabase.auth.signInWithOtp({
        phone: validatedPhone.data,
    });

    if (error) {
        console.error("SignInWithOtp Error:", error);
        return { success: false, error: "Impossible d'envoyer le code. Assurez-vous que le numéro est correct." };
    }
    return { success: true };
}

export async function verifyOtpAction(phone: string, token: string): Promise<{ success: boolean; error?: string }> {
    const validatedPhone = phoneSchema.safeParse(phone);
    const validatedToken = tokenSchema.safeParse(token);

    if (!validatedPhone.success || !validatedToken.success) {
        return { success: false, error: 'Données invalides.' };
    }

    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase.auth.verifyOtp({
        phone: validatedPhone.data,
        token: validatedToken.data,
        type: 'sms',
    });

    if (error || !data.session) {
        console.error("VerifyOtp Error:", error);
        return { success: false, error: 'Le code est incorrect ou a expiré.' };
    }

    // Ensure profile exists and has the correct role
    const { data: profile, error: profileError } = await getPharmacistProfile();

    if(profileError || !profile) {
        return { success: false, error: profileError || "Impossible de récupérer ou créer le profil." };
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
                username: user.phone || 'Nouveau Pharmacien',
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
