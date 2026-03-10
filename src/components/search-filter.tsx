"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useTransition } from "react";

export function SearchBox({ placeholder }: { placeholder?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const onSearch = useCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) params.set("q", value);
      else params.delete("q");
      startTransition(() => router.replace(`${pathname}?${params.toString()}`));
    },
    [router, pathname, searchParams],
  );

  return (
    <div className="relative">
      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
        🔍
      </span>
      <input
        type="search"
        placeholder={placeholder ?? "キーワードで検索..."}
        defaultValue={searchParams.get("q") ?? ""}
        onChange={(e) => onSearch(e.target.value)}
        className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-3 text-sm outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100 shadow-sm transition-all"
      />
    </div>
  );
}

export function TagFilter({
  allTags,
  label,
  paramKey = "tag",
}: {
  allTags: string[];
  label?: string;
  paramKey?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const current = searchParams.get(paramKey) ?? "";

  const setTag = (tag: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (tag) params.set(paramKey, tag);
    else params.delete(paramKey);
    router.replace(`${pathname}?${params.toString()}`);
  };

  if (allTags.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 items-center">
      {label && (
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mr-1">
          {label}
        </span>
      )}
      <button
        onClick={() => setTag("")}
        className={`rounded-lg px-3 py-1.5 text-xs font-medium border transition-all ${
          !current
            ? "bg-slate-900 text-white border-slate-900 shadow-sm"
            : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300"
        }`}
      >
        All
      </button>
      {allTags.map((t) => (
        <button
          key={t}
          onClick={() => setTag(t)}
          className={`rounded-lg px-3 py-1.5 text-xs font-medium border transition-all ${
            current === t
              ? "bg-slate-900 text-white border-slate-900 shadow-sm"
              : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300"
          }`}
        >
          {t}
        </button>
      ))}
    </div>
  );
}
