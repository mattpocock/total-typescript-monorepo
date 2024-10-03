-- CreateTable
CREATE TABLE "SocialPostToSocialPostCollection" (
    "order" INTEGER NOT NULL,
    "socialPostId" TEXT NOT NULL,
    "collectionId" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "SocialPostCollection" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SocialPostCollection_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SocialPostToSocialPostCollection_socialPostId_collectionId_key" ON "SocialPostToSocialPostCollection"("socialPostId", "collectionId");

-- AddForeignKey
ALTER TABLE "SocialPostToSocialPostCollection" ADD CONSTRAINT "SocialPostToSocialPostCollection_socialPostId_fkey" FOREIGN KEY ("socialPostId") REFERENCES "SocialPost"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SocialPostToSocialPostCollection" ADD CONSTRAINT "SocialPostToSocialPostCollection_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "SocialPostCollection"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
