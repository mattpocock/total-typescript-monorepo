import {
  defer,
  Link,
  Links,
  Meta,
  NavLink,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "@remix-run/react";
import clsx from "clsx";
import { CommandPalette } from "./command-palette";
import { p } from "./db";
import { coursesUrl, homeUrl } from "./routes";
import "./tailwind.css";

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
          "mr-4 px-3 py-2 rounded-lg",
          isActive ? "text-gray-800 bg-white" : "text-white"
        )
      }
      to={to}
    >
      {children}
    </NavLink>
  );
};

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="">
        <header className="bg-gray-800 text-white p-6 py-4 font-semibold flex items-center text-sm">
          <Link to={homeUrl()} className="font-mono mr-24 text-xl">
            WCM
          </Link>
          <MyNavLink to={coursesUrl()}>Courses</MyNavLink>
        </header>
        <main className="p-6">{children}</main>
        <Scripts />
        <ScrollRestoration />
      </body>
    </html>
  );
}

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

  return defer({
    courses,
    sections,
  });
};

export default function App() {
  const data = useLoaderData<typeof loader>();

  return (
    <>
      <Outlet />
      <CommandPalette courses={data.courses} sections={data.sections} />
    </>
  );
}
