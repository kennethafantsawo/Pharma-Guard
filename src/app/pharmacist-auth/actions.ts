
'use server';

import { createSupabaseServerClient } from '@/lib/supabase/server';
import { z } from 'zod';

const emailSchema = z.string().email('L\'adresse e-mail doit être valide.');

export async function signInWithEmailAction(email: string): Promise<{ success: boolean; error?: string }> {
    const validatedEmail = emailSchema.safeParse(email);
    if (!validatedEmail.success) {
        return { success: false, error: 'Adresse e-mail invalide.' };
    }

    const supabase = createSupabaseServerClient();
    // Use NEXT_PUBLIC_APP_URL for local dev, but fallback to the production URL.
    // This makes sure it works in both environments without manual config on the hosting provider.
    const origin = process.env.NEXT_PUBLIC_APP_URL || 'https://pharma-proget.vercel.app';

    const { error } = await supabase.auth.signInWithOtp({
        email: validatedEmail.data,
        options: {
            // The magic link will send the user to the callback page,
            // which will then redirect them to the dashboard.
            emailRedirectTo: `${origin}/auth/callback?next=/pharmacist-dashboard`,
        },
    });

    if (error) {
        console.error("signInWithOtp (magic link) Error:", error);
        return { success: false, error: "Impossible d'envoyer le lien de connexion. Assurez-vous que l'e-mail est correct." };
    }
    return { success: true };
}

export async function getPharmacistProfile() {
    const supabase = createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { user: null, profile: null, error: "Utilisateur non trouvé." };
    }

    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
    
    if (profileError && profileError.code !== 'PGRST116') { // Ignore "no rows found"
        console.error("Error fetching pharmacist profile:", profileError);
        return { user: user, profile: null, error: "Erreur lors de la récupération du profil." };
    }
    
    return { user, profile: profile || null, error: undefined };
}

export async function signOutAction() {
    const supabase = createSupabaseServerClient();
    await supabase.auth.signOut();
}
