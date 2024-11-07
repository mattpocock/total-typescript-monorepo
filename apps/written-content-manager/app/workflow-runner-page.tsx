import { PageContent, TitleArea } from "./components";

export interface WorkflowRunnerPageProps {
  pageTitle: string;
}

export const WorkflowRunnerPage = (props: WorkflowRunnerPageProps) => {
  return (
    <PageContent>
      <TitleArea title={props.pageTitle}></TitleArea>
    </PageContent>
  );
};
