import { ChevronDown } from "lucide-react";

export const inputClass = (invalid?: boolean) =>
  `w-full rounded-xl bg-white px-4 py-2.5 text-[15px] shadow-sm outline-none ring-1 transition placeholder:text-ink/40 focus:ring-2 focus:ring-primary disabled:cursor-not-allowed disabled:bg-white/60 ${
    invalid ? "ring-red-400" : "ring-black/5"
  }`;

/** Atribut aksesibilitas bersama untuk kontrol form. */
export function fieldProps(id: string, error?: string, hint?: string) {
  return {
    id,
    "aria-invalid": error ? (true as const) : undefined,
    "aria-describedby": error ? `${id}-error` : hint ? `${id}-hint` : undefined,
  };
}

interface FormFieldProps { id: string; label: string; required?: boolean; error?: string; hint?: string; children: React.ReactNode }

export function FormField({ id, label, required, error, hint, children }: FormFieldProps) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-[15px] font-semibold">
        {label}
        {required && <span aria-hidden className="ml-0.5 text-accent">*</span>}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="mt-1 text-xs font-medium text-red-600">{error}</p>
      ) : hint ? (
        <p id={`${id}-hint`} className="mt-1 text-xs text-ink/55">{hint}</p>
      ) : null}
    </div>
  );
}

interface SelectFieldProps {
  id: string; value: string; onChange: (v: string) => void; placeholder: string;
  options: string[]; error?: string; disabled?: boolean;
}

export function SelectField({ id, value, onChange, placeholder, options, error, disabled }: SelectFieldProps) {
  return (
    <div className="relative">
      <select
        {...fieldProps(id, error)}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className={`${inputClass(!!error)} appearance-none pr-10 ${value ? "" : "text-ink/40"}`}
      >
        <option value="" disabled>{placeholder}</option>
        {options.map((o) => <option key={o} value={o} className="text-ink">{o}</option>)}
      </select>
      <ChevronDown size={18} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink/60" />
    </div>
  );
}
