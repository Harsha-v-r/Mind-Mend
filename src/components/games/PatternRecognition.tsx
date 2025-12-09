import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, RotateCcw, Clock, Trophy } from "lucide-react";
import { toast } from "sonner";
import { useGameScore } from "@/hooks/useGameScore";

// Pattern shapes that can be used
const shapes = ["🔴", "🔵", "🟢", "🟡", "🟣", "🟠", "⭐", "❤️", "💎", "🔷"];

const generatePattern = (level: number) => {
  const complexity = Math.min(3 + Math.floor(level / 2), 8);
  const pattern: string[] = [];
  
  for (let i = 0; i < complexity; i++) {
    pattern.push(shapes[Math.floor(Math.random() * Math.min(shapes.length, 4 + level))]);
  }
  
  return pattern;
};

const generateOptions = (correctPattern: string[], level: number) => {
  const options = [correctPattern];
  
  // Generate 3 similar but incorrect patterns
  for (let i = 0; i < 3; i++) {
    const wrongPattern = [...correctPattern];
    // Change 1-2 elements randomly
    const changesToMake = Math.random() > 0.5 ? 1 : 2;
    for (let j = 0; j < changesToMake; j++) {
      const randomIndex = Math.floor(Math.random() * wrongPattern.length);
      let newShape;
      do {
        newShape = shapes[Math.floor(Math.random() * Math.min(shapes.length, 4 + level))];
      } while (newShape === wrongPattern[randomIndex]);
      wrongPattern[randomIndex] = newShape;
    }
    options.push(wrongPattern);
  }
  
  // Shuffle options
  return options.sort(() => Math.random() - 0.5);
};

const PatternRecognition = () => {
  const { highestLevel, updateHighScore } = useGameScore("pattern_recognition");
  const [currentLevel, setCurrentLevel] = useState(1);
  const [pattern, setPattern] = useState<string[]>([]);
  const [options, setOptions] = useState<string[][]>([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [gameActive, setGameActive] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [showPattern, setShowPattern] = useState(true);
  const [gameStarted, setGameStarted] = useState(false);

  const timeLimit = Math.max(15 - Math.floor(currentLevel / 3), 8);

  const startLevel = () => {
    const newPattern = generatePattern(currentLevel);
    setPattern(newPattern);
    setOptions(generateOptions(newPattern, currentLevel));
    setTimeLeft(timeLimit);
    setGameActive(true);
    setGameOver(false);
    setShowPattern(true);

    // Hide pattern after 3 seconds
    setTimeout(() => {
      setShowPattern(false);
    }, Math.max(3000 - currentLevel * 100, 1500));
  };

  useEffect(() => {
    if (gameStarted) {
      startLevel();
    }
  }, [currentLevel, gameStarted]);

  useEffect(() => {
    if (gameActive && timeLeft > 0 && !showPattern) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && gameActive && !showPattern) {
      setGameOver(true);
      setGameActive(false);
      toast.error("⏰ Time's up! Game Over!");
    }
  }, [timeLeft, gameActive, showPattern]);

  const handleOptionClick = (selectedPattern: string[]) => {
    if (!gameActive || showPattern) return;

    const isCorrect = JSON.stringify(selectedPattern) === JSON.stringify(pattern);

    if (isCorrect) {
      setGameActive(false);
      updateHighScore(currentLevel);
      toast.success(`🎉 Correct! Level ${currentLevel} complete!`);
      setTimeout(() => {
        setCurrentLevel((l) => l + 1);
      }, 1500);
    } else {
      setGameOver(true);
      setGameActive(false);
      toast.error("❌ Wrong answer! Game Over!");
    }
  };

  const resetGame = () => {
    setCurrentLevel(1);
    setGameStarted(false);
    setGameOver(false);
  };

  const handleStartGame = () => {
    setGameStarted(true);
    startLevel();
  };

  return (
    <Card className="shadow-soft">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-primary" />
          Pattern Recognition - Level {currentLevel}
        </CardTitle>
        <CardDescription>
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-primary" />
            Memorize and find the matching pattern within {timeLimit} seconds
          </div>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-lg font-semibold">Level {currentLevel}</div>
            {highestLevel > 1 && (
              <div className="text-sm text-muted-foreground">
                Best: Level {highestLevel}
              </div>
            )}
            {!showPattern && gameActive && (
              <div className="flex items-center gap-2 text-lg font-semibold">
                <Clock className="w-5 h-5 text-primary" />
                <span className={timeLeft <= 5 ? "text-destructive animate-pulse" : ""}>
                  {timeLeft}s
                </span>
              </div>
            )}
          </div>
          <Button onClick={resetGame} variant="outline" size="sm" className="gap-2">
            <RotateCcw className="w-4 h-4" />
            Reset
          </Button>
        </div>

        {!gameStarted ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <div className="text-center space-y-2">
              <p className="text-lg font-semibold">Ready to test your memory?</p>
              <p className="text-sm text-muted-foreground">
                Memorize patterns and select the correct one within the time limit
              </p>
            </div>
            <Button onClick={handleStartGame} size="lg" className="gradient-calm">
              Start Game
            </Button>
          </div>
        ) : showPattern ? (
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-lg font-semibold mb-4">Memorize this pattern!</p>
              <div className="bg-primary/10 border-2 border-primary p-6 rounded-lg">
                <div className="flex items-center justify-center gap-3 text-4xl">
                  {pattern.map((shape, idx) => (
                    <span key={idx}>{shape}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : gameOver ? (
          <div className="space-y-4">
            <div className="bg-destructive/10 border border-destructive/20 p-6 rounded-lg text-center">
              <p className="text-destructive font-semibold mb-4">Game Over!</p>
              <p className="text-sm text-muted-foreground mb-4">The correct pattern was:</p>
              <div className="flex items-center justify-center gap-3 text-3xl">
                {pattern.map((shape, idx) => (
                  <span key={idx}>{shape}</span>
                ))}
              </div>
            </div>
            <Button onClick={resetGame} className="w-full gradient-calm">
              Try Again
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-center font-semibold">Which pattern did you see?</p>
            <div className="grid grid-cols-2 gap-4">
              {options.map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => handleOptionClick(option)}
                  disabled={!gameActive}
                  className="bg-muted hover:bg-muted/80 border-2 border-border hover:border-primary p-6 rounded-lg transition-all duration-200 hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <div className="flex items-center justify-center gap-2 text-3xl">
                    {option.map((shape, shapeIdx) => (
                      <span key={shapeIdx}>{shape}</span>
                    ))}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="bg-muted/50 p-4 rounded-lg space-y-2 text-sm">
          <h4 className="font-semibold">How to play:</h4>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
            <li>Memorize the pattern shown for a few seconds</li>
            <li>Select the matching pattern from 4 options</li>
            <li>Answer within the time limit to advance</li>
            <li>Each level gets harder with longer patterns and less time</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default PatternRecognition;
