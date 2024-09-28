import { Link, useLoaderData } from "@remix-run/react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
} from "~/components/ui/breadcrumb";
import { Button } from "~/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { p } from "~/db";
import { pathExists } from "@total-typescript/shared";
import { addCourseUrl, coursesUrl, courseUrl, editCourseUrl } from "~/routes";
import type { MetaFunction } from "@remix-run/node";

export const meta: MetaFunction = () => {
  return [
    {
      title: "Courses | WCM",
    },
  ];
};

export const loader = async () => {
  const path = await import("path");
  const os = await import("os");

  const REPOS_PATH = path.join(os.homedir(), "repos", "total-typescript");

  const courses = await p.course.findMany({
    orderBy: {
      updatedAt: "desc",
    },
  });

  const exerciseCounts = await p.$transaction(
    courses.map((c) => {
      return p.exercise.count({
        where: {
          section: {
            courseId: c.id,
          },
          deleted: false,
        },
      });
    })
  );

  const checkedCourses: ((typeof courses)[number] & {
    foundOnDisk: boolean;
  })[] = [];

  for (const course of courses) {
    if (!course.repoSlug) {
      checkedCourses.push({ ...course, foundOnDisk: false });
    } else {
      const result = await pathExists(
        path.join(REPOS_PATH, course.repoSlug ?? "")
      );

      checkedCourses.push({
        ...course,
        foundOnDisk: result.isOk() && result.value,
      });
    }
  }

  return checkedCourses.map((c, index) => ({
    ...c,
    exerciseCount: exerciseCounts[index]!,
  }));
};

const Page = () => {
  const data = useLoaderData<typeof loader>();

  return (
    <div className="space-y-6">
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
        <Link to={addCourseUrl(coursesUrl())}>Add Course</Link>
      </Button>
    </div>
  );
};

export default Page;
