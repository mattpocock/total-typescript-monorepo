export type Example<T> = `${Extract<
  keyof T,
  string
>} Hello!`;

type Result = Example<{
  userId: number;
  postId: number;
  id: number;
  [index: symbol]: true;
}>;
