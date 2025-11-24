
'use server';

import { supabaseAdmin } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';
import type { HealthPost } from '@/lib/types';


export async function getHealthPostsAction(): Promise<{ success: boolean; data?: HealthPost[]; error?: string; }> {
  if (!supabaseAdmin) {
    return { success: false, error: 'Configuration Supabase manquante.' };
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('health_posts')
      .select('*')
      .order('publish_at', { ascending: false });

    if (error) throw error;

    return { success: true, data: data as HealthPost[] };
  } catch (err) {
    console.error('Error fetching health posts:', err);
    const message = err instanceof Error ? err.message : 'Une erreur est survenue lors du chargement des fiches santé.';
    return { success: false, error: message };
  }
}

export async function incrementLikeAction(postId: number, decrement: boolean = false) {
  if (!supabaseAdmin) {
    return { success: false, error: "Configuration Supabase manquante." };
  }
  try {
    const { data, error } = await supabaseAdmin.rpc('increment_likes', { post_id_to_update: postId, increment_value: decrement ? -1 : 1 });

    if (error) throw error;
    
    revalidatePath('/health-library');
    return { success: true, newLikes: data };

  } catch (error) {
    console.error('Error (de)incrementing like:', error);
    const message = error instanceof Error ? error.message : 'Une erreur est survenue.';
    return { success: false, error: message };
  }
}

export async function getCommentsAction(postId: number) {
    if (!supabaseAdmin) {
        return { success: false, error: "Configuration Supabase manquante.", data: null };
    }

    try {
        const { data, error } = await supabaseAdmin
            .from('health_post_comments')
            .select('*')
            .eq('post_id', postId)
            .order('created_at', { ascending: true });

        if (error) throw error;

        return { success: true, data };
    } catch (error) {
        console.error('Error fetching comments:', error);
        return { success: false, error: 'Impossible de charger les commentaires.', data: null };
    }
}

export async function addCommentAction(formData: FormData) {
    if (!supabaseAdmin) {
        return { success: false, error: "Configuration Supabase manquante." };
    }
    
    const postId = Number(formData.get('postId'));
    const content = formData.get('content') as string;

    if (!postId || !content) {
        return { success: false, error: "Données du commentaire invalides." };
    }

    try {
        const { data, error } = await supabaseAdmin
            .from('health_post_comments')
            .insert({ post_id: postId, content: content })
            .select()
            .single();

        if (error) throw error;
        
        revalidatePath('/health-library');
        return { success: true, data };

    } catch (error) {
        console.error('Error adding comment:', error);
        return { success: false, error: 'Impossible d\'ajouter le commentaire.' };
    }
}
