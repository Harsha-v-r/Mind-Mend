import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LogOut, Activity, MessageCircle, Brain, TrendingUp, Gamepad2, BarChart3 } from "lucide-react";
import MoodTracker from "@/components/MoodTracker";
import CommunitySpace from "@/components/CommunitySpace";
import TherapeuticGame from "@/components/TherapeuticGame";
import MoodHistory from "@/components/MoodHistory";
import MoodAnalytics from "@/components/MoodAnalytics";
import { toast } from "sonner";

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [username, setUsername] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (!session?.user) {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setUser(session?.user ?? null);
    
    if (!session?.user) {
      navigate("/auth");
    } else {
      // Fetch username from profiles
      const { data: profile } = await supabase
        .from("profiles")
        .select("username")
        .eq("id", session.user.id)
        .single();
      
      if (profile) {
        setUsername(profile.username);
      }
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Logged out successfully");
    navigate("/auth");
  };

  if (loading) {
    return (
      <div className="min-h-screen gradient-serene flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-muted-foreground">Loading your wellness space...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-serene">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Brain className="w-8 h-8 text-primary" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Mind Mend
            </h1>
          </div>
          <div className="flex items-center gap-4">
            {username && (
              <span className="text-sm font-medium text-muted-foreground">
                @{username}
              </span>
            )}
            <Button variant="outline" onClick={handleLogout} className="gap-2">
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="shadow-soft border-2">
              <CardHeader>
                <CardTitle className="text-2xl">Welcome back! 🌸</CardTitle>
                <CardDescription>
                  How are you feeling today? Track your mood and get personalized support.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="shadow-soft border-2 bg-gradient-to-br from-primary/5 to-secondary/5">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Gamepad2 className="w-6 h-6 text-primary" />
                  Therapeutic Games
                </CardTitle>
                <CardDescription>
                  Take a break and relax with our collection of mindful games
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => navigate("/games")} 
                  className="w-full gradient-calm gap-2"
                  size="lg"
                >
                  <Brain className="w-5 h-5" />
                  Explore Games
                </Button>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="mood" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="mood" className="gap-2">
                <Activity className="w-4 h-4" />
                Mood
              </TabsTrigger>
              <TabsTrigger value="history" className="gap-2">
                <TrendingUp className="w-4 h-4" />
                History
              </TabsTrigger>
              <TabsTrigger value="analytics" className="gap-2">
                <BarChart3 className="w-4 h-4" />
                Analytics
              </TabsTrigger>
              <TabsTrigger value="community" className="gap-2">
                <MessageCircle className="w-4 h-4" />
                Community
              </TabsTrigger>
            </TabsList>

            <TabsContent value="mood" className="mt-6">
              <MoodTracker userId={user?.id || ""} />
            </TabsContent>

            <TabsContent value="history" className="mt-6">
              <MoodHistory userId={user?.id || ""} />
            </TabsContent>

            <TabsContent value="analytics" className="mt-6">
              <MoodAnalytics userId={user?.id || ""} />
            </TabsContent>

            <TabsContent value="community" className="mt-6">
              <CommunitySpace userId={user?.id || ""} />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;