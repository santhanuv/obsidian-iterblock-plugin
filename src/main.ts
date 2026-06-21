import { Plugin, Notice } from "obsidian";

import { EditorView } from "@codemirror/view";
import { createNewTrackSnippetTemplate } from "./template";
import { snippet } from "@codemirror/autocomplete";
import { TrackSuggestionModel } from "./track-suggestion/modal";
import { buildRankedHeadingSuggestions } from "./track-suggestion/suggestion";

export default class IterblockPlugin extends Plugin {
  private activeTracks: Record<string, string> = {};

  async onload() {
    this.registerCommands();
  }

  onunload() {
    return;
  }

  private registerCommands() {
    this.addCommand({
      id: "iterblock-new-track",
      name: "Create new track",
      editorCallback: (editor, ctx) => {
        // @ts-expect-error
        const editorView = ctx.editor.cm as EditorView;

        const file = this.app.workspace.getActiveFile();
        if (!file) {
          new Notice("Active file not found");
          return;
        }

        const cache = this.app.metadataCache.getFileCache(file);
        const headings = cache?.headings ?? [];

        const suggestions = buildRankedHeadingSuggestions(
          headings,
          editor.getCursor().line,
        ).map((h) => slugify(h.text));

        new TrackSuggestionModel(this.app, suggestions, (value) => {
          const template = createNewTrackSnippetTemplate(value);
          const apply = snippet(template);

          const offset = editor.posToOffset(editor.getCursor());
          apply(editorView, null, offset, offset);
          this.activeTracks[file.path] = value;
        }).open();
      },
    });
  }
}

function slugify(text: string): string {
  if (!text) return "";

  return text
    .trim()
    .toLowerCase()
    .replace(/[^\w\s-]+/g, "")
    .replace(/[\s-]+/g, "-");
}
