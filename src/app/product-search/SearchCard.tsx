
'use client';

import Image from 'next/image';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, HelpCircle, MessageSquare, Phone, Send } from 'lucide-react';
import type { Database } from '@/lib/supabase/client';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

type Search = Database['public']['Tables']['searches']['Row'];

interface SearchCardProps {
  search: Search;
}

export function SearchCard({ search }: SearchCardProps) {

  const hasPhotos = search.photo_urls && search.photo_urls.length > 0;

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <div className="flex justify-between items-start">
            <div>
                <CardTitle className="text-lg font-headline">{search.product_name}</CardTitle>
                <CardDescription className="text-xs">
                    {search.original_product_name && search.original_product_name !== search.product_name 
                        ? `Votre recherche : "${search.original_product_name}"`
                        : ''}
                </CardDescription>
            </div>
             <Badge variant="secondary">En attente</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {hasPhotos && (
            <div className="flex gap-2">
                {search.photo_urls?.map((url, index) => (
                    <div key={index} className="relative h-20 w-20 rounded-md overflow-hidden border">
                        <Image src={url} alt={`Photo produit ${index+1}`} fill className="object-cover" />
                    </div>
                ))}
            </div>
        )}
        
        {/* Placeholder for responses */}
        <div className="text-center text-sm text-muted-foreground border-2 border-dashed rounded-lg p-6">
            <HelpCircle className="mx-auto h-8 w-8 mb-2" />
            <p>En attente de réponses des pharmacies...</p>
        </div>

      </CardContent>
      <CardFooter className="bg-muted/50 p-3 flex justify-between items-center">
        <p className="text-xs text-muted-foreground flex items-center gap-1.5">
            <Clock className="h-3 w-3" /> 
            demandé {formatDistanceToNow(new Date(search.created_at), { addSuffix: true, locale: fr })}
        </p>
        <Button variant="outline" size="sm" disabled>
            <MessageSquare className="mr-2" /> Discuter
        </Button>
      </CardFooter>
    </Card>
  );
}
