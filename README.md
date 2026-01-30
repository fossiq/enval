<h1 align="center">
  <strong>≅ enval</strong>
</h1>
<p align="center">
  A highly opinionated way to parse env values that I find useful.
</p>

<p align="center">
  <a href="https://github.com/fossiq/enval/actions/workflows/publish.yml"><img src="https://github.com/fossiq/enval/actions/workflows/publish.yml/badge.svg" alt="Publish to JSR and npm"></a>
  <a href="https://jsr.io/@fossiq/enval"><img src="https://jsr.io/badges/@fossiq/enval" alt="JSR"></a>
  <a href="https://www.npmjs.com/package/@fossiq/enval"><img src="https://img.shields.io/npm/v/@fossiq/enval" alt="npm version"></a>
  <a href="https://bundlephobia.com/package/@fossiq/enval"><img src="https://img.shields.io/bundlephobia/minzip/@fossiq/enval" alt="Bundle size"></a>
</p>

Guesses the type of a value from its string form so you can stop writing repetitive parsing logic.

## Install

```sh
npm install @fossiq/enval
```

## Usage

```ts
import { enval } from "@fossiq/enval";
```

Booleans (case-insensitive)

```ts
enval("true"); // true
enval("YES"); // true
enval("off"); // false
```

Numbers (with safe integer protection for large numbers like Snowflake IDs)

```ts
enval("42"); // 42
enval("3.14"); // 3.14
enval("1234567890123456789"); // "1234567890123456789"
```

Nullish

```ts
enval("null"); // null
enval("undefined"); // undefined
```

JSON

```ts
enval("[1, 2, 3]"); // [1, 2, 3]
enval('{"enabled": true}'); // { enabled: true }
```

Strings (auto-unquoted and trimmed)

```ts
enval('"hello"'); // "hello"
enval("  text  "); // "text"
```

TypeScript generics

```ts
enval<string[]>('["a", "b"]'); // string[]
enval<{ host: string }>('{"host": "localhost"}'); // { host: string }
```

Constructor shorthand

```ts
enval<string[]>('["a", "b", "a"]', Set); // Set(2) { "a", "b" }
```

## Parsing Order

1. **Nullish**: `null`, `undefined`
2. **Boolean**: `true`, `false`, `yes`, `no`, `on`, `off` (case-insensitive)
3. **Number**: Numeric strings (with safe integer protection)
4. **JSON**: Objects `{}` and arrays `[]`
5. **String**: Everything else

---

## Nice to Know

Optional values with defaults

```ts
const maxRetries = enval<number>(process.env.MAX_RETRIES) ?? 3;
```

Comma-separated values (when JSON arrays aren't an option)

```ts
const ports = enval("3000,3001,3002", (_, raw) =>
  (raw as string).split(",").map(Number),
); // [3000, 3001, 3002]
```

Validation at parse time

```ts
const port = enval(process.env.PORT, (inferred) => {
  const num = inferred as number;
  if (num < 1 || num > 65535) throw new Error(`Invalid port: ${num}`);
  return num;
});
```
