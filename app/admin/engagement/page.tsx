import { MetricCard } from "@/features/analytics/components/metric-card";
import { requireRole } from "@/lib/auth/session";
import { getEngagementSnapshot } from "@/modules/analytics/engagement";

export const metadata = { title: "Engagement analytics" };
export const dynamic = "force-dynamic";

const cards = [
  ["page_view", "Page views", "Public page visits"],
  ["follow_added", "New follows", "Members who followed"],
  ["signup_submitted", "Sign-up submissions", "Accepted account-creation requests"],
  ["tutorial_open", "Tutorial opens", "Visits to published lessons"],
  ["project_open", "Project opens", "Visits to project details"],
  ["product_open", "Product views", "Visits to product details"],
  ["cart_added", "Cart additions", "Items added; not completed sales"],
  ["newsletter_subscribed", "New subscribers", "New email records; repeat submissions are excluded"],
  ["project_request_submitted", "Project enquiries", "Submitted project requests"],
  ["collaboration_submitted", "Collaboration requests", "Submitted expressions of interest"],
] as const;

export default async function EngagementPage() {
  await requireRole(["owner", "admin"]);
  const snapshot = await getEngagementSnapshot();

  return (
    <>
      <div className="admin-title-row">
        <div>
          <span className="eyebrow">LAST 30 DAYS</span>
          <h1>Engagement</h1>
          <p>See which parts of Padmore.com visitors are exploring and which actions they take.</p>
        </div>
      </div>

      {!snapshot.available ? (
        <div className="admin-panel engagement-setup-notice" role="status">
          <strong>Engagement tracking is ready in the code.</strong>
          <p>Apply database migration <code>0014_site_engagement_events.sql</code> to start collecting aggregate event counts. No personal visitor details are stored.</p>
        </div>
      ) : (
        <>
          <div className="admin-stats engagement-stats">
            {cards.map(([key, label, note]) => (
              <MetricCard key={key} label={label} value={String(snapshot.counts[key])} note={note}/>
            ))}
          </div>

          <section className="admin-panel engagement-pages">
            <div className="engagement-panel-heading">
              <div><h2>Most visited pages</h2><p>Public page views over the last 30 days.</p></div>
            </div>
            {snapshot.topPages.length ? (
              <ol>
                {snapshot.topPages.map((item) => (
                  <li key={item.pathname}>
                    <span>{item.pathname}</span>
                    <strong>{item.views.toLocaleString("en-GH")}</strong>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="muted-copy">Page views will appear here after the first visitor activity is recorded.</p>
            )}
          </section>
          <p className="engagement-privacy-note">Counts are event totals, not unique visitors. Cart additions are not purchases. Analytics does not store names, email addresses, IP addresses, referrers or device fingerprints.</p>
        </>
      )}
    </>
  );
}
