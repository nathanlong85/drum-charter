import path from 'node:path';
import withSerwistInit from '@serwist/next';

const withSerwist = withSerwistInit({
  swSrc: 'app/sw.ts',
  swDest: 'public/sw.js',
  disable: process.env.NODE_ENV === 'development' && process.env.ENABLE_SW !== 'true',
  reloadOnOnline: true,
});

export default withSerwist({
  // Your Next.js config here
  outputFileTracingRoot: path.join(__dirname),
  turbopack: {},
});
