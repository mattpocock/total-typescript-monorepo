-- DropForeignKey
ALTER TABLE "SocialPostToSocialPostCollection" DROP CONSTRAINT "SocialPostToSocialPostCollection_collectionId_fkey";

-- DropForeignKey
ALTER TABLE "SocialPostToSocialPostCollection" DROP CONSTRAINT "SocialPostToSocialPostCollection_socialPostId_fkey";

-- AddForeignKey
ALTER TABLE "SocialPostToSocialPostCollection" ADD CONSTRAINT "SocialPostToSocialPostCollection_socialPostId_fkey" FOREIGN KEY ("socialPostId") REFERENCES "SocialPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SocialPostToSocialPostCollection" ADD CONSTRAINT "SocialPostToSocialPostCollection_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "SocialPostCollection"("id") ON DELETE CASCADE ON UPDATE CASCADE;
