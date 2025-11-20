
'use client';

import Link from 'next/link';
import { PageWrapper } from '@/components/shared/page-wrapper';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Pill, Search, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Chatbot } from '@/components/chatbot/chatbot';

export default function HomePage() {
  return (
    <PageWrapper>
      <div className="container mx-auto px-4 md:px-6 py-12 md:py-20 flex-grow flex items-center animate-in fade-in duration-500">
        <div className="w-full">
          <header className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold font-headline text-foreground">
              Bienvenue sur PharmaGuard
            </h1>
            <p className="text-muted-foreground mt-4 text-lg md:text-xl max-w-3xl mx-auto">
              Votre assistant santé à Lomé. Trouvez une pharmacie de garde ou vérifiez la disponibilité d'un produit en quelques clics.
            </p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Link href="/pharmacies" className="group">
              <Card className="h-full flex flex-col justify-between transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer">
                <div>
                  <CardHeader>
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-primary/10 rounded-lg">
                        <Pill className="h-8 w-8 text-primary" />
                      </div>
                      <CardTitle className="font-headline text-2xl text-primary">Pharmacies de Garde</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base">
                      Consultez la liste à jour des pharmacies de garde à Lomé, leurs contacts et leurs localisations.
                    </CardDescription>
                  </CardContent>
                </div>
                <div className="p-6 pt-0">
                   <Button variant="link" className="p-0 h-auto text-primary group-hover:underline">
                    Voir la liste <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </div>
              </Card>
            </Link>

            <Link href="/product-search" className="group">
              <Card className="h-full flex flex-col justify-between transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer">
                 <div>
                    <CardHeader>
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-accent/10 rounded-lg">
                          <Search className="h-8 w-8 text-accent" />
                        </div>
                        <CardTitle className="font-headline text-2xl text-accent">Rechercher un Produit</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-base">
                        Gagnez du temps. Demandez la disponibilité d'un produit aux pharmacies proches de vous avant de vous déplacer.
                      </CardDescription>
                    </CardContent>
                </div>
                <div className="p-6 pt-0">
                  <Button variant="link" className="p-0 h-auto text-accent group-hover:underline">
                    Faire une demande <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </div>
              </Card>
            </Link>
          </div>
        </div>
      </div>
      <Chatbot />
    </PageWrapper>
  );
}
