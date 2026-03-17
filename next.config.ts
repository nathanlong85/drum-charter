import path from 'node:path';
import { withSerwist } from '@serwist/turbopack';

export default withSerwist({
  // Your Next.js config here
  outputFileTracingRoot: path.join(__dirname),
  turbopack: {},
});
