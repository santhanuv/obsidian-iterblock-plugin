import { ParseErrors } from "./diagnostics";
import { ITERBLOCK_SPEC_VERSION, encodeSpec } from "./iterblock";

export function createNewTrackSnippetTemplate(
  track: string,
  lang: string = "Enter lang",
  snippet: string = "Enter snippet",
): string {
  if (snippet.trim().length === 0) {
    snippet = ParseErrors.specEmptySnippet();
  }

  if (!track) {
    track = "Enter track";
    return encodeSpec({
      specVersion: ITERBLOCK_SPEC_VERSION,
      track: `\${1:${escapeSnippetText(track)}}`,
      iter: 1,
      base: "",
      lang: `\${2:${escapeSnippetText(lang)}}`,
      snippet: `\${3}`,
    });
  } else {
    return encodeSpec({
      specVersion: ITERBLOCK_SPEC_VERSION,
      track: track,
      iter: 1,
      base: "",
      lang: `\${1:${escapeSnippetText(lang)}}`,
      snippet: `\${2}`,
    });
  }
}

function escapeSnippetText(text: string): string {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/\$/g, "\\$")
    .replace(/\}/g, "\\}");
}
