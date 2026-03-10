import { ReactNode } from "react";
import Link from "next/link";

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
    "rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-200";
  const interactive = href
    ? "hover:shadow-lg hover:border-blue-200 hover:-translate-y-0.5 cursor-pointer"
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

const TAG_COLORS: Record<string, string> = {
  効率化: "bg-emerald-50 text-emerald-700 border-emerald-200",
  品質向上: "bg-blue-50 text-blue-700 border-blue-200",
  自動化: "bg-purple-50 text-purple-700 border-purple-200",
  初心者向け: "bg-amber-50 text-amber-700 border-amber-200",
  上級者向け: "bg-red-50 text-red-700 border-red-200",
  必読: "bg-rose-50 text-rose-700 border-rose-200",
  セキュリティ: "bg-orange-50 text-orange-700 border-orange-200",
  ガイドライン: "bg-sky-50 text-sky-700 border-sky-200",
  勉強会: "bg-indigo-50 text-indigo-700 border-indigo-200",
  ハンズオン: "bg-teal-50 text-teal-700 border-teal-200",
  募集: "bg-pink-50 text-pink-700 border-pink-200",
};

const DEFAULT_TAG_COLOR = "bg-slate-50 text-slate-600 border-slate-200";

export function Tag({ label }: { label: string }) {
  const color = TAG_COLORS[label] ?? DEFAULT_TAG_COLOR;
  return (
    <span
      className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-medium ${color}`}
    >
      {label}
    </span>
  );
}

export function Badge({
  children,
  variant = "default",
}: {
  children: ReactNode;
  variant?: "default" | "blue" | "purple" | "amber" | "green";
}) {
  const colors = {
    default: "bg-slate-100 text-slate-700",
    blue: "bg-blue-100 text-blue-800",
    purple: "bg-purple-100 text-purple-800",
    amber: "bg-amber-100 text-amber-800",
    green: "bg-green-100 text-green-800",
  };
  return (
    <span
      className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-semibold ${colors[variant]}`}
    >
      {children}
    </span>
  );
}

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
          className="mb-3 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-blue-600 transition-colors"
        >
          <span>←</span>
          <span>{backLabel ?? "Back"}</span>
        </Link>
      )}
      <div className="flex items-center gap-3">
        {icon && <span className="text-3xl">{icon}</span>}
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            {title}
          </h1>
          {description && (
            <p className="mt-1 text-base text-slate-500">{description}</p>
          )}
        </div>
      </div>
    </div>
  );
}

export function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="text-4xl mb-3">🔍</div>
      <p className="text-sm text-slate-500">{message}</p>
    </div>
  );
}

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
    <div className="flex items-center gap-3 rounded-xl bg-white border border-slate-200 p-4">
      <span className="text-2xl">{icon}</span>
      <div>
        <p className="text-xl font-bold text-slate-900">{value}</p>
        <p className="text-xs text-slate-500">{label}</p>
      </div>
    </div>
  );
}
