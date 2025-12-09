import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Check, X, Trophy, Sparkles } from "lucide-react";
import { useGameScore } from "@/hooks/useGameScore";
import { toast } from "sonner";

interface WordPuzzle {
  scrambled: string;
  answer: string;
  description: string;
}

const LEVELS = [
  {
    level: 1,
    name: "Basic",
    words: [
      { scrambled: "mlac", answer: "calm", description: "Free from agitation or excitement" },
      { scrambled: "epho", answer: "hope", description: "Feeling that good things can happen" },
      { scrambled: "arce", answer: "care", description: "Serious attention or consideration" },
      { scrambled: "iemls", answer: "smile", description: "What you do when you are happy" },
      { scrambled: "velo", answer: "love", description: "A feeling of deep affection" },
      { scrambled: "apeec", answer: "peace", description: "A state of calm and freedom from disturbance" },
      { scrambled: "utstr", answer: "trust", description: "Firm belief in someone or something" },
      { scrambled: "ypahp", answer: "happy", description: "Feeling joy and contentment" },
      { scrambled: "axrle", answer: "relax", description: "To become less tense or anxious" },
      { scrambled: "acer", answer: "race", description: "To move swiftly" },
    ],
    wordsToPass: 8,
    maxAttempts: 3,
  },
  {
    level: 2,
    name: "Intermediate",
    words: [
      { scrambled: "ughtoth", answer: "thought", description: "What your mind produces all day" },
      { scrambled: "tnaipet", answer: "patient", description: "Ability to wait without anger or frustration" },
      { scrambled: "proupts", answer: "support", description: "Encouragement that helps you continue" },
      { scrambled: "lgafutre", answer: "grateful", description: "Feeling thankful" },
      { scrambled: "yhlhate", answer: "healthy", description: "In good physical or mental condition" },
      { scrambled: "scsuces", answer: "success", description: "Achievement of a goal" },
      { scrambled: "gcoruea", answer: "courage", description: "Strength to face fear or difficulty" },
      { scrambled: "dmwniso", answer: "wisdom", description: "Deep understanding and good judgment" },
      { scrambled: "balncea", answer: "balance", description: "A state of equilibrium" },
      { scrambled: "itueq", answer: "quiet", description: "A state of calm; absence of noise" },
    ],
    wordsToPass: 8,
    maxAttempts: 3,
  },
  {
    level: 3,
    name: "Advanced",
    words: [
      { scrambled: "nsleireiec", answer: "resilience", description: "Ability to recover from challenges" },
      { scrambled: "spoaimnsco", answer: "compassion", description: "Deep sympathy and desire to help others" },
      { scrambled: "tcaiaopienpr", answer: "appreciation", description: "Thankful recognition of something" },
      { scrambled: "neosiidc", answer: "decision", description: "The act of making up your mind" },
      { scrambled: "dninaeudtnrsg", answer: "understanding", description: "Ability to comprehend and empathize" },
      { scrambled: "neccofnedi", answer: "confidence", description: "Belief in your own abilities" },
      { scrambled: "nssnepdiah", answer: "happiness", description: "State of well-being and joy" },
      { scrambled: "tssrghtne", answer: "strength", description: "Physical or mental power" },
      { scrambled: "miihtylu", answer: "humility", description: "Quality of being humble" },
      { scrambled: "tneipeca", answer: "patience", description: "Capacity to tolerate delay without frustration" },
    ],
    wordsToPass: 8,
    maxAttempts: 3,
  },
  {
    level: 4,
    name: "Expert",
    words: [
      { scrambled: "slef-eprtcse", answer: "self-respect", description: "How you see and value yourself" },
      { scrambled: "slef-warsneesa", answer: "self-awareness", description: "Conscious knowledge of your own feelings" },
      { scrambled: "miitaovton", answer: "motivation", description: "Inner drive to act or achieve" },
      { scrambled: "mcouaimnnitoc", answer: "communication", description: "Sharing thoughts or feelings with others" },
      { scrambled: "ranntsdudgeni", answer: "understanding", description: "Comprehension with empathy" },
      { scrambled: "tpoizcnaiarti", answer: "prioritization", description: "Determining what matters most" },
      { scrambled: "namtrfoasitnor", answer: "transformation", description: "A complete change" },
      { scrambled: "meenpwtrome", answer: "empowerment", description: "Process of becoming stronger and confident" },
      { scrambled: "elsndfnumsi", answer: "mindfulness", description: "Being present and aware" },
      { scrambled: "naiotcaippre", answer: "appreciation", description: "Recognition of value" },
    ],
    wordsToPass: 7,
    maxAttempts: 2,
  },
];

const ScrambledWords = () => {
  const { highestLevel, updateHighScore, loading } = useGameScore("scrambled-words");
  const [gameStarted, setGameStarted] = useState(false);
  const [currentLevel, setCurrentLevel] = useState(0);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [score, setScore] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [feedback, setFeedback] = useState<{ type: "correct" | "wrong" | "reveal" | null; message: string }>({
    type: null,
    message: "",
  });
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);

  const levelData = LEVELS[currentLevel];
  const currentWord = levelData.words[currentWordIndex];

  const startGame = () => {
    // Shuffle the words array for randomization
    const shuffledWords = [...levelData.words].sort(() => Math.random() - 0.5);
    LEVELS[currentLevel] = { ...levelData, words: shuffledWords };
    
    setGameStarted(true);
    setCurrentWordIndex(0);
    setUserAnswer("");
    setAttempts(0);
    setScore(0);
    setCorrectAnswers(0);
    setFeedback({ type: null, message: "" });
    setStreak(0);
  };

  const handleSubmit = () => {
    if (!userAnswer.trim()) return;

    const isCorrect = userAnswer.toLowerCase().trim() === currentWord.answer.toLowerCase();

    if (isCorrect) {
      let points = 0;
      if (attempts === 0) points = 10;
      else if (attempts === 1) points = 6;
      else if (attempts === 2) points = 3;

      setScore(score + points);
      setCorrectAnswers(correctAnswers + 1);
      setStreak(streak + 1);
      if (streak + 1 > bestStreak) setBestStreak(streak + 1);

      setFeedback({
        type: "correct",
        message: `Correct! The word is ${currentWord.answer.toUpperCase()}. +${points} points`,
      });

      setTimeout(() => {
        moveToNextWord();
      }, 2000);
    } else {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);

      if (newAttempts >= levelData.maxAttempts) {
        setFeedback({
          type: "reveal",
          message: `The word was: ${currentWord.answer.toUpperCase()}`,
        });
        setStreak(0);

        setTimeout(() => {
          moveToNextWord();
        }, 3000);
      } else {
        setFeedback({
          type: "wrong",
          message: `That's not correct. Try again. (${newAttempts}/${levelData.maxAttempts})`,
        });
      }
    }
  };

  const moveToNextWord = () => {
    if (currentWordIndex + 1 >= levelData.words.length) {
      // Level complete
      if (correctAnswers >= levelData.wordsToPass) {
        if (currentLevel + 1 > highestLevel) {
          updateHighScore(currentLevel + 1);
        }
        toast.success(`🎉 Level ${currentLevel + 1} Complete! Score: ${score}`);
        
        if (currentLevel < LEVELS.length - 1) {
          setCurrentLevel(currentLevel + 1);
          setGameStarted(false);
        } else {
          toast.success("🏆 You've mastered all levels!");
          setGameStarted(false);
        }
      } else {
        toast.error(`Need ${levelData.wordsToPass} correct to advance. Try again!`);
        setGameStarted(false);
      }
    } else {
      setCurrentWordIndex(currentWordIndex + 1);
      setUserAnswer("");
      setAttempts(0);
      setFeedback({ type: null, message: "" });
    }
  };

  if (loading) {
    return <Card className="w-full"><CardContent className="p-8 text-center">Loading...</CardContent></Card>;
  }

  if (!gameStarted) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary" />
            Scrambled Words
          </CardTitle>
          <CardDescription>
            Unscramble words related to mental wellness and emotions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h3 className="font-semibold">How to Play:</h3>
            <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
              <li>Each round shows a jumbled word and its description</li>
              <li>Type the correct word to unscramble it</li>
              <li>You have {levelData.maxAttempts} attempts per word</li>
              <li>Score more points by solving on first try!</li>
              <li>Pass {levelData.wordsToPass} words to unlock the next level</li>
            </ul>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {LEVELS.map((level, idx) => (
              <Badge
                key={idx}
                variant={idx === currentLevel ? "default" : idx < currentLevel || idx <= highestLevel ? "secondary" : "outline"}
                className="p-3 justify-center"
              >
                Level {level.level}: {level.name}
                {idx <= highestLevel && idx !== currentLevel && <Check className="w-4 h-4 ml-2" />}
              </Badge>
            ))}
          </div>

          <div className="flex gap-2">
            <Button onClick={startGame} className="flex-1">
              Start Level {currentLevel + 1}
            </Button>
            {currentLevel > 0 && (
              <Button variant="outline" onClick={() => setCurrentLevel(Math.max(0, currentLevel - 1))}>
                Previous Level
              </Button>
            )}
            {currentLevel < highestLevel && currentLevel < LEVELS.length - 1 && (
              <Button variant="outline" onClick={() => setCurrentLevel(currentLevel + 1)}>
                Next Level
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Level {currentLevel + 1}: {levelData.name}</CardTitle>
            <CardDescription>
              Word {currentWordIndex + 1} of {levelData.words.length}
            </CardDescription>
          </div>
          <div className="text-right space-y-1">
            <Badge variant="secondary" className="text-lg">
              <Trophy className="w-4 h-4 mr-1" />
              {score}
            </Badge>
            <div className="text-xs text-muted-foreground">
              Correct: {correctAnswers} | Streak: {streak}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <Progress value={((currentWordIndex + 1) / levelData.words.length) * 100} />

        <div className="text-center space-y-6 py-8">
          <div className="space-y-2">
            <div className="text-4xl font-bold tracking-wider text-primary">
              {currentWord.scrambled.toUpperCase()}
            </div>
            <p className="text-lg text-muted-foreground italic">
              "{currentWord.description}"
            </p>
          </div>

          <div className="space-y-4 max-w-md mx-auto">
            <Input
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              placeholder="Type your answer..."
              className="text-center text-xl"
              disabled={feedback.type === "correct" || feedback.type === "reveal"}
            />

            {feedback.type && (
              <div className={`flex items-center justify-center gap-2 p-3 rounded-lg ${
                feedback.type === "correct" 
                  ? "bg-green-500/10 text-green-700 dark:text-green-400" 
                  : feedback.type === "reveal"
                  ? "bg-blue-500/10 text-blue-700 dark:text-blue-400"
                  : "bg-red-500/10 text-red-700 dark:text-red-400"
              }`}>
                {feedback.type === "correct" ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <X className="w-5 h-5" />
                )}
                <span className="font-medium">{feedback.message}</span>
              </div>
            )}

            {!feedback.type && (
              <Button onClick={handleSubmit} className="w-full" disabled={!userAnswer.trim()}>
                Submit Answer
              </Button>
            )}
          </div>
        </div>

        <div className="text-center text-sm text-muted-foreground">
          Attempts: {attempts}/{levelData.maxAttempts}
        </div>
      </CardContent>
    </Card>
  );
};

export default ScrambledWords;
