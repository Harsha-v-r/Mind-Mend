import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Heart, Brain, MessageCircle, TrendingUp, Sparkles } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen gradient-serene">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="inline-block">
            <div className="bg-primary/10 p-6 rounded-full shadow-glow">
              <Heart className="w-20 h-20 text-primary" />
            </div>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold">
            <span className="bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
              Mind Mend
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
            Your AI-powered mental health companion. Track your moods, get personalized support, and connect with a caring community.
          </p>

          <div className="flex gap-4 justify-center pt-4">
            <Button 
              size="lg" 
              onClick={() => navigate("/auth")}
              className="gradient-calm text-lg px-8 gap-2 shadow-soft hover:shadow-glow transition-smooth"
            >
              <Sparkles className="w-5 h-5" />
              Get Started Free
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => navigate("/auth")}
              className="text-lg px-8"
            >
              Sign In
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
          Everything you need for your mental wellbeing
        </h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          <div className="bg-card p-6 rounded-2xl shadow-soft hover:shadow-glow transition-smooth border-2 border-primary/10">
            <div className="bg-primary/10 p-3 rounded-full w-fit mb-4">
              <Brain className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">AI Mood Analysis</h3>
            <p className="text-muted-foreground">
              Get personalized suggestions powered by advanced AI based on your emotions and journal entries.
            </p>
          </div>

          <div className="bg-card p-6 rounded-2xl shadow-soft hover:shadow-glow transition-smooth border-2 border-secondary/10">
            <div className="bg-secondary/10 p-3 rounded-full w-fit mb-4">
              <TrendingUp className="w-8 h-8 text-secondary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Mood Tracking</h3>
            <p className="text-muted-foreground">
              Track your emotional patterns over time and gain insights into your mental health journey.
            </p>
          </div>

          <div className="bg-card p-6 rounded-2xl shadow-soft hover:shadow-glow transition-smooth border-2 border-accent/10">
            <div className="bg-accent/10 p-3 rounded-full w-fit mb-4">
              <MessageCircle className="w-8 h-8 text-accent-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Safe Community</h3>
            <p className="text-muted-foreground">
              Share anonymously and connect with others in a moderated, supportive environment.
            </p>
          </div>

          <div className="bg-card p-6 rounded-2xl shadow-soft hover:shadow-glow transition-smooth border-2 border-primary/10">
            <div className="bg-primary/10 p-3 rounded-full w-fit mb-4">
              <Heart className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Wellness Tools</h3>
            <p className="text-muted-foreground">
              Access therapeutic games and exercises designed to help you relax and reduce stress.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-3xl mx-auto bg-card/50 backdrop-blur-sm p-12 rounded-3xl shadow-glow border-2 border-primary/20 text-center space-y-6">
          <h2 className="text-3xl md:text-4xl font-bold">
            Ready to start your wellness journey?
          </h2>
          <p className="text-lg text-muted-foreground">
            Join Mind Mend today and take the first step towards better mental health. 
            Your privacy is our priority.
          </p>
          <Button 
            size="lg" 
            onClick={() => navigate("/auth")}
            className="gradient-calm text-lg px-12 gap-2 shadow-soft"
          >
            <Sparkles className="w-5 h-5" />
            Begin Your Journey
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-card/30 backdrop-blur-sm py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2024 Mind Mend. All conversations are private and confidential.</p>
          <p className="mt-2">This is not a substitute for professional mental health care.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
