"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RefreshCcw, Trash2, FileText, CheckCircle2 } from "lucide-react"

export default function TrashPage() {
  const [deletedTasks, setDeletedTasks] = useState<any[]>([])
  const [deletedDiaries, setDeletedDiaries] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // 抓取垃圾桶資料
  const fetchTrash = async () => {
    setLoading(true)
    
    // 1. 抓被刪除的任務
    const { data: tasks } = await supabase
      .from("tasks")
      .select("*")
      .eq("is_deleted", true)

    // 2. 抓被刪除的日記 (假設你的 diaries 表也有 is_deleted)
    const { data: diaries } = await supabase
      .from("diaries")
      .select("*")
      .eq("is_deleted", true)

    if (tasks) setDeletedTasks(tasks)
    if (diaries) setDeletedDiaries(diaries)
    setLoading(false)
  }

  useEffect(() => {
    fetchTrash()
  }, [])

  // 復原邏輯
  const handleRestore = async (table: string, id: string) => {
    const { error } = await supabase
      .from(table)
      .update({ is_deleted: false })
      .eq("id", id)

    if (!error) {
      fetchTrash() // 重新刷新列表
    }
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-bold">Trash Bin</h1>
        <p className="text-muted-foreground">Items will be permanently deleted after 30 days.</p>
      </div>

      <Tabs defaultValue="tasks" className="w-full">
        <TabsList>
          <TabsTrigger value="tasks">Tasks ({deletedTasks.length})</TabsTrigger>
          <TabsTrigger value="diaries">Diaries ({deletedDiaries.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="tasks" className="mt-4">
          <div className="grid gap-3">
            {deletedTasks.map((task) => (
              <Card key={task.id} className="border-border/40 bg-card/50">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-muted-foreground" />
                    <span className="line-through text-muted-foreground">{task.title}</span>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => handleRestore("tasks", task.id)}>
                    <RefreshCcw className="h-4 w-4 mr-2" /> Restore
                  </Button>
                </CardContent>
              </Card>
            ))}
            {deletedTasks.length === 0 && <p className="text-center py-10 text-muted-foreground">No deleted tasks.</p>}
          </div>
        </TabsContent>

        <TabsContent value="diaries" className="mt-4">
           {/* 日記的部分邏輯雷同，你之後可以根據 diaries 的欄位名稱微調 */}
           <p className="text-center py-10 text-muted-foreground">Diary trash feature coming soon.</p>
        </TabsContent>
      </Tabs>
    </div>
  )
}