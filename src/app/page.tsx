import { Button } from "common/components/ui/button";
import { cn } from "common/utils";
import { Roboto_Flex } from "next/font/google";
import Link from "next/link";

const roboto = Roboto_Flex({ subsets: ["latin"] });

export default function Home() {
  return (
    <main className="flex flex-col justify-center items-center p-4 gap-y-12 text-center">
      <h1 className="text-4xl font-bold pt-8">Trackstarter</h1>
      <article className={cn(roboto.className, "max-w-2xl text-lg")}>
        Trackstarter is an AI-powered songwriting tool designed to fuel your
        creative process by generating unique melodic sequences. Its goal is to
        songwriters overcome writer's block by presenting fresh ideas that that
        can be easily imported into a DAW or hardware sequencer and transformed
        into full tracks.
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
            <span> and </span>
            <a
              href="https://github.com/tonaljs/tonal"
              className="text-blue-400"
            >
              Tonal.js
            </a>
          </li>
          <li>
            MIDI file download <i>(iOS currently unsupported)</i>
          </li>
          <li>Vibe selector to fine tune the mood of the generated song</li>
          <li>Dedicated synthesizers for harmony and melody</li>
          <li>Customizable amp envelopes, filters, and delay effects</li>
        </ul>
      </section>

      <Link href={"/workstation"} className="mb-6">
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
