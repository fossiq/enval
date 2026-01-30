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

This is a **highly opinionated** utility that guesses the type of a value by looking at its string form, so you can stop writing repetitive parsing logic.
It keeps things simple and opinionated: booleans, numbers, null/undefined, and JSON are recognized automatically, and everything else stays a string.

## Install

```sh
npm install @fossiq/enval
```

## Usage

```ts
import { enval } from "@fossiq/enval";

enval("true"); // true
```

## Examples

```ts
// Common env-style values.
enval("42"); // 42
enval("3.14"); // 3.14
enval("null"); // null
enval("[1, 2, 3]"); // [1, 2, 3]
enval('{"enabled": true}'); // { enabled: true }

// Provide a transformer for custom behavior.
enval("on", (inferred) => (inferred === "on" ? true : inferred)); // true
```

---

## Appendix: Advanced Use Cases

### Q: How do I parse environment variables into a `Map`?

Use a transformer to convert a JSON object or array into a Map:

```ts
// From a JSON object
const envMap = enval(
  '{"key1": "value1", "key2": "value2"}',
  (inferred) => new Map(Object.entries(inferred as object))
);
// Map(2) { 'key1' => 'value1', 'key2' => 'value2' }

// From a JSON array of tuples
const envMap2 = enval(
  '[["key1", "value1"], ["key2", "value2"]]',
  (inferred) => new Map(inferred as [string, string][])
);
// Map(2) { 'key1' => 'value1', 'key2' => 'value2' }
```

**When to use:** When you need key-value pairs with guaranteed insertion order, non-string keys, or frequent lookups/deletions. Useful for feature flags, configuration mappings, or caching layers.

---

### Q: How do I parse environment variables into a `Set`?

Use a transformer to convert a JSON array into a Set:

```ts
const allowedOrigins = enval(
  '["http://localhost:3000", "https://example.com"]',
  (inferred) => new Set(inferred as string[])
);
// Set(2) { 'http://localhost:3000', 'https://example.com' }

// From a comma-separated string (not auto-parsed as JSON)
const tags = enval(
  "development,staging,production",
  (raw) => new Set((raw as string).split(","))
);
// Set(3) { 'development', 'staging', 'production' }
```

**When to use:** When you need unique values, membership testing, or set operations. Perfect for allowlists, feature toggles, or tag collections.

---

### Q: How do I parse environment variables into a `Date`?

Use a transformer to convert a string or number into a Date:

```ts
const expiryDate = enval(
  "2026-12-31T23:59:59Z",
  (raw) => new Date(raw as string)
);
// Date object for 2026-12-31

const timestamp = enval(
  "1735689599000",
  (inferred) => new Date(inferred as number)
);
// Date object from Unix timestamp
```

**When to use:** For expiration dates, scheduling, time-based configuration, or audit timestamps.

---

### Q: How do I parse environment variables into custom classes?

Use a transformer to instantiate your class with the parsed data:

```ts
class DatabaseConfig {
  constructor(
    public host: string,
    public port: number,
    public credentials: { user: string; password: string }
  ) {}

  getConnectionString() {
    return `${this.host}:${this.port}`;
  }
}

const dbConfig = enval(
  '{"host": "localhost", "port": 5432, "credentials": {"user": "admin", "password": "secret"}}',
  (inferred) => {
    const config = inferred as {
      host: string;
      port: number;
      credentials: { user: string; password: string };
    };
    return new DatabaseConfig(config.host, config.port, config.credentials);
  }
);

console.log(dbConfig.getConnectionString()); // "localhost:5432"
```

**When to use:** When you need:
- **Validation and defaults:** Classes can validate inputs in constructors and provide sensible defaults
- **Behavior encapsulation:** Methods to operate on the configuration (e.g., `getConnectionString()`)
- **Type safety:** Strong typing with IDE autocomplete and compile-time checks
- **Complex transformations:** Multi-step parsing or computed properties

---

### Q: How do I parse CSV or delimited strings?

Use a transformer to split and process delimited strings:

```ts
// Simple comma-separated values
const ports = enval(
  "3000,3001,3002",
  (raw) => (raw as string).split(",").map(Number)
);
// [3000, 3001, 3002]

// Key-value pairs with multiple delimiters
const headers = enval(
  "Content-Type:application/json;Authorization:Bearer token",
  (raw) =>
    Object.fromEntries(
      (raw as string).split(";").map((pair) => pair.split(":"))
    )
);
// { 'Content-Type': 'application/json', 'Authorization': 'Bearer token' }
```

**When to use:** For simple lists, CSVs, or when you want readable env values without JSON syntax.

---

### Q: How do I parse URLs?

Use a transformer to create URL objects:

```ts
const apiEndpoint = enval(
  "https://api.example.com:8080/v1/users",
  (raw) => new URL(raw as string)
);
// URL { href: 'https://api.example.com:8080/v1/users', ... }

console.log(apiEndpoint.hostname); // 'api.example.com'
console.log(apiEndpoint.port); // '8080'
```

**When to use:** When you need to parse, validate, or manipulate URLs (extract hostname, port, query params, etc.).

---

### Q: How do I handle optional values with defaults?

Use a transformer to provide fallback values:

```ts
const maxRetries = enval(
  process.env.MAX_RETRIES,
  (inferred) => (inferred === undefined ? 3 : (inferred as number))
);
// Defaults to 3 if MAX_RETRIES is not set

const features = enval(
  process.env.ENABLED_FEATURES,
  (inferred) => (inferred ? new Set(inferred as string[]) : new Set(["core"]))
);
// Defaults to Set(['core']) if not set
```

**When to use:** When environment variables are optional but your application needs sensible defaults.

---

### Q: Can I validate values during parsing?

Yes! Use a transformer to throw errors or return validated values:

```ts
const port = enval(
  process.env.PORT,
  (inferred) => {
    const num = inferred as number;
    if (num < 1 || num > 65535) {
      throw new Error(`Invalid port: ${num}. Must be between 1 and 65535.`);
    }
    return num;
  }
);

const logLevel = enval(
  process.env.LOG_LEVEL,
  (inferred) => {
    const level = inferred as string;
    const validLevels = ["debug", "info", "warn", "error"];
    if (!validLevels.includes(level)) {
      throw new Error(`Invalid log level: ${level}`);
    }
    return level;
  }
);
```

**When to use:** To fail fast at startup with clear error messages instead of runtime failures later.

---

### Q: Why would I use transformers instead of just `JSON.parse()`?

Transformers unlock several benefits:

1. **Automatic inference first:** `enval` already handles booleans, numbers, and JSON parsing. Transformers let you build on top of that.
2. **Handle non-JSON formats:** CSVs, delimited strings, URL-encoded data, etc.
3. **Create rich types:** Convert plain objects into Maps, Sets, Dates, or custom classes with methods.
4. **Validation and defaults:** Validate inputs and provide fallbacks in one step.
5. **Composability:** Chain transformations and reuse logic across your config.

```ts
// Without enval: verbose and repetitive
const rawValue = process.env.ALLOWED_IPS;
const allowedIPs = rawValue
  ? new Set(JSON.parse(rawValue))
  : new Set(["127.0.0.1"]);

// With enval: concise and declarative
const allowedIPs = enval(
  process.env.ALLOWED_IPS,
  (inferred) => (inferred ? new Set(inferred as string[]) : new Set(["127.0.0.1"]))
);
```
