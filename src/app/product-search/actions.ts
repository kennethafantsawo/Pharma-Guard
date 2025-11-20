
'use server';

import { supabaseAdmin } from '@/lib/supabase/admin';
import { z } from 'zod';
import { processDemand } from '@/ai/flows/process-demand';
import { revalidatePath } from 'next/cache';
import type { Database } from '@/lib/supabase/client';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function getUserProfile(): Promise<{data: Database['public']['Tables']['profiles']['Row'] | null}> {
    const supabase = createSupabaseServerClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
        return { data: null };
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
    
    return { data: profile };
}

const CreateSearchSchema = z.object({
    clientId: z.string().uuid(),
    productName: z.string().optional(),
    images: z.array(z.instanceof(File)).optional(),
});

export async function createSearchAction(formData: FormData): Promise<{success: boolean, error?: string}> {
    if (!supabaseAdmin) {
        return { success: false, error: 'La configuration du serveur est manquante.' };
    }

    const rawData = {
        clientId: formData.get('clientId'),
        productName: formData.get('productName') || undefined,
        images: formData.getAll('images').filter(f => (f instanceof File) && f.size > 0) as File[],
    };
    
    const validatedFields = CreateSearchSchema.safeParse({
        ...rawData,
        clientId: rawData.clientId as string
    });

    if (!validatedFields.success) {
        console.error("Validation error:", validatedFields.error.flatten().fieldErrors);
        return { success: false, error: 'Données de recherche invalides.' };
    }

    const { clientId, productName, images } = validatedFields.data;
    const imageUrls: string[] = [];

    try {
        if (images && images.length > 0) {
            for (const image of images) {
                const fileName = `${clientId}/${Date.now()}-${image.name}`;
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
                client_id: clientId,
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

export async function getSearchesByClientAction(clientId: string) {
    if (!supabaseAdmin) {
        return { success: false, error: 'La configuration du serveur est manquante.', data: null };
    }

    if (!clientId) {
        return { success: false, error: 'ID Client manquant.', data: null };
    }

    try {
        const { data, error } = await supabaseAdmin
            .from('searches')
            .select('*')
            .eq('client_id', clientId)
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
