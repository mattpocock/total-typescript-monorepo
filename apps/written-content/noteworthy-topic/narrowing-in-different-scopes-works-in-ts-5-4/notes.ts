const filterUserNames = (
  searchParams: { name?: string },
  userNames: string[]
) => {
  if (searchParams.name) {
    return userNames.filter((name) =>
      name.includes(searchParams.name)
    );
  }

  return userNames;
};
