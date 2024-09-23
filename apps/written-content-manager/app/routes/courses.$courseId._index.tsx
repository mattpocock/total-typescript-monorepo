import type { LoaderFunctionArgs } from "@remix-run/node";
import { Form, Link, useFetcher, useLoaderData } from "@remix-run/react";
import { DeleteIcon, EditIcon, PlusIcon } from "lucide-react";
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
import {
  addSectionUrl,
  coursesUrl,
  courseUrl,
  deleteSectionUrl,
  editSectionUrl,
  sectionUrl,
} from "~/routes";

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
          _count: {
            select: {
              exercises: {
                where: {
                  deleted: false,
                },
              },
            },
          },
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
  const course = useLoaderData<typeof loader>();

  return (
    <div className="space-y-6 flex-col">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink to={coursesUrl()}>Courses</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>{course.title}</BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <h1>{course.title} Sections</h1>
      <Table>
        <TableBody>
          {course.sections.map((section) => (
            <TableRow key={section.id}>
              <TableCell>
                <Button asChild variant={"link"}>
                  <Link to={sectionUrl(section.id)}>{section.title}</Link>
                </Button>
              </TableCell>
              <TableCell>{section._count.exercises} Exercises</TableCell>
              <TableCell>
                <div className="flex items-center">
                  <Button asChild className="rounded-r-none">
                    <Link to={editSectionUrl(section.id, courseUrl(course.id))}>
                      <EditIcon />
                    </Link>
                  </Button>
                  <Form
                    action={deleteSectionUrl(section.id, courseUrl(course.id))}
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
      <Button asChild>
        <Link to={addSectionUrl(course.id, courseUrl(course.id))}>
          <PlusIcon />
        </Link>
      </Button>
    </div>
  );
}
