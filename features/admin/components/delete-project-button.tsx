"use client";
import { deleteProjectAction } from "@/modules/admin/actions";

export function DeleteProjectButton({ id, title }: { id: string; title: string }) {
  return <form action={deleteProjectAction.bind(null, id)} onSubmit={(event) => { if (!window.confirm(`Delete "${title}" permanently? This can't be undone.`)) event.preventDefault(); }}>
    <button className="button button-outline button-small admin-danger" type="submit">Delete project</button>
  </form>;
}
