// @errors: 2345
const useStatuses = <TStatus extends string>(
  statuses: TStatus[],
) => {
  const update = (newStatus: TStatus) => {
    // implementation
  };

  return {
    statuses,
    update,
  };
};

// ---cut---
const statuses = useStatuses([
  "loading",
  "error",
  "success",
  // ...until we add it to our initial statuses!
  "whatever",
]);

statuses.update("whatever");
