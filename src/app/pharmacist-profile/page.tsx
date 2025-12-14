
'use client';

import { useState, useEffect, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PageWrapper } from '@/components/shared/page-wrapper';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { getPharmacistProfile } from '@/app/pharmacist-auth/actions';
import { getAllPharmacyNamesAction, updatePharmacistProfileAction } from './actions';
import { LoaderCircle, Hospital, KeyRound } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import type { Profile } from '@/lib/types';

const ProfileSchema = z.object({
  pharmacyName: z.string().min(1, 'Veuillez sélectionner une pharmacie.'),
  newPassword: z.string().optional(),
});

type ProfileValues = z.infer<typeof ProfileSchema>;

export default function ProfilePage() {
    const [profile, setProfile] = useState<Profile | null>(null);
    const [pharmacyNames, setPharmacyNames] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [isPending, startTransition] = useTransition();
    const router = useRouter();
    const { toast } = useToast();

    const form = useForm<ProfileValues>({
        resolver: zodResolver(ProfileSchema),
    });

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const { user, profile: currentProfile } = await getPharmacistProfile();
            
            if (!user || !currentProfile) {
                router.push('/pharmacist-auth');
                return;
            }
            
            setProfile(currentProfile);
            form.setValue('pharmacyName', currentProfile.pharmacy_name || '');

            const namesResult = await getAllPharmacyNamesAction();
            if (namesResult.success && namesResult.data) {
                setPharmacyNames(namesResult.data);
            }
            setLoading(false);
        };
        fetchData();
    }, [router, form]);

    const onSubmit: SubmitHandler<ProfileValues> = (data) => {
        startTransition(async () => {
            const formData = new FormData();
            formData.append('pharmacyName', data.pharmacyName);
            if (data.newPassword) {
              formData.append('newPassword', data.newPassword);
            }

            const result = await updatePharmacistProfileAction(formData);

            if (result.success) {
                toast({ title: 'Profil mis à jour !', description: 'Vos informations ont été enregistrées.' });
                form.reset({ ...form.getValues(), newPassword: '' }); // Reset only password field
            } else {
                toast({ title: 'Erreur', description: result.error || 'Impossible de mettre à jour le profil.', variant: 'destructive' });
            }
        });
    };

    if (loading) {
        return (
            <PageWrapper>
                <div className="container mx-auto px-4 md:px-6 py-8">
                    <div className="max-w-xl mx-auto">
                        <Skeleton className="h-64 w-full" />
                    </div>
                </div>
            </PageWrapper>
        )
    }
    
     if (!profile) {
        return <PageWrapper><div className="container p-8">Chargement du profil...</div></PageWrapper>;
    }


    return (
        <PageWrapper>
            <div className="container mx-auto px-4 md:px-6 py-8 animate-in fade-in duration-500">
                <div className="max-w-xl mx-auto">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 font-headline text-2xl">
                                <Hospital /> Gérer votre profil
                            </CardTitle>
                            <CardDescription>
                                Mettez à jour le nom de votre pharmacie ou votre mot de passe.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                    <FormField
                                        control={form.control}
                                        name="pharmacyName"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Nom de la pharmacie</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isPending}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Sélectionnez une pharmacie..." />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {pharmacyNames.map(name => (
                                                            <SelectItem key={name} value={name}>{name}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    
                                    <FormField
                                        control={form.control}
                                        name="newPassword"
                                        render={({ field }) => (
                                          <FormItem>
                                            <FormLabel>Nouveau mot de passe (optionnel)</FormLabel>
                                            <FormControl>
                                               <div className="relative">
                                                 <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                 <Input type="password" placeholder="Laissez vide pour ne pas changer" className="pl-10" {...field} />
                                               </div>
                                            </FormControl>
                                            <FormMessage />
                                          </FormItem>
                                        )}
                                      />

                                    <Button type="submit" disabled={isPending} className="w-full">
                                        {isPending ? <LoaderCircle className="animate-spin" /> : 'Enregistrer les modifications'}
                                    </Button>
                                </form>
                            </Form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </PageWrapper>
    );
}

    
