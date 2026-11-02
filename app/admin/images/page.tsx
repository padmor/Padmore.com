import Link from "next/link";
import { requireRole } from "@/lib/auth/session";
import { userDataApi } from "@/lib/db/data-api";
import { getAboutForEditing } from "@/modules/admin/content-repository";
import { listImages } from "@/modules/admin/images";

export const metadata = { title: "Attached images" };
export const dynamic = "force-dynamic";

type Attachment = { label: string; title: string; href: string };

async function attached(path: string, read: (row: Record<string, string>) => Attachment) {
  const response = await userDataApi(`${path}&image_id=not.is.null&limit=500`);
  if (!response?.ok) return [];
  const rows: Record<string, string>[] = await response.json();
  return rows.map((row) => [row.image_id, read(row)] as const);
}

export default async function AttachedImagesPage() {
  await requireRole(["owner", "admin", "editor"]);
  const [images, about, ...groups] = await Promise.all([
    listImages(),
    getAboutForEditing().catch(() => null),
    attached("projects?select=id,title,image_id", (row) => ({ label: "Project", title: row.title, href: `/admin/projects/${row.id}` })),
    attached("posts?select=id,title,content_type,image_id", (row) => row.content_type === "tutorial"
      ? { label: "Tutorial", title: row.title, href: `/admin/tutorials/${row.id}` }
      : { label: "Update", title: row.title, href: `/admin/updates/${row.id}` }),
    attached("products?select=id,title,image_id", (row) => ({ label: "Store", title: row.title, href: `/admin/products/${row.id}` })),
    attached("achievements?select=id,title,image_id", (row) => ({ label: "Achievement", title: row.title, href: `/admin/achievements/${row.id}` })),
    attached("opportunities?select=id,title,image_id", (row) => ({ label: "Opportunity", title: row.title, href: `/admin/opportunities/${row.id}` })),
  ]);
  const usage = new Map(groups.flat());
  if (about?.photo_id) usage.set(about.photo_id, { label: "About me", title: "Profile image", href: "/admin/about" });

  return <>
    <div className="admin-title-row"><div><span className="eyebrow">MEDIA</span><h1>Attached images</h1><p>{images.length} {images.length === 1 ? "image" : "images"}. To attach one, open the item it belongs to.</p></div></div>
    {images.length ? <div className="admin-gallery">{images.map((image) => {
      const use = usage.get(image.id);
      return <article className="admin-gallery-item" key={image.id}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <a href={`/media/${image.id}`} target="_blank" rel="noopener noreferrer" aria-label="Open full size"><img src={`/media/${image.id}`} alt={use?.title ?? "Unattached image"} loading="lazy"/></a>
        <div>
          {use ? <><span className="eyebrow">{use.label}</span><Link className="text-link" href={use.href}>{use.title}</Link></> : <span className="muted-copy">Not attached to anything</span>}
          <small>{new Date(image.created_at).toLocaleDateString("en-GB", { dateStyle: "medium", timeZone: "UTC" })}</small>
        </div>
      </article>;
    })}</div> : <div className="dashboard-empty"><strong>No images yet</strong><p>Images you attach to projects, tutorials and other items will appear here.</p></div>}
  </>;
}
