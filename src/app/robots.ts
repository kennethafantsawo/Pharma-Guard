
import { MetadataRoute } from 'next';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://pharma-proget.vercel.app';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: '/admin', // On ne veut pas que la page admin soit indexée
    },
    sitemap: `${APP_URL}/sitemap.xml`,
  };
}
