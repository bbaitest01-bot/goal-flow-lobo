"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  LayoutDashboard,
  Target,
  CheckSquare,
  ClipboardList,
  BookHeart,
  Trophy,
  Settings,
  Sparkles,
  Bell,
  Menu,
  X,
  Brain,
  Send,
  Zap,
  Trash2
} from "lucide-react"
import { useState } from "react"

const sidebarItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: Target, label: "Goals", href: "/goals" },
  { icon: CheckSquare, label: "Tasks", href: "/tasks" },
  { icon: ClipboardList, label: "Chores", href: "/chores" },
  { icon: BookHeart, label: "Diary", href: "/diary" },
  { icon: Trophy, label: "Hall of Fame", href: "/hall-of-fame" },
  { icon: Trash2, label: "Trash", href: "/trash" },
  { icon: Settings, label: "Settings", href: "/settings" },
]

const coachMessages = [
  { 
    type: "coach" as const, 
    content: "Good morning! You've got 3 tasks on your plate today. Let's see if you can actually finish them this time." 
  },
  { 
    type: "user" as const, 
    content: "What should I focus on first?" 
  },
  { 
    type: "coach" as const, 
    content: "Start with 'Review literature notes' - it's only RPE 4 and will warm you up. Save the heavy lifting for when you're caffeinated." 
  },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [coachInput, setCoachInput] = useState("")

  return (
    <div className="flex min-h-screen bg-background">
      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 transform border-r border-border/40 bg-sidebar transition-transform duration-200 lg:static lg:translate-x-0",
        mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-4">
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent">
                <Sparkles className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold">GoalFlow</span>
            </Link>
            <Button 
              variant="ghost" 
              size="icon" 
              className="lg:hidden"
              onClick={() => setMobileMenuOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation */}
          <ScrollArea className="flex-1 px-3 py-4">
            <nav className="flex flex-col gap-1">
              {sidebarItems.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                        : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                    )}
                  >
                    <item.icon className={cn("h-5 w-5", isActive && "text-primary")} />
                    {item.label}
                  </Link>
                )
              })}
            </nav>
          </ScrollArea>

          {/* User Section */}
          <div className="border-t border-sidebar-border p-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-9 w-9">
                <AvatarImage src="/avatar.png" />
                <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground">
                  JD
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 truncate">
                <p className="text-sm font-medium">John Doe</p>
                <p className="text-xs text-muted-foreground">john@example.com</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border/40 bg-background/80 px-4 backdrop-blur-xl lg:px-6">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              className="lg:hidden"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-lg font-semibold capitalize">
                {pathname === "/dashboard" ? "Dashboard" : pathname.slice(1).replace(/-/g, " ")}
              </h1>
              <p className="text-sm text-muted-foreground">
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-accent" />
            </Button>
            <Avatar className="h-9 w-9 lg:hidden">
              <AvatarImage src="/avatar.png" />
              <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground">
                JD
              </AvatarFallback>
            </Avatar>
          </div>
        </header>

        {/* Content + AI Coach */}
        <div className="flex flex-1 overflow-hidden">
          {/* Main Content */}
          <main className="flex-1 overflow-auto p-4 lg:p-6">
            {children}
          </main>

          {/* AI Coach Panel */}
          <aside className="hidden w-80 flex-shrink-0 border-l border-border/40 bg-card/30 xl:flex xl:flex-col">
            {/* Coach Header */}
            <div className="flex items-center gap-3 border-b border-border/40 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-accent to-pink-500">
                <Brain className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">Toxic Coach</h3>
                <p className="text-xs text-muted-foreground">Your brutally honest AI</p>
              </div>
              <span className="rounded-full bg-green-500/20 px-2 py-0.5 text-xs text-green-400">
                Online
              </span>
            </div>

            {/* Energy Summary */}
            <div className="border-b border-border/40 p-4">
              <div className="rounded-xl border border-border/40 bg-muted/30 p-3">
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Energy Today</span>
                  <Zap className="h-4 w-4 text-primary" />
                </div>
                <div className="mb-1 text-xl font-bold">45/100</div>
                <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                  <div className="h-full w-[45%] rounded-full bg-gradient-to-r from-primary to-accent" />
                </div>
                <p className="mt-2 text-xs text-amber-400">Low energy warning</p>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="flex flex-col gap-3">
                {coachMessages.map((msg, i) => (
                  <div 
                    key={i} 
                    className={cn(
                      "max-w-[90%] rounded-xl p-3 text-sm",
                      msg.type === "coach" 
                        ? "bg-muted/50 text-muted-foreground" 
                        : "ml-auto bg-primary/20 text-foreground"
                    )}
                  >
                    {msg.content}
                  </div>
                ))}
              </div>
            </ScrollArea>

            {/* Quick Actions */}
            <div className="border-t border-border/40 p-3">
              <div className="mb-3 flex flex-wrap gap-1.5">
                {["What next?", "Can I rest?", "Motivate me"].map((action) => (
                  <button
                    key={action}
                    className="rounded-full border border-border/60 bg-muted/30 px-3 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  >
                    {action}
                  </button>
                ))}
              </div>
              
              {/* Input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={coachInput}
                  onChange={(e) => setCoachInput(e.target.value)}
                  placeholder="Ask your coach..."
                  className="flex-1 rounded-lg border border-border/60 bg-muted/30 px-3 py-2 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                />
                <Button size="icon" className="bg-gradient-to-r from-primary to-accent hover:opacity-90">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
