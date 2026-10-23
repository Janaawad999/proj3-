-- CreateTable
CREATE TABLE "financial_alerts" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "severity" TEXT NOT NULL DEFAULT 'INFO',
    "status" TEXT NOT NULL DEFAULT 'UNREAD',
    "data" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "financial_alerts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "financial_alerts_organizationId_userId_idx" ON "financial_alerts"("organizationId", "userId");

-- CreateIndex
CREATE INDEX "financial_alerts_userId_status_idx" ON "financial_alerts"("userId", "status");

-- CreateIndex
CREATE INDEX "financial_alerts_userId_createdAt_idx" ON "financial_alerts"("userId", "createdAt");

-- AddForeignKey
ALTER TABLE "financial_alerts" ADD CONSTRAINT "financial_alerts_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "financial_alerts" ADD CONSTRAINT "financial_alerts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
