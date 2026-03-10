import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { clerkMiddleware } from '@clerk/nextjs/server'

const RESERVED_SLUGS = ['www', 'app', 'api', 'pricing', 'signup',
  'onboarding', 'login', 'dashboard', 'support', 'mail', 'admin']

export default clerkMiddleware(async (auth, req) => {
  const hostname = req.headers.get('host') || ''
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'localhost:3000'
  const hostWithoutPort = hostname.replace(/:\d+$/, '')
  const rootHost = rootDomain.split(':')[0]

  // Treat Vercel preview URLs and localhost as root
  const isVercelPreview = hostWithoutPort.endsWith('.vercel.app')
  const isIPAddress = /^(\d{1,3}\.){3}\d{1,3}$/.test(hostWithoutPort)
  const isRoot =
    hostWithoutPort === rootHost ||
    hostWithoutPort === `www.${rootHost}` ||
    hostWithoutPort === 'localhost' ||
    isIPAddress ||
    isVercelPreview

  const isApp =
    hostWithoutPort === `app.${rootHost}` ||
    hostWithoutPort === 'app.localhost'

  if (!isApp && !isRoot) {
    // It's a tenant subdomain, e.g. cool-air-fix.jobscompanion.com
    const slug = hostWithoutPort.replace(`.${rootHost}`, '')
    if (RESERVED_SLUGS.includes(slug)) {
      return NextResponse.redirect(new URL('/', req.url))
    }
    return NextResponse.rewrite(new URL(`/lead-form/${slug}${req.nextUrl.pathname}`, req.url))
  }

  const isOnboarding = req.nextUrl.pathname.startsWith('/onboarding')

  if (isApp || isOnboarding) {
    await auth.protect()
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
