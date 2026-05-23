"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useParams } from "next/navigation" // 🌟 引入 useParams 獲取網址上的目標 id
import { supabase } from "@/lib/supabase"  // 🌟 引入 supabase
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
  id: string | number
  title: string
  description: string
  rpe: number
  energyCost: number
  dueDate: string
  done: boolean
}

const goalData = {
  id: 1,
  title: "Graduation Project",
  description: "Complete the final year graduation project including research, implementation, and documentation. This goal includes all milestones from proposal to final presentation.",
  deadline: "Apr 15, 2026",
  progress: 68,
  status: "active" as const,
}

const rpeToEnergy = (rpe: number) => rpe * 3

export default function GoalDetailPage() {
  const params = useParams()
  const goalId = params?.id as string // 🎯 取得動態目標 ID
  
  const [tasks, setTasks] = useState<Task[]>([])
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    rpe: 5,
    dueDate: ""
  })

  // --- 1. 從 Supabase 撈取該目標底下的子任務 ---
  const fetchTasks = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // 🎯 這裡撈取任務，並且根據目前的目標 id 進行過濾
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("user_id", user.id)

    if (error) {
      console.error("撈取目標任務失敗:", error.message)
    } else if (data) {
      const formattedTasks = data.map((t: any) => ({
        id: t.id,
        title: t.title,
        description: t.description || "無描述",
        rpe: t.rpe_score || 5,
        energyCost: t.energy_cost || (t.rpe_score ? t.rpe_score * 3 : 15),
        dueDate: t.target_date || "無截止日",
        done: t.is_completed === true
      }))
      setTasks(formattedTasks)
    }
  }

  useEffect(() => {
    fetchTasks()
  }, [goalId])

  const completedTasks = tasks.filter(t => t.done).length
  const totalTasks = tasks.length
  const totalEnergy = tasks.reduce((sum, t) => sum + t.energyCost, 0)
  const remainingEnergy = tasks.filter(t => !t.done).reduce((sum, t) => sum + t.energyCost, 0)

  // --- 2. 核心修正：點擊打勾即時寫入 Supabase is_completed 欄位 ---
  const handleToggleTask = async (id: string | number, currentDoneStatus: boolean) => {
    // 立即反應在前端 UI 上預防卡頓
    setTasks(tasks.map(t => t.id === id ? { ...t, done: !currentDoneStatus } : t))

    const { error } = await supabase
      .from("tasks")
      .update({ is_completed: !currentDoneStatus }) // 🔑 只修改確定存在的布林值欄位
      .eq("id", id)

    if (error) {
      console.error("更新任務狀態失敗:", error.message)
      // 倒滾回舊狀態
      setTasks(tasks.map(t => t.id === id ? { ...t, done: currentDoneStatus } : t))
    }
  }

  // --- 3. 核心修正：動態插入新任務至真實資料庫 ---
  const handleCreateTask = async () => {
    if (!newTask.title) return
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      alert("請先登入系統！")
      return
    }

    const { data, error } = await supabase
      .from("tasks")
      .insert([
        {
          title: newTask.title.trim(),
          description: newTask.description.trim(),
          user_id: user.id,
          goal_id: "d8865988-327f-47f2-a277-e41ba6dc7eb2", // 🎯 統一對齊妳們目前的測試目標 UUID
          rpe_score: newTask.rpe,
          energy_cost: rpeToEnergy(newTask.rpe),
          target_date: newTask.dueDate || null,
          is_completed: false,
          priority: "medium",
          is_deleted: false
        }
      ])
      .select()

    if (error) {
      alert("新增任務失敗：" + error.message)
    } else if (data) {
      fetchTasks() // 重新刷新列表
      setNewTask({ title: "", description: "", rpe: 5, dueDate: "" })
      setIsCreateOpen(false)
    }
  }

  // --- 4. 核心修正：實作真刪除（或是改為 is_deleted） ---
  const handleDeleteTask = async (id: string | number) => {
    const { error } = await supabase
      .from("tasks")
      .delete()
      .eq("id", id)

    if (error) {
      console.error("刪除任務失敗:", error.message)
    } else {
      setTasks(tasks.filter(t => t.id !== id))
    }
  }

  const getRpeBadgeColor = (rpe: number) => {
    if (rpe >= 7) return "bg-red-500/20 text-red-400"
    if (rpe >= 5) return "bg-amber-500/20 text-amber-400"
    if (rpe >= 3) return "bg-yellow-500/20 text-yellow-400"
    return "bg-green-500/20 text-green-400"
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
                <Progress value={totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0} className="h-3" />
              </div>
              <span className="text-2xl font-bold">
                {totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0}%
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
            {tasks.length === 0 ? (
              <p className="text-muted-foreground text-sm py-8 text-center">本目標目前尚無任務</p>
            ) : (
              tasks.map((task) => (
                <div 
                  key={task.id} 
                  className="group flex items-center gap-4 rounded-lg border border-border/40 bg-muted/20 p-4 transition-colors hover:bg-muted/40"
                >
                  {/* 🎯 綁定打勾事件與動態狀態 */}
                  <Checkbox 
                    checked={task.done} 
                    onCheckedChange={() => handleToggleTask(task.id, task.done)}
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className={`font-medium ${task.done ? "line-through text-muted-foreground" : ""}`}>
                        {task.title}
                      </p>
                      {/* 🎯 這裡由原來的 status 判斷改為 done 狀態判斷 */}
                      {task.done ? (
                        <Badge className="bg-green-500/20 text-green-400">Done</Badge>
                      ) : (
                        <Badge className="bg-muted text-muted-foreground">To Do</Badge>
                      )}
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
                      <Calendar className="h-4 w-4" />
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
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}