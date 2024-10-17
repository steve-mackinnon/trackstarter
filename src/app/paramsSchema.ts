import { z } from "zod";

const lfoParamsSchema = z.object({
  rate: z.number(),
  amount: z.number(),
});

const delayParamsSchema = z.object({
  sendAmount: z.number(),
  time: z.number(),
  feedback: z.number(),
  lpfFrequency: z.number(),
});

const oscPropsSchema = z.object({
  type: z.enum(["sine", "square", "sawtooth", "triangle"]),
  detune: z.number(),
});

const synthParamsSchema = oscPropsSchema.extend({
  filterFrequency: z.number(),
  filterLFO: lfoParamsSchema,
  oscFrequencyLFO: lfoParamsSchema,
  filterQ: z.number(),
  attack: z.number(),
  decay: z.number(),
  sustain: z.number(),
  release: z.number(),
  delayParams: delayParamsSchema,
  gain: z.number().min(0).max(0.3),
});

const sequenceSchema = z.array(
  z.object({
    startStep: z.number().int().min(0).max(128),
    endStep: z.number().int().min(0).max(128),
    note: z.string(),
  }),
);

export const paramStateSchema = z.object({
  harmonySynthState: synthParamsSchema,
  melodySynthState: synthParamsSchema,
  scale: z.string(),
  rootNote: z.string(),
  chordProgression: sequenceSchema,
  melody: sequenceSchema,
});

export type ParamState = z.infer<typeof paramStateSchema>;
