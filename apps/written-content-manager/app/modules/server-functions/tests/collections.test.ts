import { describe, expect, it } from "vitest";
import { p } from "../../../db";
import { serverFunctions } from "../server-functions";

describe("collections", () => {
  describe("list", () => {
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

    it("Should be able to list the collections", async () => {
      await p.socialPostCollection.create({
        data: {
          title: "abc",
        },
      });

      const results = await serverFunctions.collections.list();

      expect(results).toHaveLength(1);
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

    it("Should retrieve collections with empty titles", async () => {
      const collection = await p.socialPostCollection.create({
        data: {
          title: "",
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

  describe("update", async () => {
    it("Should update the collection", async () => {
      const collection = await p.socialPostCollection.create({
        data: {
          title: "abc",
        },
      });

      await serverFunctions.collections.update({
        id: collection.id,
        notes: "notes",
        title: "title",
      });

      const collectionAfterUpdate = await p.socialPostCollection.findUnique({
        where: {
          id: collection.id,
        },
      });

      expect(collectionAfterUpdate).toMatchObject({
        id: collection.id,
        notes: "notes",
        title: "title",
      });
    });

    it("Should error if the collection has been deleted", async () => {
      const collection = await p.socialPostCollection.create({
        data: {
          title: "abc",
          deleted: true,
        },
      });

      await expect(() =>
        serverFunctions.collections.update({
          id: collection.id,
          notes: "notes",
          title: "title",
        })
      ).rejects.toThrowError("Invalid");
    });
  });

  describe("create", async () => {
    it("Should create a new collection with an empty title", async () => {
      const collection = await serverFunctions.collections.create();

      expect(
        await p.socialPostCollection.findUniqueOrThrow({
          where: {
            id: collection.id,
          },
        })
      ).toMatchObject({
        id: collection.id,
        title: "",
        deleted: false,
      });
    });
  });

  describe("delete", () => {
    it("Should mark a collection as deleted", async () => {
      const collection = await p.socialPostCollection.create({
        data: {
          title: "abc",
        },
      });

      await serverFunctions.collections.delete({ id: collection.id });

      expect(
        await p.socialPostCollection.findUniqueOrThrow({
          where: {
            id: collection.id,
          },
        })
      ).toMatchObject({
        id: collection.id,
        deleted: true,
      });
    });
  });

  describe("linkExistingPost", () => {
    it("Should link an existing post to the collection", async () => {
      const post = await p.socialPost.create({
        data: {
          title: "abc",
        },
      });

      const collection = await p.socialPostCollection.create({
        data: {
          title: "abc",
        },
      });

      await serverFunctions.collections.linkExistingPost({
        collectionId: collection.id,
        postId: post.id,
      });

      expect(
        await p.socialPostCollection.findUnique({
          where: {
            id: collection.id,
          },
          include: {
            posts: {
              include: {
                socialPost: true,
              },
            },
          },
        })
      ).toMatchObject({
        id: collection.id,
        posts: [
          {
            socialPost: {
              id: post.id,
            },
          },
        ],
      });
    });

    it("Should start the order at 0", async () => {
      const post = await p.socialPost.create({
        data: {
          title: "abc",
        },
      });

      const collection = await p.socialPostCollection.create({
        data: {
          title: "abc",
        },
      });

      await serverFunctions.collections.linkExistingPost({
        collectionId: collection.id,
        postId: post.id,
      });

      expect(
        await p.socialPostCollection.findUnique({
          where: {
            id: collection.id,
          },
          include: {
            posts: {
              include: {
                socialPost: true,
              },
            },
          },
        })
      ).toMatchObject({
        id: collection.id,
        posts: [
          {
            socialPost: {
              id: post.id,
            },
            order: 0,
          },
        ],
      });
    });

    it("Should increment the order of the created post", async () => {
      const post = await p.socialPost.create({
        data: {
          title: "abc",
        },
      });

      const collection = await p.socialPostCollection.create({
        data: {
          title: "abc",
          posts: {
            create: {
              order: 0,
              socialPost: {
                create: {
                  title: "abc",
                },
              },
            },
          },
        },
      });

      await serverFunctions.collections.linkExistingPost({
        collectionId: collection.id,
        postId: post.id,
      });

      expect(
        await p.socialPostCollection.findUnique({
          where: {
            id: collection.id,
          },
          include: {
            posts: {
              include: {
                socialPost: true,
              },
              orderBy: {
                order: "asc",
              },
            },
          },
        })
      ).toMatchObject({
        id: collection.id,
        posts: [
          {
            order: 0,
          },
          {
            socialPost: {
              id: post.id,
            },
            order: 1,
          },
        ],
      });
    });
  });

  describe("addNewPost", async () => {
    it("Should create a new post with an empty title and order = 0", async () => {
      const collection = await p.socialPostCollection.create({
        data: {
          title: "abc",
        },
      });

      const { socialPostId } = await serverFunctions.collections.addNewPost({
        collectionId: collection.id,
      });

      expect(
        await p.socialPost.findUniqueOrThrow({
          where: {
            id: socialPostId,
          },
          include: {
            collections: true,
          },
        })
      ).toMatchObject({
        id: socialPostId,
        title: "",
        collections: [
          {
            order: 0,
            collectionId: collection.id,
          },
        ],
      });
    });

    it("Should increment the order of the created post", async () => {
      const initialPost = await p.socialPost.create({
        data: {
          title: "abc",
        },
      });
      const collection = await p.socialPostCollection.create({
        data: {
          title: "abc",
          posts: {
            create: {
              order: 0,
              socialPost: {
                connect: {
                  id: initialPost.id,
                },
              },
            },
          },
        },
      });

      await serverFunctions.collections.addNewPost({
        collectionId: collection.id,
      });

      expect(
        await p.socialPostCollection.findUnique({
          where: {
            id: collection.id,
          },
          include: {
            posts: {
              include: {
                socialPost: true,
              },
              orderBy: {
                order: "asc",
              },
            },
          },
        })
      ).toMatchObject({
        id: collection.id,
        posts: [
          {
            order: 0,
            socialPost: {
              id: initialPost.id,
            },
          },
          {
            socialPost: {
              title: "",
            },
            order: 1,
          },
        ],
      });
    });
  });

  describe("removePost", () => {
    it("Should remove a post from a collection", async () => {
      const post = await p.socialPost.create({
        data: {
          title: "abc",
        },
      });

      const collection = await p.socialPostCollection.create({
        data: {
          title: "abc",
          posts: {
            create: {
              order: 0,
              socialPost: {
                connect: {
                  id: post.id,
                },
              },
            },
          },
        },
      });

      await serverFunctions.collections.removePost({
        collectionId: collection.id,
        postId: post.id,
      });

      expect(
        await p.socialPostCollection.findUnique({
          where: {
            id: collection.id,
          },
          include: {
            posts: true,
          },
        })
      ).toMatchObject({
        posts: [],
      });
    });
  });
});
