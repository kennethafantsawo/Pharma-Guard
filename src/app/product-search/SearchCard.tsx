
'use client';

import Image from 'next/image';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, HelpCircle, MessageSquare, Phone, Send, CheckCircle, Tag, Hand, User } from 'lucide-react';
import type { Database } from '@/lib/supabase/database.types';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';

type SearchWithResponses = Database['public']['Tables']['searches']['Row'] & {
  responses?: Database['public']['Tables']['responses']['Row'][];
};

interface SearchCardProps {
  search: SearchWithResponses;
  isPharmacistView?: boolean;
}

export function SearchCard({ search, isPharmacistView = false }: SearchCardProps) {
  const hasPhotos = search.photo_urls && search.photo_urls.length > 0;
  
  const hasResponses = search.responses && search.responses.length > 0;
  const status = hasResponses ? 'Répondu' : 'En attente';
  const statusVariant = hasResponses ? 'default' : 'secondary';
  const statusIcon = hasResponses ? <CheckCircle className="text-green-500" /> : <HelpCircle className="text-yellow-500" />;

  const handleCallClient = () => {
    if (search.client_phone) {
      window.location.href = `tel:${search.client_phone}`;
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg font-headline">{search.product_name}</CardTitle>
            {search.original_product_name && search.original_product_name !== search.product_name && (
              <CardDescription className="text-xs">
                Recherche initiale : "{search.original_product_name}"
              </CardDescription>
            )}
          </div>
          <Badge variant={statusVariant} className="flex items-center gap-1.5">
            {statusIcon}
            {status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {hasPhotos && (
          <div className="flex gap-2">
            {search.photo_urls?.map((url, index) => (
              <div key={index} className="relative h-20 w-20 rounded-md overflow-hidden border">
                <Image src={url} alt={`Photo produit ${index + 1}`} fill className="object-cover" />
              </div>
            ))}
          </div>
        )}
        
        {isPharmacistView && search.client_phone && (
            <div className="bg-muted/50 p-3 rounded-md border text-sm">
                <p className="font-semibold flex items-center gap-2"><User size={16} /> Contact Client</p>
                <p className="text-muted-foreground">Numéro de téléphone : {search.client_phone}</p>
                 <Button size="sm" className="mt-2" onClick={handleCallClient}>
                    <Phone /> Appeler le client
                 </Button>
            </div>
        )}

        <div className={cn(!hasResponses && "text-center text-sm text-muted-foreground border-2 border-dashed rounded-lg p-6")}>
          {hasResponses ? (
             <div className="space-y-3">
                 <h4 className="font-semibold text-sm">Réponses des pharmacies :</h4>
                {search.responses?.map(response => (
                    <div key={response.id} className="p-3 bg-muted rounded-md border text-sm">
                        <p className="font-semibold flex items-center gap-2"><Hand size={16}/>{response.pharmacy_name}</p>
                        <p className="text-muted-foreground flex items-center gap-2 mt-1">
                            <Tag size={16} /> Prix : {response.price || "Non spécifié"}
                        </p>
                    </div>
                ))}
             </div>
          ) : (
            <>
              <HelpCircle className="mx-auto h-8 w-8 mb-2" />
              <p>En attente de réponses des pharmacies...</p>
            </>
          )}
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

    