// Plain text with two small conveniences. React escapes everything, so text
// typed in the portal can never become markup on the page.
export function ArticleBody({ text }: { text: string }) {
  return <>{text.split(/\r?\n\s*\r?\n/).map((block, index) => {
    const lines = block.trim().split(/\r?\n/);
    if (lines[0].startsWith("## ")) return <h2 key={index}>{lines[0].slice(3)}</h2>;
    if (lines.every((line) => line.startsWith("- "))) return <ul key={index}>{lines.map((line, item) => <li key={item}>{line.slice(2)}</li>)}</ul>;
    return <p key={index}>{block.trim()}</p>;
  })}</>;
}
