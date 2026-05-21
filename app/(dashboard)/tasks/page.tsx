"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase" 
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Search,
  MoreHorizontal,
  Clock,
  Zap,
  Trash2,
  CheckSquare,
  Target
} from "lucide-react"

export default function TasksPage() {
  const [tasks, setTasks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState<"all" | "today" | "upcoming" | "done">("all")

  // 1. 撈取資料（隔離防線）
  const fetchTasks = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setLoading(false)
      return
    }

    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("user_id", user.id)    
      .eq("is_deleted", false)   

    if (data) {
      const formattedTasks = data.map(t => ({
        ...t,
        id: t.id,
        title: t.title,
        done: t.is_completed, // 🌟 修正：直接讀取 is_completed (布林值)
        rpe: t.rpe_score || 5,
        energyCost: t.energy_cost || 0, 
        dueDate: t.target_date || "No Date",
        goalTitle: "GoalFlow Project", 
        status: t.is_completed ? "done" : "todo" // 🌟 修正：根據布林值給予 todo 或 done
      }))
      setTasks(formattedTasks)
    }
    
    if (error) {
      console.error("Supabase Error:", error.message)
    }
    setLoading(false) 
  }

  useEffect(() => {
    fetchTasks()
  }, [])

  // 2. 更新 RPE 分數與能量值
  const handleUpdateRPE = async (id: string, newRpe: number) => {
    const newEnergy = newRpe * 3; 
    const { error } = await supabase
      .from("tasks")
      .update({ 
        rpe_score: newRpe,
        energy_cost: newEnergy 
      })
      .eq("id", id) 

    if (!error) {
      setTasks(tasks.map(t => t.id === id ? { ...t, rpe: newRpe, energyCost: newEnergy } : t))
    } else {
      console.error("Supabase 更新失敗:", error.message)
    }
  }

  // 🌟 修正後的打勾功能：精準對齊資料庫真實的 is_completed 欄位
  const handleToggleTask = async (id: any, currentDone: boolean) => {
    // 搶先更新前端狀態（讓使用者操作不卡頓）
    setTasks(tasks.map(t => 
      t.id === id ? { ...t, done: !currentDone, status: !currentDone ? "done" : "todo" } : t
    ))

    const { error } = await supabase
      .from("tasks")
      .update({ is_completed: !currentDone }) // 🌟 這裡改成正確的 is_completed！
      .eq("id", id)

    if (error) {
      console.error("打勾同步失敗:", error.message)
      // 失敗時倒滾狀態回來
      setTasks(tasks.map(t => 
        t.id === id ? { ...t, done: currentDone, status: currentDone ? "done" : "todo" } : t
      ))
    }
  }

  // 4. 邏輯刪除
  const handleDeleteTask = async (id: string) => {
    if (!confirm("確定要將此任務移至垃圾桶嗎？")) return

    const { error } = await supabase
      .from("tasks")
      .update({ is_deleted: true }) 
      .eq("id", id)

    if (!error) {
      setTasks(tasks.filter(t => t.id !== id))
    } else {
      console.error("刪除任務失敗:", error.message)
    }
  }

  // 資料過濾
  const filteredTasks = tasks.filter((task) => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesTab = activeTab === "all" || 
                       (activeTab === "done" && task.done) ||
                       (activeTab === "upcoming" && !task.done)
    return matchesSearch && matchesTab
  })

  const getRpeBadgeColor = (rpe: number) => {
    if (rpe >= 8) return "bg-red-500/20 text-red-400"
    if (rpe >= 6) return "bg-amber-500/20 text-amber-400"
    if (rpe >= 4) return "bg-yellow-500/20 text-yellow-400"
    return "bg-green-500/20 text-green-400"
  }

  const getStatusBadge = (status: string) => {
    return status === "done" 
      ? <Badge className="bg-green-500/20 text-green-400">Done</Badge>
      : <Badge className="bg-muted text-muted-foreground">To Do</Badge>
  }

  const completedCount = tasks.filter(t => t.done).length
  const totalEnergy = tasks.filter(t => !t.done).reduce((sum, t) => sum + t.energyCost, 0)

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">All Tasks</h1>
        <p className="text-muted-foreground">View and manage tasks across all your goals</p>
      </div>

      {/* 統計卡片 */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-border/40 bg-card/50">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20">
              <Clock className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{tasks.length}</p>
              <p className="text-sm text-muted-foreground">Total Tasks</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-border/40 bg-card/50">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/20">
              <CheckSquare className="h-5 w-5 text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{completedCount}</p>
              <p className="text-sm text-muted-foreground">Completed</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/40 bg-card/50">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/20">
              <Zap className="h-5 w-5 text-accent" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalEnergy}</p>
              <p className="text-sm text-muted-foreground">Energy Cost</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 搜尋與篩選分頁 */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input 
            placeholder="Search tasks..." 
            value={searchQuery} 
            onChange={(e) => setSearchQuery(e.target.value)} 
            className="border-border/60 bg-muted/30 pl-9" 
          />
        </div>
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
          <TabsList className="bg-muted/30">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="done">Done</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* 任務列表卡片 */}
      <Card className="border-border/40 bg-card/30 backdrop-blur-xl">
        <CardContent className="p-0">
          <div className="divide-y divide-border/40">
            {filteredTasks.length === 0 ? (
              // 🌟 核心改動：如果 loading 還在跑，就先完全不著色、不跳出提示，保持優雅留白
              loading ? null : <p className="text-muted-foreground text-sm py-8 text-center">目前尚無符合條件的任務</p>
            ) : filteredTasks.map((task) => (
              <div key={task.id} className="group flex items-center gap-4 p-4 transition-colors hover:bg-muted/20">
                <Checkbox checked={task.done} onCheckedChange={() => handleToggleTask(task.id, task.done)} />
                
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className={`font-medium ${task.done ? "line-through text-muted-foreground" : ""}`}>{task.title}</p>
                    {getStatusBadge(task.status)}
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                    <Target className="h-3 w-3" /> GoalFlow Project
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  {/* RPE 修改下拉選單 */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        className={`h-7 px-2 text-xs font-bold border hover:bg-muted/50 ${getRpeBadgeColor(task.rpe)}`}
                      >
                        RPE {task.rpe}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="grid grid-cols-5 gap-1 p-2 bg-card border-border/60">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                        <Button
                          key={num}
                          size="sm"
                          variant="outline"
                          className="h-8 w-8 p-0 text-xs hover:bg-primary hover:text-white"
                          onClick={() => handleUpdateRPE(task.id, num)}
                        >
                          {num}
                        </Button>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <Badge variant="outline" className="gap-1">
                    <Zap className="h-3 w-3" />{task.energyCost}
                  </Badge>
                  
                  <span className="hidden sm:flex items-center gap-1 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />{task.dueDate}
                  </span>
                  
                  {/* 操作選單 */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-card">
                      <DropdownMenuItem className="gap-2 text-destructive" onClick={() => handleDeleteTask(task.id)}>
                        <Trash2 className="h-4 w-4" />Delete
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