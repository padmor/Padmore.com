import type { Tutorial } from "@/lib/data";
import { CoverImage } from "@/features/content/components/site-image";
import { Icon } from "@/components/icon";
import { BookmarkButton } from "@/features/projects/components/bookmark-button";
import { trackEngagement } from "@/lib/engagement/client";
import { RecentlyViewedLink } from "@/features/engagement/components/recently-viewed";

export function TutorialCard({ tutorial }: { tutorial: Tutorial }) {
  return <article className="tutorial-card"><RecentlyViewedLink kind="tutorial" slug={tutorial.slug} title={tutorial.title} href={`/tutorials/${tutorial.slug}`} className="tutorial-image-link" onClick={() => trackEngagement("tutorial_open", `/tutorials/${tutorial.slug}`, tutorial.slug)}><CoverImage id={tutorial.imageId}/></RecentlyViewedLink><div className="tutorial-card-content"><span className="eyebrow">{tutorial.category}</span><h3><RecentlyViewedLink kind="tutorial" slug={tutorial.slug} title={tutorial.title} href={`/tutorials/${tutorial.slug}`} onClick={() => trackEngagement("tutorial_open", `/tutorials/${tutorial.slug}`, tutorial.slug)}>{tutorial.title}</RecentlyViewedLink></h3><p>{tutorial.description}</p><div className="tutorial-meta"><span><Icon name="clock" size={14}/> {tutorial.minutes} min read</span><span>{tutorial.level}</span>{tutorial.resources?.map((label) => <span className="tutorial-resource" key={label}>{label}</span>)}<span style={{ marginLeft: "auto" }}><BookmarkButton id={tutorial.slug} kind="tutorial"/></span></div></div></article>;
}
