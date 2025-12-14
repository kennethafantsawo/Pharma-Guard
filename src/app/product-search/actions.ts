
'use server';

import { createSupabaseAdminClient, createSupabaseServerClient } from '@/lib/supabase/server';
import { z } from 'zod';
import { processDemand } from '@/ai/flows/process-demand';
import { revalidatePath } from 'next/cache';
import type { Database } from '@/lib/supabase/database.types';

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
    
    // This part is now only for pharmacists, client profile creation is removed.
    
    return { data: profile };
}

const CreateSearchSchema = z.object({
    productName: z.string().optional(),
    images: z.array(z.instanceof(File)).optional(),
    contactPhone: z.string().min(8, 'Le numéro de contact est invalide.'),
});

export async function createSearchAction(formData: FormData): Promise<{success: boolean, error?: string}> {
    const supabaseAdmin = createSupabaseAdminClient();
    if (!supabaseAdmin) {
        return { success: false, error: 'La configuration du serveur est manquante.' };
    }

    const rawData = {
        productName: formData.get('productName') || undefined,
        images: formData.getAll('images').filter(f => (f instanceof File) && f.size > 0) as File[],
        contactPhone: formData.get('contactPhone'),
    };
    
    const validatedFields = CreateSearchSchema.safeParse(rawData);

    if (!validatedFields.success) {
        console.error("Validation error:", validatedFields.error.flatten().fieldErrors);
        return { success: false, error: validatedFields.error.flatten().fieldErrors.contactPhone?.[0] || 'Données de recherche invalides.' };
    }

    const { productName, images, contactPhone } = validatedFields.data;
    const imageUrls: string[] = [];
    const searchId = crypto.randomUUID();

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
                // client_id is now nullable as the user is anonymous
                client_id: null, 
                client_phone: contactPhone,
                original_product_name: productName,
                product_name: processedName,
                photo_urls: imageUrls.length > 0 ? imageUrls : null,
            });

        if (insertError) throw new Error(`Erreur lors de l'enregistrement de la recherche : ${insertError.message}`);
        
        revalidatePath('/product-search');
        revalidatePath('/pharmacist-dashboard');

        return { success: true };

    } catch (error) {
        console.error('Error in createSearchAction:', error);
        const errorMessage = error instanceof Error ? error.message : 'Une erreur inconnue est survenue.';
        return { success: false, error: errorMessage };
    }
}

export async function getSearchesByClientAction(userId: string) {
    const supabaseAdmin = createSupabaseAdminClient();
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
