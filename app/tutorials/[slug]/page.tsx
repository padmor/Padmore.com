import Link from "next/link";
import { notFound } from "next/navigation";
import { tutorials } from "@/lib/data";
import { TutorialArtwork } from "@/features/tutorials/components/tutorial-card";
import { Icon } from "@/components/icon";
export function generateStaticParams() { return tutorials.map((item) => ({ slug: item.slug })); }
export default async function TutorialPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tutorial = tutorials.find((item) => item.slug === slug);
  if (!tutorial) notFound();
  return <article className="page-container article-page"><Link href="/tutorials" className="back-link"><Icon name="arrow" size={15}/> Back to tutorials</Link><div className="article-header"><span className="eyebrow">{tutorial.category} · {tutorial.level}</span><h1>{tutorial.title}</h1><p>{tutorial.description}</p><div className="tutorial-meta"><span><Icon name="clock" size={14}/> {tutorial.minutes} min read</span><span>Learning note</span></div></div><div className="article-art"><TutorialArtwork visual={tutorial.visual}/></div><div className="article-layout"><aside className="article-toc"><strong>In this guide</strong><a href="#overview">Overview</a><a href="#principles">Key principles</a><a href="#practice">Try it yourself</a></aside><div className="article-body"><section id="overview"><h2>Overview</h2><p>This article page is a structured template for publishing a complete tutorial. Add your own researched explanation, examples and screenshots before publishing.</p></section><section id="principles"><h2>Key principles</h2><p>Start with the problem you want to solve, explain the concepts in a clear order, and use small examples that build on each other. Include common mistakes and explain why a particular approach works.</p><ul><li>Describe the goal before showing the implementation.</li><li>Keep examples focused and accessible.</li><li>Explain how to verify the result.</li></ul></section><section id="practice"><h2>Try it yourself</h2><p>Add a practical exercise, a small challenge or a related project. Link to source material when you publish a finished lesson.</p></section><div className="notice-box"><Icon name="info"/><p>Illustrative article template — replace this sample text with your own tutorial content.</p></div></div></div></article>;
}
