type StrictOmit<T, K extends keyof T> = Omit<T, K>;

type User = {
  id: string;
  firstName: string;
};
