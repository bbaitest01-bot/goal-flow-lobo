import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { 
  Target, 
  Zap, 
  Brain, 
  BookHeart,
  Sparkles,
  ArrowLeft
} from "lucide-react"

export default function LoginPage() {
  return (
    <div className="relative min-h-screen bg-background">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/4 -left-1/4 h-[600px] w-[600px] rounded-full bg-primary/20 blur-[120px]" />
        <div className="absolute -bottom-1/4 -right-1/4 h-[600px] w-[600px] rounded-full bg-accent/15 blur-[100px]" />
      </div>

      <div className="relative flex min-h-screen">
        {/* Left Panel - Login Card */}
        <div className="flex flex-1 items-center justify-center p-6 lg:p-12">
          <div className="w-full max-w-md">
            {/* Back Link */}
            <Link 
              href="/" 
              className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to home
            </Link>

            {/* Login Card */}
            <Card className="border-border/40 bg-card/60 backdrop-blur-xl">
              <CardContent className="p-8">
                {/* Logo */}
                <div className="mb-8 text-center">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent">
                    <Sparkles className="h-7 w-7 text-primary-foreground" />
                  </div>
                  <h1 className="text-2xl font-bold">Welcome to GoalFlow</h1>
                  <p className="mt-2 text-muted-foreground">
                    Your sarcastic AI coach is waiting
                  </p>
                </div>

                {/* Google Sign In Button */}
                <Button 
                  size="lg" 
                  className="h-12 w-full gap-3 bg-gradient-to-r from-primary to-accent text-base text-primary-foreground hover:opacity-90"
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continue with Google
                </Button>

                {/* Helper Text */}
                <p className="mt-6 text-center text-sm text-muted-foreground">
                  By continuing, you agree to our{" "}
                  <Link href="#" className="text-primary hover:underline">Terms of Service</Link>
                  {" "}and{" "}
                  <Link href="#" className="text-primary hover:underline">Privacy Policy</Link>
                </p>

                {/* Feature Badges */}
                <div className="mt-8 flex flex-wrap justify-center gap-2">
                  {[
                    { icon: Target, label: "Goal Tracking" },
                    { icon: Zap, label: "Energy System" },
                    { icon: Brain, label: "AI Coach" },
                    { icon: BookHeart, label: "Mood Diary" },
                  ].map(({ icon: Icon, label }) => (
                    <span 
                      key={label}
                      className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-muted/30 px-3 py-1 text-xs text-muted-foreground"
                    >
                      <Icon className="h-3 w-3" />
                      {label}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Demo Link */}
            <p className="mt-6 text-center text-sm text-muted-foreground">
              Just exploring?{" "}
              <Link href="/dashboard" className="text-primary hover:underline">
                View the demo
              </Link>
            </p>
          </div>
        </div>

        {/* Right Panel - Preview */}
        <div className="hidden flex-1 items-center justify-center border-l border-border/40 bg-card/30 p-12 lg:flex">
          <div className="w-full max-w-lg">
            <PreviewCard />
          </div>
        </div>
      </div>
    </div>
  )
}

function PreviewCard() {
  return (
    <div className="relative">
      {/* Glow effect */}
      <div className="absolute -inset-4 rounded-2xl bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 blur-2xl" />
      
      <Card className="relative border-border/40 bg-card/80 backdrop-blur-sm">
        <CardContent className="p-6">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Dashboard</h3>
              <p className="text-sm text-muted-foreground">Your productivity hub</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-accent" />
          </div>

          {/* Energy Bar */}
          <div className="mb-6 rounded-xl border border-border/40 bg-muted/30 p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium">Daily Energy</span>
              <Zap className="h-4 w-4 text-primary" />
            </div>
            <div className="mb-1 text-2xl font-bold">72/100</div>
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div className="h-full w-[72%] rounded-full bg-gradient-to-r from-primary to-accent" />
            </div>
          </div>

          {/* Goals Preview */}
          <div className="mb-6">
            <h4 className="mb-3 text-sm font-medium">Active Goals</h4>
            <div className="flex flex-col gap-2">
              {[
                { title: "Graduation Project", progress: 68 },
                { title: "Learn React", progress: 45 },
              ].map((goal) => (
                <div key={goal.title} className="rounded-lg border border-border/40 bg-muted/20 p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm">{goal.title}</span>
                    <span className="text-xs text-muted-foreground">{goal.progress}%</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                    <div 
                      className="h-full rounded-full bg-gradient-to-r from-accent to-pink-500" 
                      style={{ width: `${goal.progress}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Coach Preview */}
          <div className="rounded-xl border border-accent/30 bg-accent/5 p-4">
            <div className="mb-3 flex items-center gap-2">
              <Brain className="h-5 w-5 text-accent" />
              <span className="text-sm font-medium">AI Coach</span>
              <span className="ml-auto rounded bg-accent/20 px-1.5 py-0.5 text-xs text-accent">Online</span>
            </div>
            <p className="text-sm text-muted-foreground">
              &quot;72 energy? Looking good! Maybe you can actually finish something today. No pressure though.&quot;
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
