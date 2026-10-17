import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Gracefully handle Chrome DevTools workspace inspection requests with 200 OK
  if (request.nextUrl.pathname.startsWith('/.well-known/appspecific/com.chrome.devtools.json')) {
    return new NextResponse('{}', {
      status: 200,
      headers: {
        'content-type': 'application/json',
      },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/.well-known/:path*'],
};
