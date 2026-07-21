import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const protectedPaths = new Set([
  "/onboarding",
  "/dashboard",
  "/medications",
  "/doses",
  "/checkins",
  "/visit-prep",
  "/updates",
  "/report",
  "/settings",
]);

function getPublicSupabaseEnvironment() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error("Missing public Supabase environment variables.");
  }

  return { anonKey, url };
}

function redirectWithCookies(destination: URL, response: NextResponse) {
  const redirectResponse = NextResponse.redirect(destination);

  for (const cookie of response.cookies.getAll()) {
    redirectResponse.cookies.set(cookie);
  }

  return redirectResponse;
}

export async function updateSession(request: NextRequest) {
  const response = NextResponse.next({ request });
  const { anonKey, url } = getPublicSupabaseEnvironment();
  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, options, value } of cookiesToSet) {
          request.cookies.set(name, value);
          response.cookies.set(name, value, options);
        }
      },
    },
  });
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { pathname } = request.nextUrl;

  const isProtectedPath = [...protectedPaths].some(
    (protectedPath) =>
      pathname === protectedPath || pathname.startsWith(`${protectedPath}/`),
  );

  if (!isProtectedPath) {
    return response;
  }

  if (!user) {
    const loginUrl = request.nextUrl.clone();

    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("next", pathname);

    return redirectWithCookies(loginUrl, response);
  }

  const { data: medications } = await supabase
    .from("medications")
    .select("id")
    .eq("user_id", user.id)
    .limit(1);
  const hasMedication = Boolean(medications?.length);

  if (pathname === "/onboarding") {
    if (hasMedication) {
      const dashboardUrl = request.nextUrl.clone();

      dashboardUrl.pathname = "/dashboard";

      return redirectWithCookies(dashboardUrl, response);
    }

    return response;
  }

  if (!hasMedication) {
    const onboardingUrl = request.nextUrl.clone();

    onboardingUrl.pathname = "/onboarding";

    return redirectWithCookies(onboardingUrl, response);
  }

  return response;
}
