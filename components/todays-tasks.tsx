"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { ArrowRight, Plus } from "lucide-react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"

interface Task {
  id: string | number
  title: string
  rpe: number
  done: boolean
  goal: string
}

export function TodaysTasks() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [newTaskTitle, setNewTaskTitle] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  // --- 1. 撈取當前登入者的今日任務 ---
  const fetchTasks = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("user_id", user.id) // 🌟 嚴格隔離：只撈目前使用者的任務


    if (error) {
      console.error("任務撈取失敗:", error.message)
    } else if (data) {
      // 找到 fetchTasks 裡面的 data.map，整段改成這樣：
      const formattedTasks = data.map((t: any) => {
        // 🎯 只要資料庫是 "completed" 或 "Done" 或 is_completed 欄位為 true，都算完成！
        const isTaskDone = t.status === "completed" || t.status === "Done" || t.is_completed === true;

        return {
          id: t.id,
          title: t.title,
          rpe: t.rpe_score || 5,
          done: isTaskDone,
          goal: "Graduation Project",
        }
      })
      setTasks(formattedTasks)
    }
  }

  useEffect(() => {
    fetchTasks()
  }, [])

  // --- 🌟 2. 新增：點擊打勾即時連動 Supabase 狀態 ---
 const handleToggleTodo = async (taskId: string | number, currentStatus: boolean) => {
    // 立即優化前端 UI 體驗
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, done: !currentStatus } : t))

    // 🎯 核心修正：直接把目前的勾選狀態取反 (true 變 false，false 變 true)
    const nextCompletedStatus = !currentStatus 

    const { error } = await supabase
      .from("tasks")
      .update({ is_completed: nextCompletedStatus }) // 🔑 對齊資料庫：修改正確的欄位名稱！
      .eq("id", taskId)

    if (error) {
      console.error("更新任務狀態失敗:", error.message)
      // 失敗時倒滾回來
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, done: currentStatus } : t))
    } else {
      // 🚀 【神級優化】如果更新成功，強制刷一下大首頁的數據，讓上方的卡片（1/2）同步跳轉！
      window.location.reload()
    }
  }

  // --- 3. 動態綁定帳號手動新增任務 ---
  const handleAddTask = async () => {
    if (!newTaskTitle.trim()) return

    setIsLoading(true)

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      alert("請先登入系統！")
      setIsLoading(false)
      return
    }

    const { data, error } = await supabase
      .from("tasks")
      .insert([
        {
          title: newTaskTitle.trim(),
          user_id: user.id, // 🌟 自動綁定目前登入帳號
          goal_id: "d8865988-327f-47f2-a277-e41ba6dc7eb2",
          rpe_score: 5,
          energy_cost: 20,
          status: "todo",
          priority: "medium",
        },
      ])
      .select()

    setIsLoading(false)

    if (error) {
      alert("新增失敗：" + error.message)
    } else if (data) {
      fetchTasks()
      setNewTaskTitle("")
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleAddTask()
    }
  }

  return (
    <Card className="border-border/40">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-semibold">Today&apos;s Tasks</CardTitle>
        <Link href="/tasks">
          <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground">
            View all
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {/* Add Task Input */}
        <div className="flex items-center gap-2 mb-2">
          <Input
            placeholder="新增任務..."
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            className="flex-1"
          />
          <Button
            onClick={handleAddTask}
            disabled={isLoading || !newTaskTitle.trim()}
            size="sm"
            className="gap-1"
          >
            <Plus className="h-4 w-4" />
            新增
          </Button>
        </div>

        {/* Task List */}
        {tasks.length === 0 ? (
          <p className="text-muted-foreground text-sm py-4 text-center">今日尚無安排任務</p>
        ) : (
          tasks.map((task) => (
            <div
              key={task.id}
              className="flex items-center gap-3 rounded-lg bg-muted/20 p-3"
            >
              {/* 🌟 核心修正：將打勾狀態與點擊事件精準綁定 */}
              <Checkbox
                checked={task.done}
                onCheckedChange={() => handleToggleTodo(task.id, task.done)}
              />
              <div className="flex-1">
                <p className={task.done ? "line-through text-muted-foreground" : ""}>
                  {task.title}
                </p>
                <p className="text-xs text-muted-foreground">{task.goal}</p>
              </div>
              <Badge
                variant="secondary"
                className={`text-xs ${task.rpe >= 7 ? 'bg-red-500/20 text-red-400' : task.rpe >= 5 ? 'bg-amber-500/20 text-amber-400' : 'bg-green-500/20 text-green-400'}`}
              >
                RPE {task.rpe}
              </Badge>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}