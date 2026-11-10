"use client";
import { useEffect, useState, useTransition } from "react";
import { Check, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthPrompt } from "@/features/community/components/auth-prompt";
import { trackEngagement } from "@/lib/engagement/client";
import { toggleFollowAction } from "@/modules/follow/actions";

type State = { count: number; following: boolean; signedIn: boolean; ready: boolean };

// The count and visitor state are loaded after the page renders so cached pages
// remain public. A visitor without an account is prompted to sign in on follow.
export function FollowButton({ compact = false }: { compact?: boolean }) {
  const ask = useAuthPrompt();
  const [state, setState] = useState<State>({ count: 0, following: false, signedIn: false, ready: false });
  const [pending, start] = useTransition();
  const [error, setError] = useState("");

  useEffect(() => {
    let current = true;
    fetch("/follow-state", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => { if (current && data) setState({ count: data.count, following: data.following, signedIn: data.signedIn, ready: true }); })
      .catch(() => { if (current) setState((value) => ({ ...value, ready: true })); });
    return () => { current = false; };
  }, []);

  function toggle() {
    trackEngagement("follow_click", "/");
    if (!state.signedIn) return ask("follow Padmore");
    const before = state;
    setError("");
    setState({ ...before, following: !before.following, count: Math.max(0, before.count + (before.following ? -1 : 1)) });
    start(async () => {
      const result = await toggleFollowAction();
      if ("error" in result) { setState(before); setError(result.error); }
      else {
        setState({ ...before, ...result });
      }
    });
  }

  return (
    <div className={compact ? "follow-button-compact" : "grid gap-2"}>
      <div className="flex flex-wrap items-center gap-3">
        <Button
          type="button"
          onClick={toggle}
          disabled={!state.ready || pending}
          aria-busy={pending}
          aria-pressed={state.signedIn ? state.following : undefined}
          aria-label={compact ? (state.following ? "Following Padmore" : "Follow Padmore") : undefined}
          variant={compact || state.following ? "outline" : "default"}
          size={compact ? "sm" : "default"}
          className={compact ? "header-follow-trigger" : undefined}
        >
          {state.following ? <><Check/>Following</> : <><UserPlus/>Follow</>}
        </Button>
        {!compact && <span className="text-sm text-muted-foreground tabular-nums" aria-live="polite">{state.ready ? state.count === 0 ? "Be the first to follow" : state.count + " " + (state.count === 1 ? "follower" : "followers") : " "}</span>}
      </div>
      {error && <p role="alert" className="text-xs font-medium text-warning">{error}</p>}
    </div>
  );
}
