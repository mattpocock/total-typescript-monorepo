import type { MetaFunction } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
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
import { addCourseUrl, coursesUrl, courseUrl, editCourseUrl } from "~/routes";
import { trpc } from "~/trpc/client";

export const meta: MetaFunction = () => {
  return [
    {
      title: "Courses | WCM",
    },
  ];
};

export const clientLoader = async () => {
  return trpc.courses.list.query();
};

const Page = () => {
  const data = useLoaderData<typeof clientLoader>();

  return (
    <PageContent>
      <TitleArea title="Courses" />
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((course) => (
            <TableRow key={course.id}>
              <TableCell className="space-y-1">
                <Link className="text-base" to={courseUrl(course.id)}>
                  {course.title}
                </Link>
                <p className="font-mono text-gray-500 text-xs">
                  {course.repoSlug}
                </p>
              </TableCell>
              <TableCell>{course.exerciseCount} Exercises</TableCell>
              <TableCell>
                {course.foundOnDisk ? (
                  <span className="bg-green-100 text-green-800 text-xs p-2 px-3 rounded-lg uppercase font-semibold">
                    On Disk
                  </span>
                ) : (
                  <span className="bg-gray-100 text-gray-800 text-xs p-2 px-3 rounded-lg uppercase font-semibold">
                    Not Found
                  </span>
                )}
              </TableCell>
              <TableCell>
                <div className="flex items-center space-x-4">
                  <Button asChild variant="link">
                    <Link to={editCourseUrl(course.id, coursesUrl())}>
                      Edit
                    </Link>
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Button asChild>
        <Link to={addCourseUrl(coursesUrl())}>
          <PlusIcon />
        </Link>
      </Button>
    </PageContent>
  );
};

export default Page;
