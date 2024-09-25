import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "common/components/ui/select";
import { cn } from "common/utils";
import { useState } from "react";

interface ComboBoxProps<T extends string, U extends T> {
  label?: string;
  choices: readonly T[];
  defaultValue: U;
  widthPx: number;
  className?: string;
  onChange: (value: T) => void;
}

export function ComboBox<T extends string, U extends T>(
  props: ComboBoxProps<T, U>,
) {
  const [value, setValue] = useState<T>(props.defaultValue);

  return (
    <div
      className={cn("flex justify-between items-center py-1", props.className)}
    >
      {props.label && (
        <label htmlFor={props.label} className="select-none w-[60px]">
          {props.label}
        </label>
      )}
      <Select
        name={props.label}
        onValueChange={(val: U) => {
          setValue(val);
          props.onChange(val);
        }}
        defaultValue={value}
      >
        <SelectTrigger className={`w-[${props.widthPx}px] h-8`}>
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
