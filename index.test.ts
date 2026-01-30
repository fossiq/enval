import { describe, expect, test } from "bun:test";
import { enval } from "./index";

describe("enval", () => {
  describe("non-string values", () => {
    test("should pass through non-string values as-is", () => {
      expect(enval(123)).toBe(123);
      expect(enval(true)).toBe(true);
      expect(enval(null)).toBe(null);
      expect(enval(undefined)).toBe(undefined);
      expect(enval({ key: "value" })).toEqual({ key: "value" });
      expect(enval([1, 2, 3])).toEqual([1, 2, 3]);
    });
  });

  describe("string values", () => {
    describe("empty and whitespace strings", () => {
      test("should return empty string for empty input", () => {
        expect(enval("")).toBe("");
      });

      test("should return empty string for whitespace-only input", () => {
        expect(enval("   ")).toBe("");
        expect(enval("\t")).toBe("");
        expect(enval("\n")).toBe("");
        expect(enval("  \t\n  ")).toBe("");
      });
    });

    describe("quoted strings", () => {
      test("should unquote double-quoted strings", () => {
        expect(enval('"hello"')).toBe("hello");
        expect(enval('"hello world"')).toBe("hello world");
      });

      test("should unquote single-quoted strings", () => {
        expect(enval("'hello'")).toBe("hello");
        expect(enval("'hello world'")).toBe("hello world");
      });

      test("should unquote and then infer content inside quotes", () => {
        // After unquoting, the inference still runs on the unquoted value
        expect(enval('"true"')).toBe(true);
        expect(enval('"false"')).toBe(false);
        expect(enval('"123"')).toBe(123);
        expect(enval('"null"')).toBe(null);
      });

      test("should handle nested quotes", () => {
        expect(enval(`"it's working"`)).toBe("it's working");
        expect(enval(`'say "hello"'`)).toBe('say "hello"');
      });

      test("should not unquote mismatched quotes", () => {
        expect(enval(`"hello'`)).toBe(`"hello'`);
        expect(enval(`'hello"`)).toBe(`'hello"`);
      });

      test("should handle empty quoted strings", () => {
        expect(enval('""')).toBe("");
        expect(enval("''")).toBe("");
      });
    });

    describe("plain strings", () => {
      test("should return unmodified plain strings", () => {
        expect(enval("hello")).toBe("hello");
        expect(enval("hello world")).toBe("hello world");
        expect(enval("some-value")).toBe("some-value");
      });

      test("should trim whitespace from plain strings", () => {
        expect(enval("  hello  ")).toBe("hello");
        expect(enval("\thello\t")).toBe("hello");
      });
    });
  });

  describe("boolean inference", () => {
    test("should infer true from truthy strings", () => {
      expect(enval("true")).toBe(true);
      expect(enval("TRUE")).toBe(true);
      expect(enval("True")).toBe(true);
      expect(enval("yes")).toBe(true);
      expect(enval("YES")).toBe(true);
      expect(enval("on")).toBe(true);
      expect(enval("ON")).toBe(true);
    });

    test("should infer false from falsy strings", () => {
      expect(enval("false")).toBe(false);
      expect(enval("FALSE")).toBe(false);
      expect(enval("False")).toBe(false);
      expect(enval("no")).toBe(false);
      expect(enval("NO")).toBe(false);
      expect(enval("off")).toBe(false);
      expect(enval("OFF")).toBe(false);
    });

    test("should handle whitespace around boolean strings", () => {
      expect(enval("  true  ")).toBe(true);
      expect(enval("  false  ")).toBe(false);
    });
  });

  describe("nullish inference", () => {
    test("should infer null from 'null' string", () => {
      expect(enval("null")).toBe(null);
      expect(enval("NULL")).toBe(null);
      expect(enval("Null")).toBe(null);
    });

    test("should infer undefined from 'undefined' string", () => {
      expect(enval("undefined")).toBeUndefined();
      expect(enval("UNDEFINED")).toBeUndefined();
      expect(enval("Undefined")).toBeUndefined();
    });

    test("should handle whitespace around nullish strings", () => {
      expect(enval("  null  ")).toBe(null);
      expect(enval("  undefined  ")).toBeUndefined();
    });
  });

  describe("number inference", () => {
    describe("integers", () => {
      test("should parse positive integers", () => {
        expect(enval("0")).toBe(0);
        expect(enval("1")).toBe(1);
        expect(enval("123")).toBe(123);
        expect(enval("999999")).toBe(999999);
      });

      test("should parse negative integers", () => {
        expect(enval("-1")).toBe(-1);
        expect(enval("-123")).toBe(-123);
        expect(enval("-999999")).toBe(-999999);
      });

      test("should handle whitespace around integers", () => {
        expect(enval("  42  ")).toBe(42);
        expect(enval("  -42  ")).toBe(-42);
      });
    });

    describe("floating-point numbers", () => {
      test("should parse positive floats", () => {
        expect(enval("0.5")).toBe(0.5);
        expect(enval("3.14")).toBe(3.14);
        expect(enval("123.456")).toBe(123.456);
      });

      test("should parse negative floats", () => {
        expect(enval("-0.5")).toBe(-0.5);
        expect(enval("-3.14")).toBe(-3.14);
        expect(enval("-123.456")).toBe(-123.456);
      });
    });

    describe("scientific notation", () => {
      test("should parse positive exponents", () => {
        expect(enval("1e5")).toBe(1e5);
        expect(enval("1E5")).toBe(1e5);
        expect(enval("1.5e10")).toBe(1.5e10);
        expect(enval("1e+5")).toBe(1e5);
      });

      test("should parse negative exponents", () => {
        expect(enval("1e-5")).toBe(1e-5);
        expect(enval("1.5e-10")).toBe(1.5e-10);
      });
    });

    describe("invalid numbers", () => {
      test("should not parse numbers with invalid format", () => {
        expect(enval("12.34.56")).toBe("12.34.56");
        expect(enval("abc123")).toBe("abc123");
        expect(enval("123abc")).toBe("123abc");
        expect(enval("12 34")).toBe("12 34");
      });

      test("should not parse unsafe integers", () => {
        const unsafeInt = "99999999999999999999";
        const result = enval(unsafeInt);
        expect(result).toBe(unsafeInt);
      });
    });
  });

  describe("JSON inference", () => {
    describe("objects", () => {
      test("should parse valid JSON objects", () => {
        expect(enval('{"key":"value"}')).toEqual({ key: "value" });
        expect(enval('{"a":1,"b":2}')).toEqual({ a: 1, b: 2 });
        expect(enval('{"nested":{"key":"value"}}')).toEqual({
          nested: { key: "value" },
        });
      });

      test("should parse empty objects", () => {
        expect(enval("{}")).toEqual({});
      });

      test("should handle whitespace in JSON objects", () => {
        expect(enval('  {"key":"value"}  ')).toEqual({ key: "value" });
      });
    });

    describe("arrays", () => {
      test("should parse valid JSON arrays", () => {
        expect(enval("[1,2,3]")).toEqual([1, 2, 3]);
        expect(enval('["a","b","c"]')).toEqual(["a", "b", "c"]);
        expect(enval('[{"key":"value"}]')).toEqual([{ key: "value" }]);
      });

      test("should parse empty arrays", () => {
        expect(enval("[]")).toEqual([]);
      });

      test("should handle whitespace in JSON arrays", () => {
        expect(enval("  [1,2,3]  ")).toEqual([1, 2, 3]);
      });
    });

    describe("invalid JSON", () => {
      test("should not parse invalid JSON objects", () => {
        expect(enval("{key:value}")).toBe("{key:value}");
        expect(enval('{"key":}')).toBe('{"key":}');
        expect(enval("{")).toBe("{");
        expect(enval("}")).toBe("}");
      });

      test("should not parse invalid JSON arrays", () => {
        expect(enval("[1,2,")).toBe("[1,2,");
        expect(enval("[")).toBe("[");
        expect(enval("]")).toBe("]");
      });

      test("should not parse strings that only start with braces", () => {
        expect(enval("{notjson")).toBe("{notjson");
        expect(enval("[notjson")).toBe("[notjson");
      });
    });
  });

  describe("transformers", () => {
    test("should apply custom transformer to inferred value", () => {
      const transformer = (inferred: unknown) => String(inferred).toUpperCase();

      expect(enval("hello", transformer)).toBe("HELLO");
      expect(enval("true", transformer)).toBe("TRUE");
      expect(enval("123", transformer)).toBe("123");
    });

    test("should provide both inferred and raw values to transformer", () => {
      const transformer = (inferred: unknown, raw: unknown) => ({
        inferred,
        raw,
      });

      const result = enval("true", transformer);
      expect(result).toEqual({
        inferred: true,
        raw: "true",
      });
    });

    test("should allow transformer to return different types", () => {
      const toNumber = (inferred: unknown): number => {
        if (typeof inferred === "number") return inferred;
        if (typeof inferred === "boolean") return inferred ? 1 : 0;
        return 0;
      };

      expect(enval("123", toNumber)).toBe(123);
      expect(enval("true", toNumber)).toBe(1);
      expect(enval("false", toNumber)).toBe(0);
      expect(enval("hello", toNumber)).toBe(0);
    });

    test("should work with complex transformations", () => {
      const parseList = (inferred: unknown): string[] => {
        if (Array.isArray(inferred)) return inferred.map(String);
        if (typeof inferred === "string") return inferred.split(",").map((s) => s.trim());
        return [];
      };

      expect(enval("a,b,c", parseList)).toEqual(["a", "b", "c"]);
      expect(enval("[1,2,3]", parseList)).toEqual(["1", "2", "3"]);
      expect(enval("hello", parseList)).toEqual(["hello"]);
    });

    test("should apply transformer to non-string values", () => {
      const stringify = (inferred: unknown): string => JSON.stringify(inferred);

      expect(enval(123, stringify)).toBe("123");
      expect(enval({ key: "value" }, stringify)).toBe('{"key":"value"}');
    });
  });

  describe("edge cases", () => {
    test("should handle strings with only quotes", () => {
      expect(enval('"')).toBe('"');
      expect(enval("'")).toBe("'");
      expect(enval('"""')).toBe('"');
    });

    test("should handle strings with multiple words", () => {
      expect(enval("hello world")).toBe("hello world");
      expect(enval("  hello   world  ")).toBe("hello   world");
    });

    test("should handle special characters", () => {
      expect(enval("hello@world")).toBe("hello@world");
      expect(enval("path/to/file")).toBe("path/to/file");
      expect(enval("key=value")).toBe("key=value");
    });

    test("should handle unicode characters", () => {
      expect(enval("hello 👋")).toBe("hello 👋");
      expect(enval("こんにちは")).toBe("こんにちは");
    });

    test("should handle very long strings", () => {
      const longString = "a".repeat(10000);
      expect(enval(longString)).toBe(longString);
    });

    test("should preserve case for non-keyword strings", () => {
      expect(enval("Hello")).toBe("Hello");
      expect(enval("HELLO")).toBe("HELLO");
      expect(enval("MixedCase")).toBe("MixedCase");
    });

    test("should handle number-like strings that aren't numbers", () => {
      // Note: Leading zeros are parsed as numbers (01234 -> 1234)
      expect(enval("01234")).toBe(1234); // Leading zeros still parse
      expect(enval("+123")).toBe("+123"); // Leading plus without pattern match
      expect(enval("0x123")).toBe("0x123"); // Hex notation
      expect(enval("0b101")).toBe("0b101"); // Binary notation
    });
  });

  describe("type inference", () => {
    test("should infer correct types in order of precedence", () => {
      // Boolean takes precedence over string
      expect(typeof enval("true")).toBe("boolean");

      // Null takes precedence over string
      expect(enval("null")).toBe(null);

      // Number takes precedence over string
      expect(typeof enval("123")).toBe("number");

      // JSON takes precedence over string
      expect(Array.isArray(enval("[1,2,3]"))).toBe(true);

      // String is the fallback
      expect(typeof enval("hello")).toBe("string");
    });
  });
});
