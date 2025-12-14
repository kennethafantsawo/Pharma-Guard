
'use server';

import { PageWrapper } from '@/components/shared/page-wrapper';
import { Search, Info } from 'lucide-react';
import { SearchForm } from './SearchForm';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default async function ProductSearchPage() {
  // Client-side is now anonymous, so we don't check for a user session here.
  // We can decide later if we want to track anonymous sessions.
  
  return (
    <PageWrapper>
      <div className="container mx-auto px-4 md:px-6 py-8 animate-in fade-in duration-500">
        <div className="max-w-3xl mx-auto space-y-8">
          <header className="text-center">
            <div className="inline-block p-4 bg-accent/10 rounded-xl">
              <Search className="h-10 w-10 text-accent" />
            </div>
            <h1 className="text-4xl font-bold font-headline text-foreground mt-4">Rechercher un Produit</h1>
            <p className="text-muted-foreground mt-2 text-lg">
              Vérifiez la disponibilité d'un produit dans les pharmacies proches de vous.
            </p>
          </header>

          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>Fonctionnalité en cours de développement</AlertTitle>
            <AlertDescription>
              Ce service de recherche de produits n'est pas encore actif. Les demandes soumises ne seront pas encore traitées par les pharmacies. Merci de votre compréhension.
            </AlertDescription>
          </Alert>
          
          <SearchForm />
        </div>
      </div>
    </PageWrapper>
  );
}
