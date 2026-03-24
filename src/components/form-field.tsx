import { ReactNode } from "react";

const labelClass = "block text-sm font-semibold text-slate-700 mb-1.5";
const inputClass =
  "w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all";

export function FormWrapper({
  title,
  icon,
  backHref,
  action,
  children,
}: {
  title: string;
  icon: string;
  backHref: string;
  action: (formData: FormData) => Promise<void>;
  children: ReactNode;
}) {
  return (
    <div className="max-w-2xl mx-auto">
      <a
        href={backHref}
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-blue-600 transition-colors"
      >
        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        一覧に戻る
      </a>

      <div className="flex items-center gap-3 mb-8">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-2xl">
          {icon}
        </span>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{title}</h1>
      </div>

      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
        <form action={action} className="space-y-5">
          {children}
          <div className="flex gap-3 pt-2 border-t border-slate-100">
            <button
              type="submit"
              className="rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all shadow-sm"
            >
              保存する
            </button>
            <a
              href={backHref}
              className="rounded-xl border border-slate-200 bg-white px-6 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-all"
            >
              キャンセル
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}

export function TextInput({
  label,
  name,
  required,
  placeholder,
  hint,
}: {
  label: string;
  name: string;
  required?: boolean;
  placeholder?: string;
  hint?: string;
}) {
  return (
    <div>
      <label className={labelClass}>
        {label}
        {required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      <input
        type="text"
        name={name}
        required={required}
        placeholder={placeholder}
        className={inputClass}
      />
      {hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
    </div>
  );
}

export function TextArea({
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
  return (
    <div>
      <label className={labelClass}>{label}</label>
      <textarea
        name={name}
        rows={rows}
        placeholder={placeholder}
        className={`${inputClass} resize-y`}
      />
    </div>
  );
}

export function SelectInput({
  label,
  name,
  options,
  placeholder,
}: {
  label: string;
  name: string;
  options: string[];
  placeholder?: string;
}) {
  return (
    <div>
      <label className={labelClass}>{label}</label>
      <select name={name} className={inputClass}>
        <option value="">{placeholder ?? "選択してください"}</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    </div>
  );
}

export function DateInput({ label, name }: { label: string; name: string }) {
  return (
    <div>
      <label className={labelClass}>{label}</label>
      <input type="date" name={name} className={inputClass} />
    </div>
  );
}

export function NumberInput({
  label,
  name,
  min,
  placeholder,
}: {
  label: string;
  name: string;
  min?: number;
  placeholder?: string;
}) {
  return (
    <div>
      <label className={labelClass}>{label}</label>
      <input
        type="number"
        name={name}
        min={min}
        placeholder={placeholder}
        className={inputClass}
      />
    </div>
  );
}

export function TagInput({
  label,
  name,
  placeholder,
}: {
  label: string;
  name: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label className={labelClass}>{label}</label>
      <input
        type="text"
        name={name}
        placeholder={placeholder ?? "カンマ区切りで入力（例: 効率化, 自動化）"}
        className={inputClass}
      />
      <p className="mt-1 text-xs text-slate-400">複数タグはカンマ区切りで入力</p>
    </div>
  );
}
