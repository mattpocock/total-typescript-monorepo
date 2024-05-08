import { Routes } from "../types";

export const createUrl = <TRoute extends keyof Routes>(
  route: TRoute,
  params: Routes[TRoute],
) => {
  const searchParams = new URLSearchParams(params);
  return `http://localhost:3000${route}?${searchParams.toString()}`;
};
