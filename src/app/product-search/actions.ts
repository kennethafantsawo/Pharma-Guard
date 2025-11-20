
'use server';

import { supabaseAdmin } from '@/lib/supabase/admin';
import { z } from 'zod';
import { processDemand } from '@/ai/flows/process-demand';
import { revalidatePath } from 'next/cache';
import type { Database } from '@/lib/supabase/client';
import { createSupabaseServerClient } from '@/lib/supabase/server';

const SignUpSchema = z.object({
  phone: z.string().min(8, 'Le numéro de téléphone est trop court.'),
  username: z.string().min(2, 'Le nom d\'utilisateur est requis.'),
  role: z.literal('Client'), // Only client signup is handled here now
});

export async function getUserProfile(): Promise<Database['public']['Tables']['profiles']['Row'] | null> {
    const supabase = createSupabaseServerClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
        return null;
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
    
    return profile;
}

export async function signUpWithPhoneAction(formData: FormData) {
  if (!supabaseAdmin) {
    return { success: false, error: 'La configuration du serveur est manquante.' };
  }

  const data = Object.fromEntries(formData.entries());
  const validatedFields = SignUpSchema.safeParse(data);

  if (!validatedFields.success) {
    return { success: false, error: 'Données invalides.', issues: validatedFields.error.issues };
  }
  
  const { phone, username, role } = validatedFields.data;

  try {
    const { data: existingUser } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('phone', phone)
        .single();
    
    if (existingUser) {
        return { success: false, error: 'Ce numéro de téléphone est déjà utilisé.' };
    }

    // For phone-based sign-up, we don't create an auth user, just a profile.
    // This is a simplified approach. A more robust solution might involve OTP.
    const { data: newUser, error: profileError } = await supabaseAdmin
        .from('profiles')
        .insert({
            phone: phone,
            username: username,
            role: role,
        })
        .select()
        .single();


    if (profileError) throw profileError;

    return { success: true, message: 'Inscription réussie !', user: newUser };

  } catch(error) {
    console.error('Sign up error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Une erreur inconnue est survenue.';
    return { success: false, error: errorMessage };
  }
}


const SignInSchema = z.object({
  phone: z.string().min(8, 'Le numéro de téléphone est requis.'),
});

export async function signInWithPhoneAction(formData: FormData) {
    if (!supabaseAdmin) {
        return { success: false, error: 'La configuration du serveur est manquante.' };
    }

    const data = Object.fromEntries(formData.entries());
    const validatedFields = SignInSchema.safeParse(data);

    if (!validatedFields.success) {
        return { success: false, error: 'Numéro de téléphone invalide.' };
    }

    const { phone } = validatedFields.data;

    try {
        const { data: profile, error } = await supabaseAdmin
            .from('profiles')
            .select('*')
            .eq('phone', phone)
            .single();

        if (error || !profile) {
            return { success: false, error: 'Aucun utilisateur trouvé avec ce numéro de téléphone.' };
        }
        
        return { success: true, user: profile };

    } catch (error) {
        console.error('Sign in error:', error);
        return { success: false, error: 'Une erreur est survenue lors de la connexion.' };
    }
}

const CreateSearchSchema = z.object({
    clientId: z.string(), // Phone users might not have a UUID, so we adapt.
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
    
    // We can't use UUID validation here as phone-based users won't have one
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
                const fileName = `${clientId.replace(/[^a-zA-Z0-9]/g, '_')}/${Date.now()}-${image.name}`;
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
