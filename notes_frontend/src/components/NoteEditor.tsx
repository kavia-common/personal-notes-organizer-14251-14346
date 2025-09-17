import { $, component$, useSignal, useTask$ } from "@builder.io/qwik";
import type { QRL } from "@builder.io/qwik";
import type { Note } from "~/lib/api";

interface NoteEditorProps {
  note?: Note | null;
  onSave$?: QRL<
    (payload: { title: string; content: string; tags?: string[] }) => void
  >;
}

/**
 * Editor for a single note with title and content fields.
 */
// PUBLIC_INTERFACE
export default component$<NoteEditorProps>(({ note, onSave$ }) => {
  const title = useSignal(note?.title ?? "");
  const content = useSignal(note?.content ?? "");
  const tagsStr = useSignal((note?.tags ?? []).join(", "));

  useTask$(({ track }) => {
    track(() => note?.id);
    title.value = note?.title ?? "";
    content.value = note?.content ?? "";
    tagsStr.value = (note?.tags ?? []).join(", ");
  });

  return (
    <div class="editor-body">
      <div style={{ display: "grid", gap: "0.5rem" }}>
        <input
          class="input"
          placeholder="Note title"
          value={title.value}
          onInput$={(_, el) => (title.value = (el as HTMLInputElement).value)}
          aria-label="Note title"
        />
        <textarea
          class="textarea"
          placeholder="Write your note here..."
          value={content.value}
          onInput$={(_, el) =>
            (content.value = (el as HTMLTextAreaElement).value)
          }
          aria-label="Note content"
        />
        <input
          class="input"
          placeholder="Tags (comma separated)"
          value={tagsStr.value}
          onInput$={(_, el) => (tagsStr.value = (el as HTMLInputElement).value)}
          aria-label="Note tags"
        />
      </div>
      <div class="editor-toolbar" style={{ justifyContent: "flex-end" }}>
        <button
          class="btn"
          onClick$={$(() => {
            const tags = tagsStr.value
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean);
            if (onSave$) {
              onSave$({
                title: title.value.trim() || "Untitled",
                content: content.value,
                tags,
              });
            }
          })}
          aria-label="Save note"
        >
          💾 Save
        </button>
      </div>
    </div>
  );
});
