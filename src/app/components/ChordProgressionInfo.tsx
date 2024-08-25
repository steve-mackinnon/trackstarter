import { useAtomValue } from "jotai";
import { chordProgressionAtom } from "state";

function InfoReadout({ label, value }: { label: string; value?: string }) {
  if (!value) {
    return null;
  }
  return (
    <div className="inline-flex">
      <b className="mr-2">{label}: </b>
      <p>{value}</p>
    </div>
  );
}

export function ChordProgressionInfo() {
  const chordProgression = useAtomValue(chordProgressionAtom);
  return (
    <div className="flex flex-col justify-center w-72">
      <InfoReadout label="Mood" value={chordProgression?.mood} />
      <InfoReadout label="Root" value={chordProgression?.rootNote} />
      <InfoReadout label="Progression" value={chordProgression?.progression} />
      <InfoReadout
        label="Chords"
        value={chordProgression?.chordNames.join(", ")}
      />
    </div>
  );
}
