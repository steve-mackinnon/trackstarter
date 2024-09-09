import MidiWriter from "midi-writer-js";
import { SequencerEvent } from "./audioGraph";

function stepToTick(step: number): number {
  // 128 ticks per beat, and one step per 16th note
  return (step / 4) * 128;
}

export function sequenceToMidiData(
  sequence: SequencerEvent[],
  trackName: string,
): Uint8Array {
  const track = new MidiWriter.Track();
  track.addTrackName(trackName);

  // This is a hack to workaround a bug in midi-writer-js where only the first
  // event with tick set to 0 will be included in the written midi data.
  const step0Notes = sequence
    .filter((ev) => ev.startStep === 0)
    .map((ev) => ev.note);
  if (step0Notes.length > 0) {
    const firstEvent = sequence.find((ev) => ev.startStep === 0);
    const duration = stepToTick(firstEvent!.endStep - firstEvent!.startStep);
    track.addEvent(
      new MidiWriter.NoteEvent({
        pitch: step0Notes,
        duration: `T${duration}`,
        tick: stepToTick(firstEvent!.startStep),
      }),
    );
  }
  sequence
    .filter((ev) => ev.startStep !== 0)
    .forEach((event: SequencerEvent) => {
      const duration = stepToTick(event.endStep - event.startStep);
      const startTime = stepToTick(event.startStep);
      const noteEvent = new MidiWriter.NoteEvent({
        pitch: event.note,
        duration: `T${duration}`,
        tick: startTime,
      });
      track.addEvent(noteEvent);
    });
  const writer = new MidiWriter.Writer([track]);
  return writer.buildFile();
}
