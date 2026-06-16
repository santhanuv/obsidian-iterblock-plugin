export const ParseErrors = {
  invalidSpec: () => "Invalid Iterblock spec.",

  specMissingMetadataSep: () =>
    "Missing metadata separator ('---') in Iterblock spec.",

  invalidMetadata: () => "Invalid metadata in Iterblock spec.",

  specMissingOrInvalidField: (fieldName: string) =>
    `Missing or invalid '${fieldName}' field in Iterblock spec.`,

  specEmptySnippet: () =>
    "Snippet should contain at least one non-empty character.",
};
