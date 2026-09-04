/** Generates a unique email per test run so repeated `npm run test:e2e`
 * invocations don't collide with users already created in a prior run
 * (the backend now persists real accounts in MySQL). */
export function uniqueEmail(prefix: string): string {
  return `${prefix}.${Date.now()}.${Math.floor(Math.random() * 10000)}@example.com`;
}
