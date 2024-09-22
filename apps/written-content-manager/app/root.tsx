import {
  Link,
  Links,
  Meta,
  NavLink,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import "./tailwind.css";
import { coursesUrl, homeUrl } from "./routes";
import clsx from "clsx";

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

export default function App() {
  return <Outlet />;
}
