## Getting Started

To run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## About

Trackstarter is an AI-powered songwriting tool designed to inspire the creative process by generating unique chord progressions and melodies. It leverages [Tonal.js](https://github.com/tonaljs/tonal) to map musical scales to notes, randomly generates chord progressions given a "mood" (picks from a hardcoded map of `Mood` -> `ChordProgression[]`), then hands the chord progression to a pre-trained [Magenta.js](https://github.com/magenta/magenta-js) model capable of creating a two bar melody given chords as an input (inference happens right in the browser).

If you find a sequence you like, you can download it as a pair of MIDI files and drag it into your DAW, sequencer, etc. to turn it into a full song.

This is mostly an experiment/proof of concept, but it's capable of generating some compelling two bar ideas. Hope you enjoy it!

## Details

The app is built with Next.js/React, uses Jotai for state management, shadcn UI components, Tailwind CSS and WebAudio for playback.

In [audioGraph.ts](/src/app/audio/audioGraph.ts), you'll find a React-virtual-DOM-esque audio graph/reconciler that is heavily inspired by [Elementary Audio](https://github.com/elemaudio/elementary). This lets us write some nice declarative code to describe the audio graph instead of dealing with the details of connecting and updating WebAudio nodes directly ([check out the useRenderAudioGraph hook](https://github.com/steve-mackinnon/trackstarter/blob/230b809bce119e92eddf938317a728d88ebe5bdf/src/app/common/hooks/useRenderAudioGraph.ts#L145-L167)) to see what this looks like.
