import { vi } from 'vitest';

export interface FakeCall {
  readonly url: string;
  readonly method: string;
  readonly headers: Record<string, string>;
  readonly body: string;
}

export interface FakeFetchOptions {
  status?: number;
  statusText?: string;
  body?: unknown;
  rawBody?: string;
  /** Throw this error instead of resolving. */
  throws?: unknown;
  /** Resolve after this many ms. */
  delayMs?: number;
}

export function fakeFetch(plan: FakeFetchOptions | FakeFetchOptions[]): {
  fetch: typeof globalThis.fetch;
  calls: FakeCall[];
} {
  const plans = Array.isArray(plan) ? [...plan] : [plan];
  const calls: FakeCall[] = [];
  let idx = 0;

  const fetch = vi.fn(async (input: string | URL | Request, init?: RequestInit) => {
    const url =
      typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;
    const headers = headersToRecord(init?.headers);
    const body = typeof init?.body === 'string' ? init.body : '';
    calls.push({ url, method: init?.method ?? 'GET', headers, body });

    if (init?.signal?.aborted) {
      throw init.signal.reason ?? Object.assign(new Error('aborted'), { name: 'AbortError' });
    }

    const cur = plans[Math.min(idx, plans.length - 1)] ?? {};
    idx++;
    if (cur.delayMs) {
      await new Promise<void>((resolve, reject) => {
        const t = setTimeout(resolve, cur.delayMs);
        init?.signal?.addEventListener(
          'abort',
          () => {
            clearTimeout(t);
            reject(init.signal!.reason ?? new Error('aborted'));
          },
          { once: true },
        );
      });
    }
    if (cur.throws) throw cur.throws;

    const responseBody = cur.rawBody ?? JSON.stringify(cur.body ?? { data: null });
    return new Response(responseBody, {
      status: cur.status ?? 200,
      statusText: cur.statusText ?? 'OK',
      headers: { 'content-type': 'application/json' },
    });
  });

  return { fetch: fetch as unknown as typeof globalThis.fetch, calls };
}

function headersToRecord(h: HeadersInit | undefined): Record<string, string> {
  const out: Record<string, string> = {};
  if (!h) return out;
  if (h instanceof Headers) {
    h.forEach((v, k) => {
      out[k.toLowerCase()] = v;
    });
    return out;
  }
  if (Array.isArray(h)) {
    for (const [k, v] of h) out[k.toLowerCase()] = v;
    return out;
  }
  for (const [k, v] of Object.entries(h as Record<string, string>)) out[k.toLowerCase()] = v;
  return out;
}
