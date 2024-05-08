const inferValueFromColor = <
  N extends string,
  C extends string,
  T extends number
>(
  colorTag: `${N}-${C}-${T}`
) => {
  const [namespace, color, tone] = colorTag.split("-");

  return {
    namespace: namespace as N,
    color: color as C,
    tone: Number(tone) as T,
  };
};

const example = inferValueFromColor(`bg-red-400`);
//    ^?
