"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Empty, EmptyDescription, EmptyTitle } from "@/components/ui/empty"
import {
  Plus,
  Search,
  MoreHorizontal,
  Clock,
  CheckSquare,
  Edit,
  Trash2,
  ExternalLink,
  Target,
  Calendar
} from "lucide-react"

type GoalStatus = "active" | "completed" | "archived"

interface Goal {
  id: number
  title: string
  description: string
  deadline: string
  progress: number
  status: GoalStatus
  tasks: number
  completedTasks: number
}

const initialGoals: Goal[] = [
  { 
    id: 1, 
    title: "Graduation Project", 
    description: "Complete the final year graduation project including research, implementation, and documentation.",
    deadline: "Apr 15, 2024",
    progress: 68,
    status: "active",
    tasks: 12,
    completedTasks: 8
  },
  { 
    id: 2, 
    title: "Learn React Advanced", 
    description: "Master advanced React concepts like hooks, context, and performance optimization.",
    deadline: "May 1, 2024",
    progress: 45,
    status: "active",
    tasks: 8,
    completedTasks: 4
  },
  { 
    id: 3, 
    title: "Build Portfolio Website", 
    description: "Design and develop a personal portfolio to showcase projects and skills.",
    deadline: "Jun 1, 2024",
    progress: 20,
    status: "active",
    tasks: 6,
    completedTasks: 1
  },
  { 
    id: 4, 
    title: "Fitness Goal Q1", 
    description: "Exercise 3 times per week and improve overall health.",
    deadline: "Mar 31, 2024",
    progress: 100,
    status: "completed",
    tasks: 12,
    completedTasks: 12
  },
  { 
    id: 5, 
    title: "Read 5 Books", 
    description: "Read 5 books on productivity and self-improvement.",
    deadline: "Feb 28, 2024",
    progress: 100,
    status: "completed",
    tasks: 5,
    completedTasks: 5
  },
]

export default function GoalsPage() {
  const [goals, setGoals] = useState(initialGoals)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState<GoalStatus | "all">("active")
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [newGoal, setNewGoal] = useState({
    title: "",
    description: "",
    deadline: ""
  })

  const filteredGoals = goals.filter((goal) => {
    const matchesSearch = goal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          goal.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesTab = activeTab === "all" || goal.status === activeTab
    return matchesSearch && matchesTab
  })

  const handleCreateGoal = () => {
    if (!newGoal.title) return
    
    const goal: Goal = {
      id: goals.length + 1,
      title: newGoal.title,
      description: newGoal.description,
      deadline: newGoal.deadline || "No deadline",
      progress: 0,
      status: "active",
      tasks: 0,
      completedTasks: 0
    }
    
    setGoals([...goals, goal])
    setNewGoal({ title: "", description: "", deadline: "" })
    setIsCreateOpen(false)
  }

  const handleDeleteGoal = (id: number) => {
    setGoals(goals.filter(g => g.id !== id))
  }

  const getStatusBadge = (status: GoalStatus) => {
    switch (status) {
      case "active":
        return <Badge className="bg-primary/20 text-primary">Active</Badge>
      case "completed":
        return <Badge className="bg-green-500/20 text-green-400">Completed</Badge>
      case "archived":
        return <Badge className="bg-muted text-muted-foreground">Archived</Badge>
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Goals</h1>
          <p className="text-muted-foreground">Manage your long-term objectives</p>
        </div>
        
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90">
              <Plus className="h-4 w-4" />
              New Goal
            </Button>
          </DialogTrigger>
          <DialogContent className="border-border/40 bg-card">
            <DialogHeader>
              <DialogTitle>Create New Goal</DialogTitle>
              <DialogDescription>
                Set a new long-term goal to track your progress
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-4 pt-4">
              <div>
                <label className="mb-2 block text-sm font-medium">Title</label>
                <Input 
                  placeholder="e.g., Complete thesis"
                  value={newGoal.title}
                  onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                  className="border-border/60 bg-muted/30"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">Description</label>
                <Textarea 
                  placeholder="Describe your goal..."
                  value={newGoal.description}
                  onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                  className="border-border/60 bg-muted/30"
                  rows={3}
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">Deadline</label>
                <Input 
                  type="date"
                  value={newGoal.deadline}
                  onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })}
                  className="border-border/60 bg-muted/30"
                />
              </div>
              <Button 
                onClick={handleCreateGoal}
                className="mt-2 bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90"
              >
                Create Goal
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search goals..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border-border/60 bg-muted/30 pl-9"
          />
        </div>
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as GoalStatus | "all")}>
          <TabsList className="bg-muted/30">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="archived">Archived</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Goals Grid */}
      {filteredGoals.length === 0 ? (
        <Empty>
          <Target className="h-10 w-10" />
          <EmptyTitle>No goals found</EmptyTitle>
          <EmptyDescription>
            {searchQuery 
              ? "Try adjusting your search or filters" 
              : "Create your first goal to get started"}
          </EmptyDescription>
          {!searchQuery && (
            <Button 
              onClick={() => setIsCreateOpen(true)}
              className="mt-4 gap-2 bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90"
            >
              <Plus className="h-4 w-4" />
              Create Goal
            </Button>
          )}
        </Empty>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredGoals.map((goal) => (
            <Card 
              key={goal.id} 
              className="group border-border/40 bg-card/50 transition-all hover:border-border hover:bg-card/80"
            >
              <CardContent className="p-5">
                <div className="mb-4 flex items-start justify-between">
                  {getStatusBadge(goal.status)}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="border-border/60 bg-card">
                      <DropdownMenuItem asChild>
                        <Link href={`/goals/${goal.id}`} className="gap-2">
                          <ExternalLink className="h-4 w-4" />
                          Open
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="gap-2">
                        <Edit className="h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="gap-2 text-destructive"
                        onClick={() => handleDeleteGoal(goal.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <Link href={`/goals/${goal.id}`}>
                  <h3 className="mb-2 text-lg font-semibold transition-colors hover:text-primary">
                    {goal.title}
                  </h3>
                </Link>
                
                <p className="mb-4 line-clamp-2 text-sm text-muted-foreground">
                  {goal.description}
                </p>

                <div className="mb-4 flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {goal.deadline}
                  </span>
                  <span className="flex items-center gap-1">
                    <CheckSquare className="h-4 w-4" />
                    {goal.completedTasks}/{goal.tasks}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <Progress value={goal.progress} className="h-2 flex-1" />
                  <span className="text-sm font-medium">{goal.progress}%</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
