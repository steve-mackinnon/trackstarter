import { Button } from "common/components/ui/button";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Track Starter",
  applicationName: "Track Starter",
  description:
    "Music creation tool that generates short melodic ideas you can download as MIDI to inspire your next song.",
  keywords: [
    "music",
    "production",
    "ai",
    "gen",
    "midi",
    "generative",
    "synthesizer",
    "webaudio",
    "audio",
    "electronic",
  ],
};

export default function Home() {
  return (
    <main className="flex flex-col justify-center items-center gap-6 p-4 text-center">
      <h1 className="text-2xl font-bold app-title">Track Starter</h1>
      <article className="max-w-2xl">
        Track Starter is an AI-powered music creation tool that generates short
        melodic ideas that can be downloaded as MIDI. I built this tool to find
        interesting chord progressions to use when writing music.
      </article>
      <section aria-labelledby="features-heading">
        <h2 className="text-xl font-bold" id="features-heading">
          Features
        </h2>
        <ul className="list-disc text-left pl-8 pt-4">
          <li>
            Chord progression and melody generation powered by
            <span> </span>
            <a
              href="https://magenta.tensorflow.org/js-announce"
              className="text-blue-400"
            >
              Majenta.js
            </a>
          </li>
          <li>
            MIDI file download <i>(unsupported on iOS)</i>
          </li>
          <li>Dedicated synthesizers for harmony and melody</li>
          <li>Adjustable amp envelopes, filters, and FX</li>
        </ul>
      </section>

      <Link href={"/workstation"}>
        <Button
          variant={"outline"}
          className="bg-slate-900 border-2"
          style={{
            borderColor: "var(--harmony-border-active)",
          }}
        >
          Get Started
        </Button>
      </Link>
    </main>
  );
}
