// Cloudflare R2 upload — no AWS SDK (avoids ReadableStream issues in React Native / Hermes).
// Uses @noble/hashes for HMAC-SHA256 (pure JS, no crypto.subtle needed) +
// manual AWS Signature V4 presigned PUT URL + XMLHttpRequest for the actual upload.

import { hmac } from '@noble/hashes/hmac';
import { sha256 } from '@noble/hashes/sha2';
import { bytesToHex } from '@noble/hashes/utils';

const ACCESS_KEY = '4d01f1aad72339cb864070d2a75b925e';
const SECRET_KEY = '8c13a66cc2923f3725b5fb1b71f08914e07cbf315b28ccf66ea1f993c7179235';
const HOST = '8dc784623553374b5082fbda3202841a.r2.cloudflarestorage.com';
const BUCKET = 'mentalio-videos';
const REGION = 'auto';
export const R2_PUBLIC_URL = 'https://pub-b3ad2a85bf9d4cf3b52ba5d853fa8d69.r2.dev';

// ─── Crypto helpers ───────────────────────────────────────────────────────────

const enc = new TextEncoder();

function sha256Hex(str: string): string {
  return bytesToHex(sha256(enc.encode(str)));
}

function hmacRaw(key: Uint8Array | string, data: string): Uint8Array {
  const k = typeof key === 'string' ? enc.encode(key) : key;
  return hmac(sha256, k, enc.encode(data));
}

function signingKey(date: string): Uint8Array {
  let k = hmacRaw(`AWS4${SECRET_KEY}`, date);
  k = hmacRaw(k, REGION);
  k = hmacRaw(k, 's3');
  return hmacRaw(k, 'aws4_request');
}

// ─── Presigned URL ────────────────────────────────────────────────────────────

function presignedPutUrl(key: string, expiresIn = 3600): string {
  const now = new Date();
  const date = now.toISOString().slice(0, 10).replace(/-/g, '');
  const datetime = now.toISOString().replace(/[-:]/g, '').replace(/\.\d+Z$/, 'Z');

  const credentialScope = `${date}/${REGION}/s3/aws4_request`;

  const sortedParams: [string, string][] = [
    ['X-Amz-Algorithm', 'AWS4-HMAC-SHA256'],
    ['X-Amz-Credential', `${ACCESS_KEY}/${credentialScope}`],
    ['X-Amz-Date', datetime],
    ['X-Amz-Expires', String(expiresIn)],
    ['X-Amz-SignedHeaders', 'host'],
  ].sort(([a], [b]) => a.localeCompare(b));

  const queryString = sortedParams
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join('&');

  const canonicalRequest = [
    'PUT',
    `/${BUCKET}/${key.split('/').map(encodeURIComponent).join('/')}`,
    queryString,
    `host:${HOST}\n`,
    'host',
    'UNSIGNED-PAYLOAD',
  ].join('\n');

  const stringToSign = [
    'AWS4-HMAC-SHA256',
    datetime,
    credentialScope,
    sha256Hex(canonicalRequest),
  ].join('\n');

  const signature = bytesToHex(hmacRaw(signingKey(date), stringToSign));

  return `https://${HOST}/${BUCKET}/${key}?${queryString}&X-Amz-Signature=${signature}`;
}

// ─── Upload ───────────────────────────────────────────────────────────────────

export async function uploadVideoToR2(localUri: string, courseId: string): Promise<string> {
  const ext = (localUri.split('.').pop() ?? 'mp4').toLowerCase().split('?')[0];
  const mime = ext === 'mov' ? 'video/quicktime' : `video/${ext}`;
  const key = `${courseId}/${Date.now()}.${ext}`;

  const url = presignedPutUrl(key);

  // Step 1: read file as Blob via XHR (React Native supports responseType 'blob')
  const blob = await new Promise<Blob>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', localUri, true);
    xhr.responseType = 'blob';
    xhr.onload = () => resolve(xhr.response as Blob);
    xhr.onerror = () => reject(new Error('Failed to read local video file'));
    xhr.send();
  });

  // Step 2: PUT the blob via XHR — RN handles blobs natively without ReadableStream
  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', url, true);
    xhr.setRequestHeader('Content-Type', mime);
    xhr.timeout = 600_000; // 10 minutes for large videos
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve();
      else reject(new Error(`R2 upload failed: HTTP ${xhr.status}`));
    };
    xhr.onerror = () => reject(new Error('Network error during video upload'));
    xhr.ontimeout = () => reject(new Error('Video upload timed out'));
    xhr.send(blob);
  });

  return `${R2_PUBLIC_URL}/${key}`;
}
