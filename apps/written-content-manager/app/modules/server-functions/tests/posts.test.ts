import { describe, expect, it, vitest } from "vitest";
import { p } from "../../../db";
import { serverFunctions } from "../server-functions";

describe("posts", () => {
  describe("list", () => {
    it("Should not list deleted posts", async () => {
      await p.socialPost.create({
        data: {
          title: "abc",
          deleted: true,
        },
      });

      const result = await serverFunctions.posts.list();

      expect(result).toHaveLength(0);
    });

    it("Should not list posts with empty titles", async () => {
      await p.socialPost.create({
        data: {
          title: "",
        },
      });

      const result = await serverFunctions.posts.list();

      expect(result).toHaveLength(0);
    });

    it("Should list them in update order", async () => {
      await p.socialPost.create({
        data: {
          title: "not-latest",
        },
      });

      await p.socialPost.create({
        data: {
          title: "latest",
        },
      });

      expect(await serverFunctions.posts.list()).toMatchObject([
        {
          title: "latest",
        },
        {
          title: "not-latest",
        },
      ]);
    });
  });

  describe("get", () => {
    it("Should return the post", async () => {
      const post = await p.socialPost.create({
        data: {
          title: "abc",
        },
      });

      expect(await serverFunctions.posts.get({ id: post.id })).toMatchObject({
        id: post.id,
        title: "abc",
      });
    });

    it("Should return the attached collections", async () => {
      const post = await p.socialPost.create({
        data: {
          title: "abc",
          collections: {
            create: {
              order: 0,
              collection: {
                create: {
                  title: "collection",
                },
              },
            },
          },
        },
      });

      expect(await serverFunctions.posts.get({ id: post.id })).toMatchObject({
        collections: [
          {
            collection: {
              title: "collection",
            },
          },
        ],
      });
    });

    it("Should return any associated files", async () => {
      vitest.mock("fs", () => ({
        readFileSync: () => "file contents",
      }));

      vitest.mock("fast-glob", () => ({
        default: () => ["/first-file/notes.ts"],
      }));
      const post = await p.socialPost.create({
        data: {
          title: "abc",
        },
      });

      expect(await serverFunctions.posts.get({ id: post.id })).toMatchObject({
        files: [
          {
            content: "file contents",
            fullPath: "/first-file/notes.ts",
            path: "notes.ts",
          },
        ],
      });
    });
  });

  describe("create", () => {
    it("Should create a post with the passed-in title", async () => {
      const post = await serverFunctions.posts.create({
        title: "abc",
      });

      const postIndb = await p.socialPost.findFirstOrThrow({
        where: {
          id: post.id,
        },
      });

      expect(postIndb).toMatchObject({
        id: post.id,
        title: "abc",
      });
    });

    it("Should record an analytics event", async () => {
      const post = await serverFunctions.posts.create({
        title: "abc",
      });

      expect(
        await p.analyticsEvent.findFirstOrThrow({
          where: {
            type: "POST_CREATED",
          },
        })
      ).toMatchObject({
        type: "POST_CREATED",
        payload: {
          postId: post.id,
        },
      });
    });
  });

  describe("update", () => {
    it("Should update the post", async () => {
      const initialPost = await p.socialPost.create({
        data: {
          title: "abc",
        },
      });

      const postedAt = new Date().toISOString();

      const updatedPost = await serverFunctions.posts.update({
        id: initialPost.id,
        title: "new-title",
        isViral: "on",
        learningGoal: "Learning goal",
        notes: "Notes",
        postedAt,
      });

      const postIndb = await p.socialPost.findFirstOrThrow({
        where: {
          id: initialPost.id,
        },
      });

      expect(postIndb).toMatchObject({
        id: initialPost.id,
        title: "new-title",
        isViral: true,
        learningGoal: "Learning goal",
        notes: "Notes",
        postedAt: new Date(postedAt),
      });
    });

    it("When updating postedAt, should record an analytics event", async () => {
      const initialPost = await p.socialPost.create({
        data: {
          title: "abc",
        },
      });

      await serverFunctions.posts.update({
        id: initialPost.id,
        title: "abc",
        postedAt: new Date().toISOString(),
      });

      expect(
        await p.analyticsEvent.findFirst({
          where: {
            type: "POST_MARKED_AS_POSTED",
          },
        })
      ).toMatchObject({
        payload: {
          postId: initialPost.id,
        },
      });
    });

    it("Should not record an analytics event if the post has already been posted", async () => {
      const initialPost = await p.socialPost.create({
        data: {
          title: "abc",
          postedAt: new Date(),
        },
      });

      await serverFunctions.posts.update({
        id: initialPost.id,
        title: "abc",
        postedAt: new Date().toISOString(),
      });

      expect(await p.analyticsEvent.findMany()).toHaveLength(0);
    });

    it("Should trim a title passed to it", async () => {
      const post = await serverFunctions.posts.create({
        title: "",
      });

      await serverFunctions.posts.update({
        id: post.id,
        title: "        ",
      });

      const postInDb = await serverFunctions.posts.get({
        id: post.id,
      });

      expect(postInDb.title).toEqual("");
    });
  });

  describe("delete", () => {
    it("Should mark the post as deleted", async () => {
      const initialPost = await p.socialPost.create({
        data: {
          title: "abc",
        },
      });

      await serverFunctions.posts.delete({ id: initialPost.id });

      expect(
        await p.socialPost.findFirstOrThrow({
          where: {
            id: initialPost.id,
          },
        })
      ).toMatchObject({
        id: initialPost.id,
        deleted: true,
      });
    });

    it("Should create an analytics event", async () => {
      const initialPost = await p.socialPost.create({
        data: {
          title: "abc",
        },
      });

      await serverFunctions.posts.delete({ id: initialPost.id });

      expect(
        await p.analyticsEvent.findMany({
          where: {
            type: "POST_DELETED",
          },
        })
      ).toMatchObject([
        {
          type: "POST_DELETED",
          payload: {
            postId: initialPost.id,
          },
        },
      ]);
    });
  });
});
