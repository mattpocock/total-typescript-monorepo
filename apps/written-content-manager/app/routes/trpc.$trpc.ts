import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "~/trpc/server";

export const loader = async (args: LoaderFunctionArgs) => {
  return handleRequest(args);
};
export const action = async (args: ActionFunctionArgs) => {
  return handleRequest(args);
};

function handleRequest(args: LoaderFunctionArgs | ActionFunctionArgs) {
  return fetchRequestHandler({
    endpoint: "/trpc",
    req: args.request,
    router: appRouter,
    createContext: () => {
      return {};
    },
  });
}
