
'use client';

import { useState, useTransition } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { PageWrapper } from '@/components/shared/page-wrapper';
import { LogIn, Mail, LoaderCircle } from 'lucide-react';
import { signInWithEmailAction } from './actions';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const EmailSchema = z.object({
  email: z.string().email('Veuillez entrer une adresse e-mail valide.'),
});
type EmailValues = z.infer<typeof EmailSchema>;


export default function PharmacistAuthPage() {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const [formSubmitted, setFormSubmitted] = useState(false);

  const form = useForm<EmailValues>({
    resolver: zodResolver(EmailSchema),
    defaultValues: {
      email: '',
    },
  });

  const handleEmailSubmit: SubmitHandler<EmailValues> = (data) => {
    startTransition(async () => {
      const result = await signInWithEmailAction(data.email);
      if (result.success) {
        toast({ title: 'Lien de connexion envoyé', description: 'Vérifiez votre boîte de réception pour vous connecter.' });
        setFormSubmitted(true);
      } else {
        toast({ title: 'Erreur', description: result.error, variant: 'destructive' });
      }
    });
  };

  if (formSubmitted) {
    return (
       <PageWrapper>
          <div className="container mx-auto px-4 md:px-6 py-8 animate-in fade-in duration-500">
            <div className="max-w-md mx-auto">
               <Alert>
                  <Mail className="h-4 w-4" />
                  <AlertTitle>Vérifiez votre boîte de réception</AlertTitle>
                  <AlertDescription>
                    Nous avons envoyé un lien de connexion à votre adresse e-mail. Cliquez dessus pour accéder à votre tableau de bord.
                  </AlertDescription>
              </Alert>
            </div>
          </div>
      </PageWrapper>
    )
  }

  return (
    <PageWrapper>
      <div className="container mx-auto px-4 md:px-6 py-8 animate-in fade-in duration-500">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><LogIn />Espace Pharmacien</CardTitle>
              <CardDescription>Connectez-vous avec votre adresse e-mail pour accéder à votre espace.</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleEmailSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Adresse e-mail</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input type="email" placeholder="Votre adresse e-mail" className="pl-10" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full" disabled={isPending}>
                    {isPending ? <LoaderCircle className="animate-spin" /> : 'Recevoir le lien de connexion'}
                  </Button>
                </form>
              </Form>
              <p className="text-xs text-muted-foreground mt-4 text-center">
                  La connexion est réservée aux pharmaciens partenaires. Vous recevrez un lien magique pour vous connecter sans mot de passe.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageWrapper>
  );
}

