declare module "*.md" {
  const Component: (props: any) => JSX.Element;
  export default Component;
}

declare module "*.ogg" {
  const src: string;
  export default src;
}

declare module "*.mkv" {
  const src: string;
  export default src;
}
