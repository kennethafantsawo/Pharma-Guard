
'use client';

import { useState, useTransition, useEffect } from 'react';
import { PageWrapper } from '@/components/shared/page-wrapper';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, AlertCircle, RefreshCw, LoaderCircle, Sparkles } from 'lucide-react';
import { generateHealthTips, type HealthTip } from './actions';

export default function HealthLibraryPage() {
  const [tips, setTips] = useState<HealthTip[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleGenerateTips = () => {
    startTransition(async () => {
      setError(null);
      const result = await generateHealthTips();
      if (result.success && result.tips) {
        setTips(result.tips);
      } else {
        setError(result.error || "Une erreur est survenue lors de la génération des conseils.");
        setTips([]);
      }
    });
  };

  // Generate initial tips on component mount
  useEffect(() => {
    handleGenerateTips();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <PageWrapper>
      <div className="container mx-auto px-4 md:px-6 py-8 animate-in fade-in duration-500">
        <div className="max-w-3xl mx-auto">
          <header className="mb-6 text-center">
             <div className="inline-block p-4 bg-primary/10 rounded-xl mb-4">
              <BookOpen className="h-10 w-10 text-primary" />
            </div>
            <h1 className="text-4xl font-bold font-headline text-foreground">Conseils Santé du Jour</h1>
            <p className="text-muted-foreground mt-2 text-lg">
              Découvrez des conseils santé générés par notre IA pour vous aider à rester en forme.
            </p>
          </header>

          <div className="mb-8 flex justify-center">
            <Button onClick={handleGenerateTips} disabled={isPending} size="lg">
              {isPending ? (
                <LoaderCircle className="h-5 w-5 animate-spin" />
              ) : (
                <RefreshCw className="h-5 w-5" />
              )}
              <span>{isPending ? 'Génération...' : 'Nouveaux conseils'}</span>
            </Button>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4"/>
              <AlertTitle>Erreur de Génération</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            {isPending && tips.length === 0 ? (
                Array.from({ length: 5 }).map((_, i) => (
                    <Card key={i} className="animate-pulse">
                        <CardHeader>
                           <div className="h-6 w-3/4 bg-muted rounded-md" />
                        </CardHeader>
                        <CardContent>
                            <div className="h-4 w-full bg-muted rounded-md mb-2" />
                            <div className="h-4 w-5/6 bg-muted rounded-md" />
                        </CardContent>
                    </Card>
                ))
            ) : tips.length > 0 ? (
              tips.map((tip, index) => (
                <Card key={index} className="animate-in fade-in-50 duration-500">
                  <CardHeader>
                    <CardTitle className="flex items-start gap-3 text-primary font-headline text-xl">
                      <Sparkles className="h-5 w-5 mt-1 flex-shrink-0" />
                      <span>{tip.title}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-foreground/90 whitespace-pre-wrap">{tip.content}</p>
                  </CardContent>
                </Card>
              ))
            ) : !isPending && (
              <Alert>
                <AlertCircle className="h-4 w-4"/>
                <AlertTitle>Aucun conseil disponible</AlertTitle>
                <AlertDescription>
                  Cliquez sur le bouton ci-dessus pour générer de nouveaux conseils santé.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
