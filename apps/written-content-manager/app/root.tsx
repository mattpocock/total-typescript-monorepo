import {
  Await,
  defer,
  isRouteErrorResponse,
  Link,
  Links,
  Meta,
  NavLink,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useRouteError,
  useRouteLoaderData,
  useFetchers,
} from "@remix-run/react";
import clsx from "clsx";
import {
  MicIcon,
  PlusIcon,
  VideoIcon,
  BookIcon as CoursesIcon,
  ActivityIcon as PostsIcon,
  LibraryIcon as CollectionsIcon,
  CameraIcon as ShotSlashIcon,
  SeparatorVertical as WCMLogo,
} from "lucide-react";
import {
  CommandPalette,
  OnPageActionsContext,
  type ActionsType,
} from "./command-palette";
import { p } from "./db";
import {
  collectionsUrl,
  coursesUrl,
  dashboardUrl,
  homeUrl,
  postsUrl,
  shotSlashUrl,
} from "./routes";
import "./tailwind.css";
import "./fonts.css";
import "./shiki.css";
import { useEffect, useMemo, useState } from "react";
import NProgress from "nprogress";
import "./nprogress.css";
import { useGlobalLoadingState } from "remix-utils/use-global-navigation-state";
import { cn } from "./lib/utils";

export const loader = () => {
  const courses = p.course
    .findMany({
      select: {
        id: true,
        title: true,
      },
    })
    .then((c) => c);

  const sections = p.section
    .findMany({
      select: {
        id: true,
        title: true,
        course: {
          select: {
            title: true,
          },
        },
      },
    })
    .then((s) => s);

  const exercises = p.exercise
    .findMany({
      select: {
        id: true,
        title: true,
        section: {
          select: {
            title: true,
          },
        },
      },
    })
    .then((e) => e);

  const todayAtMidnight = new Date();
  todayAtMidnight.setHours(0, 0, 0, 0);

  const analyticsData = p
    .$transaction([
      p.analyticsEvent.count({
        where: {
          createdAt: {
            gte: todayAtMidnight,
          },
          type: {
            in: ["EXERCISE_CREATED", "POST_CREATED"],
          },
        },
      }),
      p.analyticsEvent.count({
        where: {
          createdAt: {
            gte: todayAtMidnight,
          },
          type: {
            in: ["EXERCISE_DELETED", "POST_DELETED"],
          },
        },
      }),
      p.analyticsEvent.count({
        where: {
          createdAt: {
            gte: todayAtMidnight,
          },
          type: {
            in: [
              "EXERCISE_MARKED_READY_FOR_RECORDING",
              "POST_MARKED_AS_POSTED",
            ],
          },
        },
      }),
      p.analyticsEvent.count({
        where: {
          createdAt: {
            gte: todayAtMidnight,
          },
          type: "EXERCISE_AUDIO_RECORDING_DELETED",
        },
      }),
    ])
    .then((d) => {
      return {
        exercisesCreatedToday: d[0] - d[1],
        exercisesMarkedReadyForRecordingToday: d[2] - d[3],
      };
    });

  return defer({
    courses,
    sections,
    exercises,
    analyticsData,
  });
};

const MyNavLink = ({
  to,
  children,
}: {
  to: string;
  className?: string;
  children: React.ReactNode;
}) => {
  return (
    <NavLink
      className={({ isActive }) =>
        cn(
          "font-semibold flex items-center justify-center md:justify-normal space-x-3 text-gray-600 rounded-md p-2 -m-2",
          isActive && "bg-blue-100 text-blue-700"
        )
      }
      to={to}
    >
      {children}
    </NavLink>
  );
};

export function Layout({ children }: { children: React.ReactNode }) {
  const data = useRouteLoaderData<typeof loader>("root");

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="">
        <div className="flex min-h-dvh">
          <header className="bg-gray-50 flex flex-col">
            <div className="p-6 md:pr-8 font-semibold h-dvh flex flex-col">
              <Link
                to={homeUrl()}
                className="text-lg mb-10 md:-ml-[4px] text-gray-700 flex items-center font-black tracking-tight"
              >
                <WCMLogo className="size-8 md:mr-[7px]" />
                <span className="hidden md:block">WCM</span>
              </Link>
              <div className="mb-8 grid grid-cols-1 gap-6">
                <MyNavLink to={coursesUrl()}>
                  <CoursesIcon />
                  <span className="hidden md:block">Courses</span>
                </MyNavLink>
                <MyNavLink to={postsUrl()}>
                  <PostsIcon />
                  <span className="hidden md:block">Posts</span>
                </MyNavLink>
                <MyNavLink to={collectionsUrl()}>
                  <CollectionsIcon />
                  <span className="hidden md:block">Collections</span>
                </MyNavLink>
                <MyNavLink to={shotSlashUrl()}>
                  <ShotSlashIcon />
                  <span className="hidden md:block">ShotSlash</span>
                </MyNavLink>
              </div>
              <div className="mt-auto hidden md:block">
                {data?.analyticsData && (
                  <div className="text-gray-600">
                    <Await resolve={data.analyticsData}>
                      {(analyticsData) => {
                        return (
                          <Link
                            className="flex items-center space-x-4"
                            to={dashboardUrl()}
                          >
                            <div className="flex items-center">
                              <PlusIcon className="size-[22px] mr-2" />
                              <span className="text-lg font-mono font-medium">
                                {analyticsData.exercisesCreatedToday}
                              </span>
                            </div>

                            <div className="flex items-center">
                              <MicIcon className="size-[18px] mr-[11px]" />
                              <span className="text-lg font-mono font-medium">
                                {
                                  analyticsData.exercisesMarkedReadyForRecordingToday
                                }
                              </span>
                            </div>
                            <div className="flex items-center">
                              <VideoIcon className="size-[19px] mr-[13px]" />
                              <span className="text-lg font-mono font-medium">
                                {0}
                              </span>
                            </div>
                          </Link>
                        );
                      }}
                    </Await>
                  </div>
                )}
                <span className="text-gray-500 block mt-3">Matt Pocock</span>
              </div>
            </div>
          </header>
          <main className="p-6 flex-grow text-gray-700 max-w-6xl">
            {children}
          </main>
        </div>
        <Scripts />
        <ScrollRestoration />
      </body>
    </html>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    return (
      <div>
        <h1>
          {error.status} {error.statusText}
        </h1>
        <p>{error.data}</p>
      </div>
    );
  } else if (error instanceof Error) {
    return (
      <div>
        <h1>Error</h1>
        <p>{error.message}</p>
        <p>The stack trace is:</p>
        <pre>{error.stack}</pre>
      </div>
    );
  } else {
    return <h1>Unknown Error</h1>;
  }
}

export default function App() {
  const data = useLoaderData<typeof loader>();

  const [onPageActions, setOnPageActions] = useState<ActionsType>([]);

  const memoizedObj = useMemo(
    () => ({
      actions: onPageActions,
      setActions: setOnPageActions,
    }),
    [onPageActions, setOnPageActions]
  );

  let state = useGlobalLoadingState();

  useEffect(() => {
    if (state === "loading") NProgress.start();
    if (state === "idle") NProgress.done();
  }, [state]);

  return (
    <>
      <OnPageActionsContext.Provider value={memoizedObj}>
        <Outlet />
        <CommandPalette
          courses={data.courses}
          sections={data.sections}
          exercises={data.exercises}
        />
      </OnPageActionsContext.Provider>
    </>
  );
}
