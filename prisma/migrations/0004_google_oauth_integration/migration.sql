CREATE TABLE "GoogleIntegration" (
    "id" TEXT NOT NULL DEFAULT 'main',
    "googleAccountEmail" TEXT,
    "accountName" TEXT,
    "accountDisplayName" TEXT,
    "locationName" TEXT,
    "locationTitle" TEXT,
    "encryptedAccessToken" TEXT,
    "encryptedRefreshToken" TEXT,
    "accessTokenExpiresAt" TIMESTAMP(3),
    "lastSyncedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GoogleIntegration_pkey" PRIMARY KEY ("id")
);
