import { signAppSyncRequest } from './sigv4.ts';
import type { AuthConfig } from './types.ts';

/**
 * Resolve the auth-specific HTTP headers for one request. Returns a flat
 * `Record<string, string>` ready to merge with the user's `headers`.
 *
 * Each auth mode is a single tiny function — keeping them here (rather than
 * one file per mode) makes the dispatch trivial and the bundle smaller.
 */
export async function buildAuthHeaders(
  auth: AuthConfig,
  request: { url: string; body: string },
): Promise<Record<string, string>> {
  switch (auth.type) {
    case 'apiKey':
      return { 'x-api-key': auth.apiKey };

    case 'cognito':
    case 'oidc': {
      const token = await resolve(auth.jwtToken);
      return { authorization: prefixBearer(token) };
    }

    case 'lambda': {
      const token = await resolve(auth.authorizationToken);
      return { authorization: token };
    }

    case 'iam': {
      const creds =
        typeof auth.credentials === 'function' ? await auth.credentials() : auth.credentials;
      return signAppSyncRequest({
        url: request.url,
        body: request.body,
        credentials: creds,
        region: auth.region,
      });
    }
  }
}

async function resolve<T>(v: T | (() => T | Promise<T>)): Promise<T> {
  return typeof v === 'function' ? await (v as () => T | Promise<T>)() : v;
}

function prefixBearer(token: string): string {
  return /^Bearer\s/i.test(token) ? token : `Bearer ${token}`;
}
