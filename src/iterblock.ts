import YAML from "yaml";
import { ParseErrors } from "./diagnostics";
import { Result } from "./result";

export const ITERBLOCK_SPEC_VERSION = "1.0.0";

export interface IterblockSpec {
  specVersion: string;
  track: string;
  iter: number;
  snippet: string;
  base: string;
  lang: string;
}

export function encodeSpec(spec: IterblockSpec): string {
  const { snippet, ...metadata } = spec;
  const yaml = YAML.stringify(metadata).trimEnd();

  return [`\`\`\`iterblock`, yaml, "---", snippet, `\`\`\``].join("\n");
}

export function decodeSpec(source: string): Result<IterblockSpec> {
  // MarkdownCodeBlockProcessor strips the fence before passing source for decoding.
  const lines = source.split("\n");

  const separatorIndex = lines.findIndex((line) => line.trim() === "---");
  if (separatorIndex === -1) {
    return {
      ok: false,
      error: ParseErrors.specMissingMetadataSep(),
    };
  }

  const metadataText = lines.slice(0, separatorIndex).join("\n");
  const snippet = lines.slice(separatorIndex + 1).join("\n");

  if (snippet.trim().length === 0) {
    return {
      ok: false,
      error: ParseErrors.specEmptySnippet(),
    };
  }

  let metadata;
  try {
    metadata = YAML.parse(metadataText) as unknown;
  } catch (e) {
    const message = (e as { message: string }).message;
    return {
      ok: false,
      error: `${ParseErrors.invalidSpec()}\n${message ?? "Check console for details."}`,
    };
  }

  if (typeof metadata !== "object" || metadata === null) {
    return {
      ok: false,
      error: ParseErrors.invalidMetadata(),
    };
  }

  const parsed = metadata as Partial<IterblockSpec>;

  if (typeof parsed.specVersion !== "string") {
    return {
      ok: false,
      error: ParseErrors.specMissingOrInvalidField("specVersion"),
    };
  }

  if (typeof parsed.track !== "string") {
    return {
      ok: false,
      error: ParseErrors.specMissingOrInvalidField("track"),
    };
  }

  if (!Number.isInteger(parsed.iter) || !parsed.iter || parsed.iter < 0) {
    return {
      ok: false,
      error: ParseErrors.specMissingOrInvalidField("iter"),
    };
  }

  // lang might be optional in the upstream spec, but for obsidian notes we can make this required
  // so that we don't accidently miss this field
  if (typeof parsed.lang !== "string") {
    return {
      ok: false,
      error: ParseErrors.specMissingOrInvalidField("lang"),
    };
  }

  if (parsed.base !== undefined && typeof parsed.base !== "string") {
    return {
      ok: false,
      error: ParseErrors.specMissingOrInvalidField("base"),
    };
  }

  const spec: IterblockSpec = {
    specVersion: parsed.specVersion,
    track: parsed.track,
    iter: parsed.iter,
    base: parsed.base ?? "",
    lang: parsed.lang ?? "",
    snippet: snippet,
  };

  return {
    ok: true,
    data: spec,
  };
}
