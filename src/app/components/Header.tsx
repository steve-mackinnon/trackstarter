import { Mood, MOODS } from "audio/melodicConstants";
import { sequenceToMidiData } from "audio/midiWriter";
import { chordProgressionToSequencerEvents } from "audio/sequenceGenerator";
import classNames from "classnames";
import { ComboBox } from "common/components/ComboBox";
import { Button } from "common/components/ui/button";
import { useGenerateNewChordProgression } from "common/hooks/useGenerateNewChordProgression";
import { saveToFile } from "common/utils/saveToFile";
import { useAtomValue, useSetAtom } from "jotai";
import { Download } from "lucide-react";
import { chordProgressionAtom, melodyAtom, moodAtom } from "state";

export function Header({ className }: { className?: string }) {
  const setMood = useSetAtom(moodAtom);
  const generateNewChordProgression = useGenerateNewChordProgression();
  const melody = useAtomValue(melodyAtom);
  const harmony = useAtomValue(chordProgressionAtom);

  const writeCurrentStateToMidiFile = () => {
    if (!melody || !harmony) {
      return;
    }
    const harmonyMidi = sequenceToMidiData(
      chordProgressionToSequencerEvents(harmony.chordNotes),
      "harmony",
    );
    const melodyMidi = sequenceToMidiData(melody, "melody");
    saveToFile([
      { data: harmonyMidi, filename: "harmony.midi" },
      { data: melodyMidi, filename: "melody.midi" },
    ]);
  };

  return (
    <div className={classNames("flex justify-between", className)}>
      <ComboBox
        label="vibe"
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
      <Button
        variant={"secondary"}
        disabled={!melody || !harmony}
        onClick={() => writeCurrentStateToMidiFile()}
        aria-label="Download MIDI"
      >
        <Download className="px-1" />
        MIDI
      </Button>
    </div>
  );
}
