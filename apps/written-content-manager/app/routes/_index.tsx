import { Link, useLoaderData } from "@remix-run/react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
} from "~/components/ui/breadcrumb";
import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { p } from "~/db";

export const loader = () => {
  return p.course.findMany({
    select: {
      title: true,
      id: true,
    },
    orderBy: {
      updatedAt: "desc",
    },
  });
};

const Page = () => {
  const data = useLoaderData<typeof loader>();

  return (
    <div>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink to="/">Courses</BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <Separator className="my-6" />
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((course) => (
            <TableRow key={course.id}>
              <TableCell>
                <Link to={`/courses/${course.id}`}>{course.title}</Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Button asChild>
        <Link to={`/courses/add?redirectTo=${`/`}`}>Add Course</Link>
      </Button>
    </div>
  );
};

export default Page;
