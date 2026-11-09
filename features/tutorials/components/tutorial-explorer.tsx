"use client";

import { useMemo, useState } from "react";
import type { Tutorial } from "@/lib/data";
import { TutorialCard } from "@/features/tutorials/components/tutorial-card";
import { Icon } from "@/components/icon";

export function TutorialExplorer({ tutorials }: { tutorials: Tutorial[] }) {
  const [category, setCategory] = useState("All");
  const [query, setQuery] = useState("");
  const categories = ["All", ...new Set(tutorials.map((item) => item.category))];
  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return tutorials.filter((item) =>
      (category === "All" || item.category === category) &&
      `${item.title} ${item.description}`.toLowerCase().includes(normalized)
    );
  }, [tutorials, category, query]);

  const hasFilters = Boolean(query.trim()) || category !== "All";
  const clearFilters = () => { setQuery(""); setCategory("All"); };

  if (!tutorials.length) {
    return (
      <div className="empty-state">
        <span className="empty-icon"><Icon name="book" size={24}/></span>
        <h3>Tutorials are on the way</h3>
        <p>Practical guides and learning resources will appear here as soon as they are published.</p>
      </div>
    );
  }

  return (
    <>
      <div className="catalog-toolbar">
        <label className="search-box">
          <Icon name="search"/>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search tutorials and topics…" aria-label="Search tutorials"/>
        </label>
        <div className="filter-pills" role="group" aria-label="Filter tutorials by category">
          {categories.map((item) => (
            <button key={item} type="button" className={category === item ? "filter-pill active" : "filter-pill"} aria-pressed={category === item} onClick={() => setCategory(item)}>
              {item}
            </button>
          ))}
        </div>
      </div>

      <div className="result-line">
        <span aria-live="polite">Showing <strong>{filtered.length}</strong> of {tutorials.length} {tutorials.length === 1 ? "guide" : "guides"}</span>
        {hasFilters && <button type="button" className="catalog-clear" onClick={clearFilters}>Clear filters <Icon name="close" size={13}/></button>}
      </div>

      {filtered.length > 0 ? (
        <div className="tutorial-grid">{filtered.map((tutorial) => <TutorialCard key={tutorial.slug} tutorial={tutorial}/>)}</div>
      ) : (
        <div className="empty-state">
          <span className="empty-icon"><Icon name="search" size={24}/></span>
          <h3>No tutorials match that search</h3>
          <p>Try a different term or browse all topics.</p>
          <button type="button" className="button button-secondary" onClick={clearFilters}>Reset filters</button>
        </div>
      )}
    </>
  );
}
