const func = (
  obj: Record<PropertyKey, string>,
  key: PropertyKey
) => {
  console.log(obj[key]);
};

type Example = PropertyKey;
