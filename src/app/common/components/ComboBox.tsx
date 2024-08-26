import { useState } from "react";

interface ComboBoxProps<T extends string, U extends T> {
  label: string;
  choices: readonly T[];
  defaultValue: U;
  onChange: (value: T) => void;
  className?: string;
}

export function ComboBox<T extends string, U extends T>(
  props: ComboBoxProps<T, U>
) {
  const [value, setValue] = useState<T>(props.defaultValue);

  return (
    <div className="flex w-full justify-between px-5">
      <label htmlFor={props.label} className="select-none">
        {props.label}
      </label>
      <select
        className={`${
          props.className ?? ""
        } bg-black border-white border rounded-lg`}
        name={props.label}
        id={props.label}
        onChange={(e) => {
          const val = e.target.value as U;
          setValue(val);
          props.onChange(val);
        }}
        value={value}
      >
        {props.choices.map((v) => (
          <option value={v} key={v}>
            {v}
          </option>
        ))}
      </select>
    </div>
  );
}
