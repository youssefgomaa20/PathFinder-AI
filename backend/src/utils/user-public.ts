import type { User } from "@prisma/client";

/** Omit password and reset secrets from API responses */
export type PublicUser = Omit<User, "password" | "resetToken" | "resetTokenExpiry">;

export const toPublicUser = (u: User): PublicUser => {
  const { password: _p, resetToken: _r, resetTokenExpiry: _e, ...rest } = u;
  return rest;
};
