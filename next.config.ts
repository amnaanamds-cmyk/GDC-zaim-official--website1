import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Do not generate AI agent instruction files into the repository.
  agentRules: false,
};

export default nextConfig;
