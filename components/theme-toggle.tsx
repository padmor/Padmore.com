"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/icon";

export function ThemeToggle() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const saved = window.localStorage.getItem("padmore-theme");
    const isDark = saved === "dark";
    setDark(isDark);
    document.documentElement.dataset.theme = isDark ? "dark" : "light";
  }, []);
  function toggle() {
    const next = !dark;
    setDark(next);
    document.documentElement.dataset.theme = next ? "dark" : "light";
    window.localStorage.setItem("padmore-theme", next ? "dark" : "light");
  }
  return <button className="icon-button theme-toggle" type="button" onClick={toggle} aria-label={dark ? "Switch to light mode" : "Switch to dark mode"} title={dark ? "Light mode" : "Dark mode"}><Icon name={dark ? "sun" : "moon"} /></button>;
}
