import { type NextRequest, NextResponse } from "next/server";
import createIntlMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";

const intlMiddleware = createIntlMiddleware(routing);

const LOCALES = routing.locales as readonly string[];

function isProtectedRoute(pathname: string): boolean {
  for (const locale of LOCALES) {
    if (pathname === `/${locale}` || pathname === `/${locale}/`) continue;
    if (
      pathname === `/${locale}/login` ||
      pathname.startsWith(`/${locale}/login/`)
    )
      continue;
    if (pathname.startsWith(`/${locale}/`)) return true;
  }
  return false;
}

export function proxy(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;

  if (isProtectedRoute(pathname)) {
    const authCookie = request.cookies.get("beasy_auth");

    if (!authCookie?.value) {
      const rawLocale = pathname.split("/")[1] ?? "";
      const locale = (LOCALES.includes(rawLocale) ? rawLocale : routing.defaultLocale) as string;

      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = `/${locale}/login`;
      return NextResponse.redirect(loginUrl);
    }
  }

  return intlMiddleware(request) as NextResponse;
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
