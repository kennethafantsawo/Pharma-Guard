
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
      return NextResponse.redirect(`${origin}${next}`)
    }
     // Log l'erreur détaillée côté serveur
    console.error('Auth callback session exchange error:', error.message);
  } else {
    console.error('Auth callback error: No code received.');
  }


  // En cas d'erreur (lien invalide, expiré, etc.), rediriger vers la page de connexion
  // avec un message d'erreur clair pour l'utilisateur.
  const redirectUrl = new URL('/pharmacist-auth', origin);
  redirectUrl.searchParams.set('error', 'invalid_link');
  redirectUrl.searchParams.set('error_description', 'Le lien de connexion est invalide ou a expiré. Veuillez réessayer.');
  return NextResponse.redirect(redirectUrl);
}
