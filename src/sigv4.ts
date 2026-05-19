import { createHash, createHmac } from 'node:crypto';
import type { AwsCredentials } from './types.ts';

const SERVICE = 'appsync';
const ALGORITHM = 'AWS4-HMAC-SHA256';
const EMPTY_BODY_HASH = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';

/**
 * AWS Signature Version 4 for AppSync POST requests.
 *
 * This is the minimum subset of SigV4 needed for AppSync: a single POST to
 * `/graphql` with a JSON body. No query string, no multi-value headers, no
 * presigning. Reference:
 * https://docs.aws.amazon.com/general/latest/gr/sigv4_signing.html
 */
export function signAppSyncRequest(args: {
  url: string;
  body: string;
  credentials: AwsCredentials;
  region: string;
  /** Inject a fixed `Date` for deterministic tests. */
  now?: Date;
  /** Extra headers that must be included in the signature. */
  headers?: Readonly<Record<string, string>>;
}): Record<string, string> {
  const { url, body, credentials, region, now = new Date(), headers = {} } = args;
  const parsed = new URL(url);

  const amzDate = toAmzDate(now);
  const dateStamp = amzDate.slice(0, 8);
  const payloadHash = body.length === 0 ? EMPTY_BODY_HASH : sha256Hex(body);

  const baseHeaders: Record<string, string> = {
    accept: 'application/json, text/javascript',
    'content-encoding': 'amz-1.0',
    'content-type': 'application/json; charset=UTF-8',
    host: parsed.host,
    'x-amz-date': amzDate,
  };
  if (credentials.sessionToken) {
    baseHeaders['x-amz-security-token'] = credentials.sessionToken;
  }
  for (const [k, v] of Object.entries(headers)) {
    baseHeaders[k.toLowerCase()] = v;
  }

  const sortedNames = Object.keys(baseHeaders).sort();
  const canonicalHeaders = `${sortedNames
    .map((n) => `${n}:${baseHeaders[n]?.trim().replace(/\s+/g, ' ')}`)
    .join('\n')}\n`;
  const signedHeaders = sortedNames.join(';');

  const canonicalRequest = [
    'POST',
    parsed.pathname || '/',
    '',
    canonicalHeaders,
    signedHeaders,
    payloadHash,
  ].join('\n');

  const credentialScope = `${dateStamp}/${region}/${SERVICE}/aws4_request`;
  const stringToSign = [ALGORITHM, amzDate, credentialScope, sha256Hex(canonicalRequest)].join(
    '\n',
  );

  const signingKey = deriveSigningKey(credentials.secretAccessKey, dateStamp, region);
  const signature = hmacHex(signingKey, stringToSign);

  return {
    ...renameHostBack(baseHeaders),
    authorization: `${ALGORITHM} Credential=${credentials.accessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`,
  };
}

function toAmzDate(d: Date): string {
  // YYYYMMDD'T'HHMMSS'Z' — no separators.
  return d.toISOString().replace(/[:-]|\.\d{3}/g, '');
}

function sha256Hex(input: string): string {
  return createHash('sha256').update(input, 'utf8').digest('hex');
}

function hmac(key: Buffer | string, data: string): Buffer {
  return createHmac('sha256', key).update(data, 'utf8').digest();
}

function hmacHex(key: Buffer, data: string): string {
  return createHmac('sha256', key).update(data, 'utf8').digest('hex');
}

function deriveSigningKey(secret: string, dateStamp: string, region: string): Buffer {
  const kDate = hmac(`AWS4${secret}`, dateStamp);
  const kRegion = hmac(kDate, region);
  const kService = hmac(kRegion, SERVICE);
  return hmac(kService, 'aws4_request');
}

/**
 * `Host` must be present for the *signature* but `fetch` forbids userland from
 * setting it — strip it from the returned object that goes into `headers`.
 */
function renameHostBack(h: Record<string, string>): Record<string, string> {
  const { host: _host, ...rest } = h;
  return rest;
}
