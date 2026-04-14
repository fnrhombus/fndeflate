export interface DeflateOptions {
  /** Compression level: 1 = fastest, 9 = best compression, default 6 */
  level?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
}

export type CompressInput = string | Uint8Array;
