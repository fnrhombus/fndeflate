import {
  gzipSync as nodeGzipSync,
  gunzipSync as nodeGunzipSync,
  deflateRawSync as nodeDeflateRawSync,
  inflateRawSync as nodeInflateRawSync,
  deflateSync as nodeZlibCompressSync,
  inflateSync as nodeZlibDecompressSync,
  gzip as nodeGzipCb,
  gunzip as nodeGunzipCb,
  deflateRaw as nodeDeflateRawCb,
  inflateRaw as nodeInflateRawCb,
  deflate as nodeZlibCompressCb,
  inflate as nodeZlibDecompressCb,
  constants,
} from "node:zlib";
import { promisify } from "node:util";
import type { CompressInput, DeflateOptions } from "./types.js";

export type { DeflateOptions, CompressInput } from "./types.js";

const gzipAsync = promisify(nodeGzipCb);
const gunzipAsync = promisify(nodeGunzipCb);
const deflateRawAsync = promisify(nodeDeflateRawCb);
const inflateRawAsync = promisify(nodeInflateRawCb);
const zlibCompressAsync = promisify(nodeZlibCompressCb);
const zlibDecompressAsync = promisify(nodeZlibDecompressCb);

function toBuffer(data: CompressInput): Buffer {
  if (typeof data === "string") return Buffer.from(data, "utf-8");
  return Buffer.from(data);
}

function toUint8Array(buf: Buffer): Uint8Array {
  return new Uint8Array(buf.buffer, buf.byteOffset, buf.byteLength);
}

function zlibLevel(level?: DeflateOptions["level"]): number {
  return level ?? constants.Z_DEFAULT_COMPRESSION;
}

// --- Gzip ---

export function gzip(data: CompressInput): Promise<Uint8Array> {
  return gzipAsync(toBuffer(data)).then(toUint8Array);
}

export function gunzip(data: Uint8Array): Promise<Uint8Array> {
  return gunzipAsync(Buffer.from(data)).then(toUint8Array);
}

export function gzipSync(data: CompressInput): Uint8Array {
  return toUint8Array(nodeGzipSync(toBuffer(data)));
}

export function gunzipSync(data: Uint8Array): Uint8Array {
  return toUint8Array(nodeGunzipSync(Buffer.from(data)));
}

// --- Deflate (raw, no header) ---

export function deflate(
  data: CompressInput,
  options?: DeflateOptions,
): Promise<Uint8Array> {
  return deflateRawAsync(toBuffer(data), {
    level: zlibLevel(options?.level),
  }).then(toUint8Array);
}

export function inflate(data: Uint8Array): Promise<Uint8Array> {
  return inflateRawAsync(Buffer.from(data)).then(toUint8Array);
}

export function deflateSync(
  data: CompressInput,
  options?: DeflateOptions,
): Uint8Array {
  return toUint8Array(
    nodeDeflateRawSync(toBuffer(data), { level: zlibLevel(options?.level) }),
  );
}

export function inflateSync(data: Uint8Array): Uint8Array {
  return toUint8Array(nodeInflateRawSync(Buffer.from(data)));
}

// --- Zlib (deflate + zlib header) ---

export function zlibCompress(data: CompressInput): Promise<Uint8Array> {
  return zlibCompressAsync(toBuffer(data)).then(toUint8Array);
}

export function zlibDecompress(data: Uint8Array): Promise<Uint8Array> {
  return zlibDecompressAsync(Buffer.from(data)).then(toUint8Array);
}

export function zlibCompressSync(data: CompressInput): Uint8Array {
  return toUint8Array(nodeZlibCompressSync(toBuffer(data)));
}

export function zlibDecompressSync(data: Uint8Array): Uint8Array {
  return toUint8Array(nodeZlibDecompressSync(Buffer.from(data)));
}
