import { Button } from "common/components/ui/button";
import { cn } from "common/utils";
import { Roboto_Flex } from "next/font/google";
import Link from "next/link";

const roboto = Roboto_Flex({ subsets: ["latin"] });

export default function Home() {
  return (
    <main className="flex flex-col justify-center items-center gap-6 p-4 pt-10 text-center">
      <h1 className="text-4xl font-bold p-3">Trackstarter</h1>
      <article className={cn(roboto.className, "max-w-2xl text-lg")}>
        Trackstarter is an AI-powered tool designed to inspire your music
        creation process by generating unique, short melodic ideas. Chord
        progression and melodies can be downloaded as MIDI files and dragged
        into your DAW, giving you the perfect starting point to build a full
        track.
      </article>
      <section aria-labelledby="features-heading">
        <h2 className="text-3xl font-bold" id="features-heading">
          Features
        </h2>
        <ul
          className={cn(
            `${roboto.className} antialiased`,
            "list-disc text-left pl-8 pt-4 text-lg",
          )}
        >
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
          <li>Vibe selector for fine tuning the mood of the generated song</li>
          <li>Dedicated synthesizers for harmony and melody</li>
          <li>Adjustable amp envelopes, filters, and FX</li>
        </ul>
      </section>

      <Link href={"/workstation"}>
        <Button
          variant={"outline"}
          className="bg-slate-900 border-2 text-2xl w-48 h-16 rounded-xl"
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
