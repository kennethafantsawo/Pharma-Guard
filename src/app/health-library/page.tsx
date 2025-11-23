
'use client';

import { useEffect, useState } from 'react';
import { PageWrapper } from '@/components/shared/page-wrapper';
import { HealthPostCard } from './HealthPostCard';
import { getHealthPostsAction } from './actions';
import type { HealthPost } from '@/lib/types';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { BookOpen, AlertCircle, LoaderCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function HealthLibraryPage() {
  const [posts, setPosts] = useState<HealthPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      const result = await getHealthPostsAction();

      if (result.success && result.data) {
        setPosts(result.data);
      } else {
        console.error('Error fetching health posts:', result.error);
        setError(result.error || 'Impossible de charger les fiches santé.');
      }
      setLoading(false);
    };

    fetchPosts();
  }, []);

  return (
    <PageWrapper>
      <div className="container mx-auto px-4 md:px-6 py-8 animate-in fade-in duration-500">
        <div className="max-w-3xl mx-auto">
          <header className="mb-8 text-center">
            <div className="inline-block p-4 bg-primary/10 rounded-xl mb-4">
              <BookOpen className="h-10 w-10 text-primary" />
            </div>
            <h1 className="text-4xl font-bold font-headline text-foreground">Fiches Santé</h1>
            <p className="text-muted-foreground mt-2 text-lg">
              Conseils, astuces et informations utiles pour votre bien-être au quotidien.
            </p>
          </header>

          {loading ? (
            <div className="space-y-6">
              <Skeleton className="w-full h-48" />
              <Skeleton className="w-full h-48" />
            </div>
          ) : error ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Erreur</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : posts.length > 0 ? (
            <div className="border rounded-lg">
              {posts.map((post, index) => (
                <div key={post.id} className={index === posts.length - 1 ? '' : 'border-b'}>
                   <HealthPostCard post={post} />
                </div>
              ))}
            </div>
          ) : (
            <Alert>
              <BookOpen className="h-4 w-4" />
              <AlertTitle>Aucun article disponible</AlertTitle>
              <AlertDescription>
                Aucune fiche santé n'a été publiée pour le moment. Revenez bientôt !
              </AlertDescription>
            </Alert>
          )}
        </div>
      </div>
    </PageWrapper>
  );
}
