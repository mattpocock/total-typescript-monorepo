import type { MetaFunction } from "@remix-run/node";
import { Form, Link, redirect, useLoaderData } from "@remix-run/react";
import { DeleteIcon, PlusIcon } from "lucide-react";
import { PageContent, TitleArea } from "~/components";
import { Button } from "~/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { deleteCollectionUrl, editCollectionUrl } from "~/routes";
import { trpc } from "~/trpc/client";
import { useVSCode } from "~/use-open-in-vscode";
import { createJsonAction } from "~/utils";

export const meta: MetaFunction = () => {
  return [
    {
      title: "Collections | WCM",
    },
  ];
};

export const clientLoader = async () => {
  return trpc.collections.list.query();
};

export const clientAction = createJsonAction(async (json) => {
  const colleciton = await trpc.collections.create.mutate(json);

  return redirect(editCollectionUrl(colleciton.id));
});

const Page = () => {
  const collections = useLoaderData<typeof clientLoader>();

  return (
    <PageContent>
      <TitleArea
        title="Collections"
        underTitle={
          <p className="text-gray-600">
            Create collections of posts to be organized into videos or threads.
          </p>
        }
      />
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            {/* <TableHead>Posted</TableHead>
            <TableHead>Viral</TableHead> */}
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {collections.map((collection) => (
            <TableRow key={collection.id}>
              <TableCell>
                <Link
                  to={editCollectionUrl(collection.id)}
                  className="text-base"
                >
                  <h2>{collection.title}</h2>
                  {/* <p className="text-sm text-gray-500">
                    {collection.learningGoal}
                  </p> */}
                </Link>
              </TableCell>

              {/* <TableCell>
                {collection.postedAt && (
                  <p>
                    {new Date(collection.postedAt).toISOString().slice(0, 10)}
                  </p>
                )}
              </TableCell>
              <TableCell>
                {collection.isViral ? (
                  <div className="size-8 flex justify-center items-center rounded-full bg-gray-100">
                    <ZapIcon className="size-5" />
                  </div>
                ) : null}
              </TableCell> */}
              <TableCell>
                <div className="flex items-center">
                  {/* <Button
                    variant="default"
                    className="rounded-r-none flex items-center justify-center"
                    onClick={() => {
                      vscode.openSocialPostPlayground(collection.id);
                    }}
                  >
                    <img
                      src="/vscode-alt.svg"
                      className="size-5 flex-shrink-0"
                    />
                  </Button> */}

                  <Form
                    action={deleteCollectionUrl(collection.id)}
                    method="delete"
                  >
                    <Button variant="secondary" className="rounded-l-none">
                      <DeleteIcon />
                    </Button>
                  </Form>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Form method="POST">
        <input type="hidden" name="title" value="" />
        <Button>
          <PlusIcon />
        </Button>
      </Form>
    </PageContent>
  );
};

export default Page;
