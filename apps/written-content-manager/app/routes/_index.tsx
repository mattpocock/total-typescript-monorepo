import type { MetaFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { PageContent, TitleArea } from "~/components";
import { serverFunctions } from "~/modules/server-functions/server-functions";

export const meta: MetaFunction = () => {
  return [
    {
      title: "WCM",
    },
  ];
};

export const loader = async () => {
  const data = serverFunctions.analytics.allCounts();

  return data;
};

export default function Dashboard() {
  const data = useLoaderData<typeof loader>();
  return (
    <PageContent>
      <TitleArea title="Dashboard" />

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {/* <div className="p-6 rounded-lg border-2 border-gray-200 dark:border-gray-500 flex flex-col items-center">
                <h2 className="text-xl font-semibold tracking-tight">
                  Courses Created Today
                </h2>
                <span className="rounded-full size-36 flex items-center justify-center border-gray-200 dark:border-gray-500 border-4 text-5xl text-gray-800 dark:text-gray-200 font-mono mt-4">
                  {data.coursesCreatedToday - data.coursesDeletedToday}
                </span>
              </div>
              <div className="p-6 rounded-lg border-2 border-gray-200 dark:border-gray-500 flex flex-col items-center">
                <h2 className="text-xl font-semibold tracking-tight">
                  Sections Created Today
                </h2>
                <span className="rounded-full size-36 flex items-center justify-center border-gray-200 dark:border-gray-500 border-4 text-5xl text-gray-800 dark:text-gray-200 font-mono mt-4">
                  {data.sectionsCreatedToday - data.sectionsDeletedToday}
                </span>
              </div> */}
        <div className="p-6 rounded-lg border-2 border-gray-200 dark:border-gray-500 flex flex-col items-center">
          <h2 className="text-xl font-semibold tracking-tight">
            Exercises Created Today
          </h2>
          <span className="rounded-full size-36 flex items-center justify-center border-gray-200 dark:border-gray-500 border-4 text-5xl text-gray-800 dark:text-gray-200 font-mono mt-4">
            {data.exercisesCreatedToday - data.exercisesDeletedToday}
          </span>
        </div>
        <div className="p-6 rounded-lg border-2 border-gray-200 dark:border-gray-500 flex flex-col items-center">
          <h2 className="text-xl font-semibold tracking-tight">
            Exercises Ready for Recording Today
          </h2>
          <span className="rounded-full size-36 flex items-center justify-center border-gray-200 dark:border-gray-500 border-4 text-5xl text-gray-800 dark:text-gray-200 font-mono mt-4">
            {data.exercisesMarkedReadyForRecordingToday}
          </span>
        </div>
        <div className="p-6 rounded-lg border-2 border-gray-200 dark:border-gray-500 flex flex-col items-center">
          <h2 className="text-xl font-semibold tracking-tight">
            Audio Recordings Created Today
          </h2>
          <span className="rounded-full size-36 flex items-center justify-center border-gray-200 dark:border-gray-500 border-4 text-5xl text-gray-800 dark:text-gray-200 font-mono mt-4">
            {data.audioRecordingsCreatedToday -
              data.audioRecordingsDeletedToday}
          </span>
        </div>
        <div className="p-6 rounded-lg border-2 border-gray-200 dark:border-gray-500 flex flex-col items-center">
          <h2 className="text-xl font-semibold tracking-tight">
            Posts Created Today
          </h2>
          <span className="rounded-full size-36 flex items-center justify-center border-gray-200 dark:border-gray-500 border-4 text-5xl text-gray-800 dark:text-gray-200 font-mono mt-4">
            {data.postsCreatedToday - data.postsDeletedToday}
          </span>
        </div>
        <div className="p-6 rounded-lg border-2 border-gray-200 dark:border-gray-500 flex flex-col items-center">
          <h2 className="text-xl font-semibold tracking-tight">
            Posts Marked as Posted Today
          </h2>
          <span className="rounded-full size-36 flex items-center justify-center border-gray-200 dark:border-gray-500 border-4 text-5xl text-gray-800 dark:text-gray-200 font-mono mt-4">
            {data.postsMarkedAsPostedToday}
          </span>
        </div>
      </div>
    </PageContent>
  );
}
