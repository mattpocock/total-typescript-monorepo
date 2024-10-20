import type { MetaFunction } from "@remix-run/node";
import { Form, Link, redirect, useLoaderData } from "@remix-run/react";
import { DeleteIcon, PlusIcon, ZapIcon } from "lucide-react";
import {
  PageContent,
  PageDescription,
  TitleArea,
  ViralIcon,
  VSCodeIcon,
} from "~/components";
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
import { deletePostUrl, editPostUrl, postsUrl } from "~/routes";
import { useVSCode } from "~/use-open-in-vscode";
import { createJsonAction } from "~/utils";

export const meta: MetaFunction = () => {
  return [
    {
      title: "Posts | WCM",
    },
  ];
};

export const loader = async () => {
  return serverFunctions.posts.list();
};

export const action = createJsonAction(async (json) => {
  const post = await serverFunctions.posts.create(json);

  return redirect(editPostUrl(post.id));
});

const Page = () => {
  const posts = useLoaderData<typeof loader>();

  const vscode = useVSCode();

  return (
    <PageContent>
      <TitleArea
        title="Posts"
        underTitle={
          <PageDescription>
            Track your posts on social media and create new ones.
          </PageDescription>
        }
      />
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Posted</TableHead>
            <TableHead>Viral</TableHead>
            <TableHead>Collections</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {posts.map((post) => (
            <TableRow key={post.id}>
              <TableCell>
                <Link to={editPostUrl(post.id)} className="text-base">
                  <h2>{post.title}</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {post.learningGoal}
                  </p>
                </Link>
              </TableCell>

              <TableCell>
                {post.postedAt && (
                  <p>{new Date(post.postedAt).toISOString().slice(0, 10)}</p>
                )}
              </TableCell>
              <TableCell>{post.isViral ? <ViralIcon /> : null}</TableCell>
              <TableCell>{post.collections.length}</TableCell>
              <TableCell>
                <div className="flex items-center">
                  <Button
                    variant="default"
                    className="rounded-r-none flex items-center justify-center"
                    onClick={() => {
                      vscode.openSocialPostPlayground(post.id);
                    }}
                  >
                    <VSCodeIcon className="size-5 flex-shrink-0" />
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
