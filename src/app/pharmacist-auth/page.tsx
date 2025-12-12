'use client';

import { useState, useTransition } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { PageWrapper } from '@/components/shared/page-wrapper';
import { LogIn, Phone, KeyRound, LoaderCircle } from 'lucide-react';
import { signInWithPhoneAction, verifyOtpAction } from './actions';

const PhoneSchema = z.object({
  phone: z.string().min(8, 'Le numéro doit contenir au moins 8 chiffres.'),
});
type PhoneValues = z.infer<typeof PhoneSchema>;

const OTPSchema = z.object({
  token: z.string().length(6, 'Le code doit contenir 6 chiffres.'),
});
type OTPValues = z.infer<typeof OTPSchema>;

export default function PharmacistAuthPage() {
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
      const result = await signInWithPhoneAction(data.phone);
      if (result.success) {
        toast({ title: 'Code envoyé', description: 'Un code de vérification a été envoyé à votre numéro.' });
        setStep('otp');
      } else {
        toast({ title: 'Erreur', description: result.error, variant: 'destructive' });
      }
    });
  };

  const handleOtpSubmit: SubmitHandler<OTPValues> = (data) => {
    startTransition(async () => {
      const result = await verifyOtpAction(phoneNumber, data.token);
      if (result.success) {
        toast({ title: 'Connexion réussie !', description: 'Vous allez être redirigé.' });
        router.push('/pharmacist-dashboard');
      } else {
        toast({ title: 'Erreur', description: result.error, variant: 'destructive' });
      }
    });
  };
  
  const cardTitle = step === 'phone' ? 'Espace Pharmacien' : 'Vérification du code';
  const cardDescription = step === 'phone' 
    ? "Connectez-vous avec votre numéro de téléphone pour accéder à votre espace."
    : `Entrez le code à 6 chiffres envoyé au ${phoneNumber}.`;

  return (
    <PageWrapper>
      <div className="container mx-auto px-4 md:px-6 py-8 animate-in fade-in duration-500">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><LogIn />{cardTitle}</CardTitle>
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
                              <Input type="tel" placeholder="Votre numéro de téléphone" className="pl-10" {...field} />
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
                        {isPending ? <LoaderCircle className="animate-spin" /> : 'Se connecter'}
                    </Button>
                    <Button variant="link" size="sm" onClick={() => { setStep('phone'); otpForm.reset(); }}>
                        Changer de numéro
                    </Button>
                  </form>
                </Form>
              )}
               <p className="text-xs text-muted-foreground mt-4 text-center">
                  {step === 'phone' ? "La connexion est réservée aux pharmaciens partenaires." : "Des frais de messagerie standard peuvent s'appliquer."}
               </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageWrapper>
  );
}
