import { PageWrapper } from '@/components/shared/page-wrapper';
import { getHealthPostsAction } from './actions';
import { HealthLibraryClient } from './HealthLibraryClient';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, BookOpen } from 'lucide-react';


export default async function HealthLibraryPage() {
  const result = await getHealthPostsAction();

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

          {result.error ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Erreur de chargement</AlertTitle>
              <AlertDescription>{result.error}</AlertDescription>
            </Alert>
          ) : result.data && result.data.length > 0 ? (
            <HealthLibraryClient initialPosts={result.data} />
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
