'use server';

import { createSupabaseServerClient } from '@/lib/supabase/server';
import { headers } from 'next/headers';

export async function signInAsPharmacistAction(): Promise<{ url?: string; error?: string }> {
  const supabase = createSupabaseServerClient();
  const origin = headers().get('origin')!;

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${origin}/auth/callback?next=/pharmacist-dashboard`,
      queryParams: {
        prompt: 'consent',
      }
    },
  });

  if (error) {
    return { error: error.message };
  }

  return { url: data.url };
}

export async function getPharmacistProfile() {
    const supabase = createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { user: null, profile: null };
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
    
    // This is a crucial step: if a user logs in but has no profile,
    // it means they are a new user. We must create a profile for them
    // with the 'Pharmacien' role.
    if (!profile) {
        const { data: newProfile, error } = await supabase
            .from('profiles')
            .insert({
                id: user.id,
                username: user.user_metadata.full_name || user.email || 'Nouveau Pharmacien',
                role: 'Pharmacien', // Assign the 'Pharmacien' role
            })
            .select()
            .single();

        if (error) {
            console.error("Error creating pharmacist profile:", error);
            return { user, profile: null };
        }
        return { user, profile: newProfile };
    }

    // Also ensure their role is Pharmacien if they exist
    if (profile.role !== 'Pharmacien') {
        const { data: updatedProfile, error } = await supabase
            .from('profiles')
            .update({ role: 'Pharmacien' })
            .eq('id', user.id)
            .select()
            .single();
        if (error) {
             console.error("Error updating pharmacist role:", error);
             return { user, profile };
        }
        return { user, profile: updatedProfile };
    }
    
    return { user, profile };
}

export async function signOutAction() {
    const supabase = createSupabaseServerClient();
    await supabase.auth.signOut();
}
