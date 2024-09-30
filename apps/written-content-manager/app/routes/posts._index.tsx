import type { MetaFunction } from "@remix-run/node";
import {
  Form,
  Link,
  redirect,
  useLoaderData,
  type ClientActionFunctionArgs,
} from "@remix-run/react";
import { PlusIcon } from "lucide-react";
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
import { editPostUrl } from "~/routes";
import { trpc } from "~/trpc/client";
import { createJsonAction, requestToJson } from "~/utils";

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
                <div className="flex items-center space-x-4">
                  <Button asChild variant="link">
                    <Link to={editPostUrl(post.id)}>Edit</Link>
                  </Button>
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
