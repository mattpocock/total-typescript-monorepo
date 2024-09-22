export const moveElementBack = <T extends { id: string }>(
  arr: T[],
  id: string
): T[] => {
  const index = arr.findIndex((el) => el.id === id);
  if (index === 0) return arr;
  const newArr = [...arr];
  newArr.splice(index - 1, 0, newArr.splice(index, 1)[0]!);
  return newArr;
};

export const moveElementForward = <T extends { id: string }>(
  arr: T[],
  id: string
): T[] => {
  const index = arr.findIndex((el) => el.id === id);
  if (index === arr.length - 1) return arr;
  const newArr = [...arr];
  newArr.splice(index + 1, 0, newArr.splice(index, 1)[0]!);
  return newArr;
};
