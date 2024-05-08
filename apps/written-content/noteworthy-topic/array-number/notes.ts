const roles = ["user", "admin", "superadmin"] as const;

// This doesn't work - it's the type of the array,
// not the value of the array
type RoleAttempt1 = typeof roles;
//   ^?

// This DOES work, but it's pretty verbose, and won't
// adapt if we add more roles to the array
type RoleAttempt2 = (typeof roles)[0 | 1 | 2];
//          ^?

// This works no matter how many roles we have in the array
type Role = (typeof roles)[number];
//   ^?
