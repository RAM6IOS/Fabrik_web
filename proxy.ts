import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * Next.js 16 Proxy function (replacing deprecated middleware).
 * Runs on the server before requests are completed to check auth sessions.
 */
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh user session cookie if expired.
  const { data: { user } } = await supabase.auth.getUser();

  const isLoginPage = request.nextUrl.pathname === '/login';
  const isSignupPage = request.nextUrl.pathname === '/signup';
  const isForgotPasswordPage = request.nextUrl.pathname === '/forgot-password';
  const isResetPasswordPage = request.nextUrl.pathname === '/reset-password';
  const isApiRoute = request.nextUrl.pathname.startsWith('/api');
  const isPublicPage = isLoginPage || isSignupPage || isForgotPasswordPage || isResetPasswordPage;

  // Protect pages: if not authenticated, redirect to /login
  if (!user && !isPublicPage && !isApiRoute && request.nextUrl.pathname !== '/') {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  // If already authenticated and visiting the login/signup page, redirect to dashboard
  if (user && (isLoginPage || isSignupPage)) {
    const dashboardUrl = new URL('/dashboard', request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
