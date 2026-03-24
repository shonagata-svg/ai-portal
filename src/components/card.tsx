import { ReactNode } from "react";
import Link from "next/link";

// ===================== Card =====================

export function Card({
  children,
  className = "",
  href,
}: {
  children: ReactNode;
  className?: string;
  href?: string;
}) {
  const base =
    "rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all duration-200";
  const interactive = href
    ? "hover:shadow-md hover:border-slate-300 cursor-pointer group"
    : "";

  if (href) {
    return (
      <Link href={href} className={`block ${base} ${interactive} ${className}`}>
        {children}
      </Link>
    );
  }
  return <div className={`${base} ${className}`}>{children}</div>;
}

// ===================== Tag =====================

const TAG_COLORS: Record<string, string> = {
  効率化: "bg-emerald-50 text-emerald-700 border-emerald-200",
  品質向上: "bg-blue-50 text-blue-700 border-blue-200",
  自動化: "bg-violet-50 text-violet-700 border-violet-200",
  初心者向け: "bg-amber-50 text-amber-700 border-amber-200",
  上級者向け: "bg-red-50 text-red-700 border-red-200",
  必読: "bg-rose-50 text-rose-700 border-rose-200",
  セキュリティ: "bg-orange-50 text-orange-700 border-orange-200",
  ガイドライン: "bg-sky-50 text-sky-700 border-sky-200",
  勉強会: "bg-indigo-50 text-indigo-700 border-indigo-200",
  ハンズオン: "bg-teal-50 text-teal-700 border-teal-200",
  募集: "bg-pink-50 text-pink-700 border-pink-200",
};

const DEFAULT_TAG_COLOR = "bg-slate-50 text-slate-500 border-slate-200";

export function Tag({ label }: { label: string }) {
  const color = TAG_COLORS[label] ?? DEFAULT_TAG_COLOR;
  return (
    <span className={`inline-block rounded-full border px-2.5 py-0.5 text-[11px] font-medium tracking-wide ${color}`}>
      {label}
    </span>
  );
}

// ===================== Badge =====================

export function Badge({
  children,
  variant = "default",
}: {
  children: ReactNode;
  variant?: "default" | "blue" | "purple" | "amber" | "green";
}) {
  const colors = {
    default: "bg-slate-100 text-slate-600",
    blue: "bg-blue-50 text-blue-700",
    purple: "bg-violet-50 text-violet-700",
    amber: "bg-amber-50 text-amber-700",
    green: "bg-emerald-50 text-emerald-700",
  };
  return (
    <span className={`inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-semibold ${colors[variant]}`}>
      {children}
    </span>
  );
}

// ===================== AuthorChip =====================

const AVATAR_PALETTES = [
  "bg-blue-500",
  "bg-violet-500",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-rose-500",
  "bg-cyan-500",
  "bg-pink-500",
  "bg-indigo-500",
];

function avatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) & 0xffffffff;
  }
  return AVATAR_PALETTES[Math.abs(hash) % AVATAR_PALETTES.length];
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

export function AuthorChip({ name, size = "sm" }: { name: string; size?: "sm" | "md" }) {
  if (!name) return null;
  const color = avatarColor(name);
  const sizeClass = size === "md" ? "h-7 w-7 text-xs" : "h-5 w-5 text-[10px]";
  const textClass = size === "md" ? "text-sm" : "text-xs";
  return (
    <div className="flex items-center gap-1.5">
      <span className={`flex shrink-0 items-center justify-center rounded-full font-bold text-white ${color} ${sizeClass}`}>
        {initials(name)}
      </span>
      <span className={`text-slate-500 font-medium ${textClass}`}>{name}</span>
    </div>
  );
}

// ===================== PageHeader =====================

export function PageHeader({
  title,
  description,
  icon,
  backHref,
  backLabel,
}: {
  title: string;
  description?: string;
  icon?: string;
  backHref?: string;
  backLabel?: string;
}) {
  return (
    <div className="mb-8">
      {backHref && (
        <Link
          href={backHref}
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-blue-600 transition-colors"
        >
          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          {backLabel ?? "Back"}
        </Link>
      )}
      <div className="flex items-center gap-3">
        {icon && (
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-2xl">
            {icon}
          </span>
        )}
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{title}</h1>
          {description && (
            <p className="mt-0.5 text-sm text-slate-500">{description}</p>
          )}
        </div>
      </div>
    </div>
  );
}

// ===================== EmptyState =====================

export function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-2xl mb-3">
        🔍
      </div>
      <p className="text-sm font-medium text-slate-500">{message}</p>
    </div>
  );
}

// ===================== MetricCard =====================

export function MetricCard({
  value,
  label,
  icon,
}: {
  value: string | number;
  label: string;
  icon: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-white border border-slate-200/80 p-4 shadow-sm">
      <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-xl">{icon}</span>
      <div>
        <p className="text-xl font-bold text-slate-900 leading-tight">{value}</p>
        <p className="text-xs text-slate-400 font-medium">{label}</p>
      </div>
    </div>
  );
}
