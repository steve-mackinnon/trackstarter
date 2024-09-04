export function scaleNormalizedValue({
  normalizedValue,
  min,
  max,
  scaling,
}: {
  normalizedValue: number;
  min: number;
  max: number;
  scaling: number;
}) {
  const scaled = Math.pow(normalizedValue, scaling);
  return min + scaled * (max - min);
}

export function inverseScaleAndNormalizeValue({
  value,
  min,
  max,
  scaling,
}: {
  value: number;
  min: number;
  max: number;
  scaling: number;
}) {
  return Math.pow(normalizeValue(value, min, max), 1 / scaling);
}

function normalizeValue(value: number, min: number, max: number) {
  return (value - min) / (max - min);
}
