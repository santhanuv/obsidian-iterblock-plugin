import { ParseErrors } from "./diagnostics";
import { IterblockSpec, ITERBLOCK_SPEC_VERSION, encodeSpec } from "./iterblock";

export function createNewTrackSnippetTemplate(
  track: string = "Enter track",
  lang: string = "Enter lang",
  snippet: string = "Enter snippet",
): string {
  if (snippet.trim().length === 0) {
    snippet = ParseErrors.specEmptySnippet();
  }

  const starterSpec: IterblockSpec = {
    specVersion: ITERBLOCK_SPEC_VERSION,
    track: `\${1:${escapeSnippetText(track)}}`,
    iter: 1,
    base: "",
    lang: `\${2:${escapeSnippetText(lang)}}`,
    snippet: `\${3:${escapeSnippetText(snippet)}}`,
  };

  return encodeSpec(starterSpec);
}

function escapeSnippetText(text: string): string {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/\$/g, "\\$")
    .replace(/\}/g, "\\}");
}
