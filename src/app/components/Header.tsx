import { Mood, MOODS } from "audio/melodicConstants";
import classNames from "classnames";
import { ComboBox } from "common/components/ComboBox";
import { useGenerateNewChordProgression } from "common/hooks/useGenerateNewChordProgression";
import { useSetAtom } from "jotai";
import { moodAtom } from "state";

export function Header({ className }: { className?: string }) {
  const setMood = useSetAtom(moodAtom);
  const generateNewChordProgression = useGenerateNewChordProgression();
  return (
    <div className={classNames("flex justify-between", className)}>
      <ComboBox
        label="Vibe"
        choices={(MOODS as string[]).concat("Any")}
        onChange={(newMood: string | null) => {
          if (newMood === "Any") {
            newMood = null;
          }
          setMood(newMood as Mood);
          generateNewChordProgression(newMood as Mood | null);
        }}
        defaultValue="Any"
      />
      <div>...</div>
    </div>
  );
}
