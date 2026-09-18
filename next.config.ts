import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Do not generate AI agent instruction files into the repository.
  agentRules: false,
  experimental: {
    // Photographs and documents are uploaded through server actions, whose
    // default body limit is 1 MB — smaller than a phone photograph. This
    // matches the 20 MB ceiling enforced in lib/media.ts, with a little
    // headroom for the rest of the form.
    serverActions: { bodySizeLimit: '24mb' },
  },
};

export default nextConfig;
