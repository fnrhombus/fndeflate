# fndeflate

**Gzip that uses your platform's native engine. Not a JS reimplementation.**

[![npm version](https://img.shields.io/npm/v/fndeflate)](https://www.npmjs.com/package/fndeflate)
[![bundle size](https://img.shields.io/bundlephobia/minzip/fndeflate)](https://bundlephobia.com/package/fndeflate)
[![license](https://img.shields.io/npm/l/fndeflate)](./LICENSE)

```typescript
import { gzip, gunzip } from "fndeflate";

const compressed = await gzip("Hello, world!");
const decompressed = await gunzip(compressed);
// => Uint8Array of "Hello, world!"
```

## The problem

[pako](https://github.com/nodeca/pako) has 3.7M weekly downloads. It reimplements the entire zlib algorithm in JavaScript. That's ~45KB of code doing what your platform already does natively.

- **Node.js** ships with `zlib` -- a C-backed, battle-tested compression library.
- **Browsers** now have the [Compression Streams API](https://developer.mozilla.org/en-US/docs/Web/API/Compression_Streams_API) -- baseline in all modern browsers since 2023.

Why ship a JS reimplementation when the native engine is right there?

## Features

- **Native speed** -- Node uses C-backed zlib. Browsers use built-in CompressionStream.
- **TypeScript-first** -- Written in TypeScript, ships types. No `@types/` needed.
- **ESM + CJS** -- Dual-format builds. Works everywhere.
- **Zero dependencies** -- Uses Node built-ins and web standards. Nothing to install.
- **Sync + Async** -- Sync APIs on Node for hot paths. Async everywhere.

## Install

```bash
npm install fndeflate
# or
pnpm add fndeflate
```

## API

### Gzip (most common for HTTP)

```typescript
import { gzip, gunzip, gzipSync, gunzipSync } from "fndeflate";

// Async
const compressed = await gzip("Hello, world!");
const decompressed = await gunzip(compressed);

// Sync (Node only)
const buf = gzipSync("Hello, world!");
const original = gunzipSync(buf);
```

### Raw deflate

```typescript
import { deflate, inflate, deflateSync, inflateSync } from "fndeflate";

// With compression level (1=fastest, 9=best, default=6)
const compressed = await deflate(data, { level: 9 });
const decompressed = await inflate(compressed);

// Sync (Node only)
const buf = deflateSync(data, { level: 1 });
const original = inflateSync(buf);
```

### Zlib (deflate + zlib header)

```typescript
import { zlibCompress, zlibDecompress } from "fndeflate";

const compressed = await zlibCompress(data);
const decompressed = await zlibDecompress(compressed);
```

### Input types

All compression functions accept `string | Uint8Array`. Strings are encoded as UTF-8. Decompression functions accept `Uint8Array` and return `Uint8Array`.

### Browser notes

Browser builds use the Compression Streams API. Sync variants (`gzipSync`, `deflateSync`, etc.) are not available in the browser and will throw with a helpful error message. Use the async API instead.

## Comparison

| Feature | fndeflate | pako | fflate |
|---|---|---|---|
| Native speed (C-backed zlib) | Yes | No (pure JS) | No (pure JS) |
| TypeScript (ships types) | Yes | No (@types/) | Yes |
| ESM + CJS | Yes | CJS only | Yes |
| Zero dependencies | Yes | Yes | Yes |
| Browser support | Yes (Compression Streams) | Yes (pure JS) | Yes (pure JS) |
| Sync API (Node) | Yes | Yes | Yes |
| Sync API (Browser) | No | Yes | Yes |
| Bundle size | ~0KB (uses platform) | ~45KB | ~29KB |

## Support

If fndeflate saves you time or bundle size, consider supporting development:

- [GitHub Sponsors](https://github.com/sponsors/fnrhombus)
- [Buy Me a Coffee](https://buymeacoffee.com/fnrhombus)

## License

[MIT](./LICENSE)
