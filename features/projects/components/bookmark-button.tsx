"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/icon";

const KEY = "padmore-bookmarks-v1";
export function BookmarkButton({ id }: { id: string }) {
  const [saved, setSaved] = useState(false);
  useEffect(() => {
    try { setSaved((JSON.parse(localStorage.getItem(KEY) || "[]") as string[]).includes(id)); } catch { setSaved(false); }
  }, [id]);
  function toggle() {
    let list: string[] = [];
    try { list = JSON.parse(localStorage.getItem(KEY) || "[]") as string[]; } catch { list = []; }
    const next = list.includes(id) ? list.filter((value) => value !== id) : [...list, id];
    localStorage.setItem(KEY, JSON.stringify(next));
    setSaved(next.includes(id));
  }
  return <button className={`icon-button bookmark-button${saved ? " is-saved" : ""}`} type="button" onClick={toggle} aria-label={saved ? "Remove bookmark" : "Save project"} aria-pressed={saved}><Icon name="bookmark" size={16}/></button>;
}
