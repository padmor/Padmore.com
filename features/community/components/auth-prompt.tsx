"use client";
import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ArrowRight, LogIn, X } from "lucide-react";
import { Button } from "@/components/ui/button";

type Ask = (action: string) => void;
const AuthPromptContext = createContext<Ask>(() => {});

// Lets any part of the community ask a visitor to sign in at the moment they try
// to post, reply or like. The prompt is not on the page until then.
export const useAuthPrompt = () => useContext(AuthPromptContext);

export function AuthPromptProvider({ children }: { children: ReactNode }) {
  const dialog = useRef<HTMLDialogElement>(null);
  // Signing in from here brings the visitor back to this page, not to the dashboard.
  const next = encodeURIComponent(usePathname());
  const [action, setAction] = useState("take part");
  const ask = useCallback<Ask>((what) => {
    setAction(what);
    if (!dialog.current?.open) dialog.current?.showModal();
  }, []);
  const value = useMemo(() => ask, [ask]);

  return <AuthPromptContext.Provider value={value}>
    {children}
    <dialog ref={dialog} aria-labelledby="auth-prompt-title"
      onClick={(event) => { if (event.target === event.currentTarget) event.currentTarget.close(); }}
      className="m-auto w-[min(26rem,calc(100%-2rem))] overflow-visible rounded-3xl border border-border bg-card p-0 text-foreground shadow-[0_40px_80px_-24px_rgb(16_27_61/0.45)] backdrop:bg-slate-900/45 backdrop:backdrop-blur-sm open:animate-in open:fade-in open:zoom-in-95 open:duration-200">
      <div className="relative p-7 text-center">
        <button type="button" onClick={() => dialog.current?.close()} aria-label="Close" className="absolute top-3 right-3 grid size-9 place-items-center rounded-full text-muted-foreground transition hover:bg-muted hover:text-foreground"><X className="size-4"/></button>
        <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-primary-soft text-primary"><LogIn className="size-6"/></span>
        <h2 id="auth-prompt-title" className="m-0 mt-4 font-display text-xl font-semibold tracking-[-0.03em] text-foreground">Sign in to {action}</h2>
        <p className="m-0 mt-2 text-[15px] leading-relaxed text-soft-foreground">Create a free account to follow new work, keep projects and tutorials saved to your profile, and join the community. You can return to this page after signing in.</p>
        <div className="mt-6 grid gap-2.5">
          <Button asChild size="lg"><Link href={`/signin?next=${next}`}>Sign in</Link></Button>
          <Button asChild size="lg" variant="outline"><Link href={`/signup?next=${next}`}>Create an account <ArrowRight/></Link></Button>
          <Button type="button" variant="ghost" onClick={() => dialog.current?.close()}>Not now</Button>
        </div>
      </div>
    </dialog>
  </AuthPromptContext.Provider>;
}

// In the Community, posting, replying and voting go straight to the sign-in page, which
// brings the visitor back here once they have signed in.
export function useSignInRedirect(): Ask {
  const router = useRouter();
  const path = usePathname();
  return useCallback(() => router.push(`/signin?next=${encodeURIComponent(path)}`), [router, path]);
}
