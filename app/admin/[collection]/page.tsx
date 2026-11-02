import Link from "next/link";
import { notFound } from "next/navigation";
import { Icon } from "@/components/icon";
import { requireRole, type Role } from "@/lib/auth/session";
import { COLLECTIONS, isCollection } from "@/modules/admin/collections";
import { listContent } from "@/modules/admin/content-repository";

export const metadata = { title: "Manage content" };
export const dynamic = "force-dynamic";

const STATUS: Record<string, string> = { published: "public", draft: "draft", archived: "private" };

export default async function CollectionPage({ params }: { params: Promise<{ collection: string }> }) {
  const { collection: key } = await params;
  if (!isCollection(key)) notFound();
  const collection = COLLECTIONS[key];
  await requireRole(collection.roles as readonly Role[]);
  const items = await listContent(key);
  return <>
    <div className="admin-title-row">
      <div><span className="eyebrow">CONTENT</span><h1>{collection.label}</h1><p>{collection.intro} {items.length} in total.</p></div>
      <Link className="button button-primary button-small" href={`/admin/${key}/new`}><Icon name="plus" size={15}/> Add {collection.singular}</Link>
    </div>
    {items.length ? <div className="admin-table-wrap"><table className="admin-table">
      <thead><tr><th scope="col">Title</th><th scope="col">Visibility</th><th scope="col">Updated</th><th scope="col"><span className="sr-only">Actions</span></th></tr></thead>
      <tbody>{items.map((item) => <tr key={item.id}>
        <td className="admin-title-cell">{/* eslint-disable-next-line @next/next/no-img-element */}{Boolean(item.values.image_id) && <img className="admin-thumb" src={`/media/${item.values.image_id}`} alt="" loading="lazy"/>}<div><strong>{item.heading}</strong><br/><small>{item.note}</small></div></td>
        <td><span className={`admin-visibility admin-visibility-${STATUS[item.status] ?? "draft"}`}>{item.status}</span></td>
        <td>{new Date(item.updatedAt).toLocaleDateString("en-GB", { dateStyle: "medium", timeZone: "UTC" })}</td>
        <td><Link className="text-link" href={`/admin/${key}/${item.id}`}>Edit</Link></td>
      </tr>)}</tbody>
    </table></div> : <div className="dashboard-empty"><strong>Nothing here yet</strong><p>Add your first {collection.singular} to get started.</p></div>}
  </>;
}
