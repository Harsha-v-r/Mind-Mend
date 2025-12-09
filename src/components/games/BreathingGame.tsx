import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wind, Play, Pause, Trophy } from "lucide-react";
import { toast } from "sonner";
import { useGameScore } from "@/hooks/useGameScore";

const generateLevel = (levelNum: number) => {
  const baseInhale = 4 + Math.floor(levelNum / 3);
  const baseHold = 4 + Math.floor(levelNum / 2);
  const baseExhale = 4 + Math.floor(levelNum / 2);
  const cycles = 3 + Math.floor(levelNum / 2);
  
  return {
    name: `Level ${levelNum}`,
    inhale: Math.min(baseInhale, 8),
    hold: Math.min(baseHold, 10),
    exhale: Math.min(baseExhale, 12),
    cycles: Math.min(cycles, 8),
  };
};

const BreathingGame = () => {
  const { highestLevel, updateHighScore } = useGameScore("breathing_exercise");
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState<"inhale" | "hold" | "exhale">("inhale");
  const [seconds, setSeconds] = useState(0);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [completedCycles, setCompletedCycles] = useState(0);

  const pattern = generateLevel(currentLevel);

  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      setSeconds((s) => {
        const newSeconds = s + 1;
        
        if (phase === "inhale" && newSeconds >= pattern.inhale) {
          setPhase("hold");
          return 0;
        } else if (phase === "hold" && newSeconds >= pattern.hold) {
          setPhase("exhale");
          return 0;
        } else if (phase === "exhale" && newSeconds >= pattern.exhale) {
          setPhase("inhale");
          setCompletedCycles((c) => {
            const newCount = c + 1;
            if (newCount >= pattern.cycles) {
              setIsActive(false);
              updateHighScore(currentLevel);
              toast.success(`🎉 Level ${currentLevel} complete!`);
            }
            return newCount;
          });
          return 0;
        }
        
        return newSeconds;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, phase, pattern]);

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
          Breathing Exercise - {pattern.name}
        </CardTitle>
        <CardDescription>
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-primary" />
            Complete {pattern.cycles} breathing cycles to advance
          </div>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="text-lg font-semibold">
              Cycle {completedCycles} / {pattern.cycles}
            </div>
            {highestLevel > 1 && (
              <div className="text-sm text-muted-foreground">
                Best: Level {highestLevel}
              </div>
            )}
          </div>
          {!isActive && completedCycles >= pattern.cycles && (
            <Button onClick={() => {
              setCurrentLevel((l) => l + 1);
              setCompletedCycles(0);
              setPhase("inhale");
              setSeconds(0);
            }} size="sm" className="gradient-calm">
              Next Level
            </Button>
          )}
        </div>

        <div className="flex flex-col items-center justify-center py-12">
          <div
            className={`w-48 h-48 rounded-full border-8 flex items-center justify-center transition-all duration-1000 ${getPhaseColor()} ${
              isActive ? "animate-pulse-soft" : ""
            }`}
          >
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">
                {phase === "inhale" ? pattern.inhale - seconds : phase === "hold" ? pattern.hold - seconds : pattern.exhale - seconds}
              </div>
              <div className="text-lg font-medium">{getPhaseText()}</div>
            </div>
          </div>
        </div>

        <Button
          onClick={() => setIsActive(!isActive)}
          className="gradient-calm gap-2 w-full"
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
              Start
            </>
          )}
        </Button>

        <div className="bg-muted/50 p-4 rounded-lg space-y-2 text-sm">
          <h4 className="font-semibold">Current Pattern:</h4>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
            <li>Inhale: {pattern.inhale}s</li>
            <li>Hold: {pattern.hold}s</li>
            <li>Exhale: {pattern.exhale}s</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default BreathingGame;
