
'use server';

import { createSupabaseServerClient, createSupabaseAdminClient } from '@/lib/supabase/server';
import { z } from 'zod';
import { redirect } from 'next/navigation';
import crypto from 'crypto';

// Fonction pour générer un mot de passe aléatoire
function generateRandomPassword(length = 8) {
  return crypto.randomBytes(length).toString('hex').slice(0, length);
}

const signInSchema = z.object({
  pharmacyName: z.string().min(1, 'Le nom de la pharmacie est requis.'),
  password: z.string().min(1, 'Le mot de passe est requis.'),
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
  const supabaseAdmin = createSupabaseAdminClient();
  if (!supabaseAdmin) {
    return { error: "La configuration de l'administrateur Supabase est manquante." };
  }

  // Créer un format d'email convivial et unique
  const email = `${pharmacyName.toLowerCase().replace(/\s+/g, '.')}@pharmaguard.app`;
  
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const emailRedirectTo = `${appUrl}/auth/callback`;

  if (isNew) {
    // 1. Créer un nouvel utilisateur (pharmacie)
    const generatedPassword = generateRandomPassword(8); // Génère un mot de passe sécurisé
    const { data: { user }, error: signUpError } = await supabase.auth.signUp({
      email,
      password: generatedPassword, // Utilise le mot de passe généré pour la création du compte
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
    
    // 2. Stocker le mot de passe saisi par l'utilisateur dans le profil
    const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .update({ password: password }) // Stocke le mot de passe du formulaire
        .eq('id', user.id);

    if (profileError) {
        console.error('Profile password update error:', profileError);
        // Tenter de nettoyer l'utilisateur créé si la mise à jour du profil échoue
        await supabaseAdmin.auth.admin.deleteUser(user.id);
        return { error: 'Impossible de définir le mot de passe pour le nouveau profil.' };
    }

    // Le compte est créé, maintenant on connecte l'utilisateur avec le mot de passe qu'il a choisi
  }

  // 3. Connexion de l'utilisateur
  // D'abord, on récupère l'utilisateur par email pour vérifier son profil
  const { data: userByEmail, error: userError } = await supabaseAdmin.from('users').select('id').eq('email', email).single();
  if (userError || !userByEmail) {
      return { error: 'Aucun compte trouvé pour cette pharmacie.' };
  }

  // Ensuite, on vérifie le mot de passe stocké dans le profil
  const { data: profile, error: profileError } = await supabaseAdmin
    .from('profiles')
    .select('password')
    .eq('id', userByEmail.id)
    .single();

  if (profileError || !profile) {
    return { error: 'Profil de pharmacie introuvable.' };
  }

  if (profile.password !== password) {
    return { error: 'Mot de passe incorrect.' };
  }
  
  // Si le mot de passe du profil correspond, on connecte l'utilisateur
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password: password, // Il faut se connecter avec le mot de passe du profil
  });

  if (signInError) {
      // Si la connexion échoue, cela peut être dû à un décalage de mot de passe.
      // On met à jour le mot de passe Supabase Auth pour correspondre à celui du profil.
      const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(userByEmail.id, { password: password });
      if (updateError) {
          console.error('Admin user update error:', updateError);
          return { error: 'Impossible de synchroniser les informations de connexion. Veuillez réessayer.' };
      }
      // On retente la connexion après la mise à jour
      const { error: retrySignInError } = await supabase.auth.signInWithPassword({ email, password });
      if (retrySignInError) {
          console.error('Retry Sign In Error:', retrySignInError);
          return { error: 'Échec de la connexion après synchronisation. Vérifiez le mot de passe.' };
      }
  }


  // En cas de succès, redirection vers le tableau de bord
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
