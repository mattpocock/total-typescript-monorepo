interface User {
  id: number;
  name: string;
  email: string;
}

type UserWithoutId = Omit<User, "id">;
//   ^?

interface WithId {
  id: number;
}

interface UserProperties {
  name: string;
  email: string;
}

interface User extends WithId, UserProperties {}
