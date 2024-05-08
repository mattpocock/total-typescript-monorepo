type ObjectKey =
  | "userId"
  | "postId"
  | "id"
  | "userName"
  | "postName";

type NonIdKeys = Exclude<
  ObjectKey,
  `${string}${"id" | "Id"}${string}`
>;
