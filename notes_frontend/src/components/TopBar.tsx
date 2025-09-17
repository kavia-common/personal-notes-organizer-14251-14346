import { component$, Slot, useSignal, $ } from "@builder.io/qwik";
import type { QRL } from "@builder.io/qwik";

interface TopBarProps {
  onAddNote$?: QRL<() => void>;
  onSearch$?: QRL<(query: string) => void>;
}

/**
 * Top navigation bar with app title, search, and quick actions.
 */
// PUBLIC_INTERFACE
export default component$<TopBarProps>(({ onAddNote$, onSearch$ }) => {
  const q = useSignal("");

  // Wrap cross-scope usage in a QRL to satisfy qwik/valid-lexical-scope
  const submitSearch$ = $(() => {
    const query = q.value.trim();
    if (onSearch$) {
      onSearch$(query);
    }
  });

  return (
    <header class="app-topbar">
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
        <div
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "8px",
            display: "grid",
            placeItems: "center",
            background:
              "linear-gradient(135deg, rgba(37,99,235,0.15), rgba(255,255,255,1))",
            border: "1px solid #e5e7eb",
            boxShadow: "var(--shadow-sm)",
          }}
          aria-hidden="true"
        >
          📘
        </div>
        <strong style={{ fontWeight: 800, letterSpacing: "-0.02em" }}>
          Ocean Notes
        </strong>
      </div>

      <div
        class="container"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          justifyContent: "center",
        }}
      >
        <input
          class="input"
          style={{ maxWidth: "520px" }}
          placeholder="Search notes..."
          value={q.value}
          onInput$={(ev, el) => (q.value = (el as HTMLInputElement).value)}
          onKeyDown$={$((ev) => {
            if ((ev as KeyboardEvent).key === "Enter") submitSearch$();
          })}
          aria-label="Search notes"
        />
        <button class="btn ghost" onClick$={submitSearch$} aria-label="Search">
          Search
        </button>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <button
          class="btn"
          onClick$={$(() => {
            onAddNote$ && onAddNote$();
          })}
          aria-label="Add note"
        >
          + New
        </button>
        <button class="icon-btn" aria-label="User account">
          👤
        </button>
      </div>
      <Slot />
    </header>
  );
});
