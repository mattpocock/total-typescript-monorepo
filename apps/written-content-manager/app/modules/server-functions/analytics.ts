import { z } from "zod";
import { createServerFunction } from "./utils";

export const analytics = {
  allCounts: createServerFunction(z.object({}), async ({ p }) => {
    const todayAtMidnight = new Date();
    todayAtMidnight.setHours(0, 0, 0, 0);
    return p
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
        p.analyticsEvent.count({
          where: {
            createdAt: {
              gte: todayAtMidnight,
            },
            type: "POST_CREATED",
          },
        }),
        p.analyticsEvent.count({
          where: {
            createdAt: {
              gte: todayAtMidnight,
            },
            type: "POST_DELETED",
          },
        }),
        p.analyticsEvent.count({
          where: {
            createdAt: {
              gte: todayAtMidnight,
            },
            type: "POST_MARKED_AS_POSTED",
          },
        }),
        p.analyticsEvent.count({
          where: {
            createdAt: {
              gte: todayAtMidnight,
            },
            type: "EXERCISE_VIDEO_RECORDING_MARKED_AS_FINAL",
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
          postsCreatedToday: d[9],
          postsDeletedToday: d[10],
          postsMarkedAsPostedToday: d[11],
          exerciseVideoRecordingsMarkedAsFinal: d[12],
        };
      });
  }),
};
