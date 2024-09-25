import { useGenerateNewSong } from "common/hooks/useGenerateNewSong";
import { useEffect, useState } from "react";

export function useGenerateSongOnFirstRender() {
  const generateNewSong = useGenerateNewSong();
  const [initialLoad, setInitialLoad] = useState(true);

  useEffect(() => {
    if (!initialLoad) {
      return;
    }
    setInitialLoad(false);
    generateNewSong(null, true);
  }, [initialLoad, setInitialLoad, generateNewSong]);
}
