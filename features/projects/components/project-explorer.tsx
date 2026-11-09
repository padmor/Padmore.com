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

  const hasFilters = Boolean(query.trim()) || category !== "All" || status !== "All statuses";
  const clearFilters = () => { setQuery(""); setCategory("All"); setStatus("All statuses"); };

  if (projects.length === 0) {
    return (
      <div className="empty-state explorer-empty-state">
        <span className="empty-icon"><Icon name="folder" size={24}/></span>
        <h3>Projects are being prepared</h3>
        <p>Published work will appear here with project details, progress and technology information.</p>
      </div>
    );
  }

  return (
    <div className="explorer-layout">
      <aside className="project-sidebar" aria-label="Project categories">
        <div className="project-sidebar-heading">
          <strong>Categories</strong>
          <span>{projects.length}</span>
        </div>
        {filters.map((filter) => (
          <button
            key={filter}
            type="button"
            onClick={() => setCategory(filter)}
            className={category === filter ? "side-filter active" : "side-filter"}
            aria-pressed={category === filter}
          >
            <span className="side-filter-indicator" aria-hidden="true">{category === filter ? "●" : "○"}</span>
            {filter}
          </button>
        ))}
      </aside>

      <div className="explorer-main">
        <div className="explorer-toolbar">
          <label className="search-box">
            <Icon name="search"/>
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search projects, features or technologies…" aria-label="Search projects"/>
          </label>
          <label className="select-wrap">
            <Icon name="filter"/>
            <select value={status} onChange={(event) => setStatus(event.target.value)} aria-label="Filter by status">
              {statuses.map((item) => <option key={item}>{item}</option>)}
            </select>
          </label>
        </div>

        <div className="result-line">
          <span aria-live="polite">Showing <strong>{filtered.length}</strong> of {projects.length} {projects.length === 1 ? "project" : "projects"}</span>
          {hasFilters && <button type="button" className="catalog-clear" onClick={clearFilters}>Clear filters <Icon name="close" size={13}/></button>}
        </div>

        {filtered.length > 0 ? (
          <div className="project-grid">{filtered.map((project) => <ProjectCard key={project.slug} project={project}/>)}</div>
        ) : (
          <div className="empty-state">
            <span className="empty-icon"><Icon name="search" size={24}/></span>
            <h3>No projects match those filters</h3>
            <p>Try another search term or choose a different category or status.</p>
            <button className="button button-secondary" type="button" onClick={clearFilters}>Reset filters</button>
          </div>
        )}
      </div>
    </div>
  );
}
