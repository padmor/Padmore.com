import { SiteImage } from "@/features/content/components/site-image";
import { Icon } from "@/components/icon";
import { ArticleBody } from "@/features/content/components/article-body";
import { listPublicUpdates } from "@/modules/content/repository";

export async function UpdateFeed() {
  const updates = await listPublicUpdates();
  if (!updates.length) return <div className="empty-state"><Icon name="clock"/><h3>No updates yet</h3><p>New notes from the work will appear here.</p></div>;
  return <div className="updates-feed">{updates.map((item) => <article className="update-card" key={item.slug}>
    {item.imageId && <SiteImage id={item.imageId}/>}<span className="update-type">{item.type}</span><h2>{item.title}</h2><ArticleBody text={item.text}/>
    <div className="update-meta"><span><Icon name="clock" size={14}/> {item.date}</span></div>
  </article>)}</div>;
}
