
'use client';

import { useState, useTransition } from 'react';
import { PageWrapper } from '@/components/shared/page-wrapper';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { BookOpen, AlertCircle, Sparkles, LoaderCircle, ArrowLeft } from 'lucide-react';
import { generateHealthPost, type GenerateHealthPostOutput } from '@/ai/flows/generate-health-post';

const healthTopics = [
  "Les bienfaits d'un sommeil réparateur",
  "Conseils pour gérer le stress au quotidien",
  "L'importance d'une alimentation équilibrée",
  "Les bases de l'hydratation : pourquoi et comment bien boire",
  "Activité physique : trouver le rythme qui vous convient",
  "Prendre soin de sa santé mentale",
  "Prévenir les maux de dos au travail",
  "Protéger sa peau du soleil efficacement",
];

export default function HealthLibraryPage() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [generatedPost, setGeneratedPost] = useState<GenerateHealthPostOutput | null>(null);

  const handleGeneratePost = (topic: string) => {
    setError(null);
    setGeneratedPost(null);
    startTransition(async () => {
      try {
        const response = await generateHealthPost({ topic });
        setGeneratedPost(response);
      } catch (err) {
        console.error("AI Error:", err);
        setError("Une erreur est survenue lors de la génération de l'article. Veuillez réessayer.");
      }
    });
  };

  const handleBack = () => {
    setGeneratedPost(null);
    setError(null);
  };

  return (
    <PageWrapper>
      <div className="container mx-auto px-4 md:px-6 py-8 animate-in fade-in duration-500">
        <div className="max-w-3xl mx-auto">
          <header className="mb-8 text-center">
             <div className="inline-block p-4 bg-primary/10 rounded-xl mb-4">
              <BookOpen className="h-10 w-10 text-primary" />
            </div>
            <h1 className="text-4xl font-bold font-headline text-foreground">Fiches Santé par IA</h1>
            <p className="text-muted-foreground mt-2 text-lg">
              {generatedPost 
                ? "Voici votre article personnalisé."
                : "Choisissez un sujet et laissez notre IA rédiger une fiche conseil pour vous."
              }
            </p>
          </header>

          {isPending && (
            <div className="text-center text-muted-foreground flex flex-col items-center justify-center gap-3 py-8">
              <Sparkles className="h-12 w-12 text-primary animate-pulse" />
              <p className="flex items-center gap-2"><LoaderCircle className="animate-spin" /> L'IA est en train de rédiger votre article...</p>
              <p className="text-sm">Cela peut prendre quelques instants.</p>
            </div>
          )}

          {error && !isPending && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Erreur de génération</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {!isPending && !generatedPost && (
            <Card>
                <CardHeader>
                    <CardTitle>Sujets disponibles</CardTitle>
                    <CardDescription>Cliquez sur un sujet pour générer une fiche santé.</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {healthTopics.map((topic, index) => (
                        <Button key={index} variant="outline" className="h-auto py-3 justify-start" onClick={() => handleGeneratePost(topic)}>
                           <Sparkles className="mr-3 text-primary/70" />
                           <span className="flex-1 text-left">{topic}</span>
                        </Button>
                    ))}
                </CardContent>
            </Card>
          )}

          {generatedPost && !isPending && (
            <div className="animate-in fade-in duration-500">
                <Button onClick={handleBack} variant="outline" className="mb-6">
                    <ArrowLeft className="mr-2"/> Retour aux sujets
                </Button>
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline text-2xl text-primary">{generatedPost.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="prose prose-zinc dark:prose-invert max-w-none text-base text-foreground/90 whitespace-pre-wrap leading-relaxed">
                            {generatedPost.content}
                        </div>
                    </CardContent>
                </Card>
            </div>
          )}

        </div>
      </div>
    </PageWrapper>
  );
}
