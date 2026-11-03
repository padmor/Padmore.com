import type { Metadata } from "next";
import { cache } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArticleBody } from "@/features/content/components/article-body";
import { getPublicTutorial } from "@/modules/content/repository";
import { CoverImage } from "@/features/content/components/site-image";
import { Icon } from "@/components/icon";
export const revalidate = 300;
// The page and its metadata share one lookup per request.
const loadTutorial = cache(getPublicTutorial);
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const found = await loadTutorial((await params).slug);
  return found ? { title: found.title, description: found.description, openGraph: { title: found.title, description: found.description } } : {};
}
export default async function TutorialPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tutorial = await loadTutorial(slug);
  if (!tutorial) notFound();
  return <article className="page-container article-page"><Link href="/tutorials" className="back-link"><Icon name="arrow" size={15}/> Back to tutorials</Link><div className="article-header"><span className="eyebrow">{tutorial.category} · {tutorial.level}</span><h1>{tutorial.title}</h1><p>{tutorial.description}</p><div className="tutorial-meta"><span><Icon name="clock" size={14}/> {tutorial.minutes} min read</span>{tutorial.videoUrl && <a className="text-link" href={tutorial.videoUrl} target="_blank" rel="noopener noreferrer">Watch the video</a>}</div></div><div className="article-art"><CoverImage id={tutorial.imageId} alt={tutorial.title}/></div><div className="article-body"><ArticleBody text={tutorial.body ?? ""}/></div></article>;
}
