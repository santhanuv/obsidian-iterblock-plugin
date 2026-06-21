import { describe, expect, it } from "vitest";

import {
  decodeSpec,
  encodeSpec,
  ITERBLOCK_SPEC_VERSION,
  type IterblockSpec,
} from "./iterblock";

function expectOk<T>(result: { ok: boolean; data?: T; error?: string }): T {
  expect(result.ok, `Failed with error: ${result.error}`).toBe(true);
  if (!result.ok) {
    throw new Error(result.error ?? "expected ok result");
  }

  return result.data!;
}

function createSpec(overrides: Partial<IterblockSpec> = {}): IterblockSpec {
  return {
    specVersion: ITERBLOCK_SPEC_VERSION,
    track: "event-sourcing",
    iter: 1,
    base: "base-track",
    lang: "ts",
    snippet: ["const a = 1;", "const b = 2;"].join("\n"),
    ...overrides,
  };
}

describe("encodeSpec / decodeSpec", () => {
  it("roundtrips a spec through encoding and decoding", () => {
    const spec = createSpec();

    const block = encodeSpec(spec);
    expect(block.startsWith("```iterblock")).toBe(true);

    const inner = block.split("\n").slice(1, -1).join("\n");
    const decoded = decodeSpec(inner);

    expect(decoded).toEqual({
      ok: true,
      data: spec,
    });
  });

  it("encodes the snippet after the metadata separator", () => {
    const spec = createSpec({
      snippet: ["line one", "line two"].join("\n"),
    });

    const block = encodeSpec(spec);
    const lines = block.split("\n");

    expect(lines[0]).toBe("```iterblock");
    expect(lines[lines.length - 2]).toBe("line two");
    expect(lines[lines.length - 1]).toBe("```");
  });

  it("supports snippets containing markdown fences", () => {
    const spec = createSpec({
      snippet: ["function main() {", "```", "}"].join("\n"),
    });

    const block = encodeSpec(spec);

    expect(block.startsWith("```iterblock")).toBe(true);
    expect(block.includes("```")).toBe(true);
  });

  it("rejects specs without a metadata separator", () => {
    const result = decodeSpec(
      ["specVersion: 1.0.0", "track: event-sourcing"].join("\n"),
    );

    expect(result.ok).toBe(false);
  });

  it("rejects specs with an empty snippet", () => {
    const result = decodeSpec(
      [
        "specVersion: 1.0.0",
        "track: event-sourcing",
        "iter: 1",
        "base: base-track",
        "lang: ts",
        "---",
        "   ",
      ].join("\n"),
    );

    expect(result.ok).toBe(false);
  });

  it("rejects specs with missing required metadata", () => {
    const result = decodeSpec(
      [
        "track: event-sourcing",
        "iter: 1",
        "base: base-track",
        "lang: ts",
        "---",
        "const a = 1;",
      ].join("\n"),
    );

    expect(result.ok).toBe(false);
  });

  it("rejects specs with invalid metadata", () => {
    const result = decodeSpec(
      [
        "specVersion: [broken",
        "track: event-sourcing",
        "iter: 1",
        "base: base-track",
        "lang: ts",
        "---",
        "const a = 1;",
      ].join("\n"),
    );

    expect(result.ok).toBe(false);
  });

  it("defaults base to an empty string when it is omitted", () => {
    const result = decodeSpec(
      [
        "specVersion: 1.0.0",
        "track: event-sourcing",
        "iter: 1",
        "lang: ts",
        "---",
        "const a = 1;",
      ].join("\n"),
    );

    const spec = expectOk(result);

    expect(spec.base).toBe("");
    expect(spec.track).toBe("event-sourcing");
    expect(spec.iter).toBe(1);
    expect(spec.lang).toBe("ts");
    expect(spec.snippet).toBe("const a = 1;");
  });
});
