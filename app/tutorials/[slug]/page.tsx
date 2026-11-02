import Link from "next/link";
import { notFound } from "next/navigation";
import { TutorialArtwork } from "@/features/tutorials/components/tutorial-card";
import { ArticleBody } from "@/features/content/components/article-body";
import { getPublicTutorial } from "@/modules/content/repository";
import { SiteImage } from "@/features/content/components/site-image";
import { Icon } from "@/components/icon";
export const revalidate = 300;
export default async function TutorialPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tutorial = await getPublicTutorial(slug);
  if (!tutorial) notFound();
  return <article className="page-container article-page"><Link href="/tutorials" className="back-link"><Icon name="arrow" size={15}/> Back to tutorials</Link><div className="article-header"><span className="eyebrow">{tutorial.category} · {tutorial.level}</span><h1>{tutorial.title}</h1><p>{tutorial.description}</p><div className="tutorial-meta"><span><Icon name="clock" size={14}/> {tutorial.minutes} min read</span>{tutorial.videoUrl && <a className="text-link" href={tutorial.videoUrl} target="_blank" rel="noopener noreferrer">Watch the video</a>}</div></div><div className="article-art">{tutorial.imageId ? <SiteImage id={tutorial.imageId} alt={tutorial.title}/> : <TutorialArtwork visual={tutorial.visual}/>}</div><div className="article-body"><ArticleBody text={tutorial.body ?? ""}/></div></article>;
}
