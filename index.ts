/**
 * Special symbol to indicate that an infer function did not match/process the value.
 */
const NO_MATCH = Symbol("NO_MATCH");

/**
 * The inferred output types returned by {@link enval} when no transformer is provided.
 */
export type EnvalInferred =
  | string
  | number
  | boolean
  | null
  | undefined
  | object;

/**
 * Transforms the inferred value into a custom shape.
 */
export type EnvalTransformer<T> = (inferred: EnvalInferred, raw: unknown) => T;

/**
 * Parse a value and run it through a transformer for custom behavior.
 */
export function enval<T>(value: unknown, transformer: EnvalTransformer<T>): T;

/**
 * Parse a value into a typed representation based on env-style input.
 */
export function enval<T = EnvalInferred>(value: unknown): T;

/**
 * Parse a value into a boolean, number, null/undefined, JSON, or keep it as a string.
 */
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
    if (value !== NO_MATCH) return value;
  }

  return unquoted;
}

const inferFns = [
  function inferBoolean(lower: string) {
    if (["true", "yes", "on"].includes(lower)) return true;
    if (["false", "no", "off"].includes(lower)) return false;
    return NO_MATCH;
  },
  function inferNullish(lower: string) {
    if (lower === "null") return null;
    if (lower === "undefined") return undefined;
    return NO_MATCH;
  },
  function inferNumber(text: string) {
    const numberPattern = /^-?\d+(\.\d+)?([eE][+-]?\d+)?$/;
    if (!numberPattern.test(text)) return NO_MATCH;

    const num = Number(text);
    if (Number.isSafeInteger(num) || !Number.isInteger(num)) {
      return num;
    }
    return NO_MATCH;
  },
  function inferJson(text: string) {
    if (
      (!text.startsWith("{") || !text.endsWith("}")) &&
      (!text.startsWith("[") || !text.endsWith("]"))
    ) {
      return NO_MATCH;
    }

    try {
      return JSON.parse(text);
    } catch {
      return NO_MATCH;
    }
  },
];
