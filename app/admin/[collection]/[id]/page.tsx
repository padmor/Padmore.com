import Link from "next/link";
import { notFound } from "next/navigation";
import { Icon } from "@/components/icon";
import { ContentForm, DeleteContentButton } from "@/features/admin/components/content-form";
import { requireRole, type Role } from "@/lib/auth/session";
import { COLLECTIONS, isCollection } from "@/modules/admin/collections";
import { getContent } from "@/modules/admin/content-repository";
import { projectIdSchema } from "@/modules/admin/validation";

export const metadata = { title: "Edit content" };
export const dynamic = "force-dynamic";

export default async function EditContentPage({ params }: { params: Promise<{ collection: string; id: string }> }) {
  const { collection: key, id } = await params;
  if (!isCollection(key)) notFound();
  const collection = COLLECTIONS[key];
  await requireRole(collection.roles as readonly Role[]);
  if (!projectIdSchema.safeParse(id).success) notFound();
  const item = await getContent(key, id);
  if (!item) notFound();
  return <>
    <Link href={`/admin/${key}`} className="back-link"><Icon name="arrow" size={15}/> Back to {collection.label.toLowerCase()}</Link>
    <div className="admin-title-row"><div><h1>{item.heading}</h1><p>Public changes appear on the site as soon as you save.</p></div><DeleteContentButton collection={key} id={item.id} title={item.heading}/></div>
    <ContentForm collection={key} id={item.id} values={item.values}/>
  </>;
}
