import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/icon";
import { FollowPadmoreButton } from "@/features/community/components/follow-padmore-button";

export function ProfileHeading({ projectCount }: { projectCount: number }) {
  return <div className="profile-main">
    <div className="profile-avatar"><Image src="/images/portrait-reference-placeholder.webp" alt="Temporary portrait placeholder from the supplied design reference" fill sizes="120px"/></div>
    <div><h2>Padmore Yeb</h2><p>Building modern web and mobile applications that solve real problems.</p><span className="profile-location"><Icon name="map" size={14}/> Ghana</span></div>
    <div className="profile-actions"><FollowPadmoreButton/><Link href="/about" className="button button-outline button-small">About me</Link></div>
    <span className="sr-only">{projectCount} illustrative projects</span>
  </div>;
}
