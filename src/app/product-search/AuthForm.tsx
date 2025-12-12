'use client';

import { useState, useTransition } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { LogIn, Phone, KeyRound, LoaderCircle } from 'lucide-react';
import { signInWithPhoneClientAction, verifyOtpClientAction } from './actions';

const PhoneSchema = z.object({
  phone: z.string().min(8, 'Le numéro doit contenir au moins 8 chiffres.'),
});
type PhoneValues = z.infer<typeof PhoneSchema>;

const OTPSchema = z.object({
  token: z.string().length(6, 'Le code doit contenir 6 chiffres.'),
});
type OTPValues = z.infer<typeof OTPSchema>;


export function AuthForm() {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const router = useRouter();

  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');

  const phoneForm = useForm<PhoneValues>({
    resolver: zodResolver(PhoneSchema),
    defaultValues: { phone: '+228' }
  });

  const otpForm = useForm<OTPValues>({
    resolver: zodResolver(OTPSchema),
  });

  const handlePhoneSubmit: SubmitHandler<PhoneValues> = (data) => {
    startTransition(async () => {
      setPhoneNumber(data.phone);
      const result = await signInWithPhoneClientAction(data.phone);
      if (result.success) {
        toast({ title: 'Code envoyé', description: 'Un code a été envoyé à votre numéro.' });
        setStep('otp');
      } else {
        toast({ title: 'Erreur', description: result.error, variant: 'destructive' });
      }
    });
  };

  const handleOtpSubmit: SubmitHandler<OTPValues> = (data) => {
    startTransition(async () => {
      const result = await verifyOtpClientAction(phoneNumber, data.token);
      if (result.success) {
        toast({ title: 'Connexion réussie !'});
        // Force a refresh of the current page to re-run server components
        router.refresh();
      } else {
        toast({ title: 'Erreur', description: result.error, variant: 'destructive' });
      }
    });
  };

  const cardTitle = step === 'phone' ? 'Connexion / Inscription' : 'Vérifiez votre numéro';
  const cardDescription = step === 'phone' 
    ? 'Utilisez votre numéro de téléphone pour accéder à la recherche de produits. C\'est rapide et sécurisé.'
    : `Entrez le code à 6 chiffres que nous avons envoyé au ${phoneNumber}.`;


  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><LogIn /> {cardTitle}</CardTitle>
        <CardDescription>{cardDescription}</CardDescription>
      </CardHeader>
      <CardContent>
          {step === 'phone' ? (
            <Form {...phoneForm}>
              <form onSubmit={phoneForm.handleSubmit(handlePhoneSubmit)} className="space-y-4">
                <FormField
                  control={phoneForm.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Numéro de téléphone</FormLabel>
                      <FormControl>
                        <div className="relative">
                           <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                           <Input type="tel" placeholder="+228..." className="pl-10" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={isPending}>
                  {isPending ? <LoaderCircle className="animate-spin" /> : 'Recevoir le code'}
                </Button>
              </form>
            </Form>
          ) : (
             <Form {...otpForm}>
                <form onSubmit={otpForm.handleSubmit(handleOtpSubmit)} className="space-y-4">
                    <FormField
                    control={otpForm.control}
                    name="token"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Code de vérification</FormLabel>
                        <FormControl>
                            <div className="relative">
                                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input type="text" placeholder="_ _ _ _ _ _" maxLength={6} className="pl-10 tracking-[0.5em] text-center" {...field} />
                            </div>
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <Button type="submit" className="w-full" disabled={isPending}>
                        {isPending ? <LoaderCircle className="animate-spin" /> : 'Vérifier et continuer'}
                    </Button>
                    <Button variant="link" size="sm" onClick={() => { setStep('phone'); otpForm.reset(); }}>
                        Changer de numéro
                    </Button>
                </form>
             </Form>
          )}
          <p className="text-xs text-muted-foreground mt-4 text-center">
            La connexion est requise pour envoyer des demandes aux pharmaciens.
          </p>
      </CardContent>
    </Card>
  );
}
