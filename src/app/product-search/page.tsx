
'use client';

import { useState, useEffect, useTransition } from 'react';
import { PageWrapper } from '@/components/shared/page-wrapper';
import { Search, LogOut, LoaderCircle } from 'lucide-react';
import { AuthForm } from './AuthForm';
import { SearchForm } from './SearchForm';
import type { Database } from '@/lib/supabase/client';
import { RecentSearches } from './RecentSearches';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/lib/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { getUserProfile } from './actions';

type Profile = Database['public']['Tables']['profiles']['Row'];

export default function ProductSearchPage() {
  const [user, setUser] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoggingOut, startLogoutTransition] = useTransition();
  const [lastSearchTimestamp, setLastSearchTimestamp] = useState(Date.now());
  const { toast } = useToast();

  useEffect(() => {
    const checkUser = async () => {
      setLoading(true);
      const userProfile = await getUserProfile();
      setUser(userProfile);
      setLoading(false);
    };

    checkUser();
  }, []);

  const handleLoginSuccess = (loggedInUser: Profile) => {
    setUser(loggedInUser);
  };
  
  const handleNewSearch = () => {
    setLastSearchTimestamp(Date.now());
  };

  const handleLogout = async () => {
    startLogoutTransition(async () => {
      if (!supabase) return;
      const { error } = await supabase.auth.signOut();
      if (error) {
        toast({ title: 'Erreur', description: 'Impossible de se déconnecter.', variant: 'destructive' });
      } else {
        setUser(null);
        toast({ title: 'Déconnecté', description: 'Vous avez été déconnecté avec succès.' });
      }
    });
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

          {loading ? (
            <div className="flex justify-center items-center h-32">
                <LoaderCircle className="animate-spin h-8 w-8 text-muted-foreground" />
            </div>
          ) : user ? (
            <div className="space-y-12">
               <div className="text-center space-y-2">
                <p>Connecté en tant que <span className="font-bold text-accent">{user.username}</span> ({user.role})</p>
                <Button variant="ghost" size="sm" onClick={handleLogout} disabled={isLoggingOut}>
                  {isLoggingOut ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin"/> : <LogOut className="mr-2 h-4 w-4"/>}
                  Se déconnecter
                </Button>
              </div>
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
