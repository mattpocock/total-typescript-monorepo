import type { LoaderFunctionArgs } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "~/components/ui/breadcrumb";
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
          <BreadcrumbItem>
            <BreadcrumbLink to={`/courses/${data.id}`}>
              {data.title}
            </BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <h1>{data.title}</h1>
      <Table>
        <TableBody>
          {data.sections.map((section) => (
            <TableRow key={section.id}>
              <TableCell>
                <Link to={`/courses/${data.id}/sections/${section.id}`}>
                  {section.title}
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
