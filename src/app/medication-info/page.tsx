
'use client';

import { useState, useTransition } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PageWrapper } from '@/components/shared/page-wrapper';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { LoaderCircle, Search, Pill, FileText, HeartPulse, AlertTriangle, ShieldAlert, Frown } from 'lucide-react';
import { medicationInfo, type MedicationInfoOutput } from '@/ai/flows/medication-info';

const SearchSchema = z.object({
  medicationName: z.string().min(2, 'Veuillez entrer au moins 2 caractères.'),
});

type SearchValues = z.infer<typeof SearchSchema>;

const ResultCard = ({ icon, title, content }: { icon: React.ReactNode, title: string, content: string }) => (
    <Card>
        <CardHeader>
            <CardTitle className="flex items-center gap-3 font-headline text-lg">
                {icon} {title}
            </CardTitle>
        </CardHeader>
        <CardContent>
            <p className="text-base text-foreground/90 whitespace-pre-wrap leading-relaxed">{content}</p>
        </CardContent>
    </Card>
);

export default function MedicationInfoPage() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<MedicationInfoOutput | null>(null);

  const form = useForm<SearchValues>({
    resolver: zodResolver(SearchSchema),
  });

  const onSubmit: SubmitHandler<SearchValues> = (data) => {
    setError(null);
    setResult(null);
    startTransition(async () => {
      try {
        const response = await medicationInfo(data);
        setResult(response);
      } catch (err) {
        console.error("Erreur de l'IA:", err);
        setError("Une erreur est survenue lors de la communication avec l'assistant IA. Veuillez réessayer.");
      }
    });
  };

  return (
    <PageWrapper>
      <div className="container mx-auto px-4 md:px-6 py-8 animate-in fade-in duration-500">
        <div className="max-w-3xl mx-auto">
          <header className="mb-8 text-center">
            <div className="inline-block p-4 bg-primary/10 rounded-xl mb-4">
              <Pill className="h-10 w-10 text-primary" />
            </div>
            <h1 className="text-4xl font-bold font-headline text-foreground">Informations Médicaments</h1>
            <p className="text-muted-foreground mt-2 text-lg">
              Obtenez des informations fiables sur un médicament ou une molécule grâce à notre assistant IA.
            </p>
          </header>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex items-start gap-2 mb-8">
              <FormField
                control={form.control}
                name="medicationName"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormControl>
                        <div className="relative">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            <Input placeholder="Entrez le nom d'un médicament (ex: Doliprane)" className="pl-11" {...field} />
                        </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isPending} className="h-10">
                {isPending ? <LoaderCircle className="animate-spin" /> : 'Rechercher'}
              </Button>
            </form>
          </Form>

          <div className="space-y-6">
            {isPending && (
                <div className="text-center text-muted-foreground flex items-center justify-center gap-3 py-8">
                    <LoaderCircle className="animate-spin" />
                    <p>Recherche en cours...</p>
                </div>
            )}

            {error && (
                <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Erreur</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {result && !result.found && (
                 <Alert>
                    <Frown className="h-4 w-4" />
                    <AlertTitle>Médicament non trouvé</AlertTitle>
                    <AlertDescription>
                        L'assistant IA n'a pas pu trouver d'informations pour ce nom. Vérifiez l'orthographe ou essayez un autre nom.
                    </AlertDescription>
                </Alert>
            )}

            {result && result.found && (
                <div className="space-y-6 animate-in fade-in duration-500">
                    <h2 className="text-2xl font-bold font-headline text-center">Résultats pour : {result.name}</h2>
                    <ResultCard icon={<FileText className="text-primary"/>} title="Description" content={result.description} />
                    <ResultCard icon={<HeartPulse className="text-blue-500"/>} title="Posologie" content={result.dosage} />
                    <ResultCard icon={<AlertTriangle className="text-orange-500"/>} title="Effets secondaires" content={result.sideEffects} />
                    <ResultCard icon={<ShieldAlert className="text-red-500"/>} title="Contre-indications" content={result.contraindications} />
                </div>
            )}
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
