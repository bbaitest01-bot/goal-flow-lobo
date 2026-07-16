"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ArrowRight, Plus, Loader2 } from "lucide-react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"

interface Task {
  id: string | number
  title: string
  rpe: number
  done: boolean
  goal: string
}

const getTodayDateString = () => {
  const d = new Date()
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// 🌟 重點修改：加上 onToggle 參數
export function TodaysTasks({ onToggle }: { onToggle?: () => void }) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [newTask, setNewTask] = useState({ title: "", rpe_score: 5 })

  const fetchTasks = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("user_id", user.id)
      .eq("is_deleted", false)
      .eq("target_date", getTodayDateString()) // 🌟 核心過濾：只抓今天的任務！

    if (error) {
      console.error("任務撈取失敗:", error.message)
    } else if (data) {
      const formattedTasks = data.map((t: any) => ({
        id: t.id,
        title: t.title,
        rpe: t.rpe_score || 5,
        done: t.is_completed, 
        goal: "GoalFlow Project",    
      }))
      setTasks(formattedTasks)
    }
  }

  useEffect(() => {
    fetchTasks()
  }, [])

  const handleToggleTodo = async (taskId: string | number, currentStatus: boolean) => {
    const newStatus = !currentStatus
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, done: newStatus } : t))

    await supabase
      .from("tasks")
      .update({ 
        is_completed: newStatus,
        completed_at: newStatus ? getTodayDateString() : null 
      })
      .eq("id", taskId)
      
    // 🌟 重點修改：通知父元件資料已更新！
    if (onToggle) onToggle()
  }

  const handleAddTask = async () => {
    if (!newTask.title.trim()) return
    setIsSubmitting(true)
    const { data: { user } } = await supabase.auth.getUser()
    
    await supabase.from("tasks").insert([{
      title: newTask.title,
      user_id: user?.id,
      rpe_score: newTask.rpe_score,
      energy_cost: newTask.rpe_score * 3,
      target_date: getTodayDateString(),
      is_completed: false
    }])

    setIsSubmitting(false)
    setIsCreateOpen(false)
    setNewTask({ title: "", rpe_score: 5 }) // 重置回預設值 5
    fetchTasks()
  }

  return (
    <Card className="border-border/40 flex flex-col h-[320px]">
      <CardHeader className="flex flex-row items-center justify-between pb-2 shrink-0">
        <CardTitle className="text-lg font-semibold">今日任務</CardTitle>
        <Link href="/tasks">
          <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground">
            查看全部
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </CardHeader>
      
      <CardContent className="flex flex-col gap-2 flex-1 overflow-hidden">
        {/* 🌟 Dialog 新增模式 */}
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="w-full gap-2 mb-2" variant="outline">
              <Plus className="h-4 w-4" /> 新增任務
            </Button>
          </DialogTrigger>
          <DialogContent className="border-border/40 bg-card">
            <DialogHeader>
              <DialogTitle>新增今日任務</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-4 pt-4">
              <Input placeholder="任務標題" value={newTask.title} onChange={(e) => setNewTask({...newTask, title: e.target.value})} />
              
              {/* 【重點修改】：加入 RPE 1~10 限制 */}
              <Input 
                type="number" 
                min={1} 
                max={10} 
                placeholder="疲勞值 (1-10)" 
                value={newTask.rpe_score} 
                onChange={(e) => {
                  let val = Number(e.target.value)
                  if (val > 10) val = 10 // 超過 10 自動變 10
                  if (val < 1) val = 1   // 小於 1 (如 0 或負數) 自動變 1
                  setNewTask({...newTask, rpe_score: val})
                }} 
              />

              <Button onClick={handleAddTask} disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="animate-spin h-4 w-4" /> : "確認新增"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <div className="flex-1 overflow-y-auto pr-2 space-y-2 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
          {tasks.length === 0 ? (
            <p className="text-muted-foreground text-sm py-4 text-center">今日尚無安排任務</p>
          ) : (
            tasks.map((task) => (
              <div key={task.id} className="flex items-center gap-3 rounded-lg bg-muted/20 p-3">
                <Checkbox checked={task.done} onCheckedChange={() => handleToggleTodo(task.id, task.done)} />
                <div className="flex-1">
                  <p className={task.done ? "line-through text-muted-foreground text-sm" : "text-sm font-medium"}>
                    {task.title}
                  </p>
                </div>
                <Badge variant="secondary" className="text-xs">RPE {task.rpe}</Badge>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}