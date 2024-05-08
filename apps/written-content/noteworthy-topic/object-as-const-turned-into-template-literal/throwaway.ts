type Time = "1" | "2" | "3" | "4" | "5" | "6" | "7";

type Timespan = Time | (string & {});

declare function getTimespan(timespan: Timespan): Timespan;

getTimespan("");
