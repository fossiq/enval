type JsonWithVersion = { version?: string };

export async function readVersionFrom(path: string): Promise<string> {
  const json = (await Bun.file(path).json()) as JsonWithVersion;
  if (!json.version || typeof json.version !== "string") {
    throw new Error(`Missing version in ${path}`);
  }

  return json.version;
}

export function getErrorOutput(error: unknown): string {
  const output =
    (
      error as {
        stderr?: { toString(): string };
        stdout?: { toString(): string };
        message?: string;
      }
    ).stderr?.toString() ||
    (error as { stdout?: { toString(): string } }).stdout?.toString() ||
    (error as { message?: string }).message ||
    String(error);

  return output;
}
