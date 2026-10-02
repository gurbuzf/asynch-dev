import { useCallback, useEffect, useState } from "react";

const cache = new Map<string, unknown>();

export async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((body as { error?: string }).error ?? `İstek başarısız (${res.status})`);
  cache.set(url, body);
  return body as T;
}

export function buildUrl(path: string, params: Record<string, string | number | boolean | undefined | null | string[]>): string {
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null || v === false || v === "") continue;
    if (Array.isArray(v)) {
      if (v.length) qs.set(k, v.join(","));
    } else qs.set(k, v === true ? "1" : String(v));
  }
  const s = qs.toString();
  return s ? `${path}?${s}` : path;
}

export interface ApiState<T> {
  data?: T;
  error?: string;
  loading: boolean;
  reload: () => void;
}

export function useApi<T>(url: string | null): ApiState<T> {
  const [state, setState] = useState<{ data?: T; error?: string; loading: boolean }>(() => ({
    data: url ? (cache.get(url) as T | undefined) : undefined,
    loading: Boolean(url && !cache.has(url)),
  }));
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    if (!url) return;
    let alive = true;
    setState((s) => ({ data: (cache.get(url) as T | undefined) ?? (s.data as T | undefined), loading: true }));
    getJson<T>(url)
      .then((data) => alive && setState({ data, loading: false }))
      .catch((e: Error) => alive && setState((s) => ({ data: s.data, error: e.message, loading: false })));
    return () => {
      alive = false;
    };
  }, [url, nonce]);

  const reload = useCallback(() => setNonce((n) => n + 1), []);
  return { ...state, reload };
}
