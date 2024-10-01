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
import { deletePostUrl, editPostUrl, postsUrl } from "~/routes";
import { trpc } from "~/trpc/client";
import { useVSCode } from "~/use-open-in-vscode";
import { createJsonAction } from "~/utils";

export const meta: MetaFunction = () => {
  return [
    {
      title: "Posts | WCM",
    },
  ];
};

export const clientLoader = async () => {
  return trpc.posts.list.query();
};

export const clientAction = createJsonAction(async (json) => {
  const post = await trpc.posts.create.mutate(json);

  return redirect(editPostUrl(post.id));
});

const Page = () => {
  const posts = useLoaderData<typeof clientLoader>();

  const vscode = useVSCode();

  return (
    <PageContent>
      <TitleArea title="Posts" />
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {posts.map((post) => (
            <TableRow key={post.id}>
              <TableCell>
                <Link to={editPostUrl(post.id)} className="text-base">
                  <h2>{post.title}</h2>
                  <p className="text-sm text-gray-500">{post.learningGoal}</p>
                </Link>
              </TableCell>
              <TableCell>
                {post.postedAt && (
                  <p>
                    Posted {new Date(post.postedAt).toISOString().slice(0, 10)}
                  </p>
                )}
              </TableCell>
              <TableCell>
                <div className="flex items-center">
                  <Button
                    variant="default"
                    className="rounded-r-none flex items-center justify-center"
                    onClick={() => {
                      vscode.openSocialPostPlayground(post.id);
                    }}
                  >
                    <img
                      src="/vscode-alt.svg"
                      className="size-5 flex-shrink-0"
                    />
                  </Button>

                  <Form
                    action={deletePostUrl(post.id, postsUrl())}
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
