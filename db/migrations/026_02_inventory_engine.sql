-- Fase 26.2 — Inventory Engine
CREATE TABLE IF NOT EXISTS "InventoryHold" (
  "id" SERIAL PRIMARY KEY,
  "producerId" INTEGER NOT NULL,
  "eventId" INTEGER NOT NULL,
  "lotId" INTEGER,
  "code" TEXT NOT NULL UNIQUE,
  "quantity" INTEGER NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'active',
  "reason" TEXT NOT NULL,
  "source" TEXT NOT NULL DEFAULT 'manual',
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "createdBy" TEXT,
  "releasedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS "InventoryHold_scope_idx" ON "InventoryHold" ("producerId","eventId","status","expiresAt");
CREATE INDEX IF NOT EXISTS "InventoryHold_lot_idx" ON "InventoryHold" ("lotId","status");

CREATE TABLE IF NOT EXISTS "InventorySnapshot" (
  "id" SERIAL PRIMARY KEY,
  "producerId" INTEGER NOT NULL,
  "eventId" INTEGER NOT NULL,
  "lotId" INTEGER,
  "capacity" INTEGER NOT NULL,
  "sold" INTEGER NOT NULL,
  "held" INTEGER NOT NULL DEFAULT 0,
  "available" INTEGER NOT NULL,
  "salesVelocityPerHour" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "forecastSoldOutAt" TIMESTAMP(3),
  "capturedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS "InventorySnapshot_scope_idx" ON "InventorySnapshot" ("producerId","eventId","capturedAt");
CREATE INDEX IF NOT EXISTS "InventorySnapshot_lot_idx" ON "InventorySnapshot" ("lotId","capturedAt");
