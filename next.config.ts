import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  async redirects() {
    return [
      {
        source: '/dp',
        destination: 'https://getdp.co/MainQuest26',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
