// Hidden from people and screen readers. See isBot in modules/inquiries/actions.ts.
export function Honeypot() {
  return <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" style={{ position: "absolute", left: "-9999px", height: 0, width: 0, opacity: 0 }}/>;
}
