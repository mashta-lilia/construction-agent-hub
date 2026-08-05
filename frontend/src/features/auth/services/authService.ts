import type { AuthUser } from "../types/auth.types";

/**
 * MVP has exactly one user type (head engineer, full access) and no login
 * screen — see tech.pdf §single-role access. This mock service is the single
 * seam to replace once real authentication exists; nothing else in the app
 * should assume how the current user is resolved.
 */
export function getCurrentUser(): AuthUser {
  return { id: "ENG-CURRENT", role: "leadEngineer" };
}
