import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Heart, Sparkles } from "lucide-react";
import { toast } from "sonner";

const prompts = [
  "What made you smile today?",
  "Who are you grateful for and why?",
  "What's a small thing that brought you joy?",
  "What's something beautiful you noticed today?",
  "What's a challenge you overcame recently?",
  "What's something about yourself you appreciate?",
  "What's a memory that makes you happy?",
  "What's something you're looking forward to?",
];

const GratitudeJournal = () => {
  const [currentPrompt, setCurrentPrompt] = useState("");
  const [entry, setEntry] = useState("");
  const [entries, setEntries] = useState<string[]>([]);

  useEffect(() => {
    const randomPrompt = prompts[Math.floor(Math.random() * prompts.length)];
    setCurrentPrompt(randomPrompt);

    const saved = localStorage.getItem("gratitude-entries");
    if (saved) {
      setEntries(JSON.parse(saved));
    }
  }, []);

  const newPrompt = () => {
    const randomPrompt = prompts[Math.floor(Math.random() * prompts.length)];
    setCurrentPrompt(randomPrompt);
    setEntry("");
  };

  const saveEntry = () => {
    if (entry.trim().length < 10) {
      toast.error("Please write a bit more to save your entry");
      return;
    }

    const newEntries = [...entries, entry];
    setEntries(newEntries);
    localStorage.setItem("gratitude-entries", JSON.stringify(newEntries));
    toast.success("✨ Your gratitude has been saved!");
    setEntry("");
    newPrompt();
  };

  return (
    <Card className="shadow-soft">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="w-5 h-5 text-primary" />
          Gratitude Journal
        </CardTitle>
        <CardDescription>
          Express gratitude to boost your mood and well-being
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-primary/10 border-2 border-primary/20 p-6 rounded-lg">
          <div className="flex items-start gap-3">
            <Sparkles className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
            <p className="text-lg font-medium">{currentPrompt}</p>
          </div>
        </div>

        <div className="space-y-3">
          <Textarea
            placeholder="Write your thoughts here..."
            value={entry}
            onChange={(e) => setEntry(e.target.value)}
            className="min-h-32 resize-none"
          />
          <div className="flex gap-2">
            <Button onClick={saveEntry} className="flex-1 gradient-calm gap-2">
              <Heart className="w-4 h-4" />
              Save Entry
            </Button>
            <Button onClick={newPrompt} variant="outline">
              <Sparkles className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {entries.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-semibold text-sm">Your Recent Gratitude:</h4>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {entries.slice(-3).reverse().map((e, i) => (
                <div key={i} className="bg-muted/50 p-3 rounded-lg text-sm">
                  {e}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-muted/50 p-4 rounded-lg space-y-2 text-sm">
          <h4 className="font-semibold">Benefits of Gratitude:</h4>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
            <li>Improves mood and emotional well-being</li>
            <li>Reduces stress and anxiety</li>
            <li>Enhances sleep quality</li>
            <li>Strengthens relationships and empathy</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default GratitudeJournal;
