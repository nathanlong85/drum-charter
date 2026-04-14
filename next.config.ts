import path from 'node:path';
import withSerwistInit from '@serwist/next';

const withSerwist = withSerwistInit({
  // The source file for your service worker
  swSrc: 'app/sw.ts',
  // The destination where the compiled worker will be served (root)
  swDest: 'public/sw.js',
  // Force SW in production-like builds
  disable: process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_FORCE_SW !== 'true',
});

export default withSerwist({
  outputFileTracingRoot: path.resolve(process.cwd()),
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  logging: {
    browserToTerminal: true,
  },
  experimental: {
    viewTransition: true,
  },
});
