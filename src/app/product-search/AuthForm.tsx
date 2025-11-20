
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
import { supabase } from '@/lib/supabase/client';

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
});
type SignUpValues = z.infer<typeof SignUpSchema>;

const GoogleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="24px" height="24px">
        <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
        <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
        <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.222,0-9.619-3.317-11.28-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
        <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C39.901,36.62,44,30.638,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
    </svg>
);


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
    if (data.role === 'Pharmacien') return; // Pharmacist signup is handled by Google
    startTransition(async () => {
        const formData = new FormData();
        formData.append('username', data.username);
        formData.append('phone', data.phone);
        formData.append('role', data.role);
        
        const result = await signUpWithPhoneAction(formData);

        if (result.success) {
            toast({ title: 'Inscription réussie !', description: 'Vous pouvez maintenant vous connecter.' });
        } else {
            toast({ title: 'Erreur d\'inscription', description: result.error, variant: 'destructive' });
        }
    });
  };

  const handlePharmacistGoogleSignIn = async () => {
    if (!supabase) return;
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.href, // Redirect back to this page
      },
    });
    if (error) {
      toast({ title: 'Erreur Google', description: error.message, variant: 'destructive' });
    }
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
                
                {watchedRole === 'Client' && (
                    <>
                        <FormField control={signUpForm.control} name="username" render={({ field }) => (
                            <FormItem><FormLabel>Nom d'utilisateur</FormLabel><FormControl><Input placeholder="Votre nom" {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                        <FormField control={signUpForm.control} name="phone" render={({ field }) => (
                            <FormItem><FormLabel>Numéro de téléphone</FormLabel><FormControl><Input placeholder="+228 XX XX XX XX" {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                        <Button type="submit" disabled={isPending} className="w-full">
                          {isPending ? <LoaderCircle className="animate-spin" /> : 'Créer mon compte Client'}
                        </Button>
                    </>
                )}

                {watchedRole === 'Pharmacien' && (
                  <div className='pt-4'>
                    <Button type="button" onClick={handlePharmacistGoogleSignIn} className="w-full" variant="outline">
                        <GoogleIcon /> Se connecter / S'inscrire avec Google
                    </Button>
                     <p className="text-xs text-muted-foreground mt-2 text-center">
                        L'inscription et la connexion des pharmaciens se font via un compte Google sécurisé.
                    </p>
                  </div>
                )}
                
              </form>
            </Form>
          </CardContent>
        </TabsContent>
      </Tabs>
    </Card>
  );
}
