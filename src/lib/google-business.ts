import { prisma } from "@/lib/prisma";
import { decryptSecret, encryptSecret } from "@/lib/secret-crypto";

const businessScope = "https://www.googleapis.com/auth/business.manage";

type GoogleTokenResponse = {
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
  error?: string;
  error_description?: string;
};

type GoogleApiErrorResponse = {
  error?: {
    code?: number;
    message?: string;
    status?: string;
  };
};

type GoogleAccount = {
  name: string;
  accountName?: string;
  type?: string;
};

type GoogleLocation = {
  name: string;
  title?: string;
};

type GoogleReview = {
  reviewId?: string;
  reviewer?: {
    profilePhotoUrl?: string;
    displayName?: string;
    isAnonymous?: boolean;
  };
  starRating?: "ONE" | "TWO" | "THREE" | "FOUR" | "FIVE" | "STAR_RATING_UNSPECIFIED";
  comment?: string;
  updateTime?: string;
  name?: string;
};

type ReviewsResponse = {
  reviews?: GoogleReview[];
  averageRating?: number;
  totalReviewCount?: number;
};

export function getGoogleOAuthConfig() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri =
    process.env.GOOGLE_REDIRECT_URI ||
    `${process.env.NEXT_PUBLIC_SITE_URL || "https://lojacarroecasa.com.br"}/api/google/callback`;

  if (!clientId || !clientSecret) {
    throw new Error("Configure GOOGLE_CLIENT_ID e GOOGLE_CLIENT_SECRET.");
  }

  return { clientId, clientSecret, redirectUri };
}

export function buildGoogleOAuthUrl(state: string) {
  const { clientId, redirectUri } = getGoogleOAuthConfig();
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: `${businessScope} openid email profile`,
    access_type: "offline",
    prompt: "consent",
    state,
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

export async function exchangeCodeForTokens(code: string) {
  const { clientId, clientSecret, redirectUri } = getGoogleOAuthConfig();
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });
  const data = (await response.json()) as GoogleTokenResponse;

  if (!response.ok || !data.access_token) {
    throw new Error(data.error_description || data.error || "Falha ao conectar com Google.");
  }

  return data;
}

async function refreshAccessToken(encryptedRefreshToken: string) {
  const { clientId, clientSecret } = getGoogleOAuthConfig();
  const refreshToken = decryptSecret(encryptedRefreshToken);
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });
  const data = (await response.json()) as GoogleTokenResponse;

  if (!response.ok || !data.access_token) {
    throw new Error(data.error_description || data.error || "Falha ao renovar token do Google.");
  }

  await prisma.googleIntegration.update({
    where: { id: "main" },
    data: {
      encryptedAccessToken: encryptSecret(data.access_token),
      accessTokenExpiresAt: new Date(Date.now() + (data.expires_in || 3600) * 1000),
    },
  });

  return data.access_token;
}

export async function getGoogleAccessToken() {
  const integration = await prisma.googleIntegration.findUnique({ where: { id: "main" } });
  if (!integration?.encryptedRefreshToken) {
    throw new Error("Conecte o Perfil Google da empresa primeiro.");
  }

  if (
    integration.encryptedAccessToken &&
    integration.accessTokenExpiresAt &&
    integration.accessTokenExpiresAt.getTime() > Date.now() + 60_000
  ) {
    return decryptSecret(integration.encryptedAccessToken);
  }

  return refreshAccessToken(integration.encryptedRefreshToken);
}

async function googleGet<T>(url: string, accessToken: string) {
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });

  if (!response.ok) {
    let message = `Google retornou erro ${response.status}.`;
    try {
      const data = (await response.json()) as GoogleApiErrorResponse;
      if (data.error?.message) {
        message = `Google retornou erro ${response.status}: ${data.error.message}`;
      }
    } catch {
      message = `Google retornou erro ${response.status}.`;
    }
    throw new Error(message);
  }

  return (await response.json()) as T;
}

export async function findFirstBusinessLocation(accessToken: string) {
  const accountsData = await googleGet<{ accounts?: GoogleAccount[] }>(
    "https://mybusinessaccountmanagement.googleapis.com/v1/accounts",
    accessToken,
  );
  const accounts = accountsData.accounts || [];
  if (!accounts.length) {
    throw new Error("A conta Google conectada não possui contas Business Profile acessíveis.");
  }

  const preferredLocation = process.env.GOOGLE_BUSINESS_LOCATION_NAME;
  const preferredTitle = process.env.GOOGLE_BUSINESS_LOCATION_TITLE?.toLowerCase() || "carro";

  for (const account of accounts) {
    const locationsData = await googleGet<{ locations?: GoogleLocation[] }>(
      `https://mybusinessbusinessinformation.googleapis.com/v1/${account.name}/locations?readMask=name,title`,
      accessToken,
    );
    const locations = locationsData.locations || [];
    const match =
      locations.find((location) => location.name === preferredLocation) ||
      locations.find((location) => location.title?.toLowerCase().includes(preferredTitle)) ||
      locations[0];

    if (match) {
      return { account, location: match };
    }
  }

  throw new Error("Nenhum local foi encontrado para a conta Google conectada.");
}

export function buildReviewParent(accountName: string, locationName: string) {
  if (locationName.startsWith("accounts/")) return locationName;
  if (locationName.startsWith("locations/")) return `${accountName}/${locationName}`;
  return `${accountName}/locations/${locationName}`;
}

export function starRatingToNumber(starRating?: GoogleReview["starRating"]) {
  return {
    ONE: 1,
    TWO: 2,
    THREE: 3,
    FOUR: 4,
    FIVE: 5,
    STAR_RATING_UNSPECIFIED: 5,
  }[starRating || "STAR_RATING_UNSPECIFIED"];
}

export async function fetchBusinessProfileReviews() {
  const integration = await prisma.googleIntegration.findUnique({ where: { id: "main" } });
  if (!integration?.accountName || !integration.locationName) {
    throw new Error("Conecte o Perfil Google da empresa primeiro.");
  }

  const accessToken = await getGoogleAccessToken();
  const parent = buildReviewParent(integration.accountName, integration.locationName);
  const data = await googleGet<ReviewsResponse>(
    `https://mybusiness.googleapis.com/v4/${parent}/reviews?pageSize=20&orderBy=updateTime%20desc`,
    accessToken,
  );

  return data;
}

export async function saveGoogleConnection(tokens: GoogleTokenResponse) {
  if (!tokens.access_token) {
    throw new Error("Google não retornou token de acesso.");
  }

  const accessToken = tokens.access_token;
  await prisma.googleIntegration.upsert({
    where: { id: "main" },
    update: {
      encryptedAccessToken: encryptSecret(accessToken),
      encryptedRefreshToken: tokens.refresh_token
        ? encryptSecret(tokens.refresh_token)
        : undefined,
      accessTokenExpiresAt: new Date(Date.now() + (tokens.expires_in || 3600) * 1000),
    },
    create: {
      id: "main",
      encryptedAccessToken: encryptSecret(accessToken),
      encryptedRefreshToken: tokens.refresh_token ? encryptSecret(tokens.refresh_token) : null,
      accessTokenExpiresAt: new Date(Date.now() + (tokens.expires_in || 3600) * 1000),
    },
  });

  const { account, location } = await findFirstBusinessLocation(accessToken);
  await prisma.googleIntegration.upsert({
    where: { id: "main" },
    update: {
      accountName: account.name,
      accountDisplayName: account.accountName || account.name,
      locationName: location.name,
      locationTitle: location.title || location.name,
      encryptedAccessToken: encryptSecret(accessToken),
      encryptedRefreshToken: tokens.refresh_token
        ? encryptSecret(tokens.refresh_token)
        : undefined,
      accessTokenExpiresAt: new Date(Date.now() + (tokens.expires_in || 3600) * 1000),
    },
    create: {
      id: "main",
      accountName: account.name,
      accountDisplayName: account.accountName || account.name,
      locationName: location.name,
      locationTitle: location.title || location.name,
      encryptedAccessToken: encryptSecret(accessToken),
      encryptedRefreshToken: tokens.refresh_token ? encryptSecret(tokens.refresh_token) : null,
      accessTokenExpiresAt: new Date(Date.now() + (tokens.expires_in || 3600) * 1000),
    },
  });
}
