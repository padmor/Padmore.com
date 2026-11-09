"use client";
import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import { ArrowBigUp, MessageSquare, Send, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useSignInRedirect } from "./auth-prompt";
import { createReplyAction, deletePostAction, deleteReplyAction, toggleVoteAction, type CommunityFormState } from "@/modules/community/actions";
import { SubmitButton } from "@/components/submit-button";

export type PostView = {
  id: string;
  userId: string;
  authorName: string;
  title: string | null;
  body: string;
  ago: string;
  createdAt: string;
  votes: number;
  voted: boolean;
  replies: { id: string; userId: string; authorName: string; body: string; ago: string; createdAt: string }[];
};

const TONES = ["bg-primary-soft text-primary", "bg-success-soft text-success", "bg-violet-soft text-violet", "bg-warning-soft text-warning", "bg-cyan-soft text-cyan"];
const tone = (name: string) => TONES[[...name].reduce((sum, char) => sum + char.charCodeAt(0), 0) % TONES.length];

function Avatar({ name }: { name: string }) {
  return <span aria-hidden="true" className={cn("grid size-6 shrink-0 place-items-center rounded-full text-[11px] font-semibold", tone(name))}>{name.slice(0, 1).toUpperCase()}</span>;
}

function Meta({ name, ago, iso, mine }: { name: string; ago: string; iso: string; mine: boolean }) {
  return <p className="m-0 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
    <Avatar name={name}/>
    <span className="font-semibold text-foreground">{name}</span>
    {mine && <span className="rounded-full bg-primary-soft px-2 py-0.5 text-[11px] font-semibold text-primary">You</span>}
    <span aria-hidden="true">·</span>
    <time dateTime={iso}>{ago}</time>
  </p>;
}

function confirmDelete(message: string) {
  return (event: React.FormEvent<HTMLFormElement>) => { if (!window.confirm(message)) event.preventDefault(); };
}

// The upvote rail on the left of every post: an arrow and the running count.
function VoteRail({ postId, votes, voted, signedIn }: { postId: string; votes: number; voted: boolean; signedIn: boolean }) {
  const [state, setState] = useState({ votes, voted });
  const [pending, start] = useTransition();
  const [error, setError] = useState("");
  const ask = useSignInRedirect();

  function toggle() {
    if (!signedIn) return ask("vote");
    const before = state;
    setError("");
    setState({ voted: !before.voted, votes: before.votes + (before.voted ? -1 : 1) });
    start(async () => {
      const result = await toggleVoteAction(postId);
      if ("error" in result) { setState(before); setError(result.error); } else setState(result);
    });
  }

  return <div className="flex w-10 shrink-0 flex-col items-center gap-0.5 sm:w-11">
    <button type="button" onClick={toggle} disabled={pending} aria-busy={pending} aria-pressed={signedIn ? state.voted : undefined} aria-label={state.voted ? "Remove upvote" : "Upvote this post"}
      className={cn("grid size-9 place-items-center rounded-xl transition active:scale-90", state.voted ? "bg-primary-soft text-primary" : "text-muted-foreground hover:bg-muted hover:text-primary")}>
      <ArrowBigUp className={cn("size-6 transition", state.voted && "fill-current")}/>
    </button>
    <span className={cn("text-sm font-semibold tabular-nums", state.voted ? "text-primary" : "text-foreground")} aria-label={`${state.votes} ${state.votes === 1 ? "upvote" : "upvotes"}`}>{state.votes}</span>
    {error && <span role="alert" className="sr-only">{error}</span>}
  </div>;
}

const initial: CommunityFormState = {};

function ReplyForm({ postId }: { postId: string }) {
  const [state, action, pending] = useActionState(createReplyAction, initial);
  const form = useRef<HTMLFormElement>(null);
  useEffect(() => { if (state.sent) form.current?.reset(); }, [state.sent]);
  return <form ref={form} action={action} className="flex items-start gap-2">
    <input type="hidden" name="postId" value={postId}/>
    <label className="sr-only" htmlFor={`reply-${postId}`}>Write a reply</label>
    <input id={`reply-${postId}`} name="body" required maxLength={1000} autoComplete="off" placeholder="Write a reply…"
      className="h-10 min-w-0 flex-1 rounded-full border border-border-strong bg-background/70 px-4 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-[3px] focus-visible:ring-ring/25"/>
    <Button type="submit" size="icon" className="size-10 rounded-full" disabled={pending} aria-busy={pending} aria-label="Send reply"><Send/></Button>
    {state.error && <p role="alert" className="basis-full pl-2 text-xs font-medium text-warning">{state.error}</p>}
  </form>;
}

export function PostCard({ post, viewerId, canModerate }: { post: PostView; viewerId: string | null; canModerate: boolean }) {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const ask = useSignInRedirect();
  const mine = viewerId === post.userId;
  const long = post.body.length > 360 || post.body.split("\n").length > 5;

  return <article className="flex gap-2 p-4 transition-colors hover:bg-muted/30 sm:gap-3 sm:p-5">
    <VoteRail postId={post.id} votes={post.votes} voted={post.voted} signedIn={Boolean(viewerId)}/>

    <div className="min-w-0 flex-1">
      <Meta name={post.authorName} ago={post.ago} iso={post.createdAt} mine={mine}/>
      {post.title && <h3 className="m-0 mt-2 font-display text-lg leading-snug font-semibold tracking-[-0.02em] text-balance text-foreground">{post.title}</h3>}
      <p className={cn("m-0 mt-2 text-[15px] leading-relaxed break-words whitespace-pre-wrap text-soft-foreground", long && !expanded && "line-clamp-5")}>{post.body}</p>
      {long && <button type="button" onClick={() => setExpanded((value) => !value)} aria-expanded={expanded} className="mt-1 text-sm font-semibold text-primary hover:underline">{expanded ? "Show less" : "Show more"}</button>}

      <div className="mt-3 flex flex-wrap items-center gap-1">
        <button type="button" onClick={() => setOpen((value) => !value)} aria-expanded={open}
          className="inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-[13px] font-semibold text-muted-foreground transition hover:bg-muted hover:text-foreground"><MessageSquare className="size-4"/>{post.replies.length} {post.replies.length === 1 ? "reply" : "replies"}</button>
        {(mine || canModerate) && <form action={deletePostAction} onSubmit={confirmDelete("Delete this post and its replies?")}>
          <input type="hidden" name="postId" value={post.id}/>
          <SubmitButton type="submit" aria-label="Delete this post" className="inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-[13px] font-semibold text-muted-foreground transition hover:bg-danger-soft hover:text-destructive"><Trash2 className="size-4"/>Delete</SubmitButton>
        </form>}
      </div>

      {open && <div className="mt-3 grid gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
        {post.replies.length > 0 && <ul className="m-0 grid list-none gap-4 border-l-2 border-border p-0 pl-4">{post.replies.map((reply) => <li key={reply.id}>
          <div className="flex items-start gap-2">
            <div className="min-w-0 flex-1">
              <Meta name={reply.authorName} ago={reply.ago} iso={reply.createdAt} mine={viewerId === reply.userId}/>
              <p className="m-0 mt-1.5 text-sm leading-relaxed break-words whitespace-pre-wrap text-soft-foreground">{reply.body}</p>
            </div>
            {(viewerId === reply.userId || canModerate) && <form action={deleteReplyAction} onSubmit={confirmDelete("Delete this reply?")}>
              <input type="hidden" name="replyId" value={reply.id}/>
              <SubmitButton type="submit" aria-label="Delete this reply" className="grid size-8 place-items-center rounded-lg text-muted-foreground transition hover:bg-danger-soft hover:text-destructive"><Trash2 className="size-3.5"/></SubmitButton>
            </form>}
          </div>
        </li>)}</ul>}
        {viewerId
          ? <ReplyForm postId={post.id}/>
          : <button type="button" onClick={() => ask("reply")} className="h-10 w-full cursor-text rounded-full border border-border-strong bg-background/70 px-4 text-left text-sm text-muted-foreground transition hover:border-muted-foreground/40">Write a reply…</button>}
      </div>}
    </div>
  </article>;
}
