import { requireRole } from "@/lib/auth/session";
import { userDataApi } from "@/lib/db/data-api";

export const metadata = { title: "Subscribers" };
export const dynamic = "force-dynamic";

export default async function SubscribersPage() {
  await requireRole(["owner", "admin"]);
  const response = await userDataApi("newsletter_subscribers?select=id,email,status,created_at&order=created_at.desc&limit=500");
  if (!response?.ok) throw new Error("Could not load subscribers");
  const subscribers: { id: string; email: string; status: string; created_at: string }[] = await response.json();
  return <>
    <div className="admin-title-row"><div><span className="eyebrow">AUDIENCE</span><h1>Subscribers</h1><p>{subscribers.length} newsletter sign-ups. They stay pending until confirmation emails are switched on.</p></div></div>
    {subscribers.length ? <div className="admin-table-wrap"><table className="admin-table">
      <thead><tr><th scope="col">Email</th><th scope="col">Status</th><th scope="col">Signed up</th></tr></thead>
      <tbody>{subscribers.map((item) => <tr key={item.id}><td>{item.email}</td><td><span className="admin-visibility">{item.status}</span></td><td>{new Date(item.created_at).toLocaleDateString("en-GB", { dateStyle: "medium", timeZone: "UTC" })}</td></tr>)}</tbody>
    </table></div> : <div className="dashboard-empty"><strong>No subscribers yet</strong><p>Sign-ups from the website will appear here.</p></div>}
  </>;
}
