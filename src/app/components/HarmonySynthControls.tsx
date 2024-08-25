import { setProperty } from "audio/audioGraph";
import { ComboBox } from "common/components/ComboBox";
import { useAtom } from "jotai";
import { harmonySynthParamsAtom } from "state";

export function HarmonySynthControls() {
  const [params, setParams] = useAtom(harmonySynthParamsAtom);

  return (
    <div className="w-36">
      <ComboBox
        label="Shape"
        choices={["sine", "sawtooth", "square", "triangle"]}
        defaultValue={
          params.type as "sine" | "sawtooth" | "square" | "triangle"
        }
        onChange={(v) => {
          setParams({ ...params, type: v });
          setProperty("0", "osc", "type", v);
        }}
      />
    </div>
  );
}
