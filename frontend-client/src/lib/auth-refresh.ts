import axios from "axios";

let refreshPromise: Promise<any> | null = null;

export function silentRefresh() {
  if (!refreshPromise) {
    refreshPromise = axios
      .post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/customer-auth/refresh`,
        {},
        { withCredentials: true },
      )
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}
