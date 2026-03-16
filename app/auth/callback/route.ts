import { NextResponse } from 'next/server';
// The client you created in Step 2
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  // if "next" is in search params, use it as the redirection URL
  const next = searchParams.get('next') ?? '/';

  // Security: Ensure the redirect URL is relative to prevent open redirects
  // This validates that "next" is a path-only relative URL (e.g., /library, /songs/123)
  // and rejects any absolute URLs, protocol-relative URLs (//), or non-standard schemes.
  let sanitizedNext = '/';
  if (next.startsWith('/') && !next.startsWith('//') && !next.startsWith('\\')) {
    try {
      // Validate that it's a valid relative path by attempting to parse it with a dummy base
      const url = new URL(next, origin);
      if (url.origin === origin) {
        sanitizedNext = next;
      }
    } catch {
      sanitizedNext = '/';
    }
  }

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const forwardedHost = request.headers.get('x-forwarded-host'); // provided by Vercel
      const isLocalEnv = process.env.NODE_ENV === 'development';
      if (isLocalEnv) {
        // we can be sure that there is no proxy involved in local dev
        return NextResponse.redirect(`${origin}${sanitizedNext}`);
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${sanitizedNext}`);
      } else {
        return NextResponse.redirect(`${origin}${sanitizedNext}`);
      }
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
