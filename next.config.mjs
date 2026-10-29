/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  compiler: { styledComponents: true },
  images: {
    formats: ['image/avif', 'image/webp'],
    // Fotos enviadas pelo admin ficam no Vercel Blob (Etapa 4).
    remotePatterns: [{ protocol: 'https', hostname: '*.public.blob.vercel-storage.com' }],
  },
};

export default nextConfig;
