
'use client';

import { useState, useEffect } from 'react';
import { getSearchesByClientAction } from './actions';
import type { Database } from '@/lib/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Inbox, AlertCircle } from 'lucide-react';
import { SearchCard } from './SearchCard';

type Profile = Database['public']['Tables']['profiles']['Row'];
type Search = Database['public']['Tables']['searches']['Row'];

interface RecentSearchesProps {
  user: Profile;
}

export function RecentSearches({ user }: RecentSearchesProps) {
  const [searches, setSearches] = useState<Search[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchSearches = async () => {
      setIsLoading(true);
      setError(null);
      const result = await getSearchesByClientAction(user.id);

      if (result.success && result.data) {
        setSearches(result.data);
      } else {
        setError(result.error || 'Une erreur est survenue.');
        toast({
          title: 'Erreur',
          description: result.error || 'Impossible de charger vos demandes récentes.',
          variant: 'destructive',
        });
      }
      setIsLoading(false);
    };

    fetchSearches();
  }, [user.id, toast]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-28 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Erreur</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold font-headline text-center">Mes demandes récentes</h2>
      {searches.length === 0 ? (
        <div className="text-center py-10 px-4 border-2 border-dashed rounded-lg">
            <Inbox className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-2 text-lg font-medium">Aucune demande pour l'instant</h3>
            <p className="mt-1 text-sm text-muted-foreground">Utilisez le formulaire ci-dessus pour rechercher un produit.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {searches.map(search => (
            <SearchCard key={search.id} search={search} />
          ))}
        </div>
      )}
    </div>
  );
}
