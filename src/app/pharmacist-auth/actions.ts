'use server';

import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function signInAsPharmacistAction(): Promise<{ url?: string; error?: string }> {
  const supabase = createSupabaseServerClient();
  const origin = new URL(process.env.NEXT_PUBLIC_APP_URL!).origin;

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${origin}/auth/callback?next=/admin`, // Redirect to admin after login
    },
  });

  if (error) {
    return { error: error.message };
  }

  return { url: data.url };
}
