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
