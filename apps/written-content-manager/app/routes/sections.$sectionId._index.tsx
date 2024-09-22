import type { LoaderFunctionArgs } from "@remix-run/node";
import {
  Form,
  Link,
  useLoaderData,
  useNavigate,
  useSearchParams,
} from "@remix-run/react";
import { FormButtons, FormContent } from "~/components";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "~/components/ui/breadcrumb";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Table, TableBody, TableCell, TableRow } from "~/components/ui/table";
import { p } from "~/db";
import {
  addExerciseDialogUrl,
  addExerciseUrl,
  coursesUrl,
  courseUrl,
  deleteExerciseUrl,
  editExerciseUrl,
  sectionUrl,
} from "~/routes";

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const { sectionId } = params;
  const section = await p.section.findUniqueOrThrow({
    where: {
      id: sectionId,
    },
    select: {
      id: true,
      title: true,
      course: {
        select: {
          id: true,
          title: true,
        },
      },
      exercises: {
        select: {
          id: true,
          title: true,
        },
        orderBy: {
          order: "asc",
        },
      },
    },
  });

  return section;
};

export default function Section() {
  const section = useLoaderData<typeof loader>();
  const navigate = useNavigate();

  const [search, setSearch] = useSearchParams();

  return (
    <div className="space-y-6 flex-col">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink to={coursesUrl()}>Courses</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink to={courseUrl(section.course.id)}>
              {section.course.title}
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>{section.title}</BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <h1>{section.title} Exercises</h1>
      <Table>
        <TableBody>
          {section.exercises.map((exercise) => (
            <TableRow key={exercise.id}>
              <TableCell>
                <Button asChild variant={"link"}>
                  <Link to={editExerciseUrl(exercise.id)}>
                    {exercise.title}
                  </Link>
                </Button>
              </TableCell>
              <TableCell>
                <div className="flex items-center space-x-4">
                  <Button asChild variant="link">
                    <Link to={editExerciseUrl(exercise.id)}>Edit</Link>
                  </Button>
                  <Form
                    action={deleteExerciseUrl(
                      exercise.id,
                      sectionUrl(section.id)
                    )}
                    method="delete"
                  >
                    <Button variant="destructive">Delete</Button>
                  </Form>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Button asChild>
        <Link to={addExerciseDialogUrl(section.id)}>Add Exercise</Link>
      </Button>
      <Dialog
        open={search.has("add")}
        onOpenChange={(o) => {
          if (!o) {
            navigate(sectionUrl(section.id));
          }
        }}
      >
        <DialogContent>
          <DialogHeader>Add Exercise</DialogHeader>
          <DialogDescription>
            <Form
              method="POST"
              action={addExerciseUrl(section.id, sectionUrl(section.id))}
            >
              <FormContent>
                <Input name="title" required autoFocus placeholder="Title" />
                <FormButtons>
                  <Button type="submit">Save</Button>
                </FormButtons>
              </FormContent>
            </Form>
          </DialogDescription>
        </DialogContent>
      </Dialog>
    </div>
  );
}
