"use client";
import { useMemo, useState } from "react";
import { tutorials } from "@/lib/data";
import { TutorialCard } from "@/features/tutorials/components/tutorial-card";
import { Icon } from "@/components/icon";
const categories = ["All", "Web Development", "Design", "Programming", "Backend", "Tools"];
export function TutorialExplorer() {
  const [category, setCategory] = useState("All");
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => tutorials.filter((item) => (category === "All" || item.category === category) && `${item.title} ${item.description}`.toLowerCase().includes(query.toLowerCase())), [category, query]);
  return <><div className="catalog-toolbar"><label className="search-box"><Icon name="search"/><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search tutorials..." aria-label="Search tutorials"/></label><div className="filter-pills">{categories.map((item) => <button key={item} className={category === item ? "filter-pill active" : "filter-pill"} onClick={() => setCategory(item)}>{item}</button>)}</div></div>{filtered.length ? <div className="tutorial-grid">{filtered.map((tutorial) => <TutorialCard key={tutorial.slug} tutorial={tutorial}/>)}</div> : <div className="empty-state"><Icon name="search"/><h3>No tutorials found</h3><p>Try another search or topic.</p></div>}</>;
}
