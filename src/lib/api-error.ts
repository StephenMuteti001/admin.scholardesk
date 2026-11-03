/** Human-readable message from an API (axios) error, using the backend's error.message. */
export function apiErrorMessage(error: unknown, fallback = "Something went wrong. Please try again."): string {
  const e = error as { response?: { data?: { error?: { message?: string }; message?: string } }; message?: string };
  return e?.response?.data?.error?.message || e?.response?.data?.message || (e?.response ? fallback : "We couldn't reach the server. Check your connection and try again.");
}
