"use client";

import { useEffect, useSyncExternalStore, useTransition } from "react";
import { Icon } from "@/components/icon";
import { useAuthPrompt } from "@/features/community/components/auth-prompt";
import { importLocalBookmarksAction, toggleSavedAction } from "@/modules/saved/actions";

// Saved items belong to the account. Every button on the page shares one lookup of
// what is saved, instead of each card asking on its own.
type Store = { ready: boolean; signedIn: boolean; items: ReadonlySet<string> };
const EMPTY: Store = { ready: false, signedIn: false, items: new Set() };
const LEGACY_KEY = "padmore-bookmarks-v1";

let store: Store = EMPTY;
let loading: Promise<void> | null = null;
const listeners = new Set<() => void>();
const publish = (next: Store) => { store = next; listeners.forEach((listener) => listener()); };
const subscribe = (listener: () => void) => { listeners.add(listener); return () => { listeners.delete(listener); }; };

async function fetchState() {
  const response = await fetch("/saved-state", { cache: "no-store" });
  if (!response.ok) throw new Error("state");
  return (await response.json()) as { signedIn: boolean; items: string[] };
}

function legacyBookmarks(): string[] {
  try { const list = JSON.parse(localStorage.getItem(LEGACY_KEY) || "[]"); return Array.isArray(list) ? list.filter((value): value is string => typeof value === "string") : []; } catch { return []; }
}

function load() {
  loading ??= (async () => {
    try {
      let state = await fetchState();
      // Bookmarks kept in this browser before accounts could save them move to the account once.
      const local = state.signedIn ? legacyBookmarks() : [];
      if (local.length > 0) {
        await importLocalBookmarksAction(local).catch(() => null);
        try { localStorage.removeItem(LEGACY_KEY); } catch { /* the move is a convenience */ }
        state = await fetchState();
      }
      publish({ ready: true, signedIn: state.signedIn, items: new Set(state.items) });
    } catch {
      publish({ ready: true, signedIn: false, items: new Set() });
    }
  })();
  return loading;
}

// Whether this visitor is signed in, for any control that depends on it.
export function useMemberState() {
  const state = useSyncExternalStore(subscribe, () => store, () => EMPTY);
  useEffect(() => { void load(); }, []);
  return state;
}

export function BookmarkButton({ id, kind = "project", labelled = false }: { id: string; kind?: "project" | "tutorial"; labelled?: boolean }) {
  const ask = useAuthPrompt();
  const state = useSyncExternalStore(subscribe, () => store, () => EMPTY);
  const [pending, start] = useTransition();
  useEffect(() => { void load(); }, []);

  const key = `${kind}:${id}`;
  const saved = state.items.has(key);

  function toggle() {
    if (!state.ready) return;
    if (!state.signedIn) return ask("save this");
    const before = state;
    const next = new Set(before.items);
    if (saved) next.delete(key); else next.add(key);
    publish({ ...before, items: next });
    start(async () => {
      const result = await toggleSavedAction(kind, id);
      if ("error" in result) { publish({ ...store, items: before.items }); return; }
      const settled = new Set(store.items);
      if (result.saved) settled.add(key); else settled.delete(key);
      publish({ ...store, items: settled });
    });
  }

  const label = saved ? "Remove from saved" : `Save this ${kind}`;
  if (labelled) return <button className="button button-outline" type="button" onClick={toggle} disabled={!state.ready || pending} aria-busy={pending} aria-pressed={saved} aria-label={label}><Icon name="bookmark" size={16}/>{saved ? "Saved" : "Save"}</button>;
  return <button className={`icon-button bookmark-button${saved ? " is-saved" : ""}`} type="button" onClick={toggle} disabled={!state.ready || pending} aria-busy={pending} aria-label={label} aria-pressed={saved}><Icon name="bookmark" size={16}/></button>;
}
