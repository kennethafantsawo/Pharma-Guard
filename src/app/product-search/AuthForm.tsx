
'use client';

import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { signInWithPhoneAction, signUpWithPhoneAction } from './actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { LoaderCircle, LogIn, UserPlus } from 'lucide-react';
import type { Database } from '@/lib/supabase/client';

type Profile = Database['public']['Tables']['profiles']['Row'];

const SignInSchema = z.object({
  phone: z.string().min(8, 'Le numéro de téléphone est requis (8 chiffres minimum).'),
});
type SignInValues = z.infer<typeof SignInSchema>;

const SignUpSchema = z.object({
  username: z.string().min(2, "Le nom d'utilisateur est requis."),
  phone: z.string().min(8, 'Le numéro de téléphone est requis (8 chiffres minimum).'),
  role: z.enum(['Client', 'Pharmacien'], { required_error: 'Veuillez sélectionner un rôle.' }),
  pharmacyName: z.string().optional(),
}).refine(data => {
    if (data.role === 'Pharmacien') {
        return data.pharmacyName && data.pharmacyName.length > 2;
    }
    return true;
}, {
    message: 'Le nom de la pharmacie est requis pour un pharmacien.',
    path: ['pharmacyName'],
});
type SignUpValues = z.infer<typeof SignUpSchema>;

export function AuthForm({ onLoginSuccess }: { onLoginSuccess: (user: Profile) => void }) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const signInForm = useForm<SignInValues>({ resolver: zodResolver(SignInSchema) });
  const signUpForm = useForm<SignUpValues>({ resolver: zodResolver(SignUpSchema) });

  const watchedRole = signUpForm.watch('role');

  const handleSignIn = (data: SignInValues) => {
    startTransition(async () => {
      const formData = new FormData();
      formData.append('phone', data.phone);
      const result = await signInWithPhoneAction(formData);

      if (result.success && result.user) {
        toast({ title: 'Connexion réussie', description: `Bienvenue, ${result.user.username} !` });
        onLoginSuccess(result.user);
      } else {
        toast({ title: 'Erreur de connexion', description: result.error, variant: 'destructive' });
      }
    });
  };

  const handleSignUp = (data: SignUpValues) => {
    startTransition(async () => {
        const formData = new FormData();
        formData.append('username', data.username);
        formData.append('phone', data.phone);
        formData.append('role', data.role);
        if (data.role === 'Pharmacien' && data.pharmacyName) {
            formData.append('pharmacyName', data.pharmacyName);
        }

        const result = await signUpWithPhoneAction(formData);

        if (result.success) {
            toast({ title: 'Inscription réussie !', description: 'Vous pouvez maintenant vous connecter.' });
            // For now, we ask them to log in. Later we can log them in directly.
            // A more advanced approach would directly return the user session.
        } else {
            toast({ title: 'Erreur d\'inscription', description: result.error, variant: 'destructive' });
        }
    });
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <Tabs defaultValue="login">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="login"><LogIn className="mr-2"/>Se connecter</TabsTrigger>
          <TabsTrigger value="signup"><UserPlus className="mr-2"/>S'inscrire</TabsTrigger>
        </TabsList>
        <TabsContent value="login">
          <CardHeader>
            <CardTitle>Connexion</CardTitle>
            <CardDescription>Entrez votre numéro de téléphone pour accéder à votre compte.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...signInForm}>
              <form onSubmit={signInForm.handleSubmit(handleSignIn)} className="space-y-6">
                <FormField
                  control={signInForm.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Numéro de téléphone</FormLabel>
                      <FormControl>
                        <Input placeholder="+228 XX XX XX XX" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={isPending} className="w-full">
                  {isPending ? <LoaderCircle className="animate-spin" /> : 'Se connecter'}
                </Button>
              </form>
            </Form>
          </CardContent>
        </TabsContent>
        <TabsContent value="signup">
          <CardHeader>
            <CardTitle>Créer un compte</CardTitle>
            <CardDescription>Rejoignez Pharma-Connect en quelques secondes.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...signUpForm}>
              <form onSubmit={signUpForm.handleSubmit(handleSignUp)} className="space-y-6">
                <FormField control={signUpForm.control} name="username" render={({ field }) => (
                    <FormItem><FormLabel>Nom d'utilisateur</FormLabel><FormControl><Input placeholder="Votre nom" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                <FormField control={signUpForm.control} name="phone" render={({ field }) => (
                    <FormItem><FormLabel>Numéro de téléphone</FormLabel><FormControl><Input placeholder="+228 XX XX XX XX" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                <FormField control={signUpForm.control} name="role" render={({ field }) => (
                    <FormItem className="space-y-3">
                        <FormLabel>Vous êtes ?</FormLabel>
                        <FormControl>
                            <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex gap-4">
                                <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="Client" id="role-client" /></FormControl><Label htmlFor="role-client">Client</Label></FormItem>
                                <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="Pharmacien" id="role-pharmacist" /></FormControl><Label htmlFor="role-pharmacist">Pharmacien</Label></FormItem>
                            </RadioGroup>
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}/>
                {watchedRole === 'Pharmacien' && (
                    <FormField control={signUpForm.control} name="pharmacyName" render={({ field }) => (
                        <FormItem><FormLabel>Nom de la pharmacie</FormLabel><FormControl><Input placeholder="Pharmacie du Bonheur" {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>
                )}
                <Button type="submit" disabled={isPending} className="w-full">
                  {isPending ? <LoaderCircle className="animate-spin" /> : 'Créer mon compte'}
                </Button>
              </form>
            </Form>
          </CardContent>
        </TabsContent>
      </Tabs>
    </Card>
  );
}
