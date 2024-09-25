importScripts(
  "https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@1.4.0/dist/tf.min.js",
);
importScripts(
  "https://cdn.jsdelivr.net/npm/@magenta/music@^1.12.0/es6/music_rnn.js",
);

const DRUMS_CHECKPOINT_URL =
  "https://storage.googleapis.com/magentadata/js/checkpoints/music_rnn/drum_kit_rnn";
const drumsRnn = new music_rnn.MusicRNN(DRUMS_CHECKPOINT_URL);
let initialized = false;

onmessage = async (e) => {
  if (!initialized) {
    await drumsRnn.initialize();
    initialized = true;
  }

  const { seed, steps, temperature } = e.data;
  const sequence = await drumsRnn.continueSequence(seed, steps, temperature);

  postMessage(sequence);
};
