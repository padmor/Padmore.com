"use client";
import { deleteProjectAction } from "@/modules/admin/actions";
import { SubmitButton } from "@/components/submit-button";

export function DeleteProjectButton({ id, title }: { id: string; title: string }) {
  return <form action={deleteProjectAction.bind(null, id)} onSubmit={(event) => { if (!window.confirm(`Delete "${title}" permanently? This can't be undone.`)) event.preventDefault(); }}>
    <SubmitButton className="button button-outline button-small admin-danger" type="submit">Delete project</SubmitButton>
  </form>;
}
