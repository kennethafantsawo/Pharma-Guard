
'use server';

import { createSupabaseServerClient } from '@/lib/supabase/server';
import { z } from 'zod';
import { redirect } from 'next/navigation';

const signInSchema = z.object({
  pharmacyName: z.string().min(1, 'Le nom de la pharmacie est requis.'),
  password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères.'),
  isNew: z.boolean(),
});

export async function signInWithPharmacyAction(formData: FormData) {
  const data = Object.fromEntries(formData.entries());
  const validatedFields = signInSchema.safeParse({
    ...data,
    isNew: data.isNew === 'true',
  });

  if (!validatedFields.success) {
    return {
      error: 'Données invalides. Vérifiez les champs.',
    };
  }

  const { pharmacyName, password, isNew } = validatedFields.data;
  const supabase = createSupabaseServerClient();

  // Create a user-friendly email format
  const email = `${pharmacyName.toLowerCase().replace(/\s+/g, '.')}@pharmaguard.app`;
  
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://pharma-proget.vercel.app';
  const emailRedirectTo = `${appUrl}/auth/callback`;

  if (isNew) {
    // Sign up a new user (pharmacy)
    const { data: { user }, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo,
        data: {
          username: pharmacyName,
          pharmacy_name: pharmacyName,
          role: 'Pharmacien',
        },
      },
    });

    if (signUpError) {
      console.error('Sign Up Error:', signUpError);
      if (signUpError.message.includes('User already registered')) {
        return { error: `Cette pharmacie existe déjà. Essayez de vous connecter.` };
      }
      return { error: `Impossible de créer le compte : ${signUpError.message}` };
    }

     if (!user) {
        return { error: 'La création a échoué, aucun utilisateur retourné.' };
    }

  }

  // Sign in the user (pharmacy)
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (signInError) {
    console.error('Sign In Error:', signInError);
    return { error: 'Échec de la connexion. Vérifiez le nom de la pharmacie et le mot de passe.' };
  }

  // On success, redirect to the dashboard
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
