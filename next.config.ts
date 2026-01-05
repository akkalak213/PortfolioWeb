import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'raybzszmruiqbcmyyesv.supabase.co', // **อย่าลืมเปลี่ยนเป็น Project ID ของ Supabase คุณ**
      },
    ],
  },
};

export default nextConfig;