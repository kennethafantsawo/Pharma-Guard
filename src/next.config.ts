require('dotenv').config({ path: require('path').resolve(process.cwd(), '.env') });

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'pooariitfzfacjafwkkp.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  }
};

// Add Supabase storage hostname if the URL is set
if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
  try {
    const supabaseHostname = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname;
    if (supabaseHostname && supabaseHostname !== 'pooariitfzfacjafwkkp.supabase.co') {
        nextConfig.images.remotePatterns.push({
          protocol: 'https',
          hostname: supabaseHostname,
          port: '',
          pathname: '/storage/v1/object/public/**',
        });
    }
  } catch (error) {
    console.error('Invalid NEXT_PUBLIC_SUPABASE_URL in next.config.js:', error);
  }
}

module.exports = nextConfig;
