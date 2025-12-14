'use client';

import { useState, useTransition, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { PageWrapper } from '@/components/shared/page-wrapper';
import { LogIn, Hospital, KeyRound, LoaderCircle, AlertCircle } from 'lucide-react';
import { signInWithPharmacyAction } from './actions';
import { getAllPharmacyNamesAction } from '../pharmacist-profile/actions';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const formSchema = z.object({
  pharmacyName: z.string().min(1, 'Veuillez sélectionner ou saisir une pharmacie.'),
  password: z.string().min(6, 'Le mot de passe doit faire au moins 6 caractères.'),
  newPharmacyName: z.string().optional(),
}).refine(data => {
    if (data.pharmacyName === 'other' && (!data.newPharmacyName || data.newPharmacyName.trim().length < 2)) {
        return false;
    }
    return true;
}, {
    message: 'Veuillez saisir un nom de pharmacie valide (2 caractères min).',
    path: ['newPharmacyName'],
});

type FormValues = z.infer<typeof formSchema>;

export default function PharmacistAuthPage() {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);
  const [pharmacyNames, setPharmacyNames] = useState<string[]>([]);
  const [loadingNames, setLoadingNames] = useState(true);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  });

  const selectedPharmacy = form.watch('pharmacyName');
  const isNewPharmacy = selectedPharmacy === 'other';

  useEffect(() => {
    const fetchNames = async () => {
      setLoadingNames(true);
      const result = await getAllPharmacyNamesAction();
      if (result.success && result.data) {
        setPharmacyNames(result.data);
      }
      setLoadingNames(false);
    };
    fetchNames();
  }, []);

  const handleSubmit: SubmitHandler<FormValues> = (data) => {
    setError(null);
    startTransition(async () => {
      const formData = new FormData();
      const finalPharmacyName = isNewPharmacy ? data.newPharmacyName! : data.pharmacyName;
      formData.append('pharmacyName', finalPharmacyName);
      formData.append('password', data.password);
      formData.append('isNew', String(isNewPharmacy));

      const result = await signInWithPharmacyAction(formData);

      if (result?.error) {
        setError(result.error);
      } else {
         toast({ title: 'Connexion réussie !', description: 'Redirection vers votre tableau de bord.' });
      }
    });
  };

  return (
    <PageWrapper>
      <div className="container mx-auto px-4 md:px-6 py-8 animate-in fade-in duration-500">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><LogIn />Espace Pharmacien</CardTitle>
              <CardDescription>Connectez-vous avec les identifiants de votre pharmacie.</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                  
                  <FormField
                    control={form.control}
                    name="pharmacyName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Pharmacie</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isPending || loadingNames}>
                          <FormControl>
                            <SelectTrigger>
                               <SelectValue placeholder={loadingNames ? "Chargement..." : "Sélectionnez votre pharmacie"} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {pharmacyNames.map(name => (
                              <SelectItem key={name} value={name}>{name}</SelectItem>
                            ))}
                            <SelectItem value="other">Autre (nouvelle pharmacie)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {isNewPharmacy && (
                    <FormField
                        control={form.control}
                        name="newPharmacyName"
                        render={({ field }) => (
                            <FormItem className="animate-in fade-in duration-300">
                                <FormLabel>Nom de votre nouvelle pharmacie</FormLabel>
                                <FormControl>
                                  <div className="relative">
                                    <Hospital className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input placeholder="Ex: Pharmacie du Progrès" {...field} disabled={isPending} className="pl-10"/>
                                  </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                  )}
                  
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mot de passe</FormLabel>
                        <FormControl>
                           <div className="relative">
                             <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                             <Input type="password" placeholder="Votre mot de passe" className="pl-10" {...field} />
                           </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Erreur de connexion</AlertTitle>
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <Button type="submit" className="w-full" disabled={isPending}>
                    {isPending ? <LoaderCircle className="animate-spin" /> : 'Se connecter'}
                  </Button>
                </form>
              </Form>
              <p className="text-xs text-muted-foreground mt-4 text-center">
                  Si votre pharmacie est nouvelle, choisissez "Autre" pour la créer.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageWrapper>
  );
}