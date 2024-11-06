import type { MetaFunction } from "@remix-run/node";
import {
  Form,
  Link,
  redirect,
  useLoaderData,
  useNavigate,
  useSearchParams,
} from "@remix-run/react";
import { DeleteIcon, PlusIcon } from "lucide-react";
import {
  FormButtons,
  FormContent,
  PageContent,
  PageDescription,
  TitleArea,
} from "~/components";
import { Button } from "~/components/ui/button";
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
import { serverFunctions } from "~/modules/server-functions/server-functions";
import { createFormDataAction } from "~/utils";

export const meta: MetaFunction = () => {
  return [
    {
      title: "Concepts | WCM",
    },
  ];
};

export const loader = () => {
  return serverFunctions.concepts.list({});
};

export const action = createFormDataAction(async (json) => {
  await serverFunctions.concepts.create(json);
  return redirect("/concepts");
});

export default function Page() {
  const concepts = useLoaderData<typeof loader>();

  const [search] = useSearchParams();
  const navigate = useNavigate();

  return (
    <PageContent>
      <TitleArea
        title="Concepts"
        underTitle={
          <PageDescription>
            Create building blocks from which you can build your courses.
          </PageDescription>
        }
      />
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {concepts.map((concept) => (
            <TableRow key={concept.id}>
              <TableCell className="space-y-1">
                <Link
                  className="text-base"
                  to={`${concept.id}/edit`}
                  prefetch="intent"
                >
                  {concept.title}
                </Link>
              </TableCell>
              <TableCell>
                <div className="flex items-center space-x-4">
                  <Button asChild variant="link">
                    <Link to={`${concept.id}/edit`} prefetch="intent">
                      Edit
                    </Link>
                  </Button>
                  <Form action={`${concept.id}/delete`} method="POST">
                    <Button>
                      <DeleteIcon />
                    </Button>
                  </Form>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Dialog
        open={search.has("add")}
        onOpenChange={(o) => {
          if (!o) {
            navigate(`/concepts`);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>Add Concept</DialogHeader>
          <DialogDescription>
            <Form method="POST">
              <FormContent>
                <Input
                  name="title"
                  required
                  autoFocus
                  placeholder="Title"
                  className="col-span-full"
                />
                <FormButtons>
                  <Button type="submit">Save</Button>
                </FormButtons>
              </FormContent>
            </Form>
          </DialogDescription>
        </DialogContent>
      </Dialog>
      <Button asChild>
        <Link to={"?add"}>
          <PlusIcon />
        </Link>
      </Button>
    </PageContent>
  );
}
