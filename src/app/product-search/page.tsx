
'use client';

import { PageWrapper } from '@/components/shared/page-wrapper';
import { Search } from 'lucide-react';
import { SearchForm } from './SearchForm';

export default function ProductSearchPage() {

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
              Vérifiez la disponibilité d'un produit dans les pharmacies proches de vous. Renseignez votre numéro pour être contacté.
            </p>
          </header>
          
          <SearchForm />

        </div>
      </div>
    </PageWrapper>
  );
}
