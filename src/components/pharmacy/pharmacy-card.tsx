
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Phone, MapPin } from 'lucide-react';
import type { Pharmacy } from '@/lib/types';
import Link from 'next/link';
import { WhatsAppIcon } from '../icons/WhatsAppIcon';

interface PharmacyCardProps {
  pharmacy: Pharmacy;
}

export function PharmacyCard({ pharmacy }: PharmacyCardProps) {
  const whatsAppNumber = pharmacy.contact2.startsWith('+') ? pharmacy.contact2.substring(1) : pharmacy.contact2;
  const mapQuery = encodeURIComponent(`pharmacie ${pharmacy.nom}`);
  const mapUrl = `https://www.google.com/maps/search/?api=1&query=${mapQuery}`;

  return (
    <Card 
        className="w-full h-full transition-all duration-300 hover:shadow-xl hover:-translate-y-1 flex flex-col"
    >
      <CardHeader>
        <CardTitle className="font-headline text-xl text-accent">
          <Link href={mapUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">
            {pharmacy.nom}
          </Link>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 flex-grow flex flex-col justify-between">
        <Link 
          href={mapUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-start gap-3 text-muted-foreground transition-colors hover:text-primary group"
        >
          <MapPin className="h-5 w-5 flex-shrink-0 mt-0.5 text-primary/70 transition-colors group-hover:text-primary" />
          <span className="font-body group-hover:underline">{pharmacy.localisation}</span>
        </Link>
        <div className="flex flex-wrap gap-2 pt-2">
          <Button asChild size="sm">
            <a href={`tel:${pharmacy.contact1}`}>
              <Phone />
              Appeler
            </a>
          </Button>
          <Button asChild variant="secondary" size="sm">
            <a href={`https://wa.me/${whatsAppNumber}`} target="_blank" rel="noopener noreferrer">
              <WhatsAppIcon className="h-4 w-4" />
              WhatsApp
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
