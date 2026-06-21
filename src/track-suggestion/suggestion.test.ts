import { describe, expect, it } from "vitest";
import { buildRankedHeadingSuggestions, slugify } from "./suggestion";

import type { HeadingCache } from "obsidian";

function makeHeading(
  heading: string,
  line: number,
  level: number,
): HeadingCache {
  return {
    heading,
    level,
    position: {
      start: { line, col: 0 },
      end: { line, col: 0 },
    },
  } as HeadingCache;
}

describe("buildRankedHeadingSuggestions", () => {
  it("returns an empty list when there are no headings", () => {
    const result = buildRankedHeadingSuggestions([], 10);

    expect(result).toEqual([]);
  });

  it("orders suggestions by contextual relevance", () => {
    const headings = [
      makeHeading("below-one", 20, 2),
      makeHeading("above-one", 5, 2),
      makeHeading("below-two", 30, 1),
      makeHeading("above-two", 8, 1),
    ];

    const result = buildRankedHeadingSuggestions(headings, 10).map(
      (item) => item.text,
    );

    expect(result).toEqual([
      "above-two",
      "above-one",
      "below-one",
      "below-two",
    ]);
  });

  it("prefers deeper headings above the cursor before their parent headings", () => {
    const headings = [
      makeHeading("parent", 2, 1),
      makeHeading("child", 6, 2),
      makeHeading("grandchild", 9, 3),
    ];

    const result = buildRankedHeadingSuggestions(headings, 10).map(
      (item) => item.text,
    );

    expect(result).toEqual(["grandchild", "child", "parent"]);
  });

  it("orders headings below the cursor by distance when they share the same rank", () => {
    const headings = [
      makeHeading("far", 30, 2),
      makeHeading("near", 12, 2),
      makeHeading("middle", 20, 2),
    ];

    const result = buildRankedHeadingSuggestions(headings, 10).map(
      (item) => item.text,
    );

    expect(result).toEqual(["near", "middle", "far"]);
  });
});

describe("slugify", () => {
  it("slugifies text", () => {
    expect(slugify("Event Sourcing")).toBe("event-sourcing");
  });

  it("removes punctuation and collapses whitespace", () => {
    expect(slugify("  Hello, World!  ")).toBe("hello-world");
  });

  it("returns an empty string for empty input", () => {
    expect(slugify("")).toBe("");
  });
});
