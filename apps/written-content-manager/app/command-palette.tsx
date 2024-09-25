import { Await, useBeforeUnload, useNavigate } from "@remix-run/react";
import { Suspense, useEffect, useState } from "react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./components/ui/command";
import {
  coursesUrl,
  courseUrl,
  dashboardUrl,
  editExerciseUrl,
  sectionUrl,
} from "./routes";

export function CommandPalette(props: {
  courses: Promise<{ id: string; title: string }[]>;
  sections: Promise<{ id: string; title: string; course: { title: string } }[]>;
  exercises: Promise<
    { id: string; title: string; section: { title: string } }[]
  >;
}) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const goToPage = (url: string) => {
    navigate(url, {
      replace: true,
      unstable_flushSync: true,
    });
    setOpen(false);
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Go To Page">
          <CommandItem
            onSelect={() => {
              goToPage(dashboardUrl());
            }}
          >
            Dashboard
          </CommandItem>
          <CommandItem
            onSelect={() => {
              goToPage(coursesUrl());
            }}
          >
            Courses
          </CommandItem>
        </CommandGroup>
        <Suspense fallback={null}>
          <Await resolve={props.courses}>
            {(courses) => {
              return (
                <CommandGroup heading="Open Course">
                  {courses.map((course) => (
                    <CommandItem
                      key={course.id}
                      onSelect={() => {
                        goToPage(courseUrl(course.id));
                      }}
                    >
                      Open {course.title} Course
                    </CommandItem>
                  ))}
                </CommandGroup>
              );
            }}
          </Await>
        </Suspense>
        <Suspense fallback={null}>
          <Await resolve={props.sections}>
            {(sections) => {
              return (
                <CommandGroup heading="Open Section">
                  {sections.map((section) => (
                    <CommandItem
                      key={section.id}
                      onSelect={() => {
                        goToPage(sectionUrl(section.id));
                      }}
                    >
                      Open {section.title} | {section.course.title}
                    </CommandItem>
                  ))}
                </CommandGroup>
              );
            }}
          </Await>
        </Suspense>
        <Suspense fallback={null}>
          <Await resolve={props.exercises}>
            {(exercises) => {
              return (
                <CommandGroup heading="Open Exercise">
                  {exercises.map((exercise) => (
                    <CommandItem
                      key={exercise.id}
                      onSelect={() => {
                        goToPage(editExerciseUrl(exercise.id));
                      }}
                    >
                      Open {exercise.title} | {exercise.section.title}
                    </CommandItem>
                  ))}
                </CommandGroup>
              );
            }}
          </Await>
        </Suspense>
      </CommandList>
    </CommandDialog>
  );
}
