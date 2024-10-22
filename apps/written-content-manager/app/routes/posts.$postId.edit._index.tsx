import type { MetaFunction } from "@remix-run/node";
import {
  Form,
  Link,
  redirect,
  useFetcher,
  useLoaderData,
  type ClientLoaderFunctionArgs,
} from "@remix-run/react";
import { DeleteIcon } from "lucide-react";
import { useRef } from "react";
import {
  FormButtons,
  FormContent,
  PageContent,
  TitleArea,
  VSCodeIcon,
} from "~/components";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import { Combobox } from "~/components/ui/combobox";
import { DatePicker } from "~/components/ui/datepicker";
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
  addPostToCollectionUrl,
  editCollectionUrl,
  editPostUrl,
  removePostFromCollectionUrl,
} from "~/routes";
import { useDebounceFetcher } from "~/use-debounced-fetcher";
import { useVSCode } from "~/use-open-in-vscode";
import { createFormDataAction } from "~/utils";

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return [
    {
      title: "Edit Post | WCM",
    },
  ];
};

export const loader = async (args: ClientLoaderFunctionArgs) => {
  const [post, collections] = await Promise.all([
    serverFunctions.posts.get({
      id: args.params.postId!,
    }),
    serverFunctions.collections.list({
      notConnectedToPostId: args.params.postId!,
    }),
  ]);

  return {
    post,
    collections,
  };
};

export const action = createFormDataAction(async (json, args) => {
  const post = await serverFunctions.posts.update({
    ...json,
    id: args.params.postId!,
  });

  return redirect(editPostUrl(post.id));
});

export default function EditPost() {
  const { post, collections } = useLoaderData<typeof loader>();

  const debouncedFetcher = useDebounceFetcher();

  const formRef = useRef<HTMLFormElement | null>(null);
  const handleChange = () => {
    debouncedFetcher.debounceSubmit(formRef.current, {
      debounceTimeout: 200,
      preventScrollReset: true,
    });
  };

  const fetcher = useFetcher();

  const vscode = useVSCode();

  return (
    <PageContent>
      <TitleArea title="Edit Post" />
      <Form method="post" ref={formRef}>
        <FormContent>
          <Input
            type="text"
            name="title"
            defaultValue={post.title}
            placeholder="Title"
            className="col-span-full"
            onChange={handleChange}
            autoFocus
          />
          <Input
            type="text"
            name="learningGoal"
            defaultValue={post.learningGoal ?? ""}
            placeholder="Learning Goal"
            className="col-span-full"
            onChange={handleChange}
          />

          <DatePicker
            name="postedAt"
            onChange={handleChange}
            defaultValue={post.postedAt}
          />
          <div className="items-center flex justify-center space-x-2">
            <Checkbox
              id="isViral"
              name="isViral"
              onClick={handleChange}
              defaultChecked={post.isViral}
            />
            <label htmlFor="isViral" className="text-sm">
              Did The Post Go Viral?
            </label>
          </div>
          <Button
            type="button"
            variant={"secondary"}
            onClick={(e) => {
              e.preventDefault();
              vscode.openSocialPostPlayground(post.id);
            }}
          >
            <VSCodeIcon className="size-5 mr-3" />
            Open
          </Button>
          <Button asChild type="button" variant={"secondary"}>
            <a
              href={`https://publish.buffer.com/post/new`}
              target="buffer-page"
            >
              Open Buffer
            </a>
          </Button>
          <LazyLoadedEditor
            defaultValue={post.notes}
            label="Notes"
            name="notes"
            language="md"
            className="col-span-full"
            onChange={handleChange}
          />
          {post.files.map((file) => {
            return (
              <div className="col-span-full">
                <a
                  href={`vscode://file${file.fullPath}`}
                  className="font-mono text-sm mb-2 block"
                >
                  {file.path}
                </a>
                <pre className="p-6 text-xs border-2 border-gray-200 dark:border-gray-700">
                  {file.content}
                </pre>
              </div>
            );
          })}
          <div className="col-span-full space-y-2">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Collection</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {post.collections
                  .map((c) => c.collection)
                  .map((collection) => {
                    return (
                      <TableRow key={collection.id}>
                        <TableCell>
                          <Link
                            to={editCollectionUrl(collection.id)}
                            className="text-base"
                            prefetch="intent"
                          >
                            {collection.title}
                          </Link>
                        </TableCell>
                        <TableCell>
                          <Button
                            type="button"
                            variant={"secondary"}
                            onClick={() => {
                              fetcher.submit(null, {
                                action: removePostFromCollectionUrl(
                                  collection.id,
                                  post.id
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
            <AddPostToCollectionForm
              collections={collections}
              postId={post.id}
            />
          </div>
          <FormButtons>
            <Button type="submit">Save</Button>
          </FormButtons>
        </FormContent>
      </Form>
    </PageContent>
  );
}

export const AddPostToCollectionForm = (props: {
  postId: string;
  collections: { title: string; id: string }[];
}) => {
  const fetcher = useFetcher();

  return (
    <Combobox
      defaultValue=""
      name="postId"
      options={props.collections.map((collection) => ({
        label: collection.title,
        value: collection.id,
      }))}
      className="min-w-64 max-w-0"
      placeholder="Add To Collection..."
      emptyText="No collections found"
      onChange={({ value, reset }) => {
        fetcher.submit(
          { postId: props.postId },
          {
            action: addPostToCollectionUrl(value),
            method: "POST",
            preventScrollReset: true,
          }
        );
        reset();
      }}
    />
  );
};
