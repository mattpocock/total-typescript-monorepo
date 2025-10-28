import { execSync } from "child_process";

const json = [
  {
    inputVideo: "/mnt/d/raw-footage/2025-10-08_11-59-06.mp4",
    startTime: 7.93,
    duration: 4.5,
  },
  {
    inputVideo: "/mnt/d/raw-footage/2025-10-08_12-00-53.mp4",
    startTime: 55.9,
    duration: 5.850000000000001,
  },
  {
    inputVideo: "/mnt/d/raw-footage/2025-10-08_12-00-53.mp4",
    startTime: 133.61,
    duration: 7.309999999999974,
  },
  {
    inputVideo: "/mnt/d/raw-footage/2025-10-08_12-00-53.mp4",
    startTime: 145.1,
    duration: 3.6599999999999966,
  },
  {
    inputVideo: "/mnt/d/raw-footage/2025-10-08_12-00-53.mp4",
    startTime: 157.71,
    duration: 4.609999999999985,
  },
  {
    inputVideo: "/mnt/d/raw-footage/2025-10-08_12-00-53.mp4",
    startTime: 163.69,
    duration: 3.8499999999999943,
  },
  {
    inputVideo: "/mnt/d/raw-footage/2025-10-08_12-00-53.mp4",
    startTime: 170.47,
    duration: 3.5800000000000125,
  },
  {
    inputVideo: "/mnt/d/raw-footage/2025-10-08_12-00-53.mp4",
    startTime: 194.58,
    duration: 6.159999999999997,
  },
  {
    inputVideo: "/mnt/d/raw-footage/2025-10-08_12-00-53.mp4",
    startTime: 207.37,
    duration: 4.280000000000001,
  },
  {
    inputVideo: "/mnt/d/raw-footage/2025-10-08_12-05-10.mp4",
    startTime: 16.28,
    duration: 5.629999999999999,
  },
  {
    inputVideo: "/mnt/d/raw-footage/2025-10-08_12-05-10.mp4",
    startTime: 27.49,
    duration: 2.360000000000003,
  },
  {
    inputVideo: "/mnt/d/raw-footage/2025-10-08_12-05-10.mp4",
    startTime: 47.52,
    duration: 3.1299999999999955,
  },
  {
    inputVideo: "/mnt/d/raw-footage/2025-10-08_12-05-10.mp4",
    startTime: 75.85,
    duration: 3.980000000000004,
  },
  {
    inputVideo: "/mnt/d/raw-footage/2025-10-08_12-05-10.mp4",
    startTime: 83.58,
    duration: 4.280000000000001,
  },
  {
    inputVideo: "/mnt/d/raw-footage/2025-10-08_12-05-10.mp4",
    startTime: 106.54,
    duration: 4.869999999999989,
  },
];

execSync(
  `tt create-video-from-clips '${JSON.stringify(json)}' check-ffmpeg-output.mp4`,
  {
    stdio: "inherit",
  }
);

execSync(`tt p`, {
  stdio: "inherit",
});
