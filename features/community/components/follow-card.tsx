"use client";
import { useState } from "react";
import { Icon } from "@/components/icon";
export function FollowCard({ member }: { member: { name: string; role: string; initials: string; tone: string } }) {
 const [followed, setFollowed] = useState(false);
 return <article className="member-card"><div className={`member-avatar tone-${member.tone}`}>{member.initials}</div><h3>{member.name}</h3><p>{member.role}</p><button className={`button button-small ${followed ? "button-success" : "button-primary"}`} onClick={() => setFollowed((value) => !value)}><Icon name={followed ? "check" : "plus"} size={14}/>{followed ? "Following (demo)" : "Follow"}</button></article>;
}
