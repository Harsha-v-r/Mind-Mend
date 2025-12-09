import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useGameScore = (gameName: string) => {
  const [highestLevel, setHighestLevel] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHighScore();
  }, [gameName]);

  const fetchHighScore = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("game_scores")
        .select("highest_level")
        .eq("user_id", user.id)
        .eq("game_name", gameName)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setHighestLevel(data.highest_level);
      }
    } catch (error) {
      console.error("Error fetching high score:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateHighScore = async (newLevel: number) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      if (newLevel > highestLevel) {
        const { error } = await supabase
          .from("game_scores")
          .upsert({
            user_id: user.id,
            game_name: gameName,
            highest_level: newLevel,
          }, {
            onConflict: "user_id,game_name"
          });

        if (error) throw error;

        setHighestLevel(newLevel);
        toast.success(`🏆 New high score! Level ${newLevel}`);
      }
    } catch (error) {
      console.error("Error updating high score:", error);
    }
  };

  return { highestLevel, updateHighScore, loading };
};
