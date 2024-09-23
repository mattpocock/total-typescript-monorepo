import { Await, useNavigate } from "@remix-run/react";
import { Suspense, useEffect, useState } from "react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./components/ui/command";
import { courseUrl, sectionUrl } from "./routes";

export function CommandPalette(props: {
  courses: Promise<{ id: string; title: string }[]>;
  sections: Promise<{ id: string; title: string; course: { title: string } }[]>;
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

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <Suspense fallback={null}>
          <Await resolve={props.courses}>
            {(courses) => {
              return (
                <CommandGroup heading="Open Course">
                  {courses.map((course) => (
                    <CommandItem
                      key={course.id}
                      onSelect={() => {
                        navigate(courseUrl(course.id));
                        setOpen(false);
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
                        navigate(sectionUrl(section.id));
                        setOpen(false);
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
      </CommandList>
    </CommandDialog>
  );
}
