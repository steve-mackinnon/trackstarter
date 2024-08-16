let idCounter = 0;

export function uniqueId(): string {
  return `${idCounter++}`;
}
