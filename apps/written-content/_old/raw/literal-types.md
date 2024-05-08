Here's a list of examples where literal types can be useful in TypeScript:

- Ensuring you can only pass certain strings to a function

```typescript
function printStatus(
  status: "success" | "failure"
) {
  console.log(`Status is: ${status}`);
}

printStatus("success"); // Outputs: Status is: success
printStatus("error"); // Type error!
```

- Restricting the input of a variable to a specific range of numbers

```typescript
let age: 1 | 2 | 3 | 4 | 5 = 5;
age = 3; // Works
age = 6; // Type error!
```

- Specifying the exact keys of an object

```typescript
type Person = {
  name: string;
  age: number;
  gender: "male" | "female" | "non-binary";
};

const person: Person = {
  name: "Alice",
  age: 25,
  gender: "female",
};

const person2: Person = {
  name: "Bob",
  gender: "male",
};

const person3: Person = {
  // Type error! Missing key: age
  name: "Charlie",
  gender: "non-binary",
};
```

- Defining the exact values of an array

```typescript
const weekdays: [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday"
] = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
];

const fruits: ["apple", "banana", "orange"] = [
  "banana",
  "orange",
  "apple",
];
// Type error! Wrong order of values
```

- Ensuring a function only returns certain values

```typescript
function getBoolean(value: string): true | false {
  if (value === "yes") {
    return true;
  } else if (value === "no") {
    return false;
  } else {
    throw new Error("Invalid value!");
  }
}

const booleanValue: true | false =
  getBoolean("yes"); // Works
const booleanValue2: true | false =
  getBoolean("maybe"); // Type error!
```
