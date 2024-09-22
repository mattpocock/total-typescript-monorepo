export const moveElementBack = (
  arr: { id: string }[],
  id: string
): { id: string }[] => {
  const index = arr.findIndex((el) => el.id === id);
  if (index === 0) return arr;
  const newArr = [...arr];
  newArr.splice(index - 1, 0, newArr.splice(index, 1)[0]!);
  return newArr;
};

export const moveElementForward = (
  arr: { id: string }[],
  id: string
): { id: string }[] => {
  const index = arr.findIndex((el) => el.id === id);
  if (index === arr.length - 1) return arr;
  const newArr = [...arr];
  newArr.splice(index + 1, 0, newArr.splice(index, 1)[0]!);
  return newArr;
};
