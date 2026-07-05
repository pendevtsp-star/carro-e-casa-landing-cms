import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { exchangeCodeForTokens, saveGoogleConnection } from "@/lib/google-business";

function adminReviewsUrl(params?: Record<string, string>) {
  const url = new URL(
    "/admin/avaliacoes",
    process.env.NEXT_PUBLIC_SITE_URL || "https://lojacarroecasa.com.br",
  );
  if (params) {
    Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value));
  }
  return url;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const error = url.searchParams.get("error");
  const cookieStore = await cookies();
  const expectedState = cookieStore.get("google_oauth_state")?.value;

  cookieStore.delete("google_oauth_state");

  if (error) {
    return NextResponse.redirect(adminReviewsUrl({ google_error: error }));
  }

  if (!code || !state || !expectedState || state !== expectedState) {
    return NextResponse.redirect(adminReviewsUrl({ google_error: "invalid_state" }));
  }

  try {
    const tokens = await exchangeCodeForTokens(code);
    await saveGoogleConnection(tokens);
    return NextResponse.redirect(adminReviewsUrl({ google_connected: "1" }));
  } catch (caught) {
    const message = caught instanceof Error ? caught.message : "google_connection_failed";
    return NextResponse.redirect(adminReviewsUrl({ google_error: message.slice(0, 120) }));
  }
}
