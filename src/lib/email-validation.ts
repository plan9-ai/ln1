/**
 * Email validation matching HTML5 `type="email"` behavior (permissive).
 * Used for signup, login, add-member and any form that accepts emails.
 */
export const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const emailPatternSource = emailPattern.source;

export function isValidEmail(value: string): boolean {
  return emailPattern.test(value.trim());
}
