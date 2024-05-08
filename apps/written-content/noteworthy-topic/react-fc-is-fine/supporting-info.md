```tsx twoslash
// Fine!
const ComponentWithoutProps: React.FC = () => {
  return <div />;
};

// Fine!
const ComponentWithProps: React.FC<{
  text: string;
}> = (props) => {
  return <button>{props.text}</button>;
};

// Still the best:
const AlsoComponentWithProps = (props: {
  text: string;
}) => {
  return <button>{props.text}</button>;
};
```
