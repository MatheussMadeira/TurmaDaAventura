/** @type {import('next').NextConfig} */
const nextConfig = {
  // /oficina virou /oficinas: 301 para não perder links antigos nem posição no Google
  async redirects() {
    return [{ source: '/oficina', destination: '/oficinas', statusCode: 301 }];
  },
  reactStrictMode: true,
  compiler: { styledComponents: true },
  images: {
    formats: ['image/avif', 'image/webp'],
    // Fotos enviadas pelo admin ficam no Vercel Blob (Etapa 4).
    remotePatterns: [{ protocol: 'https', hostname: '*.public.blob.vercel-storage.com' }],
  },
};

export default nextConfig;
