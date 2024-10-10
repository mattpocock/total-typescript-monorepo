import type { MetaFunction } from "@remix-run/node";
import {
  Form,
  Link,
  redirect,
  useFetcher,
  useLoaderData,
  type ClientLoaderFunctionArgs,
} from "@remix-run/react";
import { DeleteIcon, PlusIcon, ZapIcon } from "lucide-react";
import { useRef } from "react";
import { FormContent, PageContent, TitleArea } from "~/components";
import { Button } from "~/components/ui/button";
import { Combobox } from "~/components/ui/combobox";
import { Input } from "~/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { LazyLoadedEditor } from "~/monaco-editor/lazy-loaded-editor";
import {
  addNewPostToCollectionUrl,
  addPostToCollectionUrl,
  editCollectionUrl,
  editPostUrl,
  removePostFromCollectionUrl,
} from "~/routes";
import { trpc } from "~/trpc/client";
import { useDebounceFetcher } from "~/use-debounced-fetcher";
import { createJsonAction } from "~/utils";

export const clientAction = createJsonAction(async (json, args) => {
  const collection = await trpc.collections.update.mutate({
    ...json,
    id: args.params.collectionId!,
  });

  return redirect(editCollectionUrl(collection.id));
});

export const clientLoader = async ({ params }: ClientLoaderFunctionArgs) => {
  const [collection, postsToAdd] = await Promise.all([
    await trpc.collections.get.query({
      id: params.collectionId!,
    }),
    await trpc.collections.postsNotInCollection.query({
      id: params.collectionId!,
    }),
  ]);

  return {
    collection,
    postsToAdd,
  };
};

export const meta: MetaFunction<typeof clientLoader> = ({ data }) => {
  return [
    {
      title: "Edit Collection | WCM",
    },
  ];
};

export default function EditPost() {
  const { collection, postsToAdd } = useLoaderData<typeof clientLoader>();

  const debouncedFetcher = useDebounceFetcher();

  const formRef = useRef<HTMLFormElement | null>(null);
  const handleChange = () => {
    debouncedFetcher.debounceSubmit(formRef.current, {
      debounceTimeout: 200,
      preventScrollReset: true,
    });
  };

  const fetcher = useFetcher();

  return (
    <PageContent>
      <TitleArea title="Edit Collection" />
      <FormContent>
        <Form method="post" ref={formRef} id="text-fields" className="contents">
          <Input
            type="text"
            name="title"
            defaultValue={collection.title}
            placeholder="Title"
            className="col-span-full"
            onChange={handleChange}
            autoFocus
          />
          {/* <Input
            type="text"
            name="learningGoal"
            defaultValue={collection.learningGoal ?? ""}
            placeholder="Learning Goal"
            className="col-span-full"
            onChange={handleChange}
          />

          <DatePicker
            name="postedAt"
            onChange={handleChange}
            defaultValue={collection.postedAt}
          />
          <div className="items-center flex justify-center space-x-2">
            <Checkbox
              id="isViral"
              name="isViral"
              onClick={handleChange}
              defaultChecked={collection.isViral}
            />
            <label htmlFor="isViral" className="text-sm">
              Did The Post Go Viral?
            </label>
          </div> */}
          <LazyLoadedEditor
            defaultValue={collection.notes}
            label="Notes"
            name="notes"
            language="md"
            className="col-span-full"
            onChange={handleChange}
          />
        </Form>
        <div className="col-span-full">
          <Table className="">
            <TableHeader>
              <TableRow>
                <TableHead>Post</TableHead>
                <TableHead>Posted At</TableHead>
                <TableHead>Viral</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {collection.posts.map((post) => {
                return (
                  <TableRow key={post.socialPost.id}>
                    <TableCell>
                      <Link
                        to={editPostUrl(post.socialPost.id)}
                        className="text-base"
                      >
                        {post.socialPost.title}
                      </Link>
                    </TableCell>
                    <TableCell>
                      {post.socialPost.postedAt && (
                        <p>
                          {new Date(post.socialPost.postedAt)
                            .toISOString()
                            .slice(0, 10)}
                        </p>
                      )}
                    </TableCell>
                    <TableCell>
                      {post.socialPost.isViral ? (
                        <div className="size-8 flex justify-center items-center rounded-full bg-gray-100">
                          <ZapIcon className="size-5" />
                        </div>
                      ) : null}
                    </TableCell>
                    <TableCell>
                      <Button
                        type="submit"
                        variant={"secondary"}
                        onClick={() => {
                          fetcher.submit(null, {
                            action: removePostFromCollectionUrl(
                              collection.id,
                              post.socialPost.id
                            ),
                            method: "POST",
                            preventScrollReset: true,
                          });
                        }}
                      >
                        <DeleteIcon />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
        <div className="grid grid-flow-col gap-6">
          <form
            className="grid grid-flow-col"
            onSubmit={(e) => {
              e.preventDefault();
              fetcher.submit(e.currentTarget, {
                action: addPostToCollectionUrl(collection.id),
                method: "POST",
                preventScrollReset: true,
              });
              e.currentTarget.reset();
            }}
          >
            <Combobox
              defaultValue=""
              name="postId"
              options={postsToAdd.map((post) => ({
                label: post.title,
                value: post.id,
              }))}
              className="border-r-0 rounded-r-none min-w-64"
              placeholder="Add Existing Post..."
              emptyText="No posts found"
            />
            <Button
              type="submit"
              className="w-12 p-0  border-l-0 rounded-l-none"
              variant={"outline"}
            >
              <PlusIcon className="text-gray-600" />
            </Button>
          </form>
          <Form
            className="contents"
            action={addNewPostToCollectionUrl(collection.id)}
            method="POST"
          >
            <Button className="flex items-center space-x-2">
              <PlusIcon />
              <span>Add New Post</span>
            </Button>
          </Form>
        </div>
      </FormContent>
    </PageContent>
  );
}
