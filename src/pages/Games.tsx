import { Button } from "@/components/ui/button";
import { Brain, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useEffect } from "react";
import BreathingGame from "@/components/games/BreathingGame";
import MemoryGame from "@/components/games/MemoryGame";
import PatternRecognition from "@/components/games/PatternRecognition";
import ScrambledWords from "@/components/games/ScrambledWords";

const Games = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("breathing");

  // Handle URL hash navigation
  useEffect(() => {
    const hash = window.location.hash.replace('#', '');
    if (hash && ['breathing', 'memory', 'pattern', 'scrambled'].includes(hash)) {
      setActiveTab(hash);
    }
  }, []);

  return (
    <div className="min-h-screen gradient-serene">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Brain className="w-8 h-8 text-primary" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Therapeutic Games
            </h1>
          </div>
          <Button variant="outline" onClick={() => navigate("/dashboard")} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold">Find Your Calm</h2>
            <p className="text-muted-foreground">
              Choose a therapeutic game to relax, focus, and improve your mental well-being
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="breathing">Breathing</TabsTrigger>
              <TabsTrigger value="memory">Memory</TabsTrigger>
              <TabsTrigger value="pattern">Pattern</TabsTrigger>
              <TabsTrigger value="scrambled">Scrambled</TabsTrigger>
            </TabsList>

            <TabsContent value="breathing" className="mt-6">
              <BreathingGame />
            </TabsContent>

            <TabsContent value="memory" className="mt-6">
              <MemoryGame />
            </TabsContent>

            <TabsContent value="pattern" className="mt-6">
              <PatternRecognition />
            </TabsContent>

            <TabsContent value="scrambled" className="mt-6">
              <ScrambledWords />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default Games;
