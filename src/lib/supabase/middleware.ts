import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  console.log('Middleware: Starting, path:', request.nextUrl.pathname)
  
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          const cookie = request.cookies.get(name)
          console.log('Middleware: Getting cookie:', name, !!cookie?.value)
          return cookie?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          console.log('Middleware: Setting cookie:', name)
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          console.log('Middleware: Removing cookie:', name)
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  const { data: { session } } = await supabase.auth.getSession()
  console.log('Middleware: Session check:', {
    exists: !!session,
    userId: session?.user?.id,
    path: request.nextUrl.pathname
  })

  if (!session && !request.nextUrl.pathname.startsWith('/auth')) {
    console.log('Middleware: No session, redirecting to auth')
    return NextResponse.redirect(new URL('/auth', request.url))
  }

  if (session && request.nextUrl.pathname.startsWith('/auth')) {
    console.log('Middleware: Has session, redirecting to dashboard')
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  console.log('Middleware: Continuing with request')
  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}

