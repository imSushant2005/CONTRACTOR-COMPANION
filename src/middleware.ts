import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { clerkMiddleware } from '@clerk/nextjs/server'

const RESERVED_SLUGS = ['www', 'app', 'api', 'pricing', 'signup',
  'onboarding', 'login', 'dashboard', 'support', 'mail', 'admin']


export default clerkMiddleware(async (auth, req) => {
  const hostname = req.headers.get('host') || ''
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'localhost:3000'
  const hostWithoutPort = hostname.replace(/:\d+$/, '')

  const isApp = hostWithoutPort === `app.${rootDomain.split(':')[0]}` || hostWithoutPort === `app.localhost` || hostWithoutPort === 'app'
  const isIPAddress = /^(\d{1,3}\.){3}\d{1,3}$/.test(hostWithoutPort)
  const isRoot = hostWithoutPort === rootDomain.split(':')[0] || hostWithoutPort === `www.${rootDomain.split(':')[0]}` || hostWithoutPort === 'localhost' || isIPAddress

  if (!isApp && !isRoot) {
    const slug = hostWithoutPort.replace(`.${rootDomain.split(':')[0]}`, '')
    if (RESERVED_SLUGS.includes(slug)) {
      return NextResponse.redirect(new URL('/', req.url))
    }
    // Rewrite tenant subdomain → /lead-form/[slug]
    return NextResponse.rewrite(new URL(`/lead-form/${slug}${req.nextUrl.pathname}`, req.url))
  }

  if (isApp) {
    ; (await auth()).protect()
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
