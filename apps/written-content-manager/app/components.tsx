import { ZapIcon } from "lucide-react";
import { cn } from "./lib/utils";
import { useFetcher } from "@remix-run/react";
import { useEffect, useRef } from "react";
import { Input } from "./components/ui/input";
import { Button } from "./components/ui/button";
import { getLearningGoalUrl } from "./routes";

export const FormContent = (props: { children?: React.ReactNode }) => {
  return (
    <div className="grid gap-4 max-w-3xl w-full md:grid-cols-2">
      {props.children}
    </div>
  );
};

export const FormButtons = (props: { children?: React.ReactNode }) => {
  return <div className="md:col-span-full">{props.children}</div>;
};

export const PageTitle = (props: { children?: React.ReactNode }) => {
  return (
    <h1 className="text-2xl font-semibold tracking-tight">{props.children}</h1>
  );
};

export const PageDescription = (props: { children?: React.ReactNode }) => {
  return <p className="text-gray-600 dark:text-gray-300">{props.children}</p>;
};

export interface ViralIconProps {
  className?: string;
}

export const ViralIcon = (props: ViralIconProps) => {
  return (
    <div
      className={cn(
        "size-8 flex justify-center items-center rounded-full bg-gray-100 dark:bg-gray-800",
        props.className
      )}
    >
      <ZapIcon className="size-5" />
    </div>
  );
};

export interface TableDescriptionProps {
  className?: string;
  children?: React.ReactNode;
}

export const TableDescription = (props: TableDescriptionProps) => {
  return (
    <p
      className={cn(
        "text-sm text-gray-500 dark:text-gray-400",
        props.className
      )}
    >
      {props.children}
    </p>
  );
};

export const TitleArea = (props: {
  title: string;
  breadcrumbs?: React.ReactNode;
  underTitle?: React.ReactNode;
}) => {
  return (
    <div className="space-y-4">
      {props.breadcrumbs}
      <div className="space-y-1">
        <PageTitle>{props.title}</PageTitle>
        {props.underTitle}
      </div>
    </div>
  );
};

export const PageContent = (props: { children?: React.ReactNode }) => {
  return <div className="space-y-8">{props.children}</div>;
};

export const VSCodeIcon = (props: { className?: string }) => {
  return (
    <img src="/vscode.svg" className={cn("block shrink-0", props.className)} />
  );
};

export const LearningGoalInput = (props: {
  exercise: {
    title: string;
    section: { title: string; course: { title: string } };
  };
  defaultValue: string | null | undefined;
  handleChange?: () => void;
}) => {
  const learningGoalFetcher = useFetcher<{ learningGoal: string }>();

  const learningGoalRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (learningGoalFetcher.data?.learningGoal) {
      learningGoalRef.current!.value = learningGoalFetcher.data.learningGoal;

      props.handleChange?.();
    }
  }, [learningGoalFetcher.data?.learningGoal]);

  return (
    <div className="col-span-full flex">
      <Input
        ref={learningGoalRef}
        className="flex-grow border-r-0 rounded-r-none"
        defaultValue={props.defaultValue ?? ""}
        name="learningGoal"
        placeholder="Learning Goal"
        onChange={props.handleChange}
      ></Input>
      <Button
        variant="outline"
        className="rounded-l-none border-l-0"
        type="button"
        onClick={() => {
          learningGoalFetcher.submit(
            {
              title: props.exercise.title,
              courseTitle: props.exercise.section.course.title,
              sectionTitle: props.exercise.section.title,
            },
            {
              action: getLearningGoalUrl(),
              method: "POST",
            }
          );
        }}
      >
        Generate
      </Button>
    </div>
  );
};
