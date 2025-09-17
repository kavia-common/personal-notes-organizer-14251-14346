import {
  component$,
  useSignal,
  useTask$,
  $,
  useVisibleTask$,
  type QRL,
} from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import TopBar from "~/components/TopBar";
import Sidebar from "~/components/Sidebar";
import NoteList from "~/components/NoteList";
import NoteEditor from "~/components/NoteEditor";
import {
  listNotes$,
  createNote$,
  updateNote$,
  deleteNote$,
  type Note,
  searchNotes$,
} from "~/lib/api";

// PUBLIC_INTERFACE
export default component$(() => {
  const notes = useSignal<Note[]>([]);
  const filtered = useSignal<Note[] | null>(null);
  const selectedId = useSignal<string | null>(null);
  const loading = useSignal(false);
  const error = useSignal<string | null>(null);

  const selectedNote = () =>
    (filtered.value ?? notes.value).find((n) => n.id === selectedId.value) ||
    null;

  const refresh$ = $(async () => {
    loading.value = true;
    error.value = null;
    try {
      const data = await listNotes$();
      // Sort by updatedAt desc
      notes.value = data.sort(
        (a, b) =>
          new Date(b.updatedAt || b.createdAt).getTime() -
          new Date(a.updatedAt || a.createdAt).getTime(),
      );
      filtered.value = null;
      // Select first if none selected
      if (!selectedId.value && notes.value.length > 0) {
        selectedId.value = notes.value[0].id;
      }
    } catch (e: any) {
      error.value = e?.message || "Failed to load notes";
    } finally {
      loading.value = false;
    }
  });

  useTask$(() => {
    // initial server-side render safe: do nothing heavy
  });

  useVisibleTask$(async () => {
    // client-side: fetch notes
    await refresh$();
  });

  const onAddNote$: QRL<() => Promise<void>> = $(async () => {
    // Only use primitives within this closure and inline values to avoid captures.
    const tmpId = `tmp-${Math.random().toString(36).slice(2)}`;
    const now = new Date().toISOString();

    // optimistic insert (inline constant values)
    notes.value = [
      {
        id: tmpId,
        title: "Untitled",
        content: "",
        tags: [],
        createdAt: now,
        updatedAt: now,
      },
      ...notes.value,
    ];
    selectedId.value = tmpId;

    try {
      // Inline same values when creating on server to avoid capturing identifiers
      const saved = await createNote$({
        title: "Untitled",
        content: "",
        tags: [],
      });
      // Replace the optimistic entry by matching tmpId
      notes.value = notes.value.map((n) => (n.id === tmpId ? saved : n));
      selectedId.value = saved.id;
    } catch (e: any) {
      // Rollback the optimistic entry using tmpId
      notes.value = notes.value.filter((n) => n.id !== tmpId);
      error.value = e?.message || "Failed to create note";
    }
  });

  const onSelect$: QRL<(id: string) => void> = $((id: string) => {
    selectedId.value = id;
  });

  const onDelete$: QRL<(id: string) => Promise<void>> = $(async (id: string) => {
    const prev = notes.value;
    notes.value = notes.value.filter((n) => n.id !== id);
    if (selectedId.value === id) {
      selectedId.value = notes.value[0]?.id ?? null;
    }
    try {
      await deleteNote$(id);
    } catch (e: any) {
      // rollback on error
      notes.value = prev;
      error.value = e?.message || "Failed to delete note";
    }
  });

  const onSave$: QRL<
    (payload: { title: string; content: string; tags?: string[] }) => Promise<void>
  > = $(async (payload) => {
    // Read selected id directly to avoid capturing a separate local variable.
    const currentId = selectedId.value;
    if (!currentId) return;

    // optimistic update
    const prev = notes.value;
    const now = new Date().toISOString();
    notes.value = notes.value.map((n) =>
      n.id === currentId ? { ...n, ...payload, updatedAt: now } : n,
    );
    try {
      const updated = await updateNote$(currentId, payload);
      notes.value = notes.value.map((n) => (n.id === currentId ? updated : n));
    } catch (e: any) {
      notes.value = prev;
      error.value = e?.message || "Failed to save note";
    }
  });

  const onSearch$: QRL<(q: string) => Promise<void>> = $(async (q: string) => {
    if (!q) {
      filtered.value = null;
      return;
    }
    try {
      const res = await searchNotes$(q);
      filtered.value = res;
      if (res.length > 0) {
        selectedId.value = res[0].id;
      } else {
        selectedId.value = null;
      }
    } catch (e: any) {
      error.value = e?.message || "Search failed";
    }
  });

  const list = () => filtered.value ?? notes.value;

  return (
    <div class="app-shell">
      <TopBar onAddNote$={onAddNote$} onSearch$={onSearch$} />
      <Sidebar onNewNote$={onAddNote$} />
      <main class="app-content">
        {error.value && (
          <div
            class="panel"
            style={{
              borderColor: "var(--color-error)",
              boxShadow: "var(--shadow-md)",
              marginBottom: "0.75rem",
            }}
            role="alert"
          >
            <div class="panel-header" style={{ color: "var(--color-error)" }}>
              ⚠️ {error.value}
            </div>
          </div>
        )}

        <div class="notes-split">
          <section class="panel" aria-label="Notes list">
            <div class="panel-header">
              <div style={{ fontWeight: 700 }}>Notes</div>
              <div class="editor-toolbar">
                <button class="icon-btn" onClick$={refresh$} title="Refresh">
                  🔄
                </button>
                <button class="icon-btn" onClick$={onAddNote$} title="New note">
                  ➕
                </button>
              </div>
            </div>
            <div class="panel-body">
              {loading.value ? (
                <div style={{ padding: "0.5rem", color: "#6b7280" }}>
                  Loading...
                </div>
              ) : (
                <NoteList
                  notes={list()}
                  selectedId={selectedId.value}
                  onSelect$={onSelect$}
                  onDelete$={onDelete$}
                />
              )}
            </div>
          </section>

          <section class="panel" aria-label="Note editor">
            <div class="panel-header" style={{ justifyContent: "space-between" }}>
              <div>
                <h2 class="editor-title" style={{ margin: 0 }}>
                  {selectedNote()?.title || "New Note"}
                </h2>
                <div style={{ fontSize: "0.8rem", color: "#6b7280" }}>
                  {selectedNote()
                    ? `Last edit ${new Date(
                        selectedNote()!.updatedAt || selectedNote()!.createdAt,
                      ).toLocaleString()}`
                    : "Draft"}
                </div>
              </div>
            </div>
            <div class="panel-body">
              <NoteEditor note={selectedNote()} onSave$={onSave$} />
            </div>
          </section>
        </div>
      </main>
    </div>
  );
});

export const head: DocumentHead = {
  title: "Ocean Notes",
  meta: [
    {
      name: "description",
      content:
        "A modern notes app with an ocean-themed UI. Create, edit, and organize your personal notes.",
    },
    { name: "theme-color", content: "#2563EB" },
  ],
};
