export function scaleValue({
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

export function inverseScaleValue({
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
  const normalizedValue = (value - min) / (max - min);
  return Math.pow(normalizedValue, 1 / scaling);
}
