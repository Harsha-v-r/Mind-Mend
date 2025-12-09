import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, RotateCcw, Trophy, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useGameScore } from "@/hooks/useGameScore";

const allEmojis = ["🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼", "🐨", "🐯", "🦁", "🐮", "🐷", "🐸", "🐵", "🐔"];

const generateLevel = (levelNum: number) => {
  const pairs = Math.min(4 + levelNum, 12);
  const maxMoves = Math.max(Math.floor(pairs * 1.5 + 3 - Math.floor(levelNum / 3)), pairs + 2);
  const emojis = allEmojis.slice(0, pairs);
  
  return {
    name: `Level ${levelNum}`,
    pairs,
    emojis,
    maxMoves,
  };
};

const MemoryGame = () => {
  const { highestLevel, updateHighScore } = useGameScore("memory_match");
  const [cards, setCards] = useState<{ id: number; emoji: string; flipped: boolean; matched: boolean }[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [isChecking, setIsChecking] = useState(false);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [gameOver, setGameOver] = useState(false);

  const level = generateLevel(currentLevel);

  const initializeGame = () => {
    const gameEmojis = [...level.emojis, ...level.emojis]
      .sort(() => Math.random() - 0.5)
      .map((emoji, index) => ({
        id: index,
        emoji,
        flipped: false,
        matched: false,
      }));
    setCards(gameEmojis);
    setFlippedIndices([]);
    setMoves(0);
    setGameOver(false);
  };

  useEffect(() => {
    initializeGame();
  }, [currentLevel]);

  useEffect(() => {
    if (flippedIndices.length === 2 && !isChecking) {
      setIsChecking(true);
      const [first, second] = flippedIndices;

      if (cards[first].emoji === cards[second].emoji) {
        setTimeout(() => {
          setCards((prev) =>
            prev.map((card, idx) =>
              idx === first || idx === second ? { ...card, matched: true } : card
            )
          );
          setFlippedIndices([]);
          setIsChecking(false);
          
          if (cards.filter(c => !c.matched).length === 2) {
            updateHighScore(currentLevel);
            toast.success(`🎉 Level ${currentLevel} complete! Moves used: ${moves}/${level.maxMoves}`);
            setTimeout(() => setCurrentLevel((l) => l + 1), 1500);
          }
        }, 500);
      } else {
        setTimeout(() => {
          setCards((prev) =>
            prev.map((card, idx) =>
              idx === first || idx === second ? { ...card, flipped: false } : card
            )
          );
          setFlippedIndices([]);
          setIsChecking(false);
        }, 1000);
      }
    }
  }, [flippedIndices, cards, isChecking]);

  useEffect(() => {
    if (moves >= level.maxMoves && !gameOver && cards.some(c => !c.matched)) {
      setGameOver(true);
      toast.error(`Game Over! You've used all ${level.maxMoves} moves.`);
    }
  }, [moves, level.maxMoves, gameOver, cards]);

  const handleCardClick = (index: number) => {
    if (gameOver || isChecking || flippedIndices.length >= 2 || cards[index].matched) {
      return;
    }

    // If clicking on an already flipped card (and it's the only one flipped), close it
    if (cards[index].flipped && flippedIndices.length === 1 && flippedIndices[0] === index) {
      setCards((prev) =>
        prev.map((card, idx) => (idx === index ? { ...card, flipped: false } : card))
      );
      setFlippedIndices([]);
      toast.success("Card closed without costing a move!");
      return;
    }

    // Don't allow clicking already flipped cards
    if (cards[index].flipped) {
      return;
    }

    setCards((prev) =>
      prev.map((card, idx) => (idx === index ? { ...card, flipped: true } : card))
    );
    
    const newFlippedIndices = [...flippedIndices, index];
    setFlippedIndices(newFlippedIndices);
    
    // Only count moves when a pair is opened (second card flipped)
    if (newFlippedIndices.length === 2) {
      setMoves((prev) => prev + 1);
    }
  };

  return (
    <Card className="shadow-soft">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-primary" />
          Memory Match - {level.name}
        </CardTitle>
        <CardDescription>
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-primary" />
            Match {level.pairs} pairs within {level.maxMoves} moves
          </div>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="text-lg font-semibold">Moves: {moves} / {level.maxMoves}</div>
            {highestLevel > 1 && (
              <div className="text-sm text-muted-foreground">
                Best: Level {highestLevel}
              </div>
            )}
            {moves > level.maxMoves - 5 && !gameOver && (
              <div className="flex items-center gap-1 text-sm text-destructive">
                <AlertCircle className="w-3 h-3" />
                {level.maxMoves - moves} moves left!
              </div>
            )}
          </div>
          <Button onClick={initializeGame} variant="outline" size="sm" className="gap-2">
            <RotateCcw className="w-4 h-4" />
            Reset
          </Button>
        </div>

        {gameOver && (
          <div className="bg-destructive/10 border border-destructive/20 p-4 rounded-lg text-center">
            <p className="text-destructive font-semibold">Game Over! Try again with fewer moves.</p>
          </div>
        )}

        <div className={`grid gap-3 ${level.pairs <= 6 ? 'grid-cols-4' : level.pairs <= 9 ? 'grid-cols-5' : 'grid-cols-6'}`}>
          {cards.map((card, index) => (
            <button
              key={card.id}
              onClick={() => handleCardClick(index)}
              disabled={card.matched || gameOver}
              className={`aspect-square rounded-lg text-3xl flex items-center justify-center transition-all duration-300 hover:scale-105 ${
                card.flipped || card.matched
                  ? "bg-primary/20 border-2 border-primary"
                  : "bg-muted hover:bg-muted/80 border-2 border-border"
              } ${card.matched ? "opacity-50" : ""} ${gameOver ? "cursor-not-allowed opacity-60" : ""}`}
            >
              {card.flipped || card.matched ? card.emoji : "?"}
            </button>
          ))}
        </div>

        <div className="bg-muted/50 p-4 rounded-lg space-y-2 text-sm">
          <h4 className="font-semibold">How to play:</h4>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
            <li>Click on cards to reveal them</li>
            <li>Click the same card again to close it (no move cost!)</li>
            <li>Find matching pairs within the move limit</li>
            <li>Each level gets harder with more pairs and fewer moves</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default MemoryGame;
