import { Await, defer, useLoaderData } from "@remix-run/react";
import { Suspense } from "react";
import { PageContent, TitleArea } from "~/components";
import { p } from "~/db";

export const loader = async () => {
  const todayAtMidnight = new Date();
  todayAtMidnight.setHours(0, 0, 0, 0);

  const data = p
    .$transaction([
      p.analyticsEvent.count({
        where: {
          createdAt: {
            gte: todayAtMidnight,
          },
          type: "COURSE_CREATED",
        },
      }),
      p.analyticsEvent.count({
        where: {
          createdAt: {
            gte: todayAtMidnight,
          },
          type: "SECTION_CREATED",
        },
      }),
      p.analyticsEvent.count({
        where: {
          createdAt: {
            gte: todayAtMidnight,
          },
          type: "EXERCISE_CREATED",
        },
      }),
      p.analyticsEvent.count({
        where: {
          createdAt: {
            gte: todayAtMidnight,
          },
          type: "COURSE_DELETED",
        },
      }),
      p.analyticsEvent.count({
        where: {
          createdAt: {
            gte: todayAtMidnight,
          },
          type: "SECTION_DELETED",
        },
      }),
      p.analyticsEvent.count({
        where: {
          createdAt: {
            gte: todayAtMidnight,
          },
          type: "EXERCISE_DELETED",
        },
      }),
      p.analyticsEvent.count({
        where: {
          createdAt: {
            gte: todayAtMidnight,
          },
          type: "EXERCISE_AUDIO_RECORDING_CREATED",
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
      p.analyticsEvent.count({
        where: {
          createdAt: {
            gte: todayAtMidnight,
          },
          type: "EXERCISE_MARKED_READY_FOR_RECORDING",
        },
      }),
    ])
    .then((d) => {
      return {
        coursesCreatedToday: d[0],
        sectionsCreatedToday: d[1],
        exercisesCreatedToday: d[2],
        coursesDeletedToday: d[3],
        sectionsDeletedToday: d[4],
        exercisesDeletedToday: d[5],
        audioRecordingsCreatedToday: d[6],
        audioRecordingsDeletedToday: d[7],
        exercisesMarkedReadyForRecordingToday: d[8],
      };
    });

  return data;
};

export default function Dashboard() {
  const data = useLoaderData<typeof loader>();
  return (
    <PageContent>
      <TitleArea title="Dashboard" />

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {/* <div className="p-6 rounded-lg border-2 border-gray-200 flex flex-col items-center">
                <h2 className="text-xl font-semibold tracking-tight">
                  Courses Created Today
                </h2>
                <span className="rounded-full size-36 flex items-center justify-center border-gray-200 border-4 text-5xl text-gray-800 font-mono mt-4">
                  {data.coursesCreatedToday - data.coursesDeletedToday}
                </span>
              </div>
              <div className="p-6 rounded-lg border-2 border-gray-200 flex flex-col items-center">
                <h2 className="text-xl font-semibold tracking-tight">
                  Sections Created Today
                </h2>
                <span className="rounded-full size-36 flex items-center justify-center border-gray-200 border-4 text-5xl text-gray-800 font-mono mt-4">
                  {data.sectionsCreatedToday - data.sectionsDeletedToday}
                </span>
              </div> */}
        <div className="p-6 rounded-lg border-2 border-gray-200 flex flex-col items-center">
          <h2 className="text-xl font-semibold tracking-tight">
            Exercises Created Today
          </h2>
          <span className="rounded-full size-36 flex items-center justify-center border-gray-200 border-4 text-5xl text-gray-800 font-mono mt-4">
            {data.exercisesCreatedToday - data.exercisesDeletedToday}
          </span>
        </div>
        <div className="p-6 rounded-lg border-2 border-gray-200 flex flex-col items-center">
          <h2 className="text-xl font-semibold tracking-tight">
            Exercises Ready for Recording Today
          </h2>
          <span className="rounded-full size-36 flex items-center justify-center border-gray-200 border-4 text-5xl text-gray-800 font-mono mt-4">
            {data.exercisesMarkedReadyForRecordingToday}
          </span>
        </div>
        <div className="p-6 rounded-lg border-2 border-gray-200 flex flex-col items-center">
          <h2 className="text-xl font-semibold tracking-tight">
            Audio Recordings Created Today
          </h2>
          <span className="rounded-full size-36 flex items-center justify-center border-gray-200 border-4 text-5xl text-gray-800 font-mono mt-4">
            {data.audioRecordingsCreatedToday -
              data.audioRecordingsDeletedToday}
          </span>
        </div>
      </div>
    </PageContent>
  );
}
