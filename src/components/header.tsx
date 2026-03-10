import Link from "next/link";

const NAV = [
  { href: "/", label: "Home", icon: "🏠" },
  { href: "/dashboard", label: "Dashboard", icon: "📊" },
  { href: "/playbook", label: "Playbook", icon: "📖" },
  { href: "/use-cases", label: "Use Cases", icon: "💡" },
  { href: "/prompts", label: "Prompts", icon: "📝" },
  { href: "/faq", label: "FAQ", icon: "❓" },
  { href: "/events", label: "Events", icon: "📅" },
] as const;

export function Header() {
  return (
    <header className="border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-50">
      <div className="mx-auto max-w-7xl flex items-center justify-between px-6 py-3">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-[10px] text-white font-black tracking-tighter">
            H
          </span>
          <span className="text-sm font-bold text-slate-900">
            HERALBONY <span className="text-blue-600">AI Portal</span>
          </span>
        </Link>
        <nav className="flex gap-0.5">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors"
            >
              <span className="mr-1">{n.icon}</span>
              {n.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
