"use client"

import { useEffect, useState, useRef } from "react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { 
  Target, 
  Zap, 
  MessageSquare, 
  BookHeart, 
  Trophy,
  CheckCircle2,
  Brain,
  Sparkles,
  ArrowRight,
  LogOut,
  LayoutDashboard,
  Laptop,
  Moon,
  Sun
} from "lucide-react"

// 定義 User 狀態類型
interface UserProfile {
  email: string;
  avatarUrl: string;
  fullName: string;
}

export default function LandingPage() {
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<UserProfile | null>(null)
  const [menuOpen, setMenuOpen] = useState(false) // 控制頭貼下拉選單
  
  // 🎯 建立 Ref 綁定下拉選單，用來處理點擊外部關閉選單的邏輯
  const menuRef = useRef<HTMLDivElement>(null)

  // 📡 1. 檢查 Supabase Session 登入狀態
  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        if (error) throw error

        if (session?.user) {
          // 偵測到已登入，撈取 Google 提供的頭貼與姓名
          setUser({
            email: session.user.email || "",
            avatarUrl: session.user.user_metadata?.avatar_url || "",
            fullName: session.user.user_metadata?.full_name || "GoalFlow 使用者",
          })
        } else {
          setUser(null)
        }
      } catch (err) {
        console.error("檢查登入狀態失敗:", err)
      } finally {
        setLoading(false)
      }
    }

    checkUser()
  }, [])

  // 🖱️ 2. 全域監聽滑鼠點擊事件：點擊下拉選單外任何地方，選單立刻無感消失！
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      // 如果點選的地方不在頭貼大框框 (menuRef) 裡面，就立刻關閉選單
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false)
      }
    }

    // 註冊監聽器
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      // 卸載時移除監聽器，防止記憶體洩漏
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [menuRef])

  // 🚪 3. 登出處理
  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setMenuOpen(false)
    window.location.reload() // 物理重新整理，確保狀態完全乾淨
  }

  // 🚀 Google 登入並同時索取 行事曆 與 Gmail 權限
  const handleGoogleLogin = async (e: any) => {
    e.preventDefault()
    const currentUrl = typeof window !== 'undefined' ? window.location.origin : 'https://goal-flow-lobo.vercel.app'

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        // 🎯 登入成功後，直接推去正宗後台 /dashboard
        redirectTo: `${currentUrl}/dashboard`, 
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
          scope: 'openid email profile https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/gmail.send'
        }
      }
    })

    if (error) {
      console.error("Google login failed:", error.message)
    }
  }

  // 🎨 切換全站主題 (搭配組員與妳們原有的主題顏色邏輯)
  const handleThemeChange = (theme: "system" | "dark" | "light") => {
    console.log("主題切換至:", theme)
    if (typeof window !== 'undefined') {
      if (theme === 'dark') {
        document.documentElement.classList.add('dark')
      } else if (theme === 'light') {
        document.documentElement.classList.remove('dark')
      } else {
        // system 則去偵測系統偏好
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
        if (systemTheme === 'dark') document.documentElement.classList.add('dark')
        else document.documentElement.classList.remove('dark')
      }
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">GoalFlow</span>
          </div>

          {/* 右上角導覽列智慧分流 */}
          <div className="flex items-center gap-3">
            {loading ? (
              // 🔄 載入中骨架屏
              <div className="w-9 h-9 rounded-full bg-muted animate-pulse" />
            ) : !user ? (
              /* ── 情況 A：未登入 ── */
              <>
                <a href="/login">
                  <Button variant="ghost" size="sm">Sign In</Button>
                </a>
                <Button onClick={handleGoogleLogin} size="sm" className="bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90">
                  Get Started
                </Button>
              </>
            ) : (
              /* ── 情況 B：已登入 (Supabase 頂級質感頭貼下拉選單) ── */
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="relative flex items-center justify-center rounded-full focus:outline-none transition-transform duration-100 active:scale-95 hover:opacity-90"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={user.avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&h=100&q=80"}
                    alt={user.fullName}
                    className="w-8 h-8 rounded-full border border-border/60 object-cover"
                  />
                </button>

                {/* Supabase 經典質感下拉選單 */}
                {menuOpen && (
                  <div className="absolute right-0 mt-2.5 w-64 border border-border bg-card rounded-lg shadow-xl py-1.5 z-50 animate-in fade-in-95 slide-in-from-top-2 duration-150">
                    
                    {/* 1. 用戶帳號與 Email */}
                    <div className="px-4 py-3 border-b border-border/60">
                      <p className="text-xs font-medium text-muted-foreground truncate">Signed in as</p>
                      <p className="text-sm font-semibold text-foreground truncate">{user.email}</p>
                    </div>

                    {/* 2. 進入後台 & 系統功能 */}
                    <div className="p-1 border-b border-border/60">
                      <a
                        href="/dashboard"
                        className="flex items-center gap-2 w-full px-3 py-2 text-xs rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/60 transition"
                        onClick={() => setMenuOpen(false)}
                      >
                        <LayoutDashboard className="w-3.5 h-3.5" />
                        Dashboard
                      </a>
                    </div>

                    {/* 3. 主題切換 (Theme Mode) - 依照 Supabase 截圖設計 */}
                    <div className="p-3 border-b border-border/60">
                      <p className="text-[10px] font-bold text-muted-foreground tracking-wider uppercase mb-2">Theme</p>
                      <div className="grid grid-cols-3 gap-1 bg-muted/40 p-1 rounded-md border border-border/40">
                        <button
                          onClick={() => handleThemeChange("system")}
                          className="flex flex-col items-center gap-1 py-1.5 text-[10px] text-muted-foreground hover:text-foreground rounded-sm hover:bg-card transition"
                        >
                          <Laptop className="w-3 h-3" />
                          <span>System</span>
                        </button>
                        <button
                          onClick={() => handleThemeChange("dark")}
                          className="flex flex-col items-center gap-1 py-1.5 text-[10px] text-muted-foreground hover:text-foreground rounded-sm hover:bg-card transition"
                        >
                          <Moon className="w-3 h-3" />
                          <span>Dark</span>
                        </button>
                        <button
                          onClick={() => handleThemeChange("light")}
                          className="flex flex-col items-center gap-1 py-1.5 text-[10px] text-muted-foreground hover:text-foreground rounded-sm hover:bg-card transition"
                        >
                          <Sun className="w-3 h-3" />
                          <span>Light</span>
                        </button>
                      </div>
                    </div>

                    {/* 4. 英文 Sign out (登出按鈕) - 位於最下方並用細線區隔 */}
                    <div className="p-1">
                      <button
                        onClick={handleSignOut}
                        className="flex items-center gap-2 w-full px-3 py-2 text-xs text-red-500 rounded-md hover:bg-red-500/10 transition"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        Sign out
                      </button>
                    </div>

                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-32 pb-20 sm:pt-40 sm:pb-32">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-1/2 left-1/2 h-[800px] w-[800px] -translate-x-1/2 rounded-full bg-primary/20 blur-[120px]" />
          <div className="absolute top-1/4 -right-1/4 h-[600px] w-[600px] rounded-full bg-accent/15 blur-[100px]" />
        </div>
        
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/50 px-4 py-1.5 text-sm backdrop-blur-sm">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-muted-foreground">AI-Powered Productivity</span>
            </div>
            
            <h1 className="text-balance text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
              <span className="bg-gradient-to-r from-foreground via-foreground to-muted-foreground bg-clip-text text-transparent">
                Finish big goals
              </span>
              <br />
              <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                without burning out
              </span>
            </h1>
            
            <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg text-muted-foreground sm:text-xl">
              GoalFlow combines long-term goal tracking, daily energy management, and a brutally honest AI coach to help you achieve more while staying sane.
            </p>
            
            {/* 中間大按鈕智慧分流 */}
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              {loading ? (
                // 🔄 載入按鈕骨架屏
                <div className="w-52 h-12 bg-muted rounded-lg animate-pulse" />
              ) : !user ? (
                /* ── 情況 A：未登入，顯示 Google 登入按鈕 ── */
                <>
                  <Button onClick={handleGoogleLogin} size="lg" className="h-12 gap-2 bg-gradient-to-r from-primary to-accent px-8 text-base text-primary-foreground hover:opacity-90">
                    <svg className="h-5 w-5" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Sign in with Google
                  </Button>
                  <a href="/dashboard">
                    <Button variant="outline" size="lg" className="h-12 gap-2 border-border/60 px-8 text-base">
                      View Demo
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </a>
                </>
              ) : (
                /* ── 情況 B：已登入，一鍵長驅直入 ── */
                <a href="/dashboard" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full h-12 gap-2 bg-gradient-to-r from-primary to-accent px-10 text-base text-primary-foreground hover:opacity-90">
                    Enter Dashboard
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </a>
              )}
            </div>
          </div>

          {/* Dashboard Preview */}
          <div className="relative mx-auto mt-16 max-w-5xl sm:mt-24">
            <div className="absolute -inset-4 rounded-2xl bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 blur-2xl" />
            <div className="relative overflow-hidden rounded-xl border border-border/60 bg-card/80 shadow-2xl backdrop-blur-sm">
              <DashboardPreview />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-20 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Everything you need to{" "}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                stay on track
              </span>
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Not just another to-do app. A complete system for sustainable productivity.
            </p>
          </div>

          <div className="mx-auto mt-16 grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <FeatureCard icon={Target} title="Goal Tracking" description="Break down big goals into manageable tasks. Track progress with visual indicators and celebrate milestones." gradient="from-blue-500 to-cyan-500" />
            <FeatureCard icon={Zap} title="Energy Management" description="Every task has an energy cost. Monitor your daily capacity and avoid burnout with RPE-based tracking." gradient="from-primary to-accent" />
            <FeatureCard icon={MessageSquare} title="Sarcastic AI Coach" description="A brutally honest AI companion that calls you out when you're overcommitting and cheers when you're winning." gradient="from-pink-500 to-rose-500" />
            <FeatureCard icon={BookHeart} title="Mood Diary" description="Journal your daily feelings and energy levels. The AI coach uses this to give personalized advice." gradient="from-orange-500 to-amber-500" />
            <FeatureCard icon={Trophy} title="Hall of Fame" description="Completed goals move to your achievement wall. Build a legacy of accomplishments over time." gradient="from-yellow-500 to-orange-500" />
            <FeatureCard icon={Brain} title="Progress Analytics" description="Visualize your productivity patterns with heatmaps, streaks, and weekly activity reports." gradient="from-green-500 to-emerald-500" />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="relative py-20 sm:py-32">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-card/50 to-transparent" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">How GoalFlow Works</h2>
            <p className="mt-4 text-lg text-muted-foreground">Four simple steps to sustainable productivity</p>
          </div>

          <div className="mx-auto mt-16 grid max-w-4xl gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <StepCard step={1} title="Set Your Goals" description="Define what you want to achieve and set realistic deadlines" />
            <StepCard step={2} title="Rate Task Difficulty" description="Assign RPE scores to tasks so the system knows their energy cost" />
            <StepCard step={3} title="Track Daily Energy" description="Stay within your energy budget to maintain long-term productivity" />
            <StepCard step={4} title="Get AI Coaching" description="Receive personalized feedback and suggestions from your AI coach" />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-2xl">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/30 via-accent/30 to-primary/30" />
            <div className="absolute inset-0 bg-card/80 backdrop-blur-sm" />
            <div className="relative px-6 py-16 text-center sm:px-16 sm:py-24">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Ready to achieve more?</h2>
              <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">Join GoalFlow and let your sarcastic AI coach help you finish what you start.</p>
              <div className="mt-8">
                {loading ? (
                  <div className="mx-auto w-52 h-12 bg-muted rounded-lg animate-pulse" />
                ) : !user ? (
                  <Button onClick={handleGoogleLogin} size="lg" className="h-12 gap-2 bg-gradient-to-r from-primary to-accent px-8 text-base text-primary-foreground hover:opacity-90">
                    <svg className="h-5 w-5" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Get Started Free
                  </Button>
                ) : (
                  <a href="/dashboard">
                    <Button size="lg" className="h-12 gap-2 bg-gradient-to-r from-primary to-accent px-10 text-base text-primary-foreground hover:opacity-90">
                      Go to Dashboard
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent">
                <Sparkles className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-semibold">GoalFlow</span>
            </div>
            <nav className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors">Features</a>
              <a href="#" className="hover:text-foreground transition-colors">Pricing</a>
              <a href="#" className="hover:text-foreground transition-colors">About</a>
              <a href="#" className="hover:text-foreground transition-colors">Contact</a>
              <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
            </nav>
            <p className="text-sm text-muted-foreground">2026 GoalFlow. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ icon: Icon, title, description, gradient }: { icon: React.ElementType, title: string, description: string, gradient: string }) {
  return (
    <Card className="group relative overflow-hidden border-border/40 bg-card/50 backdrop-blur-sm transition-all hover:border-border hover:bg-card/80">
      <CardContent className="p-6">
        <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${gradient}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <h3 className="mb-2 text-lg font-semibold">{title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
      </CardContent>
    </Card>
  )
}

function StepCard({ step, title, description }: { step: number, title: string, description: string }) {
  return (
    <div className="text-center">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-xl font-bold text-primary-foreground">
        {step}
      </div>
      <h3 className="mb-2 font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  )
}

function DashboardPreview() {
  return (
    <div className="flex h-[400px] sm:h-[500px]">
      <div className="hidden w-16 flex-shrink-0 border-r border-border/40 bg-sidebar/50 p-3 sm:block">
        <div className="mb-6 flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent">
          <Sparkles className="h-5 w-5 text-primary-foreground" />
        </div>
        <div className="flex flex-col gap-3">
          {[Target, CheckCircle2, BookHeart, Trophy].map((Icon, i) => (
            <div key={i} className={`flex h-10 w-10 items-center justify-center rounded-lg ${i === 0 ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:bg-muted'}`}>
              <Icon className="h-5 w-5" />
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-hidden p-4 sm:p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Dashboard</h3>
            <p className="text-sm text-muted-foreground">March 26, 2026</p>
          </div>
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-accent" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Card className="border-border/40 bg-card/60">
            <CardContent className="p-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-medium">Daily Energy</span>
                <Zap className="h-4 w-4 text-primary" />
              </div>
              <div className="mb-2 text-2xl font-bold">45/100</div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div className="h-full w-[45%] rounded-full bg-gradient-to-r from-primary to-accent" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/40 bg-card/60">
            <CardContent className="p-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-medium">Graduation Project</span>
                <Target className="h-4 w-4 text-accent" />
              </div>
              <div className="mb-2 text-2xl font-bold">68%</div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div className="h-full w-[68%] rounded-full bg-gradient-to-r from-accent to-pink-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/40 bg-card/60 sm:col-span-2">
            <CardContent className="p-4">
              <div className="mb-3 text-sm font-medium">Today's Tasks</div>
              <div className="flex flex-col gap-2">
                {[
                  { title: "Write introduction chapter", rpe: 7, done: true },
                  { title: "Review literature notes", rpe: 4, done: false },
                  { title: "Update project timeline", rpe: 3, done: false },
                ].map((task, i) => (
                  <div key={i} className="flex items-center gap-3 rounded-lg bg-muted/50 p-2.5">
                    <div className={`h-4 w-4 rounded border ${task.done ? 'border-primary bg-primary' : 'border-border'} flex items-center justify-center`}>
                      {task.done && <CheckCircle2 className="h-3 w-3 text-primary-foreground" />}
                    </div>
                    <span className={`flex-1 text-sm ${task.done ? 'line-through text-muted-foreground' : ''}`}>{task.title}</span>
                    <span className="rounded bg-primary/20 px-2 py-0.5 text-xs font-medium text-primary">RPE {task.rpe}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="hidden w-64 flex-shrink-0 border-l border-border/40 bg-card/30 p-4 lg:block">
        <div className="mb-4 flex items-center gap-2">
          <Brain className="h-5 w-5 text-accent" />
          <span className="font-medium">AI Coach</span>
          <span className="ml-auto rounded bg-accent/20 px-1.5 py-0.5 text-xs text-accent">Online</span>
        </div>
        <div className="flex flex-col gap-3">
          <div className="rounded-lg bg-muted/50 p-3 text-sm">
            <p className="text-muted-foreground">You only have 45 energy left and you're still eyeing that RPE 7 task? Bold move.</p>
          </div>
          <div className="ml-auto max-w-[80%] rounded-lg bg-primary/20 p-3 text-sm">
            <p>Can I finish today?</p>
          </div>
          <div className="rounded-lg bg-muted/50 p-3 text-sm">
            <p className="text-muted-foreground">Technically yes. Wisely? Debatable. Maybe save some energy for tomorrow's you.</p>
          </div>
        </div>
      </div>
    </div>
  )
}