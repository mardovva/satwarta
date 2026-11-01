import type { ReportFormErrors, ReportFormValues } from "@/types/report";
import { CONDITION_OTHER, animalConditions, animalTypes } from "@/data/formOptions";
import { FormField, SelectField, fieldProps, inputClass } from "./FormField";

interface Props {
  values: ReportFormValues;
  errors: ReportFormErrors;
  onChange: <K extends keyof ReportFormValues>(key: K, value: ReportFormValues[K]) => void;
}

export default function AnimalInformationForm({ values, errors, onChange }: Props) {
  return (
    <div className="space-y-5">
      <FormField id="field-animalType" label="Jenis satwa" required error={errors.animalType}>
        <SelectField id="field-animalType" value={values.animalType} onChange={(v) => onChange("animalType", v)} placeholder="Pilih jenis satwa" options={animalTypes} error={errors.animalType} />
      </FormField>

      <FormField id="field-animalName" label="Nama satwa">
        <input
          {...fieldProps("field-animalName")}
          value={values.animalName}
          onChange={(e) => onChange("animalName", e.target.value)}
          placeholder="Contoh: Orangutan Kalimantan"
          className={inputClass()}
        />
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

      <div className="space-y-3">
        <FormField id="field-condition" label="Kondisi satwa" required error={errors.condition}>
          <SelectField id="field-condition" value={values.condition} onChange={(v) => onChange("condition", v)} placeholder="Pilih kondisi satwa" options={[...animalConditions, CONDITION_OTHER]} error={errors.condition} />
        </FormField>
        {values.condition === CONDITION_OTHER && (
          <FormField id="field-conditionOther" label="Tulis kondisi satwa" required error={errors.conditionOther}>
            <input
              {...fieldProps("field-conditionOther", errors.conditionOther)}
              autoFocus maxLength={120}
              value={values.conditionOther}
              onChange={(e) => onChange("conditionOther", e.target.value)}
              placeholder="Contoh: Lemah dan kesulitan bergerak"
              className={inputClass(!!errors.conditionOther)}
            />
          </FormField>
        )}
      </div>
    </div>
  );
}
