import { describe, expect, it } from "vitest";
import { p } from "../../../db";
import { serverFunctions } from "../server-functions";

describe("collections", () => {
  describe("list", () => {
    it("Should be able to list the collections", async () => {
      await p.socialPostCollection.create({
        data: {
          title: "abc",
        },
      });

      const results = await serverFunctions.collections.list();

      expect(results).toHaveLength(1);
    });

    it("Should not include deleted collections", async () => {
      await p.socialPostCollection.create({
        data: {
          title: "abc",
          deleted: true,
        },
      });

      const results = await serverFunctions.collections.list();

      expect(results).toHaveLength(0);
    });

    it("Should filter out collections with empty titles", async () => {
      await p.socialPostCollection.create({
        data: {
          title: "",
        },
      });

      const results = await serverFunctions.collections.list();

      expect(results).toHaveLength(0);
    });

    it("Should order collections by when they were last updated", async () => {
      const notLatest = await p.socialPostCollection.create({
        data: {
          title: "not-latest",
        },
      });

      const latest = await p.socialPostCollection.create({
        data: {
          title: "latest",
        },
      });

      await p.socialPostCollection.update({
        where: {
          id: notLatest.id,
        },
        data: {
          notes: "foo",
        },
      });

      await p.socialPostCollection.update({
        where: {
          id: latest.id,
        },
        data: {
          notes: "foo",
        },
      });

      const results = await serverFunctions.collections.list();

      expect(results).toMatchObject([
        {
          title: "latest",
        },
        {
          title: "not-latest",
        },
      ]);
    });
  });

  describe("get", async () => {
    it("Should fail if the collection is not found", async () => {
      await expect(() =>
        serverFunctions.collections.get({ id: crypto.randomUUID() })
      ).rejects.toThrowError(`No SocialPostCollection found`);
    });

    it("Should fail if the collection has been deleted", async () => {
      const collection = await p.socialPostCollection.create({
        data: {
          title: "abc",
          deleted: true,
        },
      });

      await expect(() =>
        serverFunctions.collections.get({ id: collection.id })
      ).rejects.toThrowError(`No SocialPostCollection found`);
    });

    it("Should retrieve the collection", async () => {
      const collection = await p.socialPostCollection.create({
        data: {
          title: "abc",
        },
      });

      const foundCollection = await serverFunctions.collections.get({
        id: collection.id,
      });

      expect(foundCollection.title).toEqual(collection.title);
    });
  });

  describe("postsNotInCollection", async () => {
    it("Should include posts not in the targeted collection", async () => {
      const collection = await p.socialPostCollection.create({
        data: {
          title: "collection",
          posts: {
            create: {
              order: 0,
              socialPost: {
                create: {
                  title: "post",
                },
              },
            },
          },
        },
      });

      const postNotInCollection = await p.socialPost.create({
        data: {
          title: "abc",
        },
      });

      const posts = await serverFunctions.collections.postsNotInCollection({
        id: collection.id,
      });

      expect(posts).toMatchObject([
        {
          id: postNotInCollection.id,
        },
      ]);
    });

    it("Should not include deleted posts", async () => {
      const collection = await p.socialPostCollection.create({
        data: {
          title: "collection",
        },
      });

      await p.socialPost.create({
        data: {
          title: "abc",
          deleted: true,
        },
      });

      const posts = await serverFunctions.collections.postsNotInCollection({
        id: collection.id,
      });

      expect(posts).toHaveLength(0);
    });

    it("Should not include posts with empty titles", async () => {
      const collection = await p.socialPostCollection.create({
        data: {
          title: "collection",
        },
      });

      await p.socialPost.create({
        data: {
          title: "",
        },
      });

      const posts = await serverFunctions.collections.postsNotInCollection({
        id: collection.id,
      });

      expect(posts).toHaveLength(0);
    });
  });
});
