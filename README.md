<p align="center">
  <strong>⚫ ENVAL</strong>
</p>
<p align="center">
  A highly opinionated way to parse env values that I find useful.
</p>

---

Enval guesses the type of a value by looking at its string form, so you can stop writing repetitive parsing logic.
It keeps things simple: booleans, numbers, null/undefined, and JSON are recognized, and everything else stays a string.

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
enval("on", (inferred) => inferred === true); // true
```
