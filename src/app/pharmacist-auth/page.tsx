
'use client';

import { useTransition } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LogIn } from 'lucide-react';
import { signInAsPharmacistAction } from './actions';
import { PageWrapper } from '@/components/shared/page-wrapper';
import { GoogleIcon } from '@/components/icons/GoogleIcon';


export default function PharmacistAuthPage() {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handlePharmacistSignIn = async () => {
    startTransition(async () => {
        const result = await signInAsPharmacistAction();
        if (result.error) {
          toast({ title: 'Erreur de connexion', description: result.error, variant: 'destructive' });
        }
        if (result.url) {
            window.location.href = result.url;
        }
    });
  };

  return (
    <PageWrapper>
        <div className="container mx-auto px-4 md:px-6 py-8 animate-in fade-in duration-500">
            <div className="max-w-md mx-auto">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><LogIn />Espace Pharmacien</CardTitle>
                        <CardDescription>Connectez-vous ou inscrivez-vous avec votre compte Google pour accéder à votre espace.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button type="button" onClick={handlePharmacistSignIn} className="w-full" variant="outline" disabled={isPending}>
                            <GoogleIcon /> Se connecter avec Google
                        </Button>
                        <p className="text-xs text-muted-foreground mt-2 text-center">
                            La connexion est réservée aux pharmaciens partenaires.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    </PageWrapper>
  );
}

    