-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "info" TEXT NOT NULL DEFAULT 'Personal kitchen account',
    "seenWelcome" BOOLEAN NOT NULL DEFAULT false,
    "isDemo" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Kitchen" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "darkMode" BOOLEAN NOT NULL DEFAULT false,
    "language" TEXT NOT NULL DEFAULT 'en',
    "reportGenerationLogic" TEXT NOT NULL DEFAULT 'Prioritize high-protein ingredients and items with high spoilage risk.',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Kitchen_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ingredient" (
    "id" TEXT NOT NULL,
    "kitchenId" TEXT NOT NULL,
    "ingredientId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "currentQty" DOUBLE PRECISION NOT NULL,
    "maxQty" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL,
    "percentage" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "freshness" INTEGER NOT NULL,
    "spoilageRisk" TEXT NOT NULL,
    "lastUpdated" TIMESTAMP(3) NOT NULL,
    "isCustom" BOOLEAN NOT NULL DEFAULT false,
    "hasThreshold" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Ingredient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RefillRecord" (
    "id" TEXT NOT NULL,
    "kitchenId" TEXT NOT NULL,
    "ingredientName" TEXT NOT NULL,
    "qtyAdded" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "confidence" INTEGER NOT NULL DEFAULT 0,
    "timestamp" TEXT NOT NULL,

    CONSTRAINT "RefillRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Conversation" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "imageFilename" TEXT NOT NULL,
    "messages" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Conversation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Kitchen_userId_key" ON "Kitchen"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Ingredient_kitchenId_ingredientId_key" ON "Ingredient"("kitchenId", "ingredientId");

-- CreateIndex
CREATE UNIQUE INDEX "Conversation_userId_conversationId_key" ON "Conversation"("userId", "conversationId");

-- AddForeignKey
ALTER TABLE "Kitchen" ADD CONSTRAINT "Kitchen_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ingredient" ADD CONSTRAINT "Ingredient_kitchenId_fkey" FOREIGN KEY ("kitchenId") REFERENCES "Kitchen"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RefillRecord" ADD CONSTRAINT "RefillRecord_kitchenId_fkey" FOREIGN KEY ("kitchenId") REFERENCES "Kitchen"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
