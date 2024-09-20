import { AudioContext } from "standardized-audio-context";

const LOOKAHEAD_MS = 0.25;
const SCHEDULE_AHEAD_SECONDS = 0.1;
const NOTE_RESOLUTION = 0.25;

export class Scheduler {
  constructor(
    private context: AudioContext,
    private callback: (t: number) => void,
  ) {}

  public tempo = 120;

  private nextNoteTime = 0;
  private timerID?: NodeJS.Timeout;

  public async start() {
    if (this.context.state !== "running") {
      await this.context.resume();
    }
    this.nextNoteTime = this.context.currentTime;
    this.tick();
  }

  public stop() {
    if (this.timerID) {
      clearTimeout(this.timerID);
      this.timerID = undefined;
    }
  }

  public isPlaying() {
    return this.timerID !== undefined;
  }

  private tick() {
    if (this.context.state !== "running") {
      this.stop();
      return;
    }
    if (this.context.currentTime === undefined) {
      return;
    }
    while (
      this.nextNoteTime <
      this.context.currentTime + SCHEDULE_AHEAD_SECONDS
    ) {
      this.scheduleStep(this.nextNoteTime);
      this.nextNoteTime += (60.0 / this.tempo) * NOTE_RESOLUTION;
    }
    this.timerID = setTimeout(() => this.tick(), LOOKAHEAD_MS);
  }

  private scheduleStep(time: number) {
    this.callback(time);
  }
}
