'use server';

import { createSupabaseServerClient, createSupabaseAdminClient } from '@/lib/supabase/server';
import { z } from 'zod';
import { redirect } from 'next/navigation';

const signInSchema = z.object({
  pharmacyName: z.string().min(1, 'Le nom de la pharmacie est requis.'),
  password: z.string().min(1, 'Le mot de passe est requis.'),
});

export async function signInWithPharmacyAction(formData: FormData) {
  const data = Object.fromEntries(formData.entries());
  const validatedFields = signInSchema.safeParse(data);

  if (!validatedFields.success) {
    return {
      error: 'Données invalides. Vérifiez les champs.',
    };
  }

  const { pharmacyName, password } = validatedFields.data;
  const supabase = createSupabaseServerClient();
  const supabaseAdmin = createSupabaseAdminClient();
  if (!supabaseAdmin) {
    return { error: "La configuration de l'administrateur Supabase est manquante." };
  }

  const email = `${pharmacyName.toLowerCase().replace(/\s+/g, '.')}@pharmaguard.app`;
  
  // 1. Vérifier si le mot de passe dans le profil est correct
  const { data: profile, error: profileError } = await supabaseAdmin
    .from('profiles')
    .select('id, password')
    .eq('pharmacy_name', pharmacyName)
    .single();

  if (profileError || !profile || profile.password !== password) {
      return { error: 'Nom de pharmacie ou mot de passe incorrect.' };
  }

  // 2. Si le mot de passe est correct, connecter l'utilisateur via Supabase Auth
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password: password,
  });
  
  if (signInError) {
    // Cette erreur peut se produire si le mot de passe dans Auth est désynchronisé
    // avec celui de notre table 'profiles'.
    console.error('Sign In Error (might be desync):', signInError);
    return { error: 'Erreur de connexion. Veuillez contacter l\'administrateur pour réinitialiser votre mot de passe.' };
  }


  // 3. En cas de succès, redirection vers le tableau de bord
  redirect('/pharmacist-dashboard');
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
    redirect('/');
}
