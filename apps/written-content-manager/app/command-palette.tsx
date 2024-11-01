import { Await, useNavigate, useSubmit } from "@remix-run/react";
import {
  createContext,
  Suspense,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./components/ui/command";
import {
  addPostUrl,
  coursesUrl,
  courseUrl,
  dashboardUrl,
  editExerciseUrl,
  sectionUrl,
} from "./routes";

export type ActionsType = { action: () => void; label: string }[];

export const OnPageActionsContext = createContext<{
  actions: ActionsType;
  setActions: (actions: ActionsType) => void;
} | null>(null);

export const useOnPageActions = (actions: ActionsType) => {
  const onPageActionsContext = useContext(OnPageActionsContext);

  useEffect(() => {
    onPageActionsContext?.setActions(actions);

    return () => {
      onPageActionsContext?.setActions([]);
    };
  }, [actions]);
};

export function CommandPalette(props: {
  courses: Promise<{ id: string; title: string }[]>;
  sections: Promise<{ id: string; title: string; course: { title: string } }[]>;
  exercises: Promise<
    { id: string; title: string; section: { title: string } }[]
  >;
}) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const onPageActions = useContext(OnPageActionsContext);

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

  const submit = useSubmit();

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        {onPageActions && onPageActions.actions.length > 0 && (
          <CommandGroup heading="On-Page Actions">
            {onPageActions.actions.map((action) => (
              <CommandItem
                key={action.label}
                onSelect={() => {
                  setOpen(false);
                  action.action();
                }}
              >
                {action.label}
              </CommandItem>
            ))}
          </CommandGroup>
        )}
        <CommandGroup heading="Go To Page">
          <CommandItem
            onSelect={() => {
              setOpen(false);
              submit(null, {
                replace: true,
                action: addPostUrl(),
                method: "POST",
                unstable_flushSync: true,
              });
            }}
          >
            Add New Post
          </CommandItem>
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
