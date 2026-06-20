import { HeadingCache } from "obsidian";

const DEFAULT_HEADING_RANK = 10;
const ANCESTOR_HEADING_RANK = 100;
const PEER_HEADING_RANK = 50;
const ANCESTOR_HEADING_MULTIPLIER = 10;
const PEER_HEADING_MULTIPLIER = 5;
const MAX_HEADING_LEVEL = 6;

export interface SuggestionEnvelope {
  text: string;
  rank: number;
  distance: number;
}

export function buildRankedHeadingSuggestions(
  headings: HeadingCache[],
  cursorLine: number,
): SuggestionEnvelope[] {
  const envelopes: SuggestionEnvelope[] = [];

  const chronologicHeadings = [...headings].sort(
    (a, b) => a.position.start.line - b.position.start.line,
  );

  let currentMinLevel = MAX_HEADING_LEVEL + 1;

  for (let i = chronologicHeadings.length - 1; i >= 0; i--) {
    const heading = chronologicHeadings[i];
    if (!heading) continue;

    const headingLine = heading.position.start.line;
    const distance = Math.abs(cursorLine - headingLine);

    let rank = DEFAULT_HEADING_RANK;

    if (headingLine < cursorLine) {
      if (heading.level < currentMinLevel) {
        // Multipliers space out the scores so we can add small bonuses later (like tags)
        // without accidentally outranking more important headings.
        rank =
          ANCESTOR_HEADING_RANK + heading.level * ANCESTOR_HEADING_MULTIPLIER;
        currentMinLevel = heading.level;
      } else {
        rank = PEER_HEADING_RANK + heading.level * PEER_HEADING_MULTIPLIER;
      }
    }

    envelopes.push({
      text: heading.heading,
      rank,
      distance,
    });
  }

  return envelopes.sort((a, b) => {
    if (a.rank !== b.rank) {
      return b.rank - a.rank;
    }
    return a.distance - b.distance;
  });
}
