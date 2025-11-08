
import type { Metadata } from 'next';
import { Toaster } from "@/components/ui/toaster"
import { ThemeProvider } from '@/components/shared/theme-provider';
import './globals.css';
import { Inter, Sora } from 'next/font/google';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const sora = Sora({ subsets: ['latin'], variable: '--font-sora' });

const APP_URL = new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://pharma-proget.vercel.app');

export const metadata: Metadata = {
  metadataBase: APP_URL,
  title: {
    default: 'PharmaGuard | Pharmacies de Garde à Lomé, Togo',
    template: '%s | PharmaGuard',
  },
  description: 'Trouvez rapidement et facilement les pharmacies de garde à Lomé, Togo. Horaires, contacts et localisation. Service disponible 24/7, même hors ligne.',
  keywords: ['pharmacie de garde', 'pharmacie de garde lomé', 'pharmacies de garde togo', 'pharmacie ouverte', 'urgence médicale lomé', 'santé togo'],
  applicationName: 'PharmaGuard',
  authors: [{ name: 'Kenneth AFANTSAWO', url: 'https://www.linkedin.com/in/kenneth-afantsawo-a593a2202/' }],
  creator: 'Kenneth AFANTSAWO',
  publisher: 'Kenneth AFANTSAWO',
  
  alternates: {
    canonical: '/',
  },

  openGraph: {
    type: 'website',
    url: '/',
    title: 'PharmaGuard | Pharmacies de Garde à Lomé, Togo',
    description: 'Trouvez rapidement et facilement les pharmacies de garde à Lomé, Togo. Horaires, contacts et localisation.',
    siteName: 'PharmaGuard',
    images: [
      {
        url: '/og-image.png', // Assurez-vous d'avoir ce fichier dans /public
        width: 1200,
        height: 630,
        alt: 'PharmaGuard - Pharmacies de Garde à Lomé',
      },
    ],
    locale: 'fr_FR',
  },
  
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },

  twitter: {
    card: 'summary_large_image',
    title: 'PharmaGuard | Pharmacies de Garde à Lomé, Togo',
    description: 'Trouvez facilement les pharmacies de garde à Lomé, Togo.',
    images: ['/og-image.png'],
  },

  // Le lien vers le manifest est maintenant ajouté manuellement dans le <head> pour plus de fiabilité.
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#2563eb" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className={`${inter.variable} ${sora.variable} font-body antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
