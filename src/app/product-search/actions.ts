
'use server';

import { supabaseAdmin } from '@/lib/supabase/admin';
import { z } from 'zod';
import { processDemand } from '@/ai/flows/process-demand';
import { revalidatePath } from 'next/cache';

const SignUpSchema = z.object({
  phone: z.string().min(8, 'Le numéro de téléphone est trop court.'),
  username: z.string().min(2, 'Le nom d\'utilisateur est requis.'),
  role: z.enum(['Client', 'Pharmacien']),
  pharmacyName: z.string().optional(),
}).refine(data => {
    if (data.role === 'Pharmacien') {
        return !!data.pharmacyName && data.pharmacyName.length > 0;
    }
    return true;
}, {
    message: 'Le nom de la pharmacie est requis pour un pharmacien.',
    path: ['pharmacyName'],
});

export async function signUpWithPhoneAction(formData: FormData) {
  if (!supabaseAdmin) {
    return { success: false, error: 'La configuration du serveur est manquante.' };
  }

  const data = Object.fromEntries(formData.entries());
  const validatedFields = SignUpSchema.safeParse(data);

  if (!validatedFields.success) {
    return { success: false, error: 'Données invalides.', issues: validatedFields.error.issues };
  }
  
  const { phone, username, role, pharmacyName } = validatedFields.data;

  try {
     // 1. Check if user already exists
    const { data: existingUser, error: existingUserError } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('phone', phone)
        .single();
    
    if (existingUser) {
        return { success: false, error: 'Ce numéro de téléphone est déjà utilisé.' };
    }

    // 2. Create user in auth.users
    const { data: authUser, error: authError } = await supabaseAdmin.auth.createUser({
        phone: phone,
        phone_confirm: true, // Auto-confirm for simplicity for now
    });
    
    if (authError) throw authError;
    if (!authUser.user) throw new Error('La création de l\'utilisateur a échoué.');

    // 3. Create profile in public.profiles
    const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .insert({
            id: authUser.user.id,
            phone: phone,
            username: username,
            role: role,
            pharmacyName: role === 'Pharmacien' ? pharmacyName : null
        });

    if (profileError) {
        // If profile creation fails, we should delete the auth user to avoid orphans
        await supabaseAdmin.auth.admin.deleteUser(authUser.user.id);
        throw profileError;
    }

    return { success: true, message: 'Inscription réussie !' };

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
        
        // For now, we are not using OTP, so we just return the user profile data.
        // This is a simplified login for now. Real implementation would involve OTP.
        return { success: true, user: profile };

    } catch (error) {
        console.error('Sign in error:', error);
        return { success: false, error: 'Une erreur est survenue lors de la connexion.' };
    }
}

const CreateSearchSchema = z.object({
    clientId: z.string().uuid('ID client invalide'),
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

    const validatedFields = CreateSearchSchema.safeParse(rawData);

    if (!validatedFields.success) {
        console.error("Validation error:", validatedFields.error.flatten().fieldErrors);
        return { success: false, error: 'Données de recherche invalides.' };
    }

    const { clientId, productName, images } = validatedFields.data;
    const imageUrls: string[] = [];

    try {
        // 1. Upload images to Supabase Storage
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

        // 2. Call AI flow to process demand
        const { productName: processedName } = await processDemand({
            description: productName || '',
            photoDataUris: imageUrls,
        });

        // 3. Save the search to the 'searches' table
        const { error: insertError } = await supabaseAdmin
            .from('searches')
            .insert({
                client_id: clientId,
                original_product_name: productName,
                product_name: processedName,
                photo_urls: imageUrls.length > 0 ? imageUrls : null,
            });

        if (insertError) throw new Error(`Erreur lors de l'enregistrement de la recherche : ${insertError.message}`);

        // 4. (Future step) Add to search_history table
        
        // Invalidate cache for pages that might display this data
        revalidatePath('/product-search');

        return { success: true };

    } catch (error) {
        console.error('Error in createSearchAction:', error);
        const errorMessage = error instanceof Error ? error.message : 'Une erreur inconnue est survenue.';
        return { success: false, error: errorMessage };
    }
}
