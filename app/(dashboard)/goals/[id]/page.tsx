"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
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
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Plus,
  Clock,
  CheckSquare,
  Zap,
  MoreHorizontal,
  Edit,
  Trash2,
  AlertTriangle,
  Target,
  Calendar,
  ChevronLeft
} from "lucide-react"

interface Task {
  id: number
  title: string
  description: string
  rpe: number
  energyCost: number
  dueDate: string
  status: "todo" | "in-progress" | "done"
  done: boolean
}

const goalData = {
  id: 1,
  title: "Graduation Project",
  description: "Complete the final year graduation project including research, implementation, and documentation. This goal includes all milestones from proposal to final presentation.",
  deadline: "Apr 15, 2024",
  progress: 68,
  status: "active" as const,
}

const initialTasks: Task[] = [
  { 
    id: 1, 
    title: "Write introduction chapter", 
    description: "Draft the introduction section covering background and motivation",
    rpe: 7, 
    energyCost: 21, 
    dueDate: "Mar 28, 2024",
    status: "done",
    done: true 
  },
  { 
    id: 2, 
    title: "Review literature notes", 
    description: "Compile and organize notes from research papers",
    rpe: 4, 
    energyCost: 12, 
    dueDate: "Mar 29, 2024",
    status: "in-progress",
    done: false 
  },
  { 
    id: 3, 
    title: "Implement core algorithm", 
    description: "Code the main algorithm based on the research methodology",
    rpe: 9, 
    energyCost: 27, 
    dueDate: "Apr 2, 2024",
    status: "todo",
    done: false 
  },
  { 
    id: 4, 
    title: "Update project timeline", 
    description: "Revise milestones and deadlines based on current progress",
    rpe: 3, 
    energyCost: 9, 
    dueDate: "Mar 27, 2024",
    status: "todo",
    done: false 
  },
  { 
    id: 5, 
    title: "Create presentation slides", 
    description: "Design and prepare slides for the mid-term presentation",
    rpe: 6, 
    energyCost: 18, 
    dueDate: "Apr 5, 2024",
    status: "todo",
    done: false 
  },
  { 
    id: 6, 
    title: "Run experiments", 
    description: "Execute test cases and collect experimental data",
    rpe: 8, 
    energyCost: 24, 
    dueDate: "Apr 8, 2024",
    status: "todo",
    done: false 
  },
]

// RPE to energy cost mapping (RPE * 3)
const rpeToEnergy = (rpe: number) => rpe * 3

export default function GoalDetailPage() {
  const [tasks, setTasks] = useState(initialTasks)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    rpe: 5,
    dueDate: ""
  })

  const completedTasks = tasks.filter(t => t.done).length
  const totalTasks = tasks.length
  const totalEnergy = tasks.reduce((sum, t) => sum + t.energyCost, 0)
  const remainingEnergy = tasks.filter(t => !t.done).reduce((sum, t) => sum + t.energyCost, 0)

  const handleToggleTask = (id: number) => {
    setTasks(tasks.map(t => 
      t.id === id ? { ...t, done: !t.done, status: !t.done ? "done" : "todo" } : t
    ))
  }

  const handleCreateTask = () => {
    if (!newTask.title) return
    
    const task: Task = {
      id: tasks.length + 1,
      title: newTask.title,
      description: newTask.description,
      rpe: newTask.rpe,
      energyCost: rpeToEnergy(newTask.rpe),
      dueDate: newTask.dueDate || "No deadline",
      status: "todo",
      done: false
    }
    
    setTasks([...tasks, task])
    setNewTask({ title: "", description: "", rpe: 5, dueDate: "" })
    setIsCreateOpen(false)
  }

  const handleDeleteTask = (id: number) => {
    setTasks(tasks.filter(t => t.id !== id))
  }

  const getRpeBadgeColor = (rpe: number) => {
    if (rpe >= 8) return "bg-red-500/20 text-red-400"
    if (rpe >= 6) return "bg-amber-500/20 text-amber-400"
    if (rpe >= 4) return "bg-yellow-500/20 text-yellow-400"
    return "bg-green-500/20 text-green-400"
  }

  const getStatusBadge = (status: Task["status"]) => {
    switch (status) {
      case "done":
        return <Badge className="bg-green-500/20 text-green-400">Done</Badge>
      case "in-progress":
        return <Badge className="bg-primary/20 text-primary">In Progress</Badge>
      default:
        return <Badge className="bg-muted text-muted-foreground">To Do</Badge>
    }
  }

  const highRpeTasks = tasks.filter(t => !t.done && t.rpe >= 7).length

  return (
    <div className="flex flex-col gap-6">
      {/* Breadcrumb */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/goals">Goals</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{goalData.title}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Goal Header */}
      <div className="flex flex-col gap-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="mb-2 flex items-center gap-3">
              <h1 className="text-2xl font-bold">{goalData.title}</h1>
              <Badge className="bg-primary/20 text-primary">Active</Badge>
            </div>
            <p className="max-w-2xl text-muted-foreground">{goalData.description}</p>
          </div>
          <Link href="/goals">
            <Button variant="outline" size="sm" className="gap-2">
              <ChevronLeft className="h-4 w-4" />
              Back
            </Button>
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <Badge variant="outline" className="gap-1 px-3 py-1">
            <Calendar className="h-4 w-4" />
            Due: {goalData.deadline}
          </Badge>
        </div>
      </div>

      {/* Progress */}
      <Card className="border-border/40">
        <CardContent className="p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="mb-1 text-lg font-semibold">Goal Progress</h2>
              <p className="text-muted-foreground">
                {completedTasks} of {totalTasks} tasks completed
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-48">
                <Progress value={(completedTasks / totalTasks) * 100} className="h-3" />
              </div>
              <span className="text-2xl font-bold">
                {Math.round((completedTasks / totalTasks) * 100)}%
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border/40">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20">
                <Target className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalTasks}</p>
                <p className="text-sm text-muted-foreground">Total Tasks</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/40">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/20">
                <CheckSquare className="h-5 w-5 text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{completedTasks}</p>
                <p className="text-sm text-muted-foreground">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/40">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/20">
                <Clock className="h-5 w-5 text-amber-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalTasks - completedTasks}</p>
                <p className="text-sm text-muted-foreground">Remaining</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/40">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/20">
                <Zap className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold">{remainingEnergy}</p>
                <p className="text-sm text-muted-foreground">Energy Needed</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Coach Warning */}
      {highRpeTasks >= 2 && (
        <Alert className="border-amber-500/50 bg-amber-500/10">
          <AlertTriangle className="h-4 w-4 text-amber-400" />
          <AlertDescription className="text-amber-200">
            You have {highRpeTasks} high-difficulty tasks (RPE 7+) remaining. Consider spreading them out to avoid burnout.
          </AlertDescription>
        </Alert>
      )}

      {/* Tasks Section */}
      <Card className="border-border/40">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Tasks</CardTitle>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-2 bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90">
                <Plus className="h-4 w-4" />
                Add Task
              </Button>
            </DialogTrigger>
            <DialogContent className="border-border/40 bg-card">
              <DialogHeader>
                <DialogTitle>Add New Task</DialogTitle>
                <DialogDescription>
                  Create a task for this goal
                </DialogDescription>
              </DialogHeader>
              <div className="flex flex-col gap-4 pt-4">
                <div>
                  <label className="mb-2 block text-sm font-medium">Title</label>
                  <Input 
                    placeholder="e.g., Complete chapter 3"
                    value={newTask.title}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                    className="border-border/60 bg-muted/30"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium">Description</label>
                  <Textarea 
                    placeholder="Task details..."
                    value={newTask.description}
                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                    className="border-border/60 bg-muted/30"
                    rows={2}
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    RPE (Difficulty): {newTask.rpe} - Energy Cost: {rpeToEnergy(newTask.rpe)}
                  </label>
                  <Slider
                    value={[newTask.rpe]}
                    onValueChange={(v) => setNewTask({ ...newTask, rpe: v[0] })}
                    min={1}
                    max={10}
                    step={1}
                    className="py-4"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>1 (Easy)</span>
                    <span>5 (Medium)</span>
                    <span>10 (Very Hard)</span>
                  </div>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium">Due Date</label>
                  <Input 
                    type="date"
                    value={newTask.dueDate}
                    onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                    className="border-border/60 bg-muted/30"
                  />
                </div>
                <Button 
                  onClick={handleCreateTask}
                  className="mt-2 bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90"
                >
                  Add Task
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-2">
            {tasks.map((task) => (
              <div 
                key={task.id} 
                className="group flex items-center gap-4 rounded-lg border border-border/40 bg-muted/20 p-4 transition-colors hover:bg-muted/40"
              >
                <Checkbox 
                  checked={task.done} 
                  onCheckedChange={() => handleToggleTask(task.id)}
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className={`font-medium ${task.done ? "line-through text-muted-foreground" : ""}`}>
                      {task.title}
                    </p>
                    {getStatusBadge(task.status)}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{task.description}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className={getRpeBadgeColor(task.rpe)}>
                    RPE {task.rpe}
                  </Badge>
                  <Badge variant="outline" className="gap-1">
                    <Zap className="h-3 w-3" />
                    {task.energyCost}
                  </Badge>
                  <span className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    {task.dueDate}
                  </span>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="border-border/60 bg-card">
                      <DropdownMenuItem className="gap-2">
                        <Edit className="h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="gap-2 text-destructive"
                        onClick={() => handleDeleteTask(task.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
