import type { CompressInput, DeflateOptions } from "./types.js";

export type { DeflateOptions, CompressInput } from "./types.js";

function toUint8Array(data: CompressInput): Uint8Array {
  if (typeof data === "string") return new TextEncoder().encode(data);
  return data;
}

async function compressStream(
  data: Uint8Array,
  format: CompressionFormat,
): Promise<Uint8Array> {
  const cs = new CompressionStream(format);
  const writer = cs.writable.getWriter();
  writer.write(data);
  writer.close();

  const chunks: Uint8Array[] = [];
  const reader = cs.readable.getReader();
  let totalLength = 0;

  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    totalLength += value.byteLength;
  }

  const result = new Uint8Array(totalLength);
  let offset = 0;
  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return result;
}

async function decompressStream(
  data: Uint8Array,
  format: CompressionFormat,
): Promise<Uint8Array> {
  const ds = new DecompressionStream(format);
  const writer = ds.writable.getWriter();
  writer.write(data);
  writer.close();

  const chunks: Uint8Array[] = [];
  const reader = ds.readable.getReader();
  let totalLength = 0;

  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    totalLength += value.byteLength;
  }

  const result = new Uint8Array(totalLength);
  let offset = 0;
  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return result;
}

function throwSyncNotAvailable(): never {
  throw new Error(
    "Sync compression is not available in browser. Use the async API (gzip/gunzip) instead.",
  );
}

// --- Gzip ---

export function gzip(data: CompressInput): Promise<Uint8Array> {
  return compressStream(toUint8Array(data), "gzip");
}

export function gunzip(data: Uint8Array): Promise<Uint8Array> {
  return decompressStream(data, "gzip");
}

export function gzipSync(_data: CompressInput): Uint8Array {
  throwSyncNotAvailable();
}

export function gunzipSync(_data: Uint8Array): Uint8Array {
  throwSyncNotAvailable();
}

// --- Deflate (raw, no header) ---

export function deflate(
  data: CompressInput,
  _options?: DeflateOptions,
): Promise<Uint8Array> {
  return compressStream(toUint8Array(data), "deflate-raw");
}

export function inflate(data: Uint8Array): Promise<Uint8Array> {
  return decompressStream(data, "deflate-raw");
}

export function deflateSync(
  _data: CompressInput,
  _options?: DeflateOptions,
): Uint8Array {
  throwSyncNotAvailable();
}

export function inflateSync(_data: Uint8Array): Uint8Array {
  throwSyncNotAvailable();
}

// --- Zlib (deflate + zlib header) ---

export function zlibCompress(data: CompressInput): Promise<Uint8Array> {
  return compressStream(toUint8Array(data), "deflate");
}

export function zlibDecompress(data: Uint8Array): Promise<Uint8Array> {
  return decompressStream(data, "deflate");
}

export function zlibCompressSync(_data: CompressInput): Uint8Array {
  throwSyncNotAvailable();
}

export function zlibDecompressSync(_data: Uint8Array): Uint8Array {
  throwSyncNotAvailable();
}
