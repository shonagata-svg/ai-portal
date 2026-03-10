"use client";

import { useState } from "react";
import { Markdown } from "./markdown";

const labelClass = "block text-sm font-semibold text-slate-700 mb-1.5";
const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all";

export function MarkdownTextArea({
  label,
  name,
  rows = 4,
  placeholder,
}: {
  label: string;
  name: string;
  rows?: number;
  placeholder?: string;
}) {
  const [tab, setTab] = useState<"edit" | "preview">("edit");
  const [value, setValue] = useState("");

  return (
    <div>
      <label className={labelClass}>{label}</label>
      <div className="flex gap-1 mb-1.5">
        <button
          type="button"
          onClick={() => setTab("edit")}
          className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
            tab === "edit"
              ? "bg-slate-800 text-white"
              : "bg-slate-100 text-slate-500 hover:bg-slate-200"
          }`}
        >
          編集
        </button>
        <button
          type="button"
          onClick={() => setTab("preview")}
          className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
            tab === "preview"
              ? "bg-slate-800 text-white"
              : "bg-slate-100 text-slate-500 hover:bg-slate-200"
          }`}
        >
          プレビュー
        </button>
      </div>
      {tab === "edit" ? (
        <textarea
          name={name}
          rows={rows}
          placeholder={placeholder}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className={`${inputClass} resize-y`}
        />
      ) : (
        <>
          <input type="hidden" name={name} value={value} />
          <div
            className={`${inputClass} resize-y overflow-auto`}
            style={{ minHeight: `${rows * 1.5 + 1.25}rem` }}
          >
            {value ? (
              <Markdown content={value} />
            ) : (
              <p className="text-slate-400 text-sm">プレビューする内容がありません</p>
            )}
          </div>
        </>
      )}
      <p className="mt-1 text-xs text-slate-400">
        Markdown記法が使えます
      </p>
    </div>
  );
}
