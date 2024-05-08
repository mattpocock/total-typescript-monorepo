// Fine!
const ComponentWithoutProps: React.FC = () => {
  return <div />;
};

<ComponentWithoutProps />;

// Fine!
const ComponentWithProps: React.FC<{
  text: string;
}> = (props) => {
  return <button>{props.text}</button>;
};

<ComponentWithProps text="Submit" />;

// Still the best:
const AlsoComponentWithProps = (props: {
  text: string;
}) => {
  return <button>{props.text}</button>;
};

<AlsoComponentWithProps text="Submit" />;
