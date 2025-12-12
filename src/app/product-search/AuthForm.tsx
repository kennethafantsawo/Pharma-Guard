
'use client';

import { useTransition } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LogIn } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { GoogleIcon } from '@/components/icons/GoogleIcon';


export function AuthForm() {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleGoogleSignIn = async () => {
    startTransition(async () => {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: `${window.location.origin}/auth/callback?next=/product-search`,
            queryParams: {
                prompt: 'consent',
            }
          },
        });
        if (error) {
          toast({ title: 'Erreur Google', description: error.message, variant: 'destructive' });
        }
    });
  };

  return (
    <Card className="w-full max-w-md mx-auto">
        <CardHeader>
            <CardTitle className="flex items-center gap-2"><LogIn />Connexion / Inscription</CardTitle>
            <CardDescription>Utilisez votre compte Google pour accéder à la recherche de produits. C'est rapide et sécurisé.</CardDescription>
        </CardHeader>
        <CardContent>
            <Button type="button" onClick={handleGoogleSignIn} className="w-full" variant="outline" disabled={isPending}>
                <GoogleIcon /> Se connecter avec Google
            </Button>
            <p className="text-xs text-muted-foreground mt-2 text-center">
                La connexion est requise pour envoyer des demandes aux pharmaciens.
            </p>
        </CardContent>
    </Card>
  );
}

    