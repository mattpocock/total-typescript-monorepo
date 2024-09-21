export const FormContent = (props: { children?: React.ReactNode }) => {
  return (
    <div className="grid gap-4 max-w-3xl md:grid-cols-2">{props.children}</div>
  );
};

export const FormButtons = (props: { children?: React.ReactNode }) => {
  return <div className="md:col-span-full">{props.children}</div>;
};
