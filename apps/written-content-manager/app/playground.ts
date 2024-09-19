import { p } from "./db";

// await p.course.create({
//   data: {
//     title: "Pro Essentials",
//     type: "WORKSHOP",
//   },
// });

await p.section.createMany({
  data: [
    {
      courseId: "98424e1f-0bf8-4687-9ebd-57fe210c1319",
      order: 0,
      title: "Introduction",
    },
    {
      courseId: "98424e1f-0bf8-4687-9ebd-57fe210c1319",
      order: 1,
      title: "Next",
    },
  ],
});
