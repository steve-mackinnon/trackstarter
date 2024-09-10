import { Button } from "common/components/ui/button";
import { cn } from "common/utils";
import { Roboto_Flex } from "next/font/google";
import Link from "next/link";

const roboto = Roboto_Flex({ subsets: ["latin"] });

export default function Home() {
  return (
    <main className="flex flex-col justify-center items-center gap-6 p-4 pt-10 text-center">
      <h1 className="text-4xl font-bold">Track Starter</h1>
      <article className={cn(roboto.className, "max-w-2xl text-lg")}>
        Track Starter is an AI-powered music creation tool that generates short
        melodic ideas that can be downloaded as MIDI. I built this tool to find
        interesting chord progressions to use when writing music.
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
