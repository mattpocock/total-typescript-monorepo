import type { MetaFunction } from "@remix-run/node";
import { Link, useLoaderData, useNavigate } from "@remix-run/react";
import { PlusIcon } from "lucide-react";
import { useMemo } from "react";
import { useOnPageActions } from "~/command-palette";
import { PageContent, PageDescription, TitleArea } from "~/components";
import { Button } from "~/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { serverFunctions } from "~/modules/server-functions/server-functions";
import { addCourseUrl, coursesUrl, courseUrl, editCourseUrl } from "~/routes";

export const meta: MetaFunction = () => {
  return [
    {
      title: "Courses | WCM",
    },
  ];
};

export const loader = async () => {
  return serverFunctions.courses.list();
};

const Page = () => {
  const data = useLoaderData<typeof loader>();

  const navigate = useNavigate();

  useOnPageActions(
    useMemo(
      () => [
        {
          action: () => {
            navigate(addCourseUrl(coursesUrl()));
          },
          label: "Add New Course",
        },
      ],
      []
    )
  );

  return (
    <PageContent>
      <TitleArea
        title="Courses"
        underTitle={
          <PageDescription>
            Build awesome courses for your students.
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
          {data.map((course) => (
            <TableRow key={course.id}>
              <TableCell className="space-y-1">
                <Link
                  className="text-base"
                  to={courseUrl(course.id)}
                  prefetch="intent"
                >
                  {course.title}
                </Link>
                <p className="font-mono text-gray-500 text-xs">
                  {course.repoSlug}
                </p>
              </TableCell>
              <TableCell>{course.exerciseCount} Exercises</TableCell>
              <TableCell>
                <div className="flex items-center space-x-4">
                  <Button asChild variant="link">
                    <Link
                      to={editCourseUrl(course.id, coursesUrl())}
                      prefetch="intent"
                    >
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
        <Link to={addCourseUrl(coursesUrl())} prefetch="intent">
          <PlusIcon />
        </Link>
      </Button>
    </PageContent>
  );
};

export default Page;
