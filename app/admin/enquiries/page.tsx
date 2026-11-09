import { requireRole } from "@/lib/auth/session";
import { userDataApi } from "@/lib/db/data-api";
import { updateInquiryStatusAction } from "@/modules/admin/inbox";
import { SubmitButton } from "@/components/submit-button";

export const metadata = { title: "Enquiries" };
export const dynamic = "force-dynamic";

const STATUSES = [["new", "New"], ["reviewing", "Reviewing"], ["in_discussion", "In discussion"], ["accepted", "Accepted"], ["declined", "Declined"], ["completed", "Completed"], ["closed", "Closed"]] as const;
const KINDS: Record<string, string> = { general: "Contact", project: "Project request", collaboration: "Collaboration" };

type Enquiry = {
  id: string;
  kind: string;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  status: string;
  created_at: string;
  project_request_details: { project_type: string | null; project_scope: string | null } | null;
  collaboration_request_details: { collaboration_type: string | null; skills: string[] | null; availability: string | null; proposal: string | null } | null;
};

export default async function EnquiriesPage() {
  await requireRole(["owner", "admin", "support"]);
  const response = await userDataApi("inquiries?select=id,kind,name,email,subject,message,status,created_at,project_request_details(project_type,project_scope),collaboration_request_details(collaboration_type,skills,availability,proposal)&order=created_at.desc&limit=200");
  if (!response?.ok) throw new Error("Could not load enquiries");
  const enquiries: Enquiry[] = await response.json();
  return <>
    <div className="admin-title-row"><div><span className="eyebrow">INBOX</span><h1>Enquiries</h1><p>Messages from the contact, project request and Build With Me forms. {enquiries.length} in total.</p></div></div>
    {enquiries.length ? <div className="admin-enquiries">{enquiries.map((item) => {
      const project = item.project_request_details;
      const collaboration = item.collaboration_request_details;
      return <article className="admin-panel admin-enquiry" key={item.id}>
        <div className="row-between"><span className="eyebrow">{KINDS[item.kind] ?? item.kind}</span><time>{new Date(item.created_at).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" })} UTC</time></div>
        <h3>{item.subject || "No subject"}</h3>
        <p><strong>{item.name}</strong> · <a className="text-link" href={`mailto:${item.email}`}>{item.email}</a></p>
        <p className="admin-enquiry-text">{item.message}</p>
        {project && <p className="admin-enquiry-text"><strong>Type:</strong> {project.project_type}{project.project_scope ? `\n${project.project_scope}` : ""}</p>}
        {collaboration && <p className="admin-enquiry-text"><strong>Role:</strong> {collaboration.collaboration_type}{`\nSkills: ${collaboration.skills?.join(", ") ?? ""}\nAvailability: ${collaboration.availability ?? ""}`}{collaboration.proposal ? `\n${collaboration.proposal}` : ""}</p>}
        <form className="admin-status-form" action={updateInquiryStatusAction.bind(null, item.id)}>
          <label htmlFor={`status-${item.id}`}>Status</label>
          <select id={`status-${item.id}`} name="status" defaultValue={item.status}>{STATUSES.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
          <SubmitButton className="button button-outline button-small" type="submit">Update</SubmitButton>
        </form>
      </article>;
    })}</div> : <div className="dashboard-empty"><strong>No enquiries yet</strong><p>Messages sent through the website will appear here.</p></div>}
  </>;
}
