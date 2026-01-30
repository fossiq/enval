export type EnvalInferred =
  | string
  | number
  | boolean
  | null
  | undefined
  | object;

export type EnvalTransformer<T> = (inferred: EnvalInferred, raw: unknown) => T;

export function enval<T>(value: unknown, transformer: EnvalTransformer<T>): T;
export function enval<T = EnvalInferred>(value: unknown): T;
export function enval<T>(value: unknown, transformer?: EnvalTransformer<T>): T {
  const inferred = infer(value);

  if (transformer) {
    return transformer(inferred, value);
  }

  return inferred as T;
}

function infer(value: unknown): EnvalInferred {
  if (typeof value !== "string") {
    return value as EnvalInferred;
  }

  const text = value.trim();

  if (text === "") {
    return text;
  }

  const unquoted = text.replace(/^(['"])(.*)\1$/, "$2");
  const lower = unquoted.toLowerCase();

  for (const fn of inferFns) {
    const value = fn(lower);
    if (value !== undefined) return value;
  }

  return unquoted;
}

const inferFns = [
  function inferBoolean(lower: string) {
    if (["true", "yes", "on"].includes(lower)) return true;
    if (["false", "no", "off"].includes(lower)) return false;
  },
  function inferNullish(lower: string) {
    if (lower === "null") return null;
    if (lower === "undefined") return;
  },
  function inferNumber(text: string) {
    const numberPattern = /^-?\d+(\.\d+)?([eE][+-]?\d+)?$/;
    if (!numberPattern.test(text)) return;

    const num = Number(text);
    if (Number.isSafeInteger(num) || !Number.isInteger(num)) {
      return num;
    }
  },
  function inferJson(text: string) {
    if (
      (!text.startsWith("{") || !text.endsWith("}")) &&
      (!text.startsWith("[") || !text.endsWith("]"))
    ) {
      return;
    }

    try {
      return JSON.parse(text);
    } catch {}
  },
];
