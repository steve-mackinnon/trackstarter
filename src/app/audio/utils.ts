export function semitonesToHz(semitones: number, referencePitchHz?: number) {
  return referencePitchHz ?? 440.0 * Math.pow(2, semitones / 12);
}
