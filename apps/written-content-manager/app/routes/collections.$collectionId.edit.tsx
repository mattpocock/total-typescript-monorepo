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
import { DatePicker } from "~/components/ui/datepicker";
import { Input } from "~/components/ui/input";
import { LazyLoadedEditor } from "~/monaco-editor/lazy-loaded-editor";
import { editCollectionUrl } from "~/routes";
import { Checkbox } from "~/schema";
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
  const collection = await trpc.collections.get.query({
    id: params.collectionId!,
  });

  return collection;
};

export const meta: MetaFunction<typeof clientLoader> = ({ data }) => {
  return [
    {
      title: "Edit Collection | WCM",
    },
  ];
};

export default function EditPost() {
  const collection = useLoaderData<typeof clientLoader>();

  const debouncedFetcher = useDebounceFetcher();

  const formRef = useRef<HTMLFormElement | null>(null);
  const handleChange = () => {
    debouncedFetcher.debounceSubmit(formRef.current, {
      debounceTimeout: 200,
      preventScrollReset: true,
    });
  };

  return (
    <PageContent>
      <TitleArea title="Edit Collection" />
      <Form method="post" ref={formRef}>
        <FormContent>
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
          <FormButtons>
            <Button type="submit">Save</Button>
          </FormButtons>
        </FormContent>
      </Form>
    </PageContent>
  );
}
