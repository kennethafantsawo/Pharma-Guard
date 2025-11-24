
import { MetadataRoute } from 'next';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://pharma-proget.vercel.app';

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    '/',
    '/pharmacies',
    '/medication-info',
    '/product-search',
    '/health-library',
    '/feedback',
    '/admin'
  ];

  return routes.map((route) => ({
    url: `${APP_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: route === '/' ? 1 : 0.8,
  }));
}
