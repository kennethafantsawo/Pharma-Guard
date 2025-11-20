'use client';

import { useLoadScript, GoogleMap } from '@react-google-maps/api';
import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { MapPin, AlertCircle } from 'lucide-react';

export function MapDisplay() {
  const libraries = useMemo(() => ['places'], []);
  const mapCenter = useMemo(() => ({ lat: 6.176, lng: 1.222 }), []);

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string,
    libraries: libraries as any,
  });

  const renderMap = () => {
    if (loadError) {
      return (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erreur de carte</AlertTitle>
          <AlertDescription>
            Impossible de charger Google Maps. Vérifiez la clé API et votre connexion.
          </AlertDescription>
        </Alert>
      );
    }

    if (!isLoaded) {
      return <Skeleton className="h-full w-full" />;
    }

    return (
      <GoogleMap
        options={{
          disableDefaultUI: true,
          clickableIcons: false,
          scrollwheel: true,
        }}
        zoom={12}
        center={mapCenter}
        mapTypeId="roadmap"
        mapContainerClassName="h-full w-full"
      />
    );
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-headline text-primary">
          <MapPin />
          Carte de Lomé
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative aspect-video w-full rounded-lg bg-muted overflow-hidden border">
          {renderMap()}
        </div>
        <p className="text-xs text-muted-foreground mt-2 text-center">
            Utilisez la molette pour zoomer sur la carte.
        </p>
      </CardContent>
    </Card>
  );
}