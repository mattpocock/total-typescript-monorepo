import type { MetaFunction } from "@remix-run/node";
import { Form, Link, useLoaderData } from "@remix-run/react";
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
import { p } from "~/db";
import { addPostUrl, editPostUrl, postsUrl } from "~/routes";

export const meta: MetaFunction = () => {
  return [
    {
      title: "Posts | WCM",
    },
  ];
};

export const loader = async () => {
  const posts = await p.socialPost.findMany({
    orderBy: {
      updatedAt: "desc",
    },
  });

  return posts;
};

const Page = () => {
  const posts = useLoaderData<typeof loader>();

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
      <Form method="POST" action={addPostUrl()}>
        <Button>
          <PlusIcon />
        </Button>
      </Form>
    </PageContent>
  );
};

export default Page;
