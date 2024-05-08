import { createContext, useContext } from "react";

export interface User {
  id: string;
  name: string;
}

export const userContext = createContext<User | null>(null);

export const useUserContext = () => {
  const context = useContext(userContext);
  if (!context) {
    throw new Error(
      "useUserContext must be used within a UserProvider"
    );
  }
  return context;
};

export const MyComponent = () => {
  const { id, name } = useUserContext();
  return (
    <div>
      <p>{id}</p>
      <p>{name}</p>
    </div>
  );
};
