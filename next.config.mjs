/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: ['10.11.238.190'],
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb'
    }
  },
  outputFileTracingIncludes: {
    '/api/**/*': ['./data/vector/index.json']
  }
};

export default nextConfig;
