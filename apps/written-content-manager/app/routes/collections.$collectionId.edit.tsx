import type { MetaFunction } from "@remix-run/node";
import {
  Form,
  Link,
  redirect,
  useFetcher,
  useLoaderData,
  type ClientLoaderFunctionArgs,
} from "@remix-run/react";
import { DeleteIcon, PlusIcon } from "lucide-react";
import { useMemo, useRef } from "react";
import { useOnPageActions } from "~/command-palette";
import {
  FormContent,
  PageContent,
  TableDescription,
  TitleArea,
  ViralIcon,
} from "~/components";
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
import { serverFunctions } from "~/modules/server-functions/server-functions";
import { LazyLoadedEditor } from "~/monaco-editor/lazy-loaded-editor";
import {
  addNewPostToCollectionUrl,
  addPostToCollectionUrl,
  editCollectionUrl,
  editPostUrl,
  removePostFromCollectionUrl,
} from "~/routes";
import { useDebounceFetcher } from "~/use-debounced-fetcher";
import { createJsonAction } from "~/utils";

export const action = createJsonAction(async (json, args) => {
  const collection = await serverFunctions.collections.update({
    ...json,
    id: args.params.collectionId!,
  });

  return redirect(editCollectionUrl(collection.id));
});

export const loader = async ({ params }: ClientLoaderFunctionArgs) => {
  const [collection, postsToAdd] = await Promise.all([
    serverFunctions.collections.get({ id: params.collectionId! }),
    serverFunctions.collections.postsNotInCollection({
      id: params.collectionId!,
    }),
  ]);

  return {
    collection,
    postsToAdd,
  };
};

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return [
    {
      title: "Edit Collection | WCM",
    },
  ];
};

export default function EditPost() {
  const { collection, postsToAdd } = useLoaderData<typeof loader>();

  const debouncedFetcher = useDebounceFetcher();

  const formRef = useRef<HTMLFormElement | null>(null);
  const handleChange = () => {
    debouncedFetcher.debounceSubmit(formRef.current, {
      debounceTimeout: 200,
      preventScrollReset: true,
    });
  };

  const fetcher = useFetcher();

  useOnPageActions(
    useMemo(
      () => [
        {
          action: () => {
            fetcher.submit(null, {
              action: addNewPostToCollectionUrl(collection.id),
              method: "post",
              unstable_flushSync: true,
            });
          },
          label: `Add New Post To Collection`,
        },
      ],
      []
    )
  );

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
                        <h2>{post.socialPost.title}</h2>
                        <TableDescription>
                          {post.socialPost.learningGoal}
                        </TableDescription>
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
                      {post.socialPost.isViral ? <ViralIcon /> : null}
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
          <AddPostToCollectionForm
            posts={postsToAdd}
            collectionId={collection.id}
          />
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

export const AddPostToCollectionForm = (props: {
  collectionId: string;
  posts: { title: string; id: string }[];
}) => {
  const fetcher = useFetcher();

  return (
    <Combobox
      defaultValue=""
      name="postId"
      options={props.posts.map((post) => ({
        label: post.title,
        value: post.id,
      }))}
      className="min-w-64"
      placeholder="Add Existing Post..."
      emptyText="No posts found"
      onChange={({ value, reset }) => {
        fetcher.submit(
          { postId: value },
          {
            action: addPostToCollectionUrl(props.collectionId),
            method: "POST",
            preventScrollReset: true,
          }
        );
        reset();
      }}
    />
  );
};
