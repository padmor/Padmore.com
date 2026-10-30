"use client";
import { useEffect, useState } from "react";
import { Icon } from "@/components/icon";
const KEY = "padmore-following-preview-v1";
export function FollowPadmoreButton() {
  const [following, setFollowing] = useState(false);
  useEffect(() => { setFollowing(localStorage.getItem(KEY) === "yes"); }, []);
  function toggle() {
    const next = !following;
    setFollowing(next);
    localStorage.setItem(KEY, next ? "yes" : "no");
  }
  return <button type="button" className={`button ${following ? "button-success" : "button-primary"}`} onClick={toggle}><Icon name={following ? "check" : "plus"} size={15}/>{following ? "Following (preview)" : "Follow Padmore"}</button>;
}
