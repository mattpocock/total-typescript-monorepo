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
import { Input } from "~/components/ui/input";
import { editPostUrl } from "~/routes";
import { trpc } from "~/trpc/client";
import { useDebounceFetcher } from "~/use-debounced-fetcher";
import { createJsonAction } from "~/utils";

export const meta: MetaFunction<typeof clientLoader> = ({ data }) => {
  return [
    {
      title: "Add Post",
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
      replace: true,
      debounceTimeout: 200,
    });
  };

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
          <FormButtons>
            <Button type="submit">Save</Button>
          </FormButtons>
        </FormContent>
      </Form>
    </PageContent>
  );
}
