import { Icon } from "@/components/icon";

export function AdminPreviewNotice() {
  return <div className="admin-preview-banner">
    <Icon name="shield-check" />
    <p><strong>Preview only.</strong> This admin page is not protected by authentication yet. Do not publish or use it for real customer data until server-side authorization is implemented.</p>
  </div>;
}
