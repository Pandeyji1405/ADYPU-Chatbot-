/** @type {import('next').NextConfig} */
const nextConfig = {
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
