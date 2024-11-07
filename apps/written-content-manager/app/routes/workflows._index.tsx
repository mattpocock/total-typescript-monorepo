import {
  Form,
  Link,
  redirect,
  useLoaderData,
  useNavigate,
  useSearchParams,
  type MetaFunction,
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
      title: "Workflows | WCM",
    },
  ];
};

export const loader = async () => {
  return serverFunctions.workflows.list();
};

export const action = createFormDataAction(async (json) => {
  await serverFunctions.workflows.create(json);
  return redirect("/workflows");
});

export default function Page() {
  const workflows = useLoaderData<typeof loader>();

  const [search] = useSearchParams();
  const navigate = useNavigate();

  return (
    <PageContent>
      <TitleArea
        title="Workflows"
        underTitle={
          <PageDescription>
            Build AI workflows to automate content creation.
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
          {workflows.map((workflow) => (
            <TableRow key={workflow.id}>
              <TableCell className="space-y-1">
                <Link
                  className="text-base"
                  to={`${workflow.id}/edit`}
                  prefetch="intent"
                >
                  {workflow.title}
                </Link>
              </TableCell>
              <TableCell>
                <div className="flex items-center space-x-4">
                  <Button asChild variant="link">
                    <Link to={`${workflow.id}/edit`} prefetch="intent">
                      Edit
                    </Link>
                  </Button>
                  <Form action={`${workflow.id}/delete`} method="POST">
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
            navigate(`/workflows`);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>Add Workflow</DialogHeader>
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
