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
} from "@remix-run/react";
import clsx from "clsx";
import { MicIcon, PlusIcon, VideoIcon } from "lucide-react";
import { CommandPalette } from "./command-palette";
import { p } from "./db";
import {
  collectionsUrl,
  coursesUrl,
  dashboardUrl,
  homeUrl,
  postsUrl,
} from "./routes";
import "./tailwind.css";
import "./fonts.css";

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
        clsx(
          "mr-4 px-3 py-2 text-white font-normal",
          isActive && "underline underline-offset-[3px] decoration-2"
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
        <header className="bg-gray-800 text-white p-6 py-4 font-semibold flex items-center text-sm justify-between">
          <div>
            <Link to={homeUrl()} className="font-mono mr-24 text-xl">
              WCM
            </Link>
            <MyNavLink to={coursesUrl()}>Courses</MyNavLink>
            <MyNavLink to={postsUrl()}>Posts</MyNavLink>
            <MyNavLink to={collectionsUrl()}>Collections</MyNavLink>
          </div>
          {data?.analyticsData && (
            <div>
              <Await resolve={data.analyticsData}>
                {(analyticsData) => {
                  return (
                    <Link
                      className="flex items-center space-x-6"
                      to={dashboardUrl()}
                    >
                      <div className="flex items-center">
                        <PlusIcon className="size-[22px] mr-2" />
                        <span className="text-lg font-mono font-medium text-gray-100">
                          {analyticsData.exercisesCreatedToday}
                        </span>
                      </div>

                      <div className="flex items-center">
                        <MicIcon className="size-[18px] mr-[11px]" />
                        <span className="text-lg font-mono font-medium text-gray-100">
                          {analyticsData.exercisesMarkedReadyForRecordingToday}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <VideoIcon className="size-[19px] mr-[13px]" />
                        <span className="text-lg font-mono font-medium text-gray-100">
                          {0}
                        </span>
                      </div>
                    </Link>
                  );
                }}
              </Await>
            </div>
          )}
        </header>
        <main className="p-6">{children}</main>
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

  return (
    <>
      <Outlet />
      <CommandPalette
        courses={data.courses}
        sections={data.sections}
        exercises={data.exercises}
      />
    </>
  );
}
