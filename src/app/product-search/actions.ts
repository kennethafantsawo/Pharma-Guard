
'use server';

import { supabaseAdmin } from '@/lib/supabase/admin';
import { z } from 'zod';
import { processDemand } from '@/ai/flows/process-demand';
import { revalidatePath } from 'next/cache';
import type { Database } from '@/lib/supabase/client';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function getUserProfileAction(): Promise<{data: Database['public']['Tables']['profiles']['Row'] | null}> {
    const supabase = createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { data: null };
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
    
    // Auto-create profile for new users
    if (!profile) {
       const { data: newProfile, error } = await supabase
            .from('profiles')
            .insert({
                id: user.id,
                username: user.user_metadata.full_name || user.email || 'Nouveau Client',
                role: 'Client',
            })
            .select()
            .single();

        if (error) {
            console.error("Error creating client profile:", error);
            return { data: null };
        }
        return { data: newProfile };
    }
    
    return { data: profile };
}

const CreateSearchSchema = z.object({
    clientPhone: z.string().min(8, "Le numéro de téléphone est requis."),
    productName: z.string().optional(),
    images: z.array(z.instanceof(File)).optional(),
});

export async function createSearchAction(formData: FormData): Promise<{success: boolean, error?: string}> {
    if (!supabaseAdmin) {
        return { success: false, error: 'La configuration du serveur est manquante.' };
    }
    
    const supabase = createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { success: false, error: 'Vous devez être connecté pour faire une demande.' };
    }


    const rawData = {
        clientPhone: formData.get('clientPhone'),
        productName: formData.get('productName') || undefined,
        images: formData.getAll('images').filter(f => (f instanceof File) && f.size > 0) as File[],
    };
    
    const validatedFields = CreateSearchSchema.safeParse({
        ...rawData,
        clientPhone: rawData.clientPhone as string
    });

    if (!validatedFields.success) {
        console.error("Validation error:", validatedFields.error.flatten().fieldErrors);
        return { success: false, error: 'Données de recherche invalides.' };
    }

    const { clientPhone, productName, images } = validatedFields.data;
    const imageUrls: string[] = [];
    const searchId = crypto.randomUUID(); // Unique ID for this search

    try {
        if (images && images.length > 0) {
            for (const image of images) {
                const fileName = `${searchId}/${Date.now()}-${image.name}`;
                const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
                    .from('demands')
                    .upload(fileName, image, {
                        cacheControl: '3600',
                        upsert: false,
                    });

                if (uploadError) throw new Error(`Erreur de téléversement d'image : ${uploadError.message}`);
                
                const { data: urlData } = supabaseAdmin.storage
                    .from('demands')
                    .getPublicUrl(uploadData.path);
                
                imageUrls.push(urlData.publicUrl);
            }
        }

        const { productName: processedName } = await processDemand({
            description: productName || '',
            photoDataUris: imageUrls,
        });

        const { error: insertError } = await supabaseAdmin
            .from('searches')
            .insert({
                client_id: user.id, 
                client_phone: clientPhone,
                original_product_name: productName,
                product_name: processedName,
                photo_urls: imageUrls.length > 0 ? imageUrls : null,
            });

        if (insertError) throw new Error(`Erreur lors de l'enregistrement de la recherche : ${insertError.message}`);
        
        revalidatePath('/product-search');

        return { success: true };

    } catch (error) {
        console.error('Error in createSearchAction:', error);
        const errorMessage = error instanceof Error ? error.message : 'Une erreur inconnue est survenue.';
        return { success: false, error: errorMessage };
    }
}

export async function getSearchesByClientAction(userId: string) {
    if (!supabaseAdmin) {
        return { success: false, error: 'La configuration du serveur est manquante.', data: null };
    }

    if (!userId) {
        return { success: false, error: 'Identifiant utilisateur manquant.', data: null };
    }

    try {
        const { data, error } = await supabaseAdmin
            .from('searches')
            .select('*, responses(*)')
            .eq('client_id', userId)
            .order('created_at', { ascending: false });

        if (error) {
            throw error;
        }

        return { success: true, data: data };

    } catch (error) {
        console.error('Error fetching client searches:', error);
        const errorMessage = error instanceof Error ? error.message : 'Une erreur inconnue est survenue.';
        return { success: false, error: errorMessage, data: null };
    }
}
