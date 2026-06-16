import { Editor, Plugin } from "obsidian";

import { EditorView } from "@codemirror/view";
import { createNewTrackSnippetTemplate } from "./template";
import { snippet } from "@codemirror/autocomplete";

export default class IterblockPlugin extends Plugin {
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

        const offset = editor.posToOffset(editor.getCursor());
        const suggestedtrackName = findNearestHeading(editor) ?? "";

        const template = createNewTrackSnippetTemplate(suggestedtrackName);
        const apply = snippet(template);
        apply(editorView, null, offset, offset);
      },
    });
  }
}

export function findNearestHeading(editor: Editor): string | null {
  const cursor = editor.getCursor();

  for (let line = cursor.line; line >= 0; line--) {
    const text = editor.getLine(line);

    const match = text.match(/^#+\s+(.*)$/);

    if (match && match[1]) {
      return match[1].trim().toLowerCase().replace(/\s+/g, "-");
    }
  }

  return null;
}
