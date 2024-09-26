import type { LoaderFunctionArgs } from "@remix-run/node";
import { Form, Link, useFetcher, useLoaderData } from "@remix-run/react";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  DeleteIcon,
  EditIcon,
  PlusIcon,
} from "lucide-react";
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
  reorderSectionsUrl,
  sectionUrl,
} from "~/routes";
import { moveElementBack, moveElementForward } from "~/utils";

// Returns a markdown readout of the course and all its exercises
export const loader = async ({ params }: LoaderFunctionArgs) => {
  const { courseId } = params;

  const course = await p.course.findUniqueOrThrow({
    where: {
      id: courseId,
    },
    select: {
      title: true,
      sections: {
        select: {
          title: true,
          exercises: {
            select: {
              title: true,
              learningGoal: true,
              notes: true,
            },
          },
        },
        orderBy: {
          order: "asc",
        },
      },
    },
  });

  return new Response(
    [
      `# ${course.title}`,
      ...course.sections.map((section, sectionIndex) => {
        return [
          `## ${sectionIndex + 1}: ${section.title}`,
          ...section.exercises.map((exercise, exerciseIndex) => {
            return [
              `### ${sectionIndex + 1}.${exerciseIndex + 1}: ${exercise.title}`,
              exercise.learningGoal,
              exercise.notes,
            ]
              .join("\n\n")
              .trim();
          }),
        ].join("\n\n");
      }),
    ].join("\n\n"),
    {
      headers: {
        "Content-Type": "text/markdown",
      },
    }
  );
};
