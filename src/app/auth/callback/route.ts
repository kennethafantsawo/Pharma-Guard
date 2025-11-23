
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { getPharmacistProfile } from '@/app/pharmacist-auth/actions';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // if "next" is in param, use it as the redirect URL
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = createSupabaseServerClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // After successful session exchange, ensure the profile is created/updated
      // This is especially important for the first login of a pharmacist
      if (next.includes('pharmacist')) {
        await getPharmacistProfile();
      }
      return NextResponse.redirect(`${origin}${next}`)
    }
    console.error('Auth callback error:', error.message)
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
