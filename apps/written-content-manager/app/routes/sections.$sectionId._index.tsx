import type { LoaderFunctionArgs } from "@remix-run/node";
import { Form, Link, useLoaderData } from "@remix-run/react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "~/components/ui/breadcrumb";
import { Button } from "~/components/ui/button";
import { Table, TableBody, TableCell, TableRow } from "~/components/ui/table";
import { p } from "~/db";

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

export default function Course() {
  const mainSection = useLoaderData<typeof loader>();

  return (
    <div className="space-y-6 flex-col">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink to="/">Courses</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink to={`/courses/${mainSection.course.id}`}>
              {mainSection.course.title}
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>{mainSection.title}</BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <h1>{mainSection.title}</h1>
      <Table>
        <TableBody>
          {mainSection.exercises.map((exercise) => (
            <TableRow key={exercise.id}>
              <TableCell>
                <Button asChild variant={"link"}>
                  <Link
                    to={`/courses/${mainSection.id}/exercises/${exercise.id}`}
                  >
                    {exercise.title}
                  </Link>
                </Button>
              </TableCell>
              <TableCell>
                <div className="flex items-center space-x-4">
                  <Button asChild variant="link">
                    <Link
                      to={`/exercises/${exercise.id}/edit?redirectTo=${`/sections/${mainSection.id}`}`}
                    >
                      Edit
                    </Link>
                  </Button>
                  <Form
                    action={`/exercises/${exercise.id}/delete?redirectTo=${`/sections/${mainSection.id}`}`}
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
        <Link
          to={`/sections/${mainSection.id}/exercises/add?redirectTo=${`/sections/${mainSection.id}`}`}
        >
          Add Exercise
        </Link>
      </Button>
    </div>
  );
}
