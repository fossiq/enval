<h1>
  <p align="center">
    <strong>⚫ ENVAL</strong>
  </p>
</h1>
<p align="center">
  Infer types from environment-like values.
</p>

---

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
enval("42"); // 42
enval("3.14"); // 3.14
enval("null"); // null
enval("[1, 2, 3]"); // [1, 2, 3]
enval('{"enabled": true}'); // { enabled: true }

enval("on", (inferred) => inferred === true); // true
```
