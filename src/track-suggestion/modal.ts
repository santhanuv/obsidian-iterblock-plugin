import { App, Modal, TextComponent } from "obsidian";

export class TrackSuggestionModel extends Modal {
  private typedValue!: string;
  private isAutocompletion = false;

  constructor(
    app: App,
    private suggestions: string[],
    private onSubmit: (value: string) => void,
  ) {
    super(app);
  }

  onOpen() {
    const { modalEl } = this;
    modalEl.empty();
    modalEl.removeAttribute("class");
    modalEl.addClass("iterblock-modal");

    const inputContainer = modalEl.createDiv({
      cls: "iterblock-modal-container",
    });

    const input = new TextComponent(inputContainer);
    input.inputEl.addClass("iterblock-modal-input");
    input.setPlaceholder("Enter track");
    input.setValue(this.suggestions[0] ?? "");

    this.setupAutocomplete(input.inputEl);

    input.inputEl.focus();
    input.inputEl.select();

    const instruct = modalEl.createDiv({ cls: "iterblock-modal-instruction" });
    instruct.createSpan({
      text: "Enter a track name. The new track becomes active.",
    });
  }

  private setupAutocomplete(inputEl: HTMLInputElement): void {
    inputEl.addEventListener("keydown", (e: KeyboardEvent) => {
      const selStart = inputEl.selectionStart ?? 0;
      const selEnd = inputEl.selectionEnd ?? 0;
      const hasCompletion = this.isAutocompletion && selStart < selEnd;

      switch (e.key) {
        case "Tab":
        case "ArrowRight":
          if (hasCompletion) {
            inputEl.setSelectionRange(selEnd, selEnd);
            this.typedValue = inputEl.value;
            this.isAutocompletion = false;
            e.preventDefault();
          }
          break;

        case "ArrowLeft":
          if (hasCompletion) {
            inputEl.value = this.typedValue;
            inputEl.setSelectionRange(selStart, selStart);
            this.isAutocompletion = false;
            e.preventDefault();
          }
          break;

        case "Backspace":
          if (hasCompletion) {
            inputEl.value = this.typedValue;
            inputEl.setSelectionRange(
              this.typedValue.length,
              this.typedValue.length,
            );
            this.isAutocompletion = false;
            e.preventDefault();
          }
          break;

        case "Enter":
          this.onSubmit(inputEl.value);
          this.close();
          e.preventDefault();
          break;

        case "Escape":
          this.close();
          e.preventDefault();
          e.stopPropagation();
          break;
      }
    });

    inputEl.addEventListener("input", () => {
      this.isAutocompletion = false;

      const val = inputEl.value;
      const cursorPos = inputEl.selectionStart ?? val.length;

      if (cursorPos !== val.length) return;

      // If value got shorter, user deleted — don't re-autocomplete
      if (this.typedValue && val.length < this.typedValue.length) {
        this.typedValue = val;
        return;
      }

      this.typedValue = val;
      if (!this.typedValue) return;

      const lowerTyped = this.typedValue.toLowerCase();
      const match = this.suggestions.find(
        (s) =>
          s.toLowerCase().startsWith(lowerTyped) &&
          s.length > this.typedValue.length,
      );

      if (match) {
        const completion = match.substring(this.typedValue.length);
        inputEl.value = this.typedValue + completion;
        inputEl.setSelectionRange(this.typedValue.length, inputEl.value.length);
        this.isAutocompletion = true;
      }
    });
  }
}
