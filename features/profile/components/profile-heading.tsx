import Link from "next/link";
import { Portrait } from "@/features/content/components/site-image";
import { Icon } from "@/components/icon";
import { FollowButton } from "@/features/follow/components/follow-button";

export function ProfileHeading({ headline, location, photoId }: { headline: string; location: string | null; photoId?: string | null }) {
  return <div className="profile-main">
    <div className="profile-avatar"><Portrait photoId={photoId} sizes="120px"/></div>
    <div><h2>Padmore Yeb</h2><p>{headline}</p>{location && <span className="profile-location"><Icon name="map" size={14}/> {location}</span>}</div>
    <div className="profile-actions"><span data-tw><FollowButton/></span><Link href="/about" className="button button-outline button-small">About me</Link></div>
  </div>;
}
