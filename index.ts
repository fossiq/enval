/**
 * Special symbol to indicate that an infer function did not match/process the value.
 */
const NO_MATCH: unique symbol = Symbol("≇");

type inferType = string | number | boolean | null | undefined | object;

/**
 * Parse a value and run it through a transformer for custom behavior.
 */
export function enval<T, R>(value: unknown, transformer: (inferred: T, raw: unknown) => R): R;

/**
 * Parse a value into a typed representation based on env-style input.
 */
export function enval<T = inferType>(value: unknown): T;

/**
 * Parse a value into a boolean, number, null/undefined, JSON, or keep it as a string.
 */
export function enval<T>(
  value: unknown,
  transformer?: (inferred: inferType, raw: unknown) => T,
): T {
  const inferred = infer(value);

  if (transformer) {
    return transformer(inferred, value);
  }

  return inferred as T;
}

function infer(value: unknown): inferType {
  if (typeof value !== "string") {
    return value as inferType;
  }

  const text = value.trim();

  if (text === "") {
    return text;
  }

  const unquoted = text.replace(/^(['"])(.*)\1$/, "$2");
  const lower = unquoted.toLowerCase();

  for (const fn of inferFns) {
    const result = fn(lower);
    if (result !== NO_MATCH) return result;
  }

  return unquoted;
}

const inferFns = [
  function inferNullish(text: string) {
    if (text === "null") return null;
    if (text === "undefined") return undefined;
    return NO_MATCH;
  },
  function inferBoolean(text: string) {
    if (["true", "yes", "on"].includes(text)) return true;
    if (["false", "no", "off"].includes(text)) return false;
    return NO_MATCH;
  },
  function inferNumber(text: string) {
    const numberPattern = /^-?\d+(\.\d+)?([eE][+-]?\d+)?$/;
    if (!numberPattern.test(text)) return NO_MATCH;

    const num = Number(text);
    return Number.isSafeInteger(num) || !Number.isInteger(num) ? num : NO_MATCH;
  },
  function inferJson(text: string) {
    if (
      (text.startsWith("{") && text.endsWith("}")) ||
      (text.startsWith("[") && text.endsWith("]"))
    ) {
      try {
        return JSON.parse(text);
      } catch {
        return NO_MATCH;
      }
    }
    return NO_MATCH;
  },
];
