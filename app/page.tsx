"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

export default function DashboardPage() {
  const [tasks, setTasks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // 1. 抓取資料
  useEffect(() => {
    const fetchTasks = async () => {
      setLoading(true)
      const { data } = await supabase
        .from("tasks")
        .select("*")
        .order("created_at", { ascending: false })
      if (data) setTasks(data)
      setLoading(false)
    }
    fetchTasks()
  }, [])

  // 2. 打勾功能
  const toggleTask = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from("tasks")
      .update({ is_completed: !currentStatus })
      .eq("id", id)

    if (!error) {
      setTasks(tasks.map(t => t.id === id ? { ...t, is_completed: !currentStatus } : t))
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card className="border-border/40 bg-card/30 backdrop-blur-xl">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            今日任務清單
          </CardTitle>
          <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
            {tasks.filter(t => !t.is_completed).length} 個待辦
          </Badge>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            {loading ? (
              // 載入中的骨架屏
              [1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)
            ) : tasks.length > 0 ? (
              tasks.map((task) => (
                <div 
                  key={task.id} 
                  className="group flex items-center justify-between p-4 rounded-xl border border-border/40 bg-muted/20 hover:bg-muted/40 transition-all duration-200"
                >
                  <div className="flex items-center gap-4">
                    <Checkbox 
                      id={task.id}
                      checked={task.is_completed} 
                      onCheckedChange={() => toggleTask(task.id, task.is_completed)}
                      className="h-5 w-5 border-primary/50 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    />
                    <label 
                      htmlFor={task.id}
                      className={`text-sm font-medium cursor-pointer transition-all ${
                        task.is_completed ? "text-muted-foreground/50 line-through" : "text-foreground"
                      }`}
                    >
                      {task.title}
                    </label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px] uppercase tracking-wider bg-background/50">
                      RPE {task.rpe_score}
                    </Badge>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center py-10 text-muted-foreground">目前沒有任務，快去建立一個吧！</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}