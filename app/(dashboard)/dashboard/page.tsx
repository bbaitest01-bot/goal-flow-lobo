import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Zap,
  Target,
  CheckCircle2,
  Clock,
  Flame,
  TrendingUp,
  ArrowRight,
  AlertTriangle
} from "lucide-react"
import Link from "next/link"
import { TodaysTasks } from "@/components/todays-tasks"

const activeGoals = [
  { 
    id: 1, 
    title: "Graduation Project", 
    progress: 68, 
    deadline: "Apr 15, 2024",
    tasks: 12,
    completedTasks: 8
  },
  { 
    id: 2, 
    title: "Learn React Advanced", 
    progress: 45, 
    deadline: "May 1, 2024",
    tasks: 8,
    completedTasks: 4
  },
  { 
    id: 3, 
    title: "Build Portfolio", 
    progress: 20, 
    deadline: "Jun 1, 2024",
    tasks: 6,
    completedTasks: 1
  },
]

const todaysChores = [
  { id: 1, title: "Reply to emails", rpe: 2, done: true },
  { id: 2, title: "Organize desktop files", rpe: 2, done: false },
  { id: 3, title: "Schedule meeting", rpe: 1, done: false },
]

// Weekly activity data for heatmap
const weeklyActivity = [
  [2, 4, 3, 5, 2, 1, 0],
  [3, 5, 4, 6, 3, 2, 1],
  [4, 3, 5, 4, 5, 3, 2],
  [5, 6, 4, 7, 4, 2, 1],
]

export default function DashboardPage() {
  const energyUsed = 55
  const totalEnergy = 100
  const remainingEnergy = totalEnergy - energyUsed

  return (
    <div className="flex flex-col gap-6">
      {/* Energy Card - Prominent */}
      <Card className="border-border/40 bg-gradient-to-br from-card via-card to-primary/5">
        <CardContent className="p-6">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex-1">
              <div className="mb-2 flex items-center gap-2">
                <Zap className="h-6 w-6 text-primary" />
                <h2 className="text-xl font-semibold">Daily Energy</h2>
              </div>
              <p className="mb-4 text-muted-foreground">
                Track your energy to stay productive without burnout
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold">{remainingEnergy}</span>
                <span className="text-xl text-muted-foreground">/ {totalEnergy}</span>
                <span className="text-sm text-muted-foreground">energy remaining</span>
              </div>
            </div>
            
            <div className="w-full lg:w-64">
              <div className="mb-2 h-4 overflow-hidden rounded-full bg-muted">
                <div 
                  className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all"
                  style={{ width: `${remainingEnergy}%` }}
                />
              </div>
              {remainingEnergy < 30 && (
                <div className="flex items-center gap-2 text-amber-400">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="text-sm">Low energy - take it easy!</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          icon={Flame}
          label="Current Streak"
          value="7 days"
          trend="+2 from last week"
          trendUp
        />
        <StatCard 
          icon={CheckCircle2}
          label="Tasks This Week"
          value="23"
          trend="5 more than usual"
          trendUp
        />
        <StatCard 
          icon={Target}
          label="Goals Completed"
          value="3"
          trend="This month"
        />
        <StatCard 
          icon={TrendingUp}
          label="Productivity Score"
          value="85%"
          trend="+12% improvement"
          trendUp
        />
      </div>

      {/* Main Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Active Goals */}
        <Card className="border-border/40">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-semibold">Active Goals</CardTitle>
            <Link href="/goals">
              <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground">
                View all
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {activeGoals.map((goal) => (
              <Link key={goal.id} href={`/goals/${goal.id}`}>
                <div className="group rounded-lg border border-border/40 bg-muted/20 p-4 transition-colors hover:bg-muted/40">
                  <div className="mb-3 flex items-start justify-between">
                    <div>
                      <h3 className="font-medium group-hover:text-primary transition-colors">{goal.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {goal.completedTasks}/{goal.tasks} tasks
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      <Clock className="mr-1 h-3 w-3" />
                      {goal.deadline}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3">
                    <Progress value={goal.progress} className="h-2 flex-1" />
                    <span className="text-sm font-medium">{goal.progress}%</span>
                  </div>
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>

        {/* Today's Tasks */}
        <TodaysTasks />

        {/* Today's Chores */}
        <Card className="border-border/40">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-semibold">Today&apos;s Chores</CardTitle>
            <Link href="/chores">
              <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground">
                View all
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {todaysChores.map((chore) => (
              <div 
                key={chore.id} 
                className="flex items-center gap-3 rounded-lg bg-muted/20 p-3"
              >
                <Checkbox checked={chore.done} />
                <p className={`flex-1 ${chore.done ? "line-through text-muted-foreground" : ""}`}>
                  {chore.title}
                </p>
                <Badge variant="secondary" className="bg-primary/20 text-primary text-xs">
                  RPE {chore.rpe}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Weekly Activity Heatmap */}
        <Card className="border-border/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold">Weekly Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-1">
              {weeklyActivity.map((week, weekIndex) => (
                <div key={weekIndex} className="flex gap-1">
                  {week.map((value, dayIndex) => (
                    <div
                      key={dayIndex}
                      className="h-8 flex-1 rounded"
                      style={{
                        backgroundColor: value === 0 
                          ? 'hsl(var(--muted))' 
                          : `oklch(0.65 0.25 290 / ${Math.min(value * 15, 100)}%)`
                      }}
                      title={`${value} tasks completed`}
                    />
                  ))}
                </div>
              ))}
              <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                <span>Mon</span>
                <span>Tue</span>
                <span>Wed</span>
                <span>Thu</span>
                <span>Fri</span>
                <span>Sat</span>
                <span>Sun</span>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-end gap-2 text-xs text-muted-foreground">
              <span>Less</span>
              <div className="flex gap-1">
                {[0, 2, 4, 6].map((v) => (
                  <div
                    key={v}
                    className="h-3 w-3 rounded"
                    style={{
                      backgroundColor: v === 0 
                        ? 'hsl(var(--muted))' 
                        : `oklch(0.65 0.25 290 / ${Math.min(v * 15, 100)}%)`
                    }}
                  />
                ))}
              </div>
              <span>More</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function StatCard({ 
  icon: Icon, 
  label, 
  value, 
  trend,
  trendUp 
}: { 
  icon: React.ElementType
  label: string
  value: string
  trend?: string
  trendUp?: boolean
}) {
  return (
    <Card className="border-border/40">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <Icon className="h-5 w-5 text-primary" />
          {trend && (
            <span className={`text-xs ${trendUp ? 'text-green-400' : 'text-muted-foreground'}`}>
              {trend}
            </span>
          )}
        </div>
        <div className="mt-3">
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-sm text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  )
}
