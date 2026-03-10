import { ReactNode } from "react";

const labelClass = "block text-sm font-semibold text-slate-700 mb-1.5";
const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all";

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
        className="mb-3 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-blue-600 transition-colors"
      >
        <span>←</span>
        <span>一覧に戻る</span>
      </a>
      <div className="flex items-center gap-3 mb-8">
        <span className="text-3xl">{icon}</span>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          {title}
        </h1>
      </div>
      <form action={action} className="space-y-6">
        {children}
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            className="rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all"
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
  );
}

export function TextInput({
  label,
  name,
  required,
  placeholder,
}: {
  label: string;
  name: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <div>
      <label className={labelClass}>
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <input
        type="text"
        name={name}
        required={required}
        placeholder={placeholder}
        className={inputClass}
      />
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
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}

export function DateInput({
  label,
  name,
}: {
  label: string;
  name: string;
}) {
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
        placeholder={placeholder ?? "タグをカンマ区切りで入力（例: 効率化, 自動化）"}
        className={inputClass}
      />
      <p className="mt-1 text-xs text-slate-400">
        カンマ区切りで複数入力できます
      </p>
    </div>
  );
}
