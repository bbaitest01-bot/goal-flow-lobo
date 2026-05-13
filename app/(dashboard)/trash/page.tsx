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
          <div className="grid gap-3">
            {deletedDiaries.map((diary) => (
              <Card key={diary.id} className="border-border/40 bg-card/50">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {/* 這裡我們用 FileText (文件圖示) 來代表日記 */}
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    {/* 日記顯示內容，加了 truncate 避免字太長破版 */}
                    <span className="line-through text-muted-foreground truncate max-w-[200px] sm:max-w-[400px]">
                      {diary.content}
                    </span>
                  </div>
                  {/* 點擊復原時，傳入 "diaries" 資料表與該日記的 id */}
                  <Button variant="ghost" size="sm" onClick={() => handleRestore("diaries", diary.id)}>
                    <RefreshCcw className="h-4 w-4 mr-2" /> 復原
                  </Button>
                </CardContent>
              </Card>
            ))}
            {/* 如果沒有被刪除的日記，顯示這段文字 */}
            {deletedDiaries.length === 0 && <p className="text-center py-10 text-muted-foreground">垃圾桶空空如也，沒有被刪除的日記。</p>}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}