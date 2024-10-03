import type { MetaFunction } from "@remix-run/node";
import {
  Form,
  redirect,
  useLoaderData,
  type ClientLoaderFunctionArgs,
} from "@remix-run/react";
import { useRef } from "react";
import { FormButtons, FormContent, PageContent, TitleArea } from "~/components";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import { DatePicker } from "~/components/ui/datepicker";
import { Input } from "~/components/ui/input";
import { LazyLoadedEditor } from "~/monaco-editor/lazy-loaded-editor";
import { editPostUrl } from "~/routes";
import { trpc } from "~/trpc/client";
import { useDebounceFetcher } from "~/use-debounced-fetcher";
import { useVSCode } from "~/use-open-in-vscode";
import { createJsonAction } from "~/utils";

export const meta: MetaFunction<typeof clientLoader> = ({ data }) => {
  return [
    {
      title: "Edit Post | WCM",
    },
  ];
};

export const clientLoader = async (args: ClientLoaderFunctionArgs) => {
  return trpc.posts.get.query({
    id: args.params.postId!,
  });
};

export const clientAction = createJsonAction(async (json, args) => {
  const post = await trpc.posts.update.mutate({
    ...json,
    id: args.params.postId!,
  });

  return redirect(editPostUrl(post.id));
});

export default function EditPost() {
  const post = useLoaderData<typeof clientLoader>();

  const debouncedFetcher = useDebounceFetcher();

  const formRef = useRef<HTMLFormElement | null>(null);
  const handleChange = () => {
    debouncedFetcher.debounceSubmit(formRef.current, {
      debounceTimeout: 200,
      preventScrollReset: true,
    });
  };

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
            onClick={(e) => {
              e.preventDefault();
              vscode.openSocialPostPlayground(post.id);
            }}
          >
            <img src="/vscode-alt.svg" className="size-5 mr-3" />
            Open
          </Button>
          <Button asChild type="button">
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
                <pre className="p-6 text-xs border-2 border-gray-200">
                  {file.content}
                </pre>
              </div>
            );
          })}
          <FormButtons>
            <Button type="submit">Save</Button>
          </FormButtons>
        </FormContent>
      </Form>
    </PageContent>
  );
}
