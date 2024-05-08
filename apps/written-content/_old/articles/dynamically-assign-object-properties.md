```typescript
import axios from "axios";

export type ActivityKey =
  | "swim"
  | "bike"
  | "something else";

export type ActivityData = Record<
  ActivityKey,
  { time: number; count: number }
>;

export type PersonData = {
  name: string;
  activities: ActivityData;
};

async function getPerson(name: string) {
  const { data } = await axios.get(`URL/${name}`);
  const all_activities = data
    .split("\n")
    .map((row: string) => row.split(","));

  const person = {
    name,
    activities: {} as ActivityData,
  };
  const activityKeys = Object.keys(
    person.activities
  );

  activityKeys.forEach((key, i) => {
    //person.activities is blank instead of referring to ActivityData like i expected it to?? so this loop does nothing.
    person.activities[key] = {
      time: Number(all_activities[i][0]),
      count: Number(all_activities[i][1]),
    };
  });
}

console.log(getPerson("name")); // { name: name, activities: {} }
```
