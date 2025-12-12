
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PageWrapper } from '@/components/shared/page-wrapper';
import { getPharmacistProfile, signOutAction } from '@/app/pharmacist-auth/actions';
import { getAllSearchesAction } from './actions';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { LogOut, LayoutDashboard } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { SearchCard } from '../product-search/SearchCard';
import type { Database } from '@/lib/supabase/database.types';

type User = Awaited<ReturnType<typeof getPharmacistProfile>>['user'];
type Profile = Awaited<ReturnType<typeof getPharmacistProfile>>['profile'];
type SearchWithResponsesArray = Awaited<ReturnType<typeof getAllSearchesAction>>['data'];


export default function PharmacistDashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [searches, setSearches] = useState<SearchWithResponsesArray>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      setLoading(true);
      const { user, profile } = await getPharmacistProfile();
      
      if (!user || !profile || profile.role !== 'Pharmacien') {
        router.push('/pharmacist-auth');
        return;
      }
      
      // NEW: Redirect to profile completion if pharmacy_name is missing
      if (!profile.pharmacy_name) {
        router.push('/pharmacist-profile');
        return;
      }

      setUser(user);
      setProfile(profile);

      const result = await getAllSearchesAction();
      if (result.success && result.data) {
        setSearches(result.data);
      } else {
        setError(result.error || "Impossible de charger les demandes.");
      }
      setLoading(false);
    };
    checkUser();
  }, [router]);

  const handleSignOut = async () => {
    await signOutAction();
    router.push('/');
  };

  if (loading) {
    return (
      <PageWrapper>
        <div className="container mx-auto px-4 md:px-6 py-8">
          <Skeleton className="h-10 w-1/3 mb-4" />
          <Skeleton className="h-8 w-1/4 mb-8" />
          <div className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </PageWrapper>
    );
  }
  
  if (!profile) {
    // This state should be brief as the user is redirected.
    // You can return null or a minimal loader.
    return <PageWrapper><div className="container p-8">Redirection...</div></PageWrapper>;
  }

  return (
    <PageWrapper>
      <div className="container mx-auto px-4 md:px-6 py-8">
        <header className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold font-headline text-foreground flex items-center gap-3">
              <LayoutDashboard/> Tableau de bord
            </h1>
            <p className="text-muted-foreground mt-1">Bienvenue, {profile.username} ({profile.pharmacy_name}). Voici les dernières demandes.</p>
          </div>
          <Button onClick={handleSignOut} variant="outline">
            <LogOut className="mr-2" /> Se déconnecter
          </Button>
        </header>

        <main className="space-y-6">
            {error && (
                <Alert variant="destructive">
                    <AlertTitle>Erreur</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {searches && searches.length > 0 ? (
                searches.map(search => (
                    <SearchCard key={search.id} search={search} isPharmacistView={true} />
                ))
            ) : (
                 <div className="text-center py-10 px-4 border-2 border-dashed rounded-lg">
                    <h3 className="text-lg font-medium">Aucune demande pour l'instant</h3>
                    <p className="mt-1 text-sm text-muted-foreground">Revenez plus tard pour voir les nouvelles demandes des clients.</p>
                </div>
            )}
        </main>
      </div>
    </PageWrapper>
  );
}

    