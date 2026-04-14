// Type declarations for Compression Streams API (browser standard)
// These are normally in lib.dom.d.ts but we don't include DOM lib for Node builds.

type CompressionFormat = "deflate" | "deflate-raw" | "gzip";

declare class CompressionStream {
  constructor(format: CompressionFormat);
  readonly readable: ReadableStream<Uint8Array>;
  readonly writable: WritableStream<Uint8Array>;
}

declare class DecompressionStream {
  constructor(format: CompressionFormat);
  readonly readable: ReadableStream<Uint8Array>;
  readonly writable: WritableStream<Uint8Array>;
}
