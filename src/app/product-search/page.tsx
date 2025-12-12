'use server';

import { PageWrapper } from '@/components/shared/page-wrapper';
import { Search } from 'lucide-react';
import { SearchForm } from './SearchForm';
import { RecentSearches } from './RecentSearches';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export default async function ProductSearchPage() {
  // Client-side is now anonymous, so we don't check for a user session here.
  // We can decide later if we want to track anonymous sessions.
  
  return (
    <PageWrapper>
      <div className="container mx-auto px-4 md:px-6 py-8 animate-in fade-in duration-500">
        <div className="max-w-3xl mx-auto space-y-12">
          <header className="mb-8 text-center">
            <div className="inline-block p-4 bg-accent/10 rounded-xl">
              <Search className="h-10 w-10 text-accent" />
            </div>
            <h1 className="text-4xl font-bold font-headline text-foreground mt-4">Rechercher un Produit</h1>
            <p className="text-muted-foreground mt-2 text-lg">
              Vérifiez la disponibilité d'un produit dans les pharmacies proches de vous, sans avoir besoin de créer un compte.
            </p>
          </header>
          
          <SearchForm />
          {/* We remove RecentSearches as it requires a user session.
              We can re-introduce this later with anonymous session tracking if needed. */}
        </div>
      </div>
    </PageWrapper>
  );
}
