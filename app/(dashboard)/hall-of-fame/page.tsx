"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Empty, EmptyDescription, EmptyTitle } from "@/components/ui/empty"
import {
  Trophy,
  Star,
  Calendar,
  Flame,
  Award,
  Crown,
  Sparkles,
  Target
} from "lucide-react"

interface Achievement {
  id: number
  title: string
  summary: string
  completedDate: string
  badge: "legendary" | "survived" | "finally" | "champion"
  tasksCompleted: number
  daysToComplete: number
}

const achievements: Achievement[] = [
  {
    id: 1,
    title: "Fitness Goal Q1",
    summary: "Exercised 3 times per week for the entire quarter. Built a consistent workout routine.",
    completedDate: "Mar 31, 2024",
    badge: "champion",
    tasksCompleted: 12,
    daysToComplete: 90
  },
  {
    id: 2,
    title: "Read 5 Books",
    summary: "Completed 5 books on productivity and self-improvement. Expanded knowledge and perspectives.",
    completedDate: "Feb 28, 2024",
    badge: "legendary",
    tasksCompleted: 5,
    daysToComplete: 60
  },
  {
    id: 3,
    title: "Learn TypeScript Basics",
    summary: "Mastered TypeScript fundamentals including types, interfaces, and generics.",
    completedDate: "Feb 15, 2024",
    badge: "finally",
    tasksCompleted: 8,
    daysToComplete: 30
  },
  {
    id: 4,
    title: "Complete Online Course",
    summary: "Finished the advanced web development course with all assignments and projects.",
    completedDate: "Jan 30, 2024",
    badge: "survived",
    tasksCompleted: 15,
    daysToComplete: 45
  },
]

const badgeStyles = {
  legendary: {
    icon: Crown,
    label: "Legendary",
    color: "bg-gradient-to-r from-yellow-500/20 to-amber-500/20 text-yellow-400 border-yellow-500/40"
  },
  survived: {
    icon: Flame,
    label: "Survived",
    color: "bg-gradient-to-r from-orange-500/20 to-red-500/20 text-orange-400 border-orange-500/40"
  },
  finally: {
    icon: Sparkles,
    label: "Finally Finished",
    color: "bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-400 border-purple-500/40"
  },
  champion: {
    icon: Award,
    label: "Champion",
    color: "bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-400 border-blue-500/40"
  }
}

export default function HallOfFamePage() {
  const totalCompleted = achievements.length
  const currentStreak = 7
  const biggestProject = achievements.reduce((max, a) => 
    a.tasksCompleted > max.tasksCompleted ? a : max, achievements[0]
  )

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-yellow-500/20 to-amber-500/20">
          <Trophy className="h-8 w-8 text-yellow-400" />
        </div>
        <h1 className="text-3xl font-bold">Hall of Fame</h1>
        <p className="mt-2 text-muted-foreground">
          Celebrate your completed goals and achievements
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-border/40 bg-gradient-to-br from-card to-primary/5">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/20">
              <Target className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-3xl font-bold">{totalCompleted}</p>
              <p className="text-sm text-muted-foreground">Goals Completed</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/40 bg-gradient-to-br from-card to-accent/5">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/20">
              <Flame className="h-6 w-6 text-accent" />
            </div>
            <div>
              <p className="text-3xl font-bold">{currentStreak}</p>
              <p className="text-sm text-muted-foreground">Day Streak</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/40 bg-gradient-to-br from-card to-yellow-500/5">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-yellow-500/20">
              <Star className="h-6 w-6 text-yellow-400" />
            </div>
            <div>
              <p className="text-xl font-bold truncate">{biggestProject.title}</p>
              <p className="text-sm text-muted-foreground">Biggest Project</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Achievements Grid */}
      {achievements.length === 0 ? (
        <Empty className="py-16">
          <Trophy className="h-12 w-12" />
          <EmptyTitle>No achievements yet</EmptyTitle>
          <EmptyDescription>
            Complete your first goal to add it to your Hall of Fame!
          </EmptyDescription>
        </Empty>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {achievements.map((achievement) => {
            const badgeInfo = badgeStyles[achievement.badge]
            const BadgeIcon = badgeInfo.icon
            
            return (
              <Card 
                key={achievement.id} 
                className="group relative overflow-hidden border-border/40 bg-card/50 transition-all hover:border-border hover:bg-card/80"
              >
                {/* Glow effect on hover */}
                <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100">
                  <div className="absolute -inset-px bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 blur-xl" />
                </div>
                
                <CardContent className="relative p-6">
                  <div className="mb-4 flex items-start justify-between">
                    <Badge className={`gap-1 border ${badgeInfo.color}`}>
                      <BadgeIcon className="h-3 w-3" />
                      {badgeInfo.label}
                    </Badge>
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-yellow-500/30 to-amber-500/30">
                      <Trophy className="h-5 w-5 text-yellow-400" />
                    </div>
                  </div>

                  <h3 className="mb-2 text-xl font-semibold">{achievement.title}</h3>
                  <p className="mb-4 text-sm text-muted-foreground leading-relaxed">
                    {achievement.summary}
                  </p>

                  <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {achievement.completedDate}
                    </span>
                    <span className="flex items-center gap-1">
                      <Target className="h-4 w-4" />
                      {achievement.tasksCompleted} tasks
                    </span>
                    <span className="flex items-center gap-1">
                      <Flame className="h-4 w-4" />
                      {achievement.daysToComplete} days
                    </span>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Motivational Footer */}
      <Card className="border-primary/30 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10">
        <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
          <Sparkles className="h-8 w-8 text-primary" />
          <h3 className="text-xl font-semibold">Keep Going!</h3>
          <p className="max-w-md text-muted-foreground">
            Every completed goal is a step towards becoming the best version of yourself. 
            Your Hall of Fame is just getting started!
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
