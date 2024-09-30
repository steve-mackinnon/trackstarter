import { Button } from "common/components/ui/button";
import { cn } from "common/utils";
import { Titillium_Web } from "next/font/google";
import Link from "next/link";

const contentFont = Titillium_Web({ subsets: ["latin"], weight: "400" });

export default function Home() {
  return (
    <main className="flex flex-col justify-center items-center p-6 gap-y-12 text-center">
      <h1
        className="text-[2.6rem] font-bold pt-8"
        style={{
          textShadow: "var(--harmony-border-active) 0px 0 100px",
        }}
      >
        Trackstarter
      </h1>
      <article className={cn(contentFont.className, "max-w-2xl text-lg")}>
        Trackstarter is an AI-powered songwriting tool designed to inspire your
        creative process by generating unique chord progressions and melodies.
        Whether you&apos;re facing writer&apos;s block or just looking for new
        ideas, Trackstarter offers fresh musical concepts that can be easily
        imported into your DAW or hardware sequencer, ready to be developed into
        full tracks.
      </article>
      <section aria-labelledby="features-heading">
        <h2 className="text-3xl font-bold" id="features-heading">
          Features
        </h2>
        <ul
          className={cn(
            `${contentFont.className} antialiased`,
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
              Magenta.js
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
          <li>
            Vibe selector to fine tune the mood of the generated sequences
          </li>
          <li>Dedicated synthesizers for harmony and melody</li>
          <li>Customizable amp envelopes, filters, and delay effects</li>
          <li>909 drum machine with AI-generated patterns</li>
        </ul>
      </section>

      <Link href={"/workstation"} className="mb-6 pt-6">
        <Button
          variant={"outline"}
          className="glow-on-hover bg-slate-900 border-2 text-2xl w-48 h-16 rounded-xl"
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
