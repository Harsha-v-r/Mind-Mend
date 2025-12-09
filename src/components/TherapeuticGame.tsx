import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wind, Play, Pause } from "lucide-react";

const TherapeuticGame = () => {
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState<"inhale" | "hold" | "exhale">("inhale");
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      setSeconds((s) => {
        const newSeconds = s + 1;
        
        if (phase === "inhale" && newSeconds >= 4) {
          setPhase("hold");
          return 0;
        } else if (phase === "hold" && newSeconds >= 4) {
          setPhase("exhale");
          return 0;
        } else if (phase === "exhale" && newSeconds >= 4) {
          setPhase("inhale");
          return 0;
        }
        
        return newSeconds;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, phase]);

  const getPhaseText = () => {
    switch (phase) {
      case "inhale":
        return "Breathe In";
      case "hold":
        return "Hold";
      case "exhale":
        return "Breathe Out";
    }
  };

  const getPhaseColor = () => {
    switch (phase) {
      case "inhale":
        return "bg-primary/20 border-primary";
      case "hold":
        return "bg-secondary/20 border-secondary";
      case "exhale":
        return "bg-accent/20 border-accent";
    }
  };

  return (
    <Card className="shadow-soft">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wind className="w-5 h-5 text-primary" />
          Breathing Exercise
        </CardTitle>
        <CardDescription>
          A simple 4-4-4 breathing technique to help you relax and reduce stress
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col items-center justify-center py-12">
          <div
            className={`w-48 h-48 rounded-full border-8 flex items-center justify-center transition-all duration-1000 ${getPhaseColor()} ${
              isActive ? "animate-pulse-soft" : ""
            }`}
          >
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">{4 - seconds}</div>
              <div className="text-lg font-medium">{getPhaseText()}</div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <Button
            onClick={() => setIsActive(!isActive)}
            className="w-full gradient-calm gap-2"
            size="lg"
          >
            {isActive ? (
              <>
                <Pause className="w-5 h-5" />
                Pause
              </>
            ) : (
              <>
                <Play className="w-5 h-5" />
                Start Breathing Exercise
              </>
            )}
          </Button>

          <div className="bg-muted/50 p-4 rounded-lg space-y-2 text-sm">
            <h4 className="font-semibold">How it works:</h4>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Inhale deeply for 4 seconds</li>
              <li>Hold your breath for 4 seconds</li>
              <li>Exhale slowly for 4 seconds</li>
              <li>Repeat for 2-5 minutes for best results</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TherapeuticGame;