import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "common/components/ui/select";
import { useState } from "react";

interface ComboBoxProps<T extends string, U extends T> {
  label: string;
  choices: readonly T[];
  defaultValue: U;
  onChange: (value: T) => void;
}

export function ComboBox<T extends string, U extends T>(
  props: ComboBoxProps<T, U>,
) {
  const [value, setValue] = useState<T>(props.defaultValue);

  return (
    <div className="flex justify-between items-center px-5 py-1">
      <label htmlFor={props.label} className="select-none w-[60px]">
        {props.label}
      </label>
      <Select
        name={props.label}
        onValueChange={(val: U) => {
          setValue(val);
          props.onChange(val);
        }}
        defaultValue={value}
      >
        <SelectTrigger className="w-[160px] h-8">
          <SelectValue placeholder={value} />
        </SelectTrigger>

        <SelectContent>
          {props.choices.map((v) => (
            <SelectItem className="text-white" value={v} key={v}>
              {v}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
