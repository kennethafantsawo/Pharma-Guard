
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // if "next" is in param, use it as the redirect URL
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = createSupabaseServerClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      // On success, redirect to the originally intended page (e.g., /pharmacist-dashboard)
      return NextResponse.redirect(`${origin}${next}`)
    }
     // Log the detailed error on the server for debugging
    console.error('Auth callback session exchange error:', error.message);
  } else {
    console.error('Auth callback error: No code received in search params.');
  }

  // On any error (invalid link, expired, no code, etc.), redirect to the login page
  // with a clear error message for the user.
  const redirectUrl = new URL('/pharmacist-auth', origin);
  redirectUrl.searchParams.set('error', 'invalid_link');
  redirectUrl.searchParams.set('error_description', 'Le lien de connexion est invalide ou a expiré. Veuillez réessayer.');
  return NextResponse.redirect(redirectUrl);
}
