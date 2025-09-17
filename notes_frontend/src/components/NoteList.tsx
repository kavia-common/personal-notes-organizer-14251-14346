import { $, component$ } from "@builder.io/qwik";
import type { QRL } from "@builder.io/qwik";
import type { Note } from "~/lib/api";

interface NoteListProps {
  notes: Note[];
  selectedId?: string | null;
  onSelect$?: QRL<(id: string) => void>;
  onDelete$?: QRL<(id: string) => void>;
}

/**
 * Scrollable list of notes with basic metadata.
 */
// PUBLIC_INTERFACE
export default component$<NoteListProps>(
  ({ notes, selectedId, onSelect$, onDelete$ }) => {
    return (
      <div style={{ display: "grid", gap: "0.25rem" }}>
        {notes.length === 0 && (
          <div
            style={{
              padding: "0.75rem",
              color: "#6b7280",
              textAlign: "center",
            }}
          >
            No notes yet. Create your first note!
          </div>
        )}
        {notes.map((n) => (
          <div
            key={n.id}
            class={{
              "note-item": true,
              active: selectedId === n.id,
            }}
            onClick$={$(() => {
              onSelect$ && onSelect$(n.id);
            })}
            role="button"
            aria-pressed={selectedId === n.id}
            tabIndex={0}
            onKeyDown$={$((ev) => {
              if ((ev as KeyboardEvent).key === "Enter") {
                onSelect$ && onSelect$(n.id);
              }
            })}
          >
            <div class="note-title">{n.title || "Untitled"}</div>
            <button
              class="icon-btn"
              aria-label={`Delete ${n.title || "note"}`}
              onClick$={$((ev) => {
                (ev as MouseEvent).stopPropagation();
                onDelete$ && onDelete$(n.id);
              })}
              title="Delete note"
            >
              🗑️
            </button>
            <div class="note-meta">
              {new Date(n.updatedAt || n.createdAt).toLocaleString()}
            </div>
          </div>
        ))}
      </div>
    );
  },
);
