const Component = ({
  children,
}: {
  children: React.ReactNode;
}): React.ReactNode => {
  return <div>{children}</div>;
};

const Parent = () => {
  return <div>123</div>;
};
