
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
import { LoaderCircle, Hospital } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const ProfileSchema = z.object({
  pharmacyName: z.string().min(1, 'Veuillez sélectionner une pharmacie.'),
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

type ProfileValues = z.infer<typeof ProfileSchema>;

export default function CompleteProfilePage() {
    const [pharmacyNames, setPharmacyNames] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [isPending, startTransition] = useTransition();
    const router = useRouter();
    const { toast } = useToast();

    const form = useForm<ProfileValues>({
        resolver: zodResolver(ProfileSchema),
    });
    const selectedPharmacy = form.watch('pharmacyName');

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const profileResult = await getPharmacistProfile();
            if (!profileResult.user || !profileResult.profile) {
                router.push('/pharmacist-auth');
                return;
            }
             if (profileResult.profile.pharmacy_name) {
                router.push('/pharmacist-dashboard');
                return;
            }

            const namesResult = await getAllPharmacyNamesAction();
            if (namesResult.success && namesResult.data) {
                setPharmacyNames(namesResult.data);
            }
            setLoading(false);
        };
        fetchData();
    }, [router]);

    const onSubmit: SubmitHandler<ProfileValues> = (data) => {
        startTransition(async () => {
            const finalPharmacyName = data.pharmacyName === 'other' ? data.newPharmacyName! : data.pharmacyName;
            const result = await updatePharmacistProfileAction(finalPharmacyName);

            if (result.success) {
                toast({ title: 'Profil mis à jour !', description: 'Vous allez être redirigé vers votre tableau de bord.' });
                router.push('/pharmacist-dashboard');
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
                        <Skeleton className="h-48 w-full" />
                    </div>
                </div>
            </PageWrapper>
        )
    }

    return (
        <PageWrapper>
            <div className="container mx-auto px-4 md:px-6 py-8 animate-in fade-in duration-500">
                <div className="max-w-xl mx-auto">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 font-headline text-2xl">
                                <Hospital /> Finaliser votre profil
                            </CardTitle>
                            <CardDescription>
                                Veuillez sélectionner votre pharmacie pour continuer. Si elle n'est pas dans la liste, choisissez "Autre" pour l'ajouter.
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
                                                        <SelectItem value="other">Autre (préciser)</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    {selectedPharmacy === 'other' && (
                                        <FormField
                                            control={form.control}
                                            name="newPharmacyName"
                                            render={({ field }) => (
                                                <FormItem className="animate-in fade-in duration-300">
                                                    <FormLabel>Nom de votre nouvelle pharmacie</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Ex: Pharmacie du Progrès" {...field} disabled={isPending}/>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    )}
                                    <Button type="submit" disabled={isPending} className="w-full">
                                        {isPending ? <LoaderCircle className="animate-spin" /> : 'Enregistrer et Continuer'}
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

    