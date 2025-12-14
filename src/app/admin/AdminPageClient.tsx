'use client';

import { useState, useTransition, type ChangeEvent } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from "@/hooks/use-toast"
import { Lock, Settings, LogOut, LoaderCircle, Upload, Pencil, Trash2, Users, KeyRound, Copy } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import type { WeekSchedule, HealthPost, PharmacyWithProfile } from '@/lib/types';
import { updatePharmaciesAction, generatePharmacyPasswordAction } from './actions';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const LoginSchema = z.object({
  password: z.string().min(1, 'Le mot de passe est requis.'),
});
type LoginValues = z.infer<typeof LoginSchema>;


const PharmacistManager = ({ pharmacies, password }: { pharmacies: PharmacyWithProfile[], password: string }) => {
    const { toast } = useToast();
    const [isGenerating, setIsGenerating] = useState<string | null>(null);
    const [newPassword, setNewPassword] = useState<{ name: string, pass: string } | null>(null);

    const handleGeneratePassword = async (pharmacyName: string) => {
        setIsGenerating(pharmacyName);
        setNewPassword(null);
        const result = await generatePharmacyPasswordAction(password, pharmacyName);
        if (result.success && result.password) {
            setNewPassword({ name: pharmacyName, pass: result.password });
            toast({ title: "Succès !", description: `Mot de passe généré pour ${pharmacyName}.` });
        } else {
            toast({ title: "Erreur", description: result.error || "Impossible de générer le mot de passe.", variant: "destructive" });
        }
        setIsGenerating(null);
    }
    
    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast({ title: "Copié !", description: "Le mot de passe a été copié dans le presse-papiers."});
    }

    return (
        <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2"><Users />Gestion des Pharmaciens</h3>
            <p className="text-sm text-muted-foreground">
                Générez ou réinitialisez les mots de passe pour chaque pharmacie. Communiquez le mot de passe généré au pharmacien concerné.
            </p>

            {newPassword && (
                 <Alert>
                    <KeyRound className="h-4 w-4" />
                    <AlertTitle>Nouveau mot de passe pour : {newPassword.name}</AlertTitle>
                    <AlertDescription className="flex items-center justify-between">
                       <span className="font-mono text-lg">{newPassword.pass}</span>
                       <Button size="sm" variant="ghost" onClick={() => copyToClipboard(newPassword.pass)}>
                            <Copy className="mr-2" /> Copier
                       </Button>
                    </AlertDescription>
                </Alert>
            )}

            <div className="border rounded-md">
                <div className="p-4 grid grid-cols-3 gap-4 font-semibold border-b">
                    <div className="col-span-1">Pharmacie</div>
                    <div className="col-span-2">Action</div>
                </div>
                {pharmacies.map(p => (
                    <div key={p.nom} className="p-4 grid grid-cols-3 gap-4 items-center border-b last:border-b-0">
                         <div className="col-span-1 flex flex-col">
                            <span className="font-medium">{p.nom}</span>
                            <span className="text-xs text-muted-foreground">{p.has_profile ? 'Compte actif' : 'Aucun compte'}</span>
                         </div>
                         <div className="col-span-2">
                             <Button 
                                size="sm" 
                                variant={p.has_profile ? 'secondary' : 'default'}
                                onClick={() => handleGeneratePassword(p.nom)}
                                disabled={isGenerating === p.nom}
                             >
                                {isGenerating === p.nom 
                                    ? <LoaderCircle className="animate-spin" /> 
                                    : <KeyRound />
                                }
                                {p.has_profile ? 'Réinitialiser le mot de passe' : 'Créer et générer le mot de passe'}
                             </Button>
                         </div>
                    </div>
                ))}
            </div>
        </div>
    )
}


// Admin Panel Component
const AdminPanel = ({ onLogout, password, pharmacies }: { onLogout: () => void, password: string, pharmacies: PharmacyWithProfile[] }) => {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result;
        if (typeof text !== 'string') throw new Error("Erreur de lecture du fichier.");
        
        const jsonData = JSON.parse(text);

        if (!Array.isArray(jsonData) || !jsonData.every(item => 'semaine' in item && 'pharmacies' in item)) {
            throw new Error("Le fichier JSON n'a pas la structure attendue.");
        }
        
        startTransition(async () => {
          const result = await updatePharmaciesAction(password, jsonData as WeekSchedule[]);
          if (result.success) {
            toast({ title: "Succès", description: result.message });
          } else {
            toast({ title: "Erreur", description: result.message, variant: "destructive" });
          }
        });
      } catch (error) {
        toast({ title: "Erreur de Fichier", description: error instanceof Error ? error.message : "Un problème est survenu.", variant: "destructive" });
      }
    };
    reader.onerror = () => toast({ title: "Erreur", description: "Impossible de lire le fichier.", variant: "destructive" });
    reader.readAsText(file);
    event.target.value = ''; // Reset input
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2"><Settings/>Panneau d'Administration</span>
          <Button variant="ghost" size="sm" onClick={onLogout}><LogOut className="mr-2 h-4 w-4"/>Se déconnecter</Button>
        </CardTitle>
         <CardDescription>
            Gérez les données de l'application via les onglets ci-dessous.
          </CardDescription>
      </CardHeader>
      <CardContent>
          <Tabs defaultValue="pharmacies-data" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="pharmacies-data">Données Pharmacies</TabsTrigger>
                <TabsTrigger value="pharmacists-mgmt">Gestion Pharmaciens</TabsTrigger>
                <TabsTrigger value="health-posts">Fiches Santé</TabsTrigger>
            </TabsList>
            <TabsContent value="pharmacies-data" className="pt-6">
                 <div className="space-y-4">
                    <h3 className="font-semibold flex items-center gap-2"><Upload />Mise à jour des pharmacies de garde</h3>
                    <p className="text-sm text-muted-foreground">
                      Remplacez les données des pharmacies de garde en chargeant un nouveau fichier JSON.
                    </p>
                    <div className="space-y-2">
                      <Label htmlFor="pharmacy-file">Nouveau fichier pharmacies.json</Label>
                      <Input id="pharmacy-file" type="file" accept=".json" onChange={handleFileChange} disabled={isPending} />
                      {isPending && <p className="text-sm text-muted-foreground flex items-center gap-2"><LoaderCircle className="animate-spin h-4 w-4" /> Mise à jour en cours...</p>}
                    </div>
                  </div>
            </TabsContent>
            <TabsContent value="pharmacists-mgmt" className="pt-6">
                <PharmacistManager pharmacies={pharmacies} password={password} />
            </TabsContent>
            <TabsContent value="health-posts" className="pt-6">
                <p className="text-sm text-center text-muted-foreground">La gestion des fiches santé sera bientôt disponible ici.</p>
            </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

const LoginForm = ({ onLogin }: { onLogin: (password: string) => void }) => {
    const { register, handleSubmit, formState: { errors } } = useForm<LoginValues>({
        resolver: zodResolver(LoginSchema)
    });
    const { toast } = useToast();

    const onSubmit: SubmitHandler<LoginValues> = (data) => {
        if (data.password === process.env.NEXT_PUBLIC_ADMIN_PASSWORD) {
            onLogin(data.password);
            toast({ title: "Connexion réussie", description: "Bienvenue dans le panneau d'administration." });
        } else {
            toast({ title: "Erreur d'authentification", description: "Mot de passe incorrect.", variant: "destructive" });
        }
    };

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Lock/>Accès Administrateur</CardTitle>
                <CardDescription>Veuillez entrer le mot de passe pour accéder aux options.</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="password">Mot de passe</Label>
                        <Input id="password" type="password" {...register('password')} />
                        {errors.password && <p className="text-sm font-medium text-destructive">{errors.password.message}</p>}
                    </div>
                    <Button type="submit" className="w-full">Se Connecter</Button>
                </form>
            </CardContent>
        </Card>
    )
};

export function AdminPageClient({ pharmacies }: { pharmacies: PharmacyWithProfile[] }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [password, setPassword] = useState('');

  const handleLogin = (pass: string) => {
    setPassword(pass);
    setIsLoggedIn(true);
  };
  const handleLogout = () => {
    setPassword('');
    setIsLoggedIn(false);
  };

  if (!process.env.NEXT_PUBLIC_ADMIN_PASSWORD) {
    return (
      <Card className="w-full bg-destructive/10 border-destructive">
          <CardHeader>
              <CardTitle>Erreur de Configuration</CardTitle>
              <CardDescription>
                  La variable d'environnement `NEXT_PUBLIC_ADMIN_PASSWORD` n'est pas définie.
                  Veuillez l'ajouter à votre fichier `.env` pour pouvoir utiliser cette page.
              </CardDescription>
          </CardHeader>
      </Card>
    )
  }

  return (
    <>
      {isLoggedIn ? (
        <AdminPanel onLogout={handleLogout} password={password} pharmacies={pharmacies} />
      ) : (
        <LoginForm onLogin={handleLogin} />
      )}
    </>
  );
}
