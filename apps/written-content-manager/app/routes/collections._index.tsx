import type { MetaFunction } from "@remix-run/node";
import {
  Form,
  Link,
  redirect,
  useLoaderData,
  useSubmit,
} from "@remix-run/react";
import { DeleteIcon, PlusIcon } from "lucide-react";
import { useMemo } from "react";
import { useOnPageActions } from "~/command-palette";
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
import { serverFunctions } from "~/modules/server-functions/server-functions";
import { deleteCollectionUrl, editCollectionUrl } from "~/routes";
import { trpc } from "~/trpc/client";
import { createJsonAction } from "~/utils";

export const meta: MetaFunction = () => {
  return [
    {
      title: "Collections | WCM",
    },
  ];
};

export const loader = async () => {
  return serverFunctions.collections.list();
};

export const clientAction = createJsonAction(async (json) => {
  const collection = await trpc.collections.create.mutate(json);

  return redirect(editCollectionUrl(collection.id));
});

const Page = () => {
  const collections = useLoaderData<typeof loader>();

  const submit = useSubmit();

  useOnPageActions(
    useMemo(
      () => [
        {
          label: "Add New Collection",
          action: () => {
            submit(null, {
              method: "post",
            });
          },
        },
      ],
      []
    )
  );

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
            <TableHead>Posts</TableHead>
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

              <TableCell>{collection._count.posts}</TableCell>
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
        <Button>
          <PlusIcon />
        </Button>
      </Form>
    </PageContent>
  );
};

export default Page;
