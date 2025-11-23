
'use client';

import { useState, useTransition } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Image from 'next/image';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormField, FormItem, FormMessage, FormLabel } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { LoaderCircle, Paperclip, Send, X, Phone } from 'lucide-react';
import { createSearchAction } from './actions';

const MAX_IMAGES = 3;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const SearchSchema = z.object({
  clientPhone: z.string().min(8, "Le numéro de téléphone est requis et doit être valide."),
  productName: z.string().optional(),
  images: z.custom<FileList>().optional(),
}).refine(data => data.productName || (data.images && data.images.length > 0), {
  message: 'Veuillez entrer un nom de produit ou ajouter au moins une image.',
  path: ['productName'],
});

type SearchValues = z.infer<typeof SearchSchema>;

export function SearchForm() {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const form = useForm<SearchValues>({
    resolver: zodResolver(SearchSchema),
  });
  
  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const currentImageCount = imagePreviews.length;
    if (currentImageCount + files.length > MAX_IMAGES) {
        toast({
            title: 'Limite d\'images atteinte',
            description: `Vous ne pouvez télécharger que ${MAX_IMAGES} images au maximum.`,
            variant: 'destructive'
        });
        return;
    }

    const newPreviews: string[] = [];
    const fileList = new DataTransfer();
    
    // Keep existing files
    const existingFiles = form.getValues('images');
    if (existingFiles) {
        for(let i=0; i<existingFiles.length; i++) {
            fileList.items.add(existingFiles[i]);
        }
    }

    Array.from(files).forEach(file => {
      if (file.size > MAX_FILE_SIZE) {
         toast({ title: 'Fichier trop volumineux', description: `L'image "${file.name}" dépasse la taille maximale de 5MB.`, variant: 'destructive'});
         return;
      }
      newPreviews.push(URL.createObjectURL(file));
      fileList.items.add(file);
    });

    setImagePreviews(prev => [...prev, ...newPreviews]);
    form.setValue('images', fileList.files);
    form.trigger('productName'); // Re-validate the form
  };

  const removeImage = (index: number) => {
    const newPreviews = [...imagePreviews];
    newPreviews.splice(index, 1);
    setImagePreviews(newPreviews);
    
    const existingFiles = form.getValues('images');
    if (existingFiles) {
        const fileList = new DataTransfer();
        for(let i=0; i<existingFiles.length; i++) {
            if (i !== index) fileList.items.add(existingFiles[i]);
        }
        form.setValue('images', fileList.files);
    }
     form.trigger('productName'); // Re-validate the form
  };

  const onSubmit: SubmitHandler<SearchValues> = (data) => {
    startTransition(async () => {
      const formData = new FormData();
      formData.append('clientPhone', data.clientPhone);
      if(data.productName) formData.append('productName', data.productName);
      if(data.images) {
        for(let i=0; i<data.images.length; i++) {
            formData.append('images', data.images[i]);
        }
      }

      const result = await createSearchAction(formData);

      if (result.success) {
        toast({ title: 'Demande envoyée !', description: 'Les pharmacies à proximité seront notifiées. Vous serez contacté par téléphone.' });
        form.reset({ productName: '', clientPhone: '' });
        setImagePreviews([]);
        form.setValue('images', undefined);
      } else {
        toast({ title: 'Erreur', description: result.error, variant: 'destructive' });
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Nouvelle demande</CardTitle>
        <CardDescription>
          Décrivez le produit, joignez une photo si possible, et laissez votre numéro pour être contacté par les pharmacies.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
             <FormField
              control={form.control}
              name="clientPhone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="clientPhone">Votre numéro de téléphone</FormLabel>
                   <div className="relative">
                     <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                     <FormControl>
                        <Input
                            id="clientPhone"
                            type="tel"
                            placeholder="Ex: 90123456"
                            className="pl-10"
                            {...field}
                        />
                     </FormControl>
                   </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="productName"
              render={({ field }) => (
                <FormItem>
                  <Label htmlFor="productName">Nom du produit ou description</Label>
                  <Textarea
                    id="productName"
                    placeholder="Ex: Paracétamol 500mg, sirop pour la toux sèche, etc."
                    {...field}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-2">
                <Label htmlFor="images">Photos du produit (optionnel)</Label>
                <div className="flex items-center gap-4">
                    <Button asChild variant="outline" size="sm" className="relative">
                        <Label htmlFor="images" className="cursor-pointer">
                           <Paperclip className="mr-2" /> Joindre une image
                        </Label>
                    </Button>
                    <Input 
                        id="images"
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageChange}
                        className="sr-only"
                        disabled={isPending || imagePreviews.length >= MAX_IMAGES}
                    />
                    <span className="text-xs text-muted-foreground">
                        {imagePreviews.length} / {MAX_IMAGES} images
                    </span>
                </div>
            </div>

            {imagePreviews.length > 0 && (
                <div className="grid grid-cols-3 gap-4">
                    {imagePreviews.map((src, index) => (
                        <div key={index} className="relative group aspect-square">
                            <Image src={src} alt={`Aperçu ${index+1}`} fill className="rounded-md object-cover" />
                            <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => removeImage(index)}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}
                </div>
            )}

            <Button type="submit" disabled={isPending} className="w-full">
              {isPending ? <LoaderCircle className="animate-spin" /> : <Send />}
              Envoyer la demande
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
