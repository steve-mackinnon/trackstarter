import dynamic from "next/dynamic";
const SongStarterView = dynamic(() => import("components/SongStarterView"), {
  ssr: false,
});

export default function Workstation() {
  return <SongStarterView />;
}
