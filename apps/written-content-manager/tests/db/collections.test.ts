import { describe, expect, it } from "vitest";
import { p } from "../../app/db";

const createCollection = (props: { title: string; notes: string }) => {
  return p.socialPostCollection.create({
    data: {
      title: props.title,
      notes: props.notes,
    },
  });
};

describe("createCollection", () => {
  it("should create a collection", async () => {
    const collection = await createCollection({
      title: "My Collection",
      notes: "Some notes",
    });

    const collectionOnServer =
      await testPrismaClient.socialPostCollection.findUniqueOrThrow({
        where: {
          id: collection.id,
        },
      });

    expect(collectionOnServer.title).toBe("My Collection");
    expect(collectionOnServer.notes).toBe("Some notes");
  });
});

describe("addPostToCollection", () => {
  it("should add a post to a collection", async () => {
    const collection = await createCollection({
      title: "My Collection",
      notes: "Some notes",
    });

    const post = await p.socialPost.create({
      data: {
        title: "My Post",
        content: "Some content",
      },
    });

    await addPostToCollection({
      collectionId: collection.id,
      postId: post.id,
    });

    const collectionOnServer =
      await testPrismaClient.socialPostCollection.findUniqueOrThrow({
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
      });

    expect(collectionOnServer.posts.length).toBe(1);
    expect(collectionOnServer.posts[0]!.socialPost.title).toBe("My Post");
    expect(collectionOnServer.posts[0]!.socialPost.content).toBe(
      "Some content"
    );
    expect(collectionOnServer.posts[0]!.order).toBe(0);
  });

  it("Should increment the order when adding a post to a collection", async () => {
    const collection = await createCollection({
      title: "My Collection",
      notes: "Some notes",
    });

    const post1 = await p.socialPost.create({
      data: {
        title: "My Post 1",
        content: "Some content",
      },
    });

    const post2 = await p.socialPost.create({
      data: {
        title: "My Post 2",
        content: "Some content",
      },
    });

    await addPostToCollection({
      collectionId: collection.id,
      postId: post1.id,
    });

    await addPostToCollection({
      collectionId: collection.id,
      postId: post2.id,
    });

    const collectionOnServer =
      await testPrismaClient.socialPostCollection.findUniqueOrThrow({
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
      });

    expect(collectionOnServer.posts[0]!.order).toBe(0);
    expect(collectionOnServer.posts[1]!.order).toBe(1);
  });
});
