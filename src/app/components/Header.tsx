import { Mood, MOODS } from "audio/melodicConstants";
import { sequenceToMidiData } from "audio/midiWriter";
import { chordProgressionToSequencerEvents } from "audio/sequenceGenerator";
import classNames from "classnames";
import { ComboBox } from "common/components/ComboBox";
import { Button } from "common/components/ui/button";
import { useGenerateNewSong } from "common/hooks/useGenerateNewSong";
import { useSaveParameterStateToFile } from "common/hooks/useSaveParameterStateToFile";
import { saveToFile } from "common/utils/saveToFile";
import { useAtomValue, useSetAtom } from "jotai";
import { Download, HomeIcon } from "lucide-react";
import Link from "next/link";
import { chordProgressionAtom, melodyAtom, moodAtom } from "state";

const PRESET_DOWNLOAD_ENABLED = false;

const iOSDevice =
  /(iPad|iPhone|iPod)/g.test(navigator.userAgent) ||
  (navigator.userAgent.includes("Mac") && "ontouchend" in document);

export function Header({ className }: { className?: string }) {
  const setMood = useSetAtom(moodAtom);
  const generateNewChordProgression = useGenerateNewSong();
  const melody = useAtomValue(melodyAtom);
  const harmony = useAtomValue(chordProgressionAtom);
  const saveParameterStateToFile = useSaveParameterStateToFile();

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
      <Link href={"/"}>
        <Button variant="link" aria-label="home">
          <HomeIcon />
        </Button>
      </Link>
      <ComboBox
        className="px-5"
        widthPx={160}
        label="vibe"
        choices={["Any", ...(MOODS as string[])]}
        onChange={(newMood: string | null) => {
          if (newMood === "Any") {
            newMood = null;
          }
          setMood(newMood as Mood);
          generateNewChordProgression(newMood as Mood | null, false);
        }}
        defaultValue="Any"
      />
      {!iOSDevice && (
        <Button
          variant={"secondary"}
          disabled={!melody || !harmony}
          onClick={() => writeCurrentStateToMidiFile()}
          aria-label="Download MIDI"
        >
          <Download className="px-1" />
          MIDI
        </Button>
      )}
      {PRESET_DOWNLOAD_ENABLED && (
        <Button
          variant={"secondary"}
          disabled={!melody || !harmony}
          onClick={() => saveParameterStateToFile()}
          aria-label="Download MIDI"
        >
          <Download className="px-1" />
          Preset
        </Button>
      )}
    </div>
  );
}
