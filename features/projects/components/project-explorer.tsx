"use client";

import { useMemo, useState } from "react";
import type { Project } from "@/lib/data";
import { ProjectCard } from "@/features/projects/components/project-card";
import { Icon } from "@/components/icon";

const statuses = ["All statuses", "Idea", "Planning", "In Progress", "Testing", "Beta", "Live", "Paused", "Completed"];

export function ProjectExplorer({ projects }: { projects: Project[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const filters = ["All", ...new Set(projects.map((project) => project.category))];
  const [status, setStatus] = useState("All statuses");
  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return projects.filter((project) => {
      const matchesQuery = !normalized || `${project.title} ${project.description} ${project.stack.join(" ")}`.toLowerCase().includes(normalized);
      const matchesCategory = category === "All" || project.category === category;
      const matchesStatus = status === "All statuses" || project.status === status;
      return matchesQuery && matchesCategory && matchesStatus;
    });
  }, [projects, query, category, status]);

  return <div className="explorer-layout">
    <aside className="project-sidebar"><strong>Categories</strong>{filters.map((filter) => <button key={filter} onClick={() => setCategory(filter)} className={category === filter ? "side-filter active" : "side-filter"}><span>{filter === "All" ? "◉" : "○"}</span>{filter}</button>)}</aside>
    <div className="explorer-main">
      <div className="explorer-toolbar"><label className="search-box"><Icon name="search"/><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search projects..." aria-label="Search projects"/></label><label className="select-wrap"><Icon name="filter"/><select value={status} onChange={(event) => setStatus(event.target.value)} aria-label="Filter by status">{statuses.map((item) => <option key={item}>{item}</option>)}</select></label></div>
      <div className="result-line"><span>{filtered.length} projects</span></div>
      {filtered.length ? <div className="project-grid">{filtered.map((project) => <ProjectCard key={project.slug} project={project}/>)}</div> : <div className="empty-state"><span className="empty-icon"><Icon name="search" size={24}/></span><h3>No projects found</h3><p>Try another search term or clear the selected filters.</p><button className="button button-secondary" onClick={() => { setQuery(""); setCategory("All"); setStatus("All statuses"); }}>Clear filters</button></div>}
    </div>
  </div>;
}
