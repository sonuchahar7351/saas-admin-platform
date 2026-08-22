import { AxiosError } from "axios";

// Single source of truth for turning ANY caught error into something safe to show a user.
// Never pass a raw Axios/Prisma error object or stack trace to a toast — always route through this.
export function getErrorMessage(
  error: unknown,
  fallback = "Something went wrong. Please try again.",
): string {
  if (!error) return fallback;

  // Network failure — request never reached the server
  if ((error as AxiosError)?.isAxiosError) {
    const axiosError = error as AxiosError<any>;

    if (!axiosError.response) {
      return "Could not connect. Check your internet connection and try again.";
    }

    const { status, data } = axiosError.response;

    // Our AllExceptionsFilter always returns { message, statusCode, code? } — but be
    // defensive since validation errors can arrive as { message: string[] } too
    if (data?.message) {
      if (Array.isArray(data.message)) return data.message[0]; // class-validator arrays — show the first, most actionable one
      if (typeof data.message === "string") return data.message;
    }

    // fall back to a clean message by status code if the body didn't have one
    switch (status) {
      case 400:
        return "That request was invalid. Please check the details and try again.";
      case 401:
        return "Your session has expired. Please log in again.";
      case 403:
        return "You don't have permission to do that.";
      case 404:
        return "That could not be found.";
      case 409:
        return "This conflicts with existing data.";
      case 429:
        return "Too many attempts. Please wait a moment and try again.";
      case 500:
      case 502:
      case 503:
        return "Something went wrong on our end. Please try again shortly.";
      default:
        return fallback;
    }
  }

  if (error instanceof Error) return error.message || fallback;
  if (typeof error === "string") return error;

  return fallback;
}
