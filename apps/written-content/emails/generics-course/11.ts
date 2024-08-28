const uniqueArray = <T>(array: T[]): T[] => {
  return Array.from(new Set(array));
};

const logRows = <T>(
  rows: T[],
  renderRow: (row: T) => string,
) => {
  for (const row of rows) {
    console.log(renderRow(row));
  }
};
