import type { ReportFormErrors, ReportFormValues } from "@/types/report";
import { animalConditions, animalNameSuggestions, animalTypes } from "@/data/formOptions";
import { FormField, SelectField, fieldProps, inputClass } from "./FormField";

interface Props {
  values: ReportFormValues;
  errors: ReportFormErrors;
  onChange: <K extends keyof ReportFormValues>(key: K, value: ReportFormValues[K]) => void;
}

export default function AnimalInformationForm({ values, errors, onChange }: Props) {
  const nameHint = "Tidak tahu spesiesnya? Boleh dikosongkan atau tulis ciri-cirinya.";
  return (
    <div className="space-y-5">
      <FormField id="field-animalType" label="Jenis satwa" required error={errors.animalType}>
        <SelectField id="field-animalType" value={values.animalType} onChange={(v) => onChange("animalType", v)} placeholder="Pilih jenis satwa" options={animalTypes} error={errors.animalType} />
      </FormField>

      <FormField id="field-animalName" label="Nama satwa" hint={nameHint}>
        <input
          {...fieldProps("field-animalName", undefined, nameHint)}
          list="animal-name-suggestions"
          value={values.animalName}
          onChange={(e) => onChange("animalName", e.target.value)}
          placeholder="Contoh: Orangutan Kalimantan"
          className={inputClass()}
        />
        <datalist id="animal-name-suggestions">
          {animalNameSuggestions.map((n) => <option key={n} value={n} />)}
        </datalist>
      </FormField>

      <FormField id="field-count" label="Jumlah satwa" required error={errors.count}>
        <input
          {...fieldProps("field-count", errors.count)}
          type="number" inputMode="numeric" min={1} max={9999}
          value={values.count}
          onChange={(e) => onChange("count", e.target.value)}
          placeholder="Masukkan angka"
          className={inputClass(!!errors.count)}
        />
      </FormField>

      <FormField id="field-condition" label="Kondisi satwa" required error={errors.condition}>
        <SelectField id="field-condition" value={values.condition} onChange={(v) => onChange("condition", v)} placeholder="Pilih kondisi satwa" options={animalConditions} error={errors.condition} />
      </FormField>
    </div>
  );
}
