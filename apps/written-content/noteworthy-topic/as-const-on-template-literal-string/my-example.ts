
const getPostsUrl = (id: string) => {
  return `/posts/${id}`;
};

type PostsUrl = ReturnType<typeof getPostsUrl>;

const getUsersUrl = (id: string) => {
  return `/users/${id}` as const;
};

type UsersUrl = ReturnType<typeof getUsersUrl>;

const example: UsersUrl = '/users/awdawd'