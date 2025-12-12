
'use server';

import { createSupabaseServerClient } from '@/lib/supabase/server';
import { headers } from 'next/headers';
import type { Database } from '@/lib/supabase/database.types';

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

export async function getPharmacistProfile(): Promise<{
    user: Database['public']['Tables']['profiles']['Row'] | null, 
    profile: Database['public']['Tables']['profiles']['Row'] | null 
}> {
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
    
    if (!profile) {
        const { data: newProfile, error } = await supabase
            .from('profiles')
            .insert({
                id: user.id,
                username: user.user_metadata.full_name || user.email || 'Nouveau Pharmacien',
                role: 'Pharmacien',
            })
            .select()
            .single();

        if (error) {
            console.error("Error creating pharmacist profile:", error);
            return { user: user as any, profile: null };
        }
        return { user: user as any, profile: newProfile };
    }

    if (profile.role !== 'Pharmacien') {
        const { data: updatedProfile, error } = await supabase
            .from('profiles')
            .update({ role: 'Pharmacien' })
            .eq('id', user.id)
            .select()
            .single();
        if (error) {
             console.error("Error updating pharmacist role:", error);
             return { user: user as any, profile };
        }
        return { user: user as any, profile: updatedProfile };
    }
    
    return { user: user as any, profile };
}

export async function signOutAction() {
    const supabase = createSupabaseServerClient();
    await supabase.auth.signOut();
}

    