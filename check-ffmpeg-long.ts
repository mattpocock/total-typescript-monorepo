import { execSync } from "child_process";

const json = [
  {
    inputVideo: "/mnt/d/raw-footage/2025-10-23_14-30-47.mkv",
    startTime: 4.78,
    duration: 3.259999999999999,
  },
  {
    inputVideo: "/mnt/d/raw-footage/2025-10-23_14-30-47.mkv",
    startTime: 19.82,
    duration: 4.23,
  },
  {
    inputVideo: "/mnt/d/raw-footage/2025-10-23_14-30-47.mkv",
    startTime: 26.42,
    duration: 8.43,
  },
  {
    inputVideo: "/mnt/d/raw-footage/2025-10-23_14-30-47.mkv",
    startTime: 38.72,
    duration: 3.1499999999999986,
  },
  {
    inputVideo: "/mnt/d/raw-footage/2025-10-23_14-30-47.mkv",
    startTime: 44.04,
    duration: 6.460000000000001,
  },
  {
    inputVideo: "/mnt/d/raw-footage/2025-10-23_14-30-47.mkv",
    startTime: 53.38,
    duration: 3.259999999999998,
  },
  {
    inputVideo: "/mnt/d/raw-footage/2025-10-23_14-30-47.mkv",
    startTime: 58.37,
    duration: 6.210000000000001,
  },
  {
    inputVideo: "/mnt/d/raw-footage/2025-10-23_14-30-47.mkv",
    startTime: 73.84,
    duration: 4.679999999999993,
  },
  {
    inputVideo: "/mnt/d/raw-footage/2025-10-23_14-30-47.mkv",
    startTime: 85.57,
    duration: 5.0800000000000125,
  },
  {
    inputVideo: "/mnt/d/raw-footage/2025-10-23_14-30-47.mkv",
    startTime: 104.92,
    duration: 6.3999999999999915,
  },
  {
    inputVideo: "/mnt/d/raw-footage/2025-10-23_14-30-47.mkv",
    startTime: 121.26,
    duration: 5.6299999999999955,
  },
  {
    inputVideo: "/mnt/d/raw-footage/2025-10-23_14-30-47.mkv",
    startTime: 130.96,
    duration: 9.179999999999978,
  },
  {
    inputVideo: "/mnt/d/raw-footage/2025-10-23_14-30-47.mkv",
    startTime: 143.79,
    duration: 5.8300000000000125,
  },
  {
    inputVideo: "/mnt/d/raw-footage/2025-10-23_14-30-47.mkv",
    startTime: 153.2,
    duration: 4.230000000000018,
  },
  {
    inputVideo: "/mnt/d/raw-footage/2025-10-23_14-30-47.mkv",
    startTime: 167.1,
    duration: 6.6299999999999955,
  },
  {
    inputVideo: "/mnt/d/raw-footage/2025-10-23_14-30-47.mkv",
    startTime: 190.16,
    duration: 7.400000000000006,
  },
  {
    inputVideo: "/mnt/d/raw-footage/2025-10-23_14-30-47.mkv",
    startTime: 202.44,
    duration: 3.460000000000008,
  },
  {
    inputVideo: "/mnt/d/raw-footage/2025-10-23_14-30-47.mkv",
    startTime: 212.78,
    duration: 4.310000000000002,
  },
  {
    inputVideo: "/mnt/d/raw-footage/2025-10-23_14-30-47.mkv",
    startTime: 218.91,
    duration: 1.9300000000000068,
  },
  {
    inputVideo: "/mnt/d/raw-footage/2025-10-23_14-30-47.mkv",
    startTime: 229.39,
    duration: 4.730000000000018,
  },
  {
    inputVideo: "/mnt/d/raw-footage/2025-10-23_14-30-47.mkv",
    startTime: 249.09,
    duration: 6.799999999999983,
  },
  {
    inputVideo: "/mnt/d/raw-footage/2025-10-23_14-30-47.mkv",
    startTime: 264.11,
    duration: 5.449999999999989,
  },
  {
    inputVideo: "/mnt/d/raw-footage/2025-10-23_14-30-47.mkv",
    startTime: 274.24,
    duration: 4.579999999999984,
  },
  {
    inputVideo: "/mnt/d/raw-footage/2025-10-23_14-46-29.mkv",
    startTime: 4.25,
    duration: 2.7800000000000002,
  },
  {
    inputVideo: "/mnt/d/raw-footage/2025-10-23_14-46-29.mkv",
    startTime: 13.4,
    duration: 4.51,
  },
  {
    inputVideo: "/mnt/d/raw-footage/2025-10-23_14-46-29.mkv",
    startTime: 22.46,
    duration: 3.129999999999999,
  },
  {
    inputVideo: "/mnt/d/raw-footage/2025-10-23_14-46-29.mkv",
    startTime: 42.04,
    duration: 4,
  },
  {
    inputVideo: "/mnt/d/raw-footage/2025-10-23_14-46-29.mkv",
    startTime: 50.74,
    duration: 3.780000000000001,
  },
  {
    inputVideo: "/mnt/d/raw-footage/2025-10-23_14-46-29.mkv",
    startTime: 58.9,
    duration: 4.310000000000002,
  },
  {
    inputVideo: "/mnt/d/raw-footage/2025-10-23_14-46-29.mkv",
    startTime: 67.69,
    duration: 2.6000000000000085,
  },
  {
    inputVideo: "/mnt/d/raw-footage/2025-10-23_14-46-29.mkv",
    startTime: 73.34,
    duration: 4.8799999999999955,
  },
  {
    inputVideo: "/mnt/d/raw-footage/2025-10-23_14-46-29.mkv",
    startTime: 87.52,
    duration: 4.400000000000006,
  },
  {
    inputVideo: "/mnt/d/raw-footage/2025-10-23_14-46-29.mkv",
    startTime: 96.79,
    duration: 3.8799999999999955,
  },
  {
    inputVideo: "/mnt/d/raw-footage/2025-10-23_14-46-29.mkv",
    startTime: 106.25,
    duration: 4.730000000000004,
  },
  {
    inputVideo: "/mnt/d/raw-footage/2025-10-23_14-46-29.mkv",
    startTime: 134.43,
    duration: 5.329999999999984,
  },
  {
    inputVideo: "/mnt/d/raw-footage/2025-10-23_14-46-29.mkv",
    startTime: 146.79,
    duration: 3.0600000000000023,
  },
  {
    inputVideo: "/mnt/d/raw-footage/2025-10-23_14-46-29.mkv",
    startTime: 153.62,
    duration: 7.180000000000007,
  },
  {
    inputVideo: "/mnt/d/raw-footage/2025-10-23_14-46-29.mkv",
    startTime: 163.57,
    duration: 5.260000000000019,
  },
  {
    inputVideo: "/mnt/d/raw-footage/2025-10-23_14-46-29.mkv",
    startTime: 171.46,
    duration: 3.8100000000000023,
  },
  {
    inputVideo: "/mnt/d/raw-footage/2025-10-23_14-46-29.mkv",
    startTime: 179.27,
    duration: 10.759999999999991,
  },
  {
    inputVideo: "/mnt/d/raw-footage/2025-10-23_14-46-29.mkv",
    startTime: 193.58,
    duration: 4.359999999999985,
  },
  {
    inputVideo: "/mnt/d/raw-footage/2025-10-23_14-46-29.mkv",
    startTime: 200.96,
    duration: 5.259999999999991,
  },
  {
    inputVideo: "/mnt/d/raw-footage/2025-10-23_14-46-29.mkv",
    startTime: 210.5,
    duration: 3.6599999999999966,
  },
  {
    inputVideo: "/mnt/d/raw-footage/2025-10-23_14-46-29.mkv",
    startTime: 222.59,
    duration: 4.3799999999999955,
  },
  {
    inputVideo: "/mnt/d/raw-footage/2025-10-23_14-46-29.mkv",
    startTime: 277.37,
    duration: 3.7099999999999795,
  },
  {
    inputVideo: "/mnt/d/raw-footage/2025-10-23_14-46-29.mkv",
    startTime: 289.63,
    duration: 2.1000000000000227,
  },
  {
    inputVideo: "/mnt/d/raw-footage/2025-10-23_14-46-29.mkv",
    startTime: 300.3,
    duration: 2.579999999999984,
  },
  {
    inputVideo: "/mnt/d/raw-footage/2025-10-23_14-46-29.mkv",
    startTime: 308.45,
    duration: 1.8100000000000023,
  },
  {
    inputVideo: "/mnt/d/raw-footage/2025-10-23_14-52-13.mkv",
    startTime: 4.98,
    duration: 5.609999999999999,
  },
  {
    inputVideo: "/mnt/d/raw-footage/2025-10-23_14-52-13.mkv",
    startTime: 13.96,
    duration: 4.300000000000001,
  },
  {
    inputVideo: "/mnt/d/raw-footage/2025-10-23_14-52-13.mkv",
    startTime: 38.88,
    duration: 3.299999999999997,
  },
  {
    inputVideo: "/mnt/d/raw-footage/2025-10-23_14-52-13.mkv",
    startTime: 60.3,
    duration: 4.6000000000000085,
  },
  {
    inputVideo: "/mnt/d/raw-footage/2025-10-23_14-52-13.mkv",
    startTime: 75.8,
    duration: 4.930000000000007,
  },
  {
    inputVideo: "/mnt/d/raw-footage/2025-10-23_14-52-13.mkv",
    startTime: 85.61,
    duration: 6.900000000000006,
  },
  {
    inputVideo: "/mnt/d/raw-footage/2025-10-23_14-52-13.mkv",
    startTime: 120.31,
    duration: 3.9599999999999937,
  },
  {
    inputVideo: "/mnt/d/raw-footage/2025-10-23_14-52-13.mkv",
    startTime: 132.62,
    duration: 7.579999999999984,
  },
  {
    inputVideo: "/mnt/d/raw-footage/2025-10-23_14-52-13.mkv",
    startTime: 164.23,
    duration: 3.3100000000000023,
  },
  {
    inputVideo: "/mnt/d/raw-footage/2025-10-23_14-52-13.mkv",
    startTime: 172.91,
    duration: 9.460000000000008,
  },
  {
    inputVideo: "/mnt/d/raw-footage/2025-10-23_14-52-13.mkv",
    startTime: 184.22,
    duration: 4.460000000000008,
  },
  {
    inputVideo: "/mnt/d/raw-footage/2025-10-23_14-52-13.mkv",
    startTime: 191.46,
    duration: 2.780000000000001,
  },
  {
    inputVideo: "/mnt/d/raw-footage/2025-10-23_14-52-13.mkv",
    startTime: 200.99,
    duration: 6.799999999999983,
  },
  {
    inputVideo: "/mnt/d/raw-footage/2025-10-23_14-52-13.mkv",
    startTime: 223.23,
    duration: 6.75,
  },
  {
    inputVideo: "/mnt/d/raw-footage/2025-10-23_14-52-13.mkv",
    startTime: 249.21,
    duration: 8.999999999999972,
  },
  {
    inputVideo: "/mnt/d/raw-footage/2025-10-23_14-52-13.mkv",
    startTime: 271.54,
    duration: 3.159999999999968,
  },
  {
    inputVideo: "/mnt/d/raw-footage/2025-10-23_14-52-13.mkv",
    startTime: 278.18,
    duration: 4.659999999999968,
  },
  {
    inputVideo: "/mnt/d/raw-footage/2025-10-23_14-52-13.mkv",
    startTime: 286.06,
    duration: 6.529999999999973,
  },
  {
    inputVideo: "/mnt/d/raw-footage/2025-10-23_14-52-13.mkv",
    startTime: 302.31,
    duration: 5.680000000000007,
  },
  {
    inputVideo: "/mnt/d/raw-footage/2025-10-23_14-52-13.mkv",
    startTime: 315.39,
    duration: 3.650000000000034,
  },
  {
    inputVideo: "/mnt/d/raw-footage/2025-10-23_14-52-13.mkv",
    startTime: 350.96,
    duration: 5.550000000000011,
  },
  {
    inputVideo: "/mnt/d/raw-footage/2025-10-23_14-52-13.mkv",
    startTime: 359.89,
    duration: 5.730000000000018,
  },
  {
    inputVideo: "/mnt/d/raw-footage/2025-10-23_14-52-13.mkv",
    startTime: 375.05,
    duration: 4.229999999999961,
  },
  {
    inputVideo: "/mnt/d/raw-footage/2025-10-23_14-52-13.mkv",
    startTime: 384.06,
    duration: 7.8799999999999955,
  },
  {
    inputVideo: "/mnt/d/raw-footage/2025-10-23_14-52-13.mkv",
    startTime: 407.97,
    duration: 4.949999999999989,
  },
  {
    inputVideo: "/mnt/d/raw-footage/2025-10-23_14-52-13.mkv",
    startTime: 419.45,
    duration: 4.100000000000023,
  },
  {
    inputVideo: "/mnt/d/raw-footage/2025-10-23_14-52-13.mkv",
    startTime: 427.2,
    duration: 5.730000000000018,
  },
  {
    inputVideo: "/mnt/d/raw-footage/2025-10-23_14-52-13.mkv",
    startTime: 458.56,
    duration: 4.060000000000002,
  },
  {
    inputVideo: "/mnt/d/raw-footage/2025-10-23_14-52-13.mkv",
    startTime: 470.87,
    duration: 4.199999999999989,
  },
  {
    inputVideo: "/mnt/d/raw-footage/2025-10-23_14-52-13.mkv",
    startTime: 478.24,
    duration: 4.279999999999973,
  },
  {
    inputVideo: "/mnt/d/raw-footage/2025-10-23_14-52-13.mkv",
    startTime: 486.27,
    duration: 2.910000000000025,
  },
  {
    inputVideo: "/mnt/d/raw-footage/2025-10-23_14-52-13.mkv",
    startTime: 497.93,
    duration: 3.3000000000000114,
  },
  {
    inputVideo: "/mnt/d/raw-footage/2025-10-23_14-52-13.mkv",
    startTime: 503.81,
    duration: 8.430000000000007,
  },
  {
    inputVideo: "/mnt/d/raw-footage/2025-10-23_14-52-13.mkv",
    startTime: 515.09,
    duration: 3.25,
  },
  {
    inputVideo: "/mnt/d/raw-footage/2025-10-23_14-52-13.mkv",
    startTime: 540.82,
    duration: 3.659999999999968,
  },
  {
    inputVideo: "/mnt/d/raw-footage/2025-10-23_14-52-13.mkv",
    startTime: 607.28,
    duration: 3.230000000000018,
  },
  {
    inputVideo: "/mnt/d/raw-footage/2025-10-23_14-52-13.mkv",
    startTime: 619.99,
    duration: 4.9500000000000455,
  },
  {
    inputVideo: "/mnt/d/raw-footage/2025-10-23_14-52-13.mkv",
    startTime: 632.47,
    duration: 6.1299999999999955,
  },
  {
    inputVideo: "/mnt/d/raw-footage/2025-10-23_14-52-13.mkv",
    startTime: 640.85,
    duration: 3.759999999999991,
  },
  {
    inputVideo: "/mnt/d/raw-footage/2025-10-23_14-52-13.mkv",
    startTime: 650.04,
    duration: 2.2800000000000864,
  },
  {
    inputVideo: "/mnt/d/raw-footage/2025-10-23_14-52-13.mkv",
    startTime: 694.79,
    duration: 4.2000000000000455,
  },
  {
    inputVideo: "/mnt/d/raw-footage/2025-10-23_14-52-13.mkv",
    startTime: 701.04,
    duration: 3.259999999999991,
  },
  {
    inputVideo: "/mnt/d/raw-footage/2025-10-23_14-52-13.mkv",
    startTime: 729.02,
    duration: 4.509999999999991,
  },
  {
    inputVideo: "/mnt/d/raw-footage/2025-10-23_14-52-13.mkv",
    startTime: 739.41,
    duration: 3.5,
  },
  {
    inputVideo: "/mnt/d/raw-footage/2025-10-23_14-52-13.mkv",
    startTime: 750.21,
    duration: 5.459999999999923,
  },
  {
    inputVideo: "/mnt/d/raw-footage/2025-10-23_14-52-13.mkv",
    startTime: 768.14,
    duration: 8.279999999999973,
  },
  {
    inputVideo: "/mnt/d/raw-footage/2025-10-23_14-52-13.mkv",
    startTime: 779.09,
    duration: 3.480000000000018,
  },
  {
    inputVideo: "/mnt/d/raw-footage/2025-10-23_14-52-13.mkv",
    startTime: 790.1,
    duration: 4.899999999999977,
  },
  {
    inputVideo: "/mnt/d/raw-footage/2025-10-23_14-52-13.mkv",
    startTime: 798.62,
    duration: 3.2000000000000455,
  },
  {
    inputVideo: "/mnt/d/raw-footage/2025-10-23_14-52-13.mkv",
    startTime: 804.95,
    duration: 5.67999999999995,
  },
  {
    inputVideo: "/mnt/d/raw-footage/2025-10-23_15-06-18.mkv",
    startTime: 2.9,
    duration: 8.299999999999999,
  },
  {
    inputVideo: "/mnt/d/raw-footage/2025-10-23_15-06-18.mkv",
    startTime: 54.35,
    duration: 4.729999999999997,
  },
  {
    inputVideo: "/mnt/d/raw-footage/2025-10-23_15-06-18.mkv",
    startTime: 61.95,
    duration: 3.8799999999999955,
  },
  {
    inputVideo: "/mnt/d/raw-footage/2025-10-23_15-06-18.mkv",
    startTime: 72.16,
    duration: 1.9300000000000068,
  },
  {
    inputVideo: "/mnt/d/raw-footage/2025-10-23_15-06-18.mkv",
    startTime: 83.61,
    duration: 5.349999999999994,
  },
  {
    inputVideo: "/mnt/d/raw-footage/2025-10-23_15-06-18.mkv",
    startTime: 94.61,
    duration: 10.959999999999994,
  },
  {
    inputVideo: "/mnt/d/raw-footage/2025-10-23_15-06-18.mkv",
    startTime: 128.15,
    duration: 6.329999999999984,
  },
  {
    inputVideo: "/mnt/d/raw-footage/2025-10-23_15-06-18.mkv",
    startTime: 152.91,
    duration: 9.650000000000006,
  },
  {
    inputVideo: "/mnt/d/raw-footage/2025-10-23_15-06-18.mkv",
    startTime: 175.39,
    duration: 4.130000000000024,
  },
  {
    inputVideo: "/mnt/d/raw-footage/2025-10-23_15-06-18.mkv",
    startTime: 181.6,
    duration: 6.060000000000002,
  },
  {
    inputVideo: "/mnt/d/raw-footage/2025-10-23_15-06-18.mkv",
    startTime: 191.36,
    duration: 5.279999999999973,
  },
  {
    inputVideo: "/mnt/d/raw-footage/2025-10-23_15-06-18.mkv",
    startTime: 220.66,
    duration: 7.050000000000011,
  },
  {
    inputVideo: "/mnt/d/raw-footage/2025-10-23_15-06-18.mkv",
    startTime: 278.03,
    duration: 3.6100000000000136,
  },
  {
    inputVideo: "/mnt/d/raw-footage/2025-10-23_15-06-18.mkv",
    startTime: 286.46,
    duration: 4.860000000000014,
  },
  {
    inputVideo: "/mnt/d/raw-footage/2025-10-23_15-06-18.mkv",
    startTime: 299.1,
    duration: 4.829999999999984,
  },
  {
    inputVideo: "/mnt/d/raw-footage/2025-10-23_15-06-18.mkv",
    startTime: 306.63,
    duration: 3,
  },
  {
    inputVideo: "/mnt/d/raw-footage/2025-10-23_15-06-18.mkv",
    startTime: 312.16,
    duration: 4.199999999999989,
  },
  {
    inputVideo: "/mnt/d/raw-footage/2025-10-23_15-06-18.mkv",
    startTime: 320.11,
    duration: 6.849999999999966,
  },
  {
    inputVideo: "/mnt/d/raw-footage/2025-10-23_15-06-18.mkv",
    startTime: 346.93,
    duration: 10.980000000000018,
  },
  {
    inputVideo: "/mnt/d/raw-footage/2025-10-23_15-06-18.mkv",
    startTime: 365.73,
    duration: 4.779999999999973,
  },
  {
    inputVideo: "/mnt/d/raw-footage/2025-10-23_15-06-18.mkv",
    startTime: 375.74,
    duration: 5.5,
  },
  {
    inputVideo: "/mnt/d/raw-footage/2025-10-23_15-06-18.mkv",
    startTime: 384.09,
    duration: 2.910000000000025,
  },
  {
    inputVideo: "/mnt/d/raw-footage/2025-10-23_15-06-18.mkv",
    startTime: 389.97,
    duration: 5.7099999999999795,
  },
  {
    inputVideo: "/mnt/d/raw-footage/2025-10-23_15-06-18.mkv",
    startTime: 399.9,
    duration: 2.3100000000000023,
  },
  {
    inputVideo: "/mnt/d/raw-footage/2025-10-23_15-06-18.mkv",
    startTime: 406.28,
    duration: 2.000000000000041,
  },
];

execSync(
  `tt create-video-from-clips '${JSON.stringify(json)}' check-ffmpeg-long`,
  {
    stdio: "inherit",
  }
);

execSync(`tt p`, {
  stdio: "inherit",
});
