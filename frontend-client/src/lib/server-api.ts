const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

// plain fetch, not the axios apiClient — the axios instance's interceptors depend on
// browser-only Zustand state (auth tokens) that doesn't exist during server rendering,
// and public campaign data needs no auth anyway
export async function serverFetch<T>(
  path: string,
  revalidateSeconds = 60,
): Promise<T | null> {
  try {
    const res = await fetch(`${API_URL}${path}`, {
      next: { revalidate: revalidateSeconds },
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}
