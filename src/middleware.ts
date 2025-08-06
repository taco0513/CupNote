import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // /tasting-flow/[mode] -> /tasting-flow/[mode]/coffee-info 리다이렉트
  if (pathname === '/tasting-flow/cafe' || pathname === '/tasting-flow/cafe/') {
    return NextResponse.redirect(new URL('/tasting-flow/cafe/coffee-info', request.url))
  }
  
  if (pathname === '/tasting-flow/homecafe' || pathname === '/tasting-flow/homecafe/') {
    return NextResponse.redirect(new URL('/tasting-flow/homecafe/coffee-info', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/tasting-flow/cafe',
    '/tasting-flow/cafe/',
    '/tasting-flow/homecafe',
    '/tasting-flow/homecafe/',
  ]
}