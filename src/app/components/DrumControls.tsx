import { Button } from "common/components/ui/button";
import { useGenerateNewDrumPattern } from "common/hooks/useGenerateNewDrumPattern";
import { Dices, DrumIcon } from "lucide-react";
import { useState } from "react";
import LoadingIndicator from "react-spinners/PuffLoader";

export function DrumControls() {
  const generateNewDrumPattern = useGenerateNewDrumPattern();
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div className="flex flex-col relative justify-center items-center bg-primary-foreground p-4 rounded-xl border-2 border-fuchsia-800">
      <span className="font-bold text-lg">Drums</span>
      <Button
        variant="outline"
        className="gap-x-4 rounded-xl"
        onClick={async () => {
          setIsLoading(true);
          await generateNewDrumPattern();
          setIsLoading(false);
        }}
      >
        <Dices />
        <DrumIcon />
      </Button>
      {isLoading && (
        <div className="absolute flex flex-col justify-center items-center w-full h-full bg-black opacity-85 rounded-xl">
          <LoadingIndicator color="white" />
        </div>
      )}
    </div>
  );
}
