import { describe, expect, it, vitest } from "vitest";
import { p } from "../../../db";
import { serverFunctions } from "../server-functions";
import { LocalFS, mockFS } from "../fs";

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
      const post = await serverFunctions.posts.create({
        title: "abc",
      });

      await serverFunctions.posts.viewInVSCode({
        id: post.id,
      });

      expect(
        await serverFunctions.posts
          .get({ id: post.id })
          .then((post) => post.files)
      ).toHaveLength(3);
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
      await serverFunctions.posts.create({
        title: "abc",
      });

      const analytics = await serverFunctions.analytics.allCounts();

      expect(analytics.postsCreatedToday).toEqual(1);
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

    it("Should allow you to turn the isViral checkbox off", async () => {
      const socialPost = await serverFunctions.posts.create({
        title: "abc",
      });

      await serverFunctions.posts.update({
        id: socialPost.id,
        title: "",
        isViral: "on",
      });

      expect(
        await serverFunctions.posts.get({
          id: socialPost.id,
        })
      ).toMatchObject({
        isViral: true,
      });

      await serverFunctions.posts.update({
        id: socialPost.id,
        title: "",
        isViral: "off",
      });

      expect(
        await serverFunctions.posts.get({
          id: socialPost.id,
        })
      ).toMatchObject({
        isViral: false,
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

  describe("viewInVSCode", () => {
    it("Should open thread.md if it already exists", async () => {
      await mockFS(async (fs) => {
        const post = await serverFunctions.posts.create({
          title: "abc",
        });

        await serverFunctions.posts.viewInVSCode({
          id: post.id,
        });

        const postInDb = await serverFunctions.posts.get({
          id: post.id,
        });

        const threadFilePath = postInDb.files.find((f) =>
          f.fullPath.includes("thread.md")
        )?.fullPath;

        await serverFunctions.posts.viewInVSCode({
          id: post.id,
        });

        expect(fs.countOpensInVSCode(threadFilePath!)).toEqual(2);
      });
    });

    it("Should open any file if thread.md has been deleted", async () => {
      await mockFS(async (fs) => {
        const post = await serverFunctions.posts.create({
          title: "abc",
        });

        await serverFunctions.posts.viewInVSCode({
          id: post.id,
        });

        const postInDb = await serverFunctions.posts.get({
          id: post.id,
        });

        const threadFilePath = postInDb.files.find((f) =>
          f.fullPath.includes("thread.md")
        )?.fullPath;

        await fs.rm(threadFilePath!);

        await serverFunctions.posts.viewInVSCode({
          id: post.id,
        });

        const playgroundFilePath = postInDb.files.find((f) =>
          f.fullPath.includes("playground.ts")
        )?.fullPath;

        expect(fs.countOpensInVSCode(playgroundFilePath!)).toEqual(1);
      });
    });
  });
});
