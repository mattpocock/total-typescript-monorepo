import type { LoaderFunctionArgs } from "@remix-run/node";
import { Form, Link, useFetcher, useLoaderData } from "@remix-run/react";
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
  const { courseId } = params;
  const course = await p.course.findUniqueOrThrow({
    where: {
      id: courseId,
    },
    select: {
      id: true,
      title: true,
      sections: {
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

  return course;
};

export default function Course() {
  const data = useLoaderData<typeof loader>();

  return (
    <div className="space-y-6 flex-col">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink to="/">Courses</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>{data.title}</BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <h1>{data.title} Sections</h1>
      <Table>
        <TableBody>
          {data.sections.map((section) => (
            <TableRow key={section.id}>
              <TableCell>
                <Button asChild variant={"link"}>
                  <Link to={`/sections/${section.id}`}>{section.title}</Link>
                </Button>
              </TableCell>
              <TableCell>
                <div className="flex items-center space-x-4">
                  <Button asChild variant="link">
                    <Link
                      to={`/sections/${section.id}/edit?redirectTo=${`/courses/${data.id}`}`}
                    >
                      Edit
                    </Link>
                  </Button>
                  <Form
                    action={`/sections/${section.id}/delete?redirectTo=${`/courses/${data.id}`}`}
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
          to={`/courses/${data.id}/sections/add?redirectTo=${`/courses/${data.id}`}`}
        >
          Add Section
        </Link>
      </Button>
    </div>
  );
}
