/**
 * Google accounts that can administer the site before any role document exists.
 * Add family admin emails here and in firestore.rules (allowlisted function).
 */
export const ADMIN_EMAILS = ['taltal115@gmail.com'] as const;

export type AdminRole = 'content_manager' | 'super_admin';

export function isAllowlistedAdmin(email: string | null | undefined): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase() as (typeof ADMIN_EMAILS)[number]);
}
