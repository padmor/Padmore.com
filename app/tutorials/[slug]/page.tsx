import type { Metadata } from "next";
import { cache } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { ArticleBody } from "@/features/content/components/article-body";
import { getPublicTutorial, listPublicTutorials } from "@/modules/content/repository";
import { listPublicTutorialFiles } from "@/modules/content/tutorial-files";
import { TutorialResources } from "@/features/tutorials/components/tutorial-resources";
import { FollowCard } from "@/features/follow/components/follow-card";
import { BookmarkButton } from "@/features/projects/components/bookmark-button";
import { CoverImage } from "@/features/content/components/site-image";
import { TutorialCard } from "@/features/tutorials/components/tutorial-card";
import { Icon } from "@/components/icon";

export const revalidate = 300;
const loadTutorial = cache(getPublicTutorial);

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const found = await loadTutorial((await params).slug);
  return found ? { title: found.title, description: found.description, openGraph: { title: found.title, description: found.description } } : {};
}

export default async function TutorialPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tutorial = await loadTutorial(slug);
  if (!tutorial) notFound();

  const [files, allTutorials] = await Promise.all([
    listPublicTutorialFiles(slug).catch(() => []),
    listPublicTutorials(8).catch(() => []),
  ]);
  const related = allTutorials.filter((item) => item.slug !== slug && item.category === tutorial.category).slice(0, 2);

  return (
    <article className="page-container article-page">
      <Link href="/tutorials" className="back-link"><Icon name="arrow" size={15}/> Back to tutorials</Link>
      <header className="article-header">
        <span className="eyebrow">{tutorial.category} · {tutorial.level}</span>
        <h1>{tutorial.title}</h1>
        <p>{tutorial.description}</p>
        <div className="tutorial-meta">
          <span><Icon name="clock" size={14}/> {tutorial.minutes} min read</span>
          {tutorial.videoUrl && <a className="text-link" href={tutorial.videoUrl} target="_blank" rel="noopener noreferrer">Watch the video</a>}
          <BookmarkButton id={slug} kind="tutorial" labelled/>
        </div>
      </header>
      <div className="article-art"><CoverImage id={tutorial.imageId} alt={tutorial.title}/></div>
      <div className="article-body"><ArticleBody text={tutorial.body ?? ""}/></div>
      <TutorialResources files={files}/>

      <section className="learning-next-step" aria-label="Continue learning">
        <div>
          <span className="eyebrow">KEEP BUILDING YOUR SKILLS</span>
          <h2>What would you like to learn next?</h2>
          <p>Save this guide, explore another lesson in ${tutorial.category}, or browse the full tutorial library.</p>
        </div>
        <Link className="button button-outline" href="/tutorials">Explore tutorials <ArrowRight aria-hidden="true"/></Link>
      </section>

      {related.length > 0 && (
        <section className="related-learning" aria-labelledby="related-learning-title">
          <div className="section-heading">
            <div><h2 id="related-learning-title">Continue with a related guide</h2><p>More lessons in ${tutorial.category}.</p></div>
          </div>
          <div className="tutorial-grid">{related.map((item) => <TutorialCard key={item.slug} tutorial={item}/>)}</div>
        </section>
      )}

      <FollowCard
        title="Want more practical guides like this?"
        text="Follow Padmore to find new projects and tutorials in your member dashboard. You can also save this guide and return to it later."
        action={<Link href="/community" className="button button-outline">Join the community <ArrowRight aria-hidden="true"/></Link>}
      />
    </article>
  );
}
