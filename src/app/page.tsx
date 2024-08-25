"use strict";

import dynamic from "next/dynamic";
const SongStarterView = dynamic(() => import("./components/SongStarterView"), {
  ssr: false,
});

export default function Home() {
  return <SongStarterView />;
}
