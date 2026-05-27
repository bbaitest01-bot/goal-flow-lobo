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

  // 1. 撈取資料
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
        done: t.is_completed === true,
        rpe: t.rpe_score || 5,
        energyCost: t.energy_cost || 0,
        dueDate: t.target_date || "無截止日",
        goalTitle: "GoalFlow Project"
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

  // 3. 打勾功能
  const handleToggleTask = async (id: any, currentDone: boolean) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, done: !currentDone } : t))

    const { error } = await supabase
      .from("tasks")
      .update({ is_completed: !currentDone })
      .eq("id", id)

    if (error) {
      console.error("打勾同步失敗:", error.message)
      setTasks(tasks.map(t => t.id === id ? { ...t, done: currentDone } : t))
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
    if (rpe >= 7) return "bg-red-500/20 text-red-400"
    if (rpe >= 5) return "bg-amber-500/20 text-amber-400"
    if (rpe >= 3) return "bg-yellow-500/20 text-yellow-400"
    return "bg-green-500/20 text-green-400"
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
              loading ? null : <p className="text-muted-foreground text-sm py-8 text-center">目前尚無符合條件的任務</p>
            ) : filteredTasks.map((task) => (
              // 🌟 核心優化：這裡的 items-center 確保高度不同時依然能精準「垂直居中」對齊
              <div key={task.id} className="group flex items-center gap-4 p-4 transition-colors hover:bg-muted/20">
                <Checkbox checked={task.done} onCheckedChange={() => handleToggleTask(task.id, task.done)} />

                {/* 🌟 核心優化：加上 flex-1 確保不論文字長短，左側區塊都強制推滿剩餘空間 */}
                <div className="flex-1 min-w-0">
                  {/* 🎯 關鍵修正點：加上 flex-1 與 w-full，讓標題行的容器強制伸展，右邊的標籤自然就會被完美向右推齊 */}
                  <div className="flex flex-wrap items-center gap-2 w-full">
                    <p className={`font-medium truncate ${task.done ? "line-through text-muted-foreground" : ""}`}>{task.title}</p>
                    {task.done ? (
                      <Badge className="bg-green-500/20 text-green-400 no-shrink">Done</Badge>
                    ) : (
                      <Badge className="bg-muted text-muted-foreground no-shrink">To Do</Badge>
                    )}
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                    <Target className="h-3 w-3" /> GoalFlow Project
                  </div>
                </div>

                {/* 🔑 終極復刻：移除 grid，改回 flex 佈局，並加上 gap-4 完美還原黑色原廠的精緻間距 */}
                {/* justify-end 讓整坨標籤往最右邊靠齊，ml-auto 釋放左側全部空間給標題 */}
                <div className="flex items-center gap-4 flex-shrink-0 ml-auto justify-end">

                  {/* 種類 1：RPE 下拉選單（鎖定 w-[65px] 垂直軌道） */}
                  <div className="w-[65px] flex justify-start">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          className={`h-7 w-[65px] text-[11px] font-bold border hover:bg-muted/50 justify-center px-1 ${getRpeBadgeColor(task.rpe)}`}
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
                  </div>

                  {/* 種類 2：能量值閃電（鎖定 w-[45px] 垂直軌道） */}
                  <div className="w-[45px] flex justify-start">
                    <Badge variant="outline" className="gap-0.5 h-7 w-[45px] text-[11px] justify-center flex-shrink-0 px-1">
                      <Zap className="h-3 w-3 text-accent" />{task.energyCost}
                    </Badge>
                  </div>

                  {/* 種類 3：截止日期（鎖定 w-[115px] 垂直軌道，加上 tabular-nums 預防數字 1 縮水） */}
                  <div className="hidden sm:flex w-[115px] justify-start">
                    <span className="flex items-center gap-1 text-xs text-muted-foreground h-7 tabular-nums">
                      <Clock className="h-3.5 w-3.5 text-muted-foreground" />{task.dueDate}
                    </span>
                  </div>

                  {/* 種類 4：三個點點操作選單（鎖定 w-8 寬度，平常 opacity-0 隱形，滑鼠滑過才顯現） */}
                  <div className="w-8 flex justify-end">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
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
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}