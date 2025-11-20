
'use client';

import { useState, useEffect } from 'react';
import { PageWrapper } from '@/components/shared/page-wrapper';
import { Search } from 'lucide-react';
import { AuthForm } from './AuthForm';
import { SearchForm } from './SearchForm';
import type { Database } from '@/lib/supabase/client';
import { RecentSearches } from './RecentSearches';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/lib/supabase/client';
import { getProfileFromSession } from './actions';
import { useToast } from '@/hooks/use-toast';

type Profile = Database['public']['Tables']['profiles']['Row'];

export default function ProductSearchPage() {
  const [user, setUser] = useState<Profile | null>(null);
  const [lastSearchTimestamp, setLastSearchTimestamp] = useState(Date.now());
  const { toast } = useToast();

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          const result = await getProfileFromSession();
          if (result.success && result.user) {
            setUser(result.user);
            toast({ title: 'Connexion réussie', description: `Bienvenue, ${result.user.username} !` });
          } else if (result.error) {
            toast({ title: 'Erreur de profil', description: result.error, variant: 'destructive' });
          }
        }
      }
    );

    // Initial check in case user is already logged in
    const checkInitialSession = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
            const result = await getProfileFromSession();
            if (result.success && result.user) {
                setUser(result.user);
            }
        }
    }
    checkInitialSession();

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [toast]);


  const handleLoginSuccess = (loggedInUser: Profile) => {
    setUser(loggedInUser);
  };
  
  const handleNewSearch = () => {
    // This will trigger a re-fetch in RecentSearches
    setLastSearchTimestamp(Date.now());
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
            <div className="space-y-12">
              <SearchForm user={user} onNewSearch={handleNewSearch} />
              <Separator />
              <RecentSearches user={user} key={lastSearchTimestamp} />
            </div>
          ) : (
            <AuthForm onLoginSuccess={handleLoginSuccess} />
          )}

        </div>
      </div>
    </PageWrapper>
  );
}
