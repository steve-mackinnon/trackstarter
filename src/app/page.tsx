import Image from "next/image";
import { Sequencer } from "./components/Sequencer";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <Sequencer />
    </main>
  );
}
