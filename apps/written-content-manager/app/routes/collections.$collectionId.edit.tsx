import type { MetaFunction } from "@remix-run/node";
import {
  Form,
  Link,
  redirect,
  useLoaderData,
  useNavigate,
  useSearchParams,
  type ClientLoaderFunctionArgs,
} from "@remix-run/react";
import { PlusIcon } from "lucide-react";
import { useRef } from "react";
import { FormButtons, FormContent, PageContent, TitleArea } from "~/components";
import { Button } from "~/components/ui/button";
import { Combobox } from "~/components/ui/combobox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
} from "~/components/ui/dialog";
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
  addPostToCollectionUrl,
  editCollectionUrl,
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

  const [search] = useSearchParams();

  const navigate = useNavigate();

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
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {collection.posts.map((post) => {
                return (
                  <TableRow key={post.socialPost.id}>
                    <TableCell>{post.socialPost.title}</TableCell>
                    <TableCell>
                      <Form
                        method="post"
                        action={removePostFromCollectionUrl(
                          collection.id,
                          post.socialPost.id
                        )}
                      >
                        <Button type="submit">Remove</Button>
                      </Form>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
        <div>
          <Button asChild>
            <Link to={"?add"}>
              <PlusIcon />
            </Link>
          </Button>
        </div>
        <FormButtons>
          <Button type="submit" form="text-fields">
            Save
          </Button>
        </FormButtons>
      </FormContent>
      <Dialog
        open={search.has("add")}
        onOpenChange={(o) => {
          if (!o) {
            navigate(editCollectionUrl(collection.id));
          }
        }}
      >
        <DialogContent>
          <DialogHeader>Add Post</DialogHeader>
          <DialogDescription>
            <Form method="POST" action={addPostToCollectionUrl(collection.id)}>
              <FormContent>
                <Combobox
                  defaultValue=""
                  name="postId"
                  options={postsToAdd.map((post) => ({
                    label: post.title,
                    value: post.id,
                  }))}
                  autoFocus
                />
                <FormButtons>
                  <Button type="submit">Save</Button>
                </FormButtons>
              </FormContent>
            </Form>
          </DialogDescription>
        </DialogContent>
      </Dialog>
    </PageContent>
  );
}
