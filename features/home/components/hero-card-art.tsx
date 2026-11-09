// Small illustrations that fill the top of each homepage fact card. Drawn as SVG, so they stay sharp
// at any size, load instantly and follow the page in light and dark mode.
type Tone = "blue" | "green" | "violet" | "gold";

const Window = ({ x, y, w, h, fill = "#fff", children }: { x: number; y: number; w: number; h: number; fill?: string; children?: React.ReactNode }) => <g>
  <rect x={x} y={y} width={w} height={h} rx="7" fill={fill} stroke="#cfd8ee" strokeWidth="1.2"/>
  <circle cx={x + 9} cy={y + 9} r="2.4" fill="#ff6b6b"/><circle cx={x + 17} cy={y + 9} r="2.4" fill="#ffc94d"/><circle cx={x + 25} cy={y + 9} r="2.4" fill="#4cd08b"/>
  {children}
</g>;

// Portfolio projects: a stack of project windows.
function Projects() {
  return <svg viewBox="0 0 240 120" className="size-full" aria-hidden="true">
    <Window x={96} y={14} w={112} h={72}><rect x="108" y="38" width="52" height="8" rx="4" fill="#dbe4ff"/><rect x="108" y="52" width="88" height="22" rx="5" fill="#eef2ff"/></Window>
    <Window x={52} y={30} w={116} h={76}><rect x="64" y="54" width="46" height="8" rx="4" fill="#c7d4ff"/><rect x="64" y="68" width="92" height="26" rx="5" fill="#4169f5"/><rect x="72" y="76" width="40" height="5" rx="2.5" fill="#fff" opacity=".85"/><rect x="72" y="85" width="64" height="4" rx="2" fill="#fff" opacity=".5"/></Window>
    <rect x="28" y="50" width="52" height="60" rx="8" fill="#fff" stroke="#cfd8ee" strokeWidth="1.2"/>
    <rect x="36" y="60" width="36" height="20" rx="4" fill="#8b5cf6" opacity=".85"/><rect x="36" y="86" width="26" height="5" rx="2.5" fill="#dbe4ff"/><rect x="36" y="96" width="36" height="4" rx="2" fill="#eef2ff"/>
  </svg>;
}

// Live projects: a browser window that is online, with a signal.
function Live() {
  return <svg viewBox="0 0 240 120" className="size-full" aria-hidden="true">
    <Window x={44} y={18} w={152} h={92}>
      <rect x="56" y="38" width="128" height="14" rx="7" fill="#eefaf3"/><circle cx="68" cy="45" r="3.6" fill="#22c55e"/><rect x="78" y="43" width="62" height="4" rx="2" fill="#a7e3c0"/>
      <rect x="56" y="60" width="60" height="38" rx="6" fill="#e9fbf1"/><rect x="124" y="60" width="60" height="16" rx="6" fill="#d7f5e5"/><rect x="124" y="82" width="42" height="16" rx="6" fill="#d7f5e5"/>
      <path d="M62 90 L74 78 L84 85 L98 68 L110 74" fill="none" stroke="#16a34a" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/>
    </Window>
    <g className="live-art-ping"><circle cx="196" cy="24" r="16" fill="#22c55e" opacity=".18"/><circle cx="196" cy="24" r="9" fill="#22c55e"/><path d="M191 24 l3.6 3.6 L201 20.5" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></g>
  </svg>;
}

// Web & mobile: a laptop and a phone side by side.
function Devices() {
  return <svg viewBox="0 0 240 120" className="size-full" aria-hidden="true">
    <rect x="38" y="22" width="132" height="80" rx="8" fill="#1e2a4a"/><rect x="44" y="28" width="120" height="68" rx="4" fill="#fff"/>
    <rect x="52" y="36" width="52" height="7" rx="3.5" fill="#8b5cf6"/><rect x="52" y="49" width="104" height="22" rx="5" fill="#f1ebff"/><rect x="52" y="77" width="30" height="14" rx="4" fill="#8b5cf6" opacity=".85"/><rect x="88" y="77" width="30" height="14" rx="4" fill="#ddd2fb"/>
    <path d="M26 102 h156 l-8 8 h-140 z" fill="#c9cfe0"/>
    <rect x="158" y="38" width="46" height="78" rx="9" fill="#1e2a4a"/><rect x="162" y="43" width="38" height="66" rx="6" fill="#fff"/><rect x="174" y="40" width="14" height="3" rx="1.5" fill="#3b4670"/>
    <rect x="167" y="50" width="28" height="22" rx="5" fill="#8b5cf6"/><rect x="167" y="78" width="28" height="5" rx="2.5" fill="#ddd2fb"/><rect x="167" y="88" width="20" height="5" rx="2.5" fill="#eee9fd"/><circle cx="181" cy="101" r="3" fill="#ddd2fb"/>
  </svg>;
}

// Ghana: the national flag, red, gold and green with the black star, gently waving.
function Ghana() {
  return <svg viewBox="0 0 240 120" className="size-full" aria-hidden="true">
    <rect x="44" y="14" width="3.5" height="98" rx="1.75" fill="#b9a275"/><circle cx="45.7" cy="13" r="4" fill="#e8c46a"/>
    <g className="ghana-flag-wave">
      <rect x="47" y="20" width="150" height="30" fill="#ce1126"/><rect x="47" y="50" width="150" height="30" fill="#fcd116"/><rect x="47" y="80" width="150" height="30" fill="#006b3f"/>
      <polygon points="122.0,50.0 125.5,60.1 136.3,60.4 127.7,66.9 130.8,77.1 122.0,71.0 113.2,77.1 116.3,66.9 107.7,60.4 118.5,60.1" fill="#000"/>
    </g>
  </svg>;
}

const ART: Record<Tone, () => React.JSX.Element> = { blue: Projects, green: Live, violet: Devices, gold: Ghana };
const BACKDROP: Record<Tone, string> = {
  blue: "bg-gradient-to-br from-primary-soft to-card",
  green: "bg-gradient-to-br from-success-soft to-card",
  violet: "bg-gradient-to-br from-violet-soft to-card",
  gold: "bg-gradient-to-br from-warning-soft to-card",
};

export function HeroCardArt({ tone }: { tone: Tone }) {
  const Art = ART[tone];
  return <span aria-hidden="true" className={`block h-28 overflow-hidden rounded-xl p-1 transition duration-500 group-hover:scale-[1.02] sm:h-32 ${BACKDROP[tone]}`}><Art/></span>;
}
