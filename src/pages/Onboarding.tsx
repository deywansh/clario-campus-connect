import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronRight, Megaphone, Calendar, Users } from "lucide-react";

const slides = [
  {
    icon: Megaphone,
    title: "Stay Updated",
    description: "Get all campus announcements in one place. No more missing important updates.",
    color: "from-primary/20 to-accent/20",
  },
  {
    icon: Calendar,
    title: "Never Miss Events",
    description: "Discover and RSVP to campus events. Your college calendar, simplified.",
    color: "from-accent/20 to-primary/20",
  },
  {
    icon: Users,
    title: "Connect & Engage",
    description: "Join clubs, chat with peers, and build your campus community.",
    color: "from-primary/20 to-accent/20",
  },
];

const Onboarding = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      navigate("/auth");
    }
  };

  const handleSkip = () => {
    navigate("/auth");
  };

  const slide = slides[currentSlide];
  const Icon = slide.icon;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background glow effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10 pointer-events-none" />
      
      <div className="max-w-md w-full space-y-8 relative z-10">
        {/* Logo/Brand */}
        <div className="text-center">
          <h1 className="text-4xl font-bold glow-text mb-2">Clario</h1>
          <p className="text-muted-foreground">Your Campus, Connected</p>
        </div>

        {/* Slide content */}
        <div className="glass-card rounded-3xl p-8 space-y-6 smooth-transition glow-border">
          <div className={`w-24 h-24 mx-auto rounded-full bg-gradient-to-br ${slide.color} flex items-center justify-center`}>
            <Icon className="w-12 h-12 text-primary" />
          </div>

          <div className="text-center space-y-3">
            <h2 className="text-2xl font-bold">{slide.title}</h2>
            <p className="text-muted-foreground leading-relaxed">{slide.description}</p>
          </div>
        </div>

        {/* Dots indicator */}
        <div className="flex justify-center gap-2">
          {slides.map((_, index) => (
            <div
              key={index}
              className={`h-2 rounded-full smooth-transition ${
                index === currentSlide
                  ? "w-8 bg-primary glow-border"
                  : "w-2 bg-muted"
              }`}
            />
          ))}
        </div>

        {/* Navigation buttons */}
        <div className="flex gap-4">
          <Button
            variant="ghost"
            onClick={handleSkip}
            className="flex-1 text-muted-foreground hover:text-foreground"
          >
            Skip
          </Button>
          <Button
            onClick={handleNext}
            className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full smooth-transition"
          >
            {currentSlide === slides.length - 1 ? "Get Started" : "Next"}
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
