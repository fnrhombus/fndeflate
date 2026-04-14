import { describe, it, expect } from "vitest";
import {
  gzip,
  gunzip,
  gzipSync,
  gunzipSync,
  deflate,
  inflate,
  deflateSync,
  inflateSync,
  zlibCompress,
  zlibDecompress,
  zlibCompressSync,
  zlibDecompressSync,
} from "fndeflate";

const encoder = new TextEncoder();
const decoder = new TextDecoder();

describe("gzipSync / gunzipSync", () => {
  it("round-trips a string", () => {
    const input = "Hello, fndeflate!";
    const compressed = gzipSync(input);
    const decompressed = gunzipSync(compressed);
    expect(decoder.decode(decompressed)).toBe(input);
  });

  it("round-trips a Uint8Array", () => {
    const input = encoder.encode("binary round-trip test");
    const compressed = gzipSync(input);
    const decompressed = gunzipSync(compressed);
    expect(decompressed).toEqual(input);
  });

  it("produces valid gzip output (magic bytes)", () => {
    const compressed = gzipSync("test");
    expect(compressed[0]).toBe(0x1f);
    expect(compressed[1]).toBe(0x8b);
  });
});

describe("gzip / gunzip (async)", () => {
  it("round-trips a string", async () => {
    const input = "Async gzip test!";
    const compressed = await gzip(input);
    const decompressed = await gunzip(compressed);
    expect(decoder.decode(decompressed)).toBe(input);
  });

  it("round-trips a Uint8Array", async () => {
    const input = encoder.encode("async binary data");
    const compressed = await gzip(input);
    const decompressed = await gunzip(compressed);
    expect(decompressed).toEqual(input);
  });
});

describe("deflateSync / inflateSync", () => {
  it("round-trips a string", () => {
    const input = "Raw deflate test";
    const compressed = deflateSync(input);
    const decompressed = inflateSync(compressed);
    expect(decoder.decode(decompressed)).toBe(input);
  });

  it("round-trips a Uint8Array", () => {
    const input = encoder.encode("raw deflate binary");
    const compressed = deflateSync(input);
    const decompressed = inflateSync(compressed);
    expect(decompressed).toEqual(input);
  });
});

describe("deflate / inflate (async)", () => {
  it("round-trips a string", async () => {
    const input = "Async deflate test";
    const compressed = await deflate(input);
    const decompressed = await inflate(compressed);
    expect(decoder.decode(decompressed)).toBe(input);
  });
});

describe("zlibCompress / zlibDecompress (async)", () => {
  it("round-trips a string", async () => {
    const input = "Zlib compression test";
    const compressed = await zlibCompress(input);
    const decompressed = await zlibDecompress(compressed);
    expect(decoder.decode(decompressed)).toBe(input);
  });

  it("produces zlib-wrapped output (CMF byte)", async () => {
    const compressed = await zlibCompress("test");
    // zlib header: first byte is CMF, method should be 8 (deflate)
    expect(compressed[0] & 0x0f).toBe(8);
  });
});

describe("zlibCompressSync / zlibDecompressSync", () => {
  it("round-trips a string", () => {
    const input = "Sync zlib test";
    const compressed = zlibCompressSync(input);
    const decompressed = zlibDecompressSync(compressed);
    expect(decoder.decode(decompressed)).toBe(input);
  });
});

describe("compression levels", () => {
  it("level 1 produces larger output than level 9", () => {
    const input = "a".repeat(10000);
    const fast = deflateSync(input, { level: 1 });
    const best = deflateSync(input, { level: 9 });
    expect(fast.byteLength).toBeGreaterThan(best.byteLength);
  });

  it("all levels produce decompressible output", () => {
    const input = "compress me at every level!";
    for (const level of [1, 2, 3, 4, 5, 6, 7, 8, 9] as const) {
      const compressed = deflateSync(input, { level });
      const decompressed = inflateSync(compressed);
      expect(decoder.decode(decompressed)).toBe(input);
    }
  });
});

describe("empty input", () => {
  it("gzipSync handles empty string", () => {
    const compressed = gzipSync("");
    const decompressed = gunzipSync(compressed);
    expect(decoder.decode(decompressed)).toBe("");
  });

  it("deflateSync handles empty Uint8Array", () => {
    const compressed = deflateSync(new Uint8Array(0));
    const decompressed = inflateSync(compressed);
    expect(decompressed.byteLength).toBe(0);
  });
});

describe("large input", () => {
  it("compresses and decompresses 1MB of text", () => {
    const chunk = "The quick brown fox jumps over the lazy dog. ";
    const input = chunk.repeat(Math.ceil(1_000_000 / chunk.length));
    const compressed = gzipSync(input);
    // Should actually compress
    expect(compressed.byteLength).toBeLessThan(input.length);
    const decompressed = gunzipSync(compressed);
    expect(decoder.decode(decompressed)).toBe(input);
  });
});

describe("unicode", () => {
  it("handles multi-byte characters", () => {
    const input = "Hello \u4e16\u754c \ud83c\udf0d \u00e9\u00e8\u00ea \u00fc\u00f6\u00e4";
    const compressed = gzipSync(input);
    const decompressed = gunzipSync(compressed);
    expect(decoder.decode(decompressed)).toBe(input);
  });

  it("handles emoji", async () => {
    const input = "\ud83d\ude80\ud83d\udca5\ud83c\udf89\ud83e\udd16\ud83c\udf0a";
    const compressed = await gzip(input);
    const decompressed = await gunzip(compressed);
    expect(decoder.decode(decompressed)).toBe(input);
  });
});

describe("interop", () => {
  it("gzip output starts with correct magic bytes", () => {
    const compressed = gzipSync("standard gzip format");
    // gzip magic number: 1f 8b
    expect(compressed[0]).toBe(0x1f);
    expect(compressed[1]).toBe(0x8b);
    // compression method: 08 (deflate)
    expect(compressed[2]).toBe(0x08);
  });

  it("deflate output does NOT have zlib/gzip headers", () => {
    const compressed = deflateSync("raw deflate");
    // raw deflate does not start with gzip magic
    expect(compressed[0]).not.toBe(0x1f);
    // raw deflate does not start with zlib CMF
    // (zlib CMF for deflate typically has low nibble = 8)
    // We just verify it's different from zlib-wrapped
    const zlibWrapped = zlibCompressSync("raw deflate");
    expect(compressed[0]).not.toBe(zlibWrapped[0]);
  });
});
