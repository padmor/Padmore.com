import Link from "next/link";
import { notFound } from "next/navigation";
import { Icon } from "@/components/icon";
import { ContentForm } from "@/features/admin/components/content-form";
import { requireRole, type Role } from "@/lib/auth/session";
import { COLLECTIONS, isCollection } from "@/modules/admin/collections";

export const metadata = { title: "Add content" };
export const dynamic = "force-dynamic";

export default async function NewContentPage({ params }: { params: Promise<{ collection: string }> }) {
  const { collection: key } = await params;
  if (!isCollection(key)) notFound();
  const collection = COLLECTIONS[key];
  await requireRole(collection.roles as readonly Role[]);
  return <>
    <Link href={`/admin/${key}`} className="back-link"><Icon name="arrow" size={15}/> Back to {collection.label.toLowerCase()}</Link>
    <div className="admin-title-row"><div><h1>Add {collection.singular}</h1><p>Nothing appears on the site until you choose to show it.</p></div></div>
    <ContentForm collection={key}/>
  </>;
}
