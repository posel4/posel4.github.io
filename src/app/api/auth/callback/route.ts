import { NextRequest, NextResponse } from "next/server";
import {
  createSessionCookie,
  COOKIE_OPTIONS,
  ALLOWED_USERNAME,
} from "@/lib/auth";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const expectedState = request.cookies.get("oauth_state")?.value;
  if (!code || !state || !expectedState || state !== expectedState) {
    return NextResponse.redirect(new URL("/write?error=no_code", request.url));
  }

  // Exchange code for access token
  const tokenRes = await fetch(
    "https://github.com/login/oauth/access_token",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      }),
    }
  );

  const tokenData = await tokenRes.json();
  if (!tokenData.access_token) {
    return NextResponse.redirect(
      new URL("/write?error=token_failed", request.url)
    );
  }

  // Verify user identity
  const userRes = await fetch("https://api.github.com/user", {
    headers: {
      Authorization: `Bearer ${tokenData.access_token}`,
      "User-Agent": "posel4-blog",
    },
  });
  const userData = await userRes.json();

  if (userData.login !== ALLOWED_USERNAME) {
    return NextResponse.redirect(
      new URL("/write?error=unauthorized", request.url)
    );
  }

  // Set encrypted session cookie
  const sessionValue = createSessionCookie({
    token: tokenData.access_token,
    username: userData.login,
  });

  const response = NextResponse.redirect(new URL("/write", request.url));
  response.cookies.set("session", sessionValue, COOKIE_OPTIONS);
  response.cookies.delete("oauth_state");
  return response;
}
