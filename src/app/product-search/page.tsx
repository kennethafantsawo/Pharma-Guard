
'use client';

import { PageWrapper } from '@/components/shared/page-wrapper';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Search } from 'lucide-react';

// This will be the main page for the "Pharma-Connect" feature.
// It will first show a login/signup form.
// Once authenticated, it will show the product search interface.

export default function ProductSearchPage() {
  const isAuthenticated = false; // This will be replaced with real auth state later

  return (
    <PageWrapper>
      <div className="container mx-auto px-4 md:px-6 py-8 animate-in fade-in duration-500">
        <div className="max-w-3xl mx-auto">
          <header className="mb-8 text-center">
            <div className="inline-block p-4 bg-accent/10 rounded-xl">
              <Search className="h-10 w-10 text-accent" />
            </div>
            <h1 className="text-4xl font-bold font-headline text-foreground mt-4">Rechercher un Produit</h1>
            <p className="text-muted-foreground mt-2 text-lg">
              Vérifiez la disponibilité d'un produit dans les pharmacies proches de vous.
            </p>
          </header>

          {isAuthenticated ? (
            <p>Interface de recherche de produit (à venir)</p>
          ) : (
            <Card>
                <CardHeader>
                    <CardTitle>Connexion Requise</CardTitle>
                    <CardDescription>
                        Pour rechercher un produit, vous devez vous connecter ou créer un compte.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p>Formulaire de connexion/inscription (à venir)</p>
                </CardContent>
            </Card>
          )}

        </div>
      </div>
    </PageWrapper>
  );
}
