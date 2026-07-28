import "server-only";

const internalBase =
  process.env.INTERNAL_API_URL?.replace(/\/$/, "") ?? "http://localhost:8000";

export async function serverApiFetch<T>(
  path: string,
  init: RequestInit & { next?: { revalidate?: number } } = {},
): Promise<T> {
  const response = await fetch(
    `${internalBase}${path.startsWith("/") ? path : `/${path}`}`,
    init,
  );
  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}`);
  }
  return response.json() as Promise<T>;
}
