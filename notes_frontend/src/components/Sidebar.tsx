import { $, component$ } from "@builder.io/qwik";
import type { QRL } from "@builder.io/qwik";
import { Link, useLocation } from "@builder.io/qwik-city";

interface SidebarProps {
  onNewNote$?: QRL<() => void>;
}

/**
 * Sidebar navigation for quick access to sections.
 */
// PUBLIC_INTERFACE
export default component$<SidebarProps>(({ onNewNote$ }) => {
  const loc = useLocation();
  const isActive = (href: string) =>
    (loc.url.pathname || "/").replace(/\/+$/, "") === href.replace(/\/+$/, "");

  return (
    <aside class="app-sidebar">
      <button
        class="btn"
        style={{ width: "100%" }}
        onClick$={$(() => {
          onNewNote$ && onNewNote$();
        })}
      >
        + New Note
      </button>

      <div class="nav-section-title">General</div>
      <nav style={{ display: "grid", gap: "0.25rem" }}>
        <Link
          href="/"
          class={{ "nav-item": true, active: isActive("/") }}
          aria-label="All notes"
        >
          🗒️ <span>All Notes</span>
        </Link>
        <a class="nav-item" href="#" aria-disabled="true">
          ⭐ Favorites
        </a>
        <a class="nav-item" href="#" aria-disabled="true">
          🗄️ Archive
        </a>
        <a class="nav-item" href="#" aria-disabled="true">
          🗑️ Trash
        </a>
      </nav>

      <div class="nav-section-title">Tags</div>
      <div style={{ display: "grid", gap: "0.25rem" }}>
        <a class="nav-item" href="#" aria-disabled="true">
          🔖 Work
        </a>
        <a class="nav-item" href="#" aria-disabled="true">
          🔖 Personal
        </a>
        <a class="nav-item" href="#" aria-disabled="true">
          🔖 Ideas
        </a>
      </div>
    </aside>
  );
});
