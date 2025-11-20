
'use client';

import { useState } from 'react';
import { PageWrapper } from '@/components/shared/page-wrapper';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Search } from 'lucide-react';
import { AuthForm } from './AuthForm';
import type { Database } from '@/lib/supabase/client';

type Profile = Database['public']['Tables']['profiles']['Row'];

// This will be the main page for the "Pharma-Connect" feature.
// It will first show a login/signup form.
// Once authenticated, it will show the product search interface.

export default function ProductSearchPage() {
  const [user, setUser] = useState<Profile | null>(null);

  const handleLoginSuccess = (loggedInUser: Profile) => {
    setUser(loggedInUser);
  };
  
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

          {user ? (
            <Card>
              <CardHeader>
                <CardTitle>Bienvenue, {user.username} !</CardTitle>
                <CardDescription>
                  Vous êtes connecté en tant que {user.role}.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p>Interface de recherche de produit (à venir)...</p>
              </CardContent>
            </Card>
          ) : (
            <AuthForm onLoginSuccess={handleLoginSuccess} />
          )}

        </div>
      </div>
    </PageWrapper>
  );
}
