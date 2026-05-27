"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RefreshCcw, FileText, CheckCircle2 } from "lucide-react"

export default function TrashPage() {
  const [deletedTasks, setDeletedTasks] = useState<any[]>([])
  const [deletedDiaries, setDeletedDiaries] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // 抓取垃圾桶資料
  const fetchTrash = async () => {
    setLoading(true)
    // 🔒 取得目前登入的使用者資訊
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setLoading(false)
      return
    }

    // 1. 🎯 抓取「目前登入者」且被軟刪除的任務
    const { data: tasks, error: taskError } = await supabase
      .from("tasks")
      .select("*")
      .eq("user_id", user.id) // 🔒 使用者帳號隔離，大雜燴退散
      .eq("is_deleted", true)

    if (taskError) console.error("撈取垃圾任務失敗:", taskError.message)

    // 2. 🎯 抓取「目前登入者」且被軟刪除的日記（精準對齊 diaries 表）
    const { data: diaries, error: diaryError } = await supabase
      .from("diaries") // ✅ 確實是 diaries 資料表
      .select("*")
      .eq("user_id", user.id) // 🔒 使用者帳號隔離，只看沛涵自己的日記
      .eq("is_deleted", true) // ✅ 確實有 is_deleted 欄位

    if (diaryError) console.error("撈取垃圾日記失敗:", diaryError.message)

    if (tasks) setDeletedTasks(tasks)
    if (diaries) setDeletedDiaries(diaries)
    setLoading(false)
  }

  useEffect(() => {
    fetchTrash()
  }, [])

  // 復原邏輯
  const handleRestore = async (table: string, id: string) => {
    // 兩張表現在都有標準的 `is_deleted` 欄位了，通通改回 false 即可復原！
    const { error } = await supabase
      .from(table)
      .update({ is_deleted: false })
      .eq("id", id)

    if (!error) {
      fetchTrash() // 重新刷新列表
    } else {
      console.error("復原失敗:", error.message)
    }
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-bold">Trash Bin</h1>
        <p className="text-muted-foreground">Items will be permanently deleted after 30 days.</p>
      </div>

      <Tabs defaultValue="tasks" className="w-full">
        {/* 🔑 修正：使用 h-10 與標準 bg-muted，讓外層大軌道復原，並讓 Trigger 觸發時能自動亮起深色滑塊 */}
        <TabsList className="grid w-full max-w-[400px] grid-cols-2 h-10 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground">
          <TabsTrigger
            value="tasks"
            className="rounded-md px-3 py-1.5 text-sm font-medium transition-all data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
          >
            Tasks ({deletedTasks.length})
          </TabsTrigger>
          <TabsTrigger
            value="diaries"
            className="rounded-md px-3 py-1.5 text-sm font-medium transition-all data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
          >
            Diaries ({deletedDiaries.length})
          </TabsTrigger>
        </TabsList>

        {/* Tasks 資源回收區 */}
        <TabsContent value="tasks" className="mt-4">
          <div className="grid gap-3">
            {loading ? (
              <p className="text-center py-10 text-muted-foreground">載入中...</p>
            ) : deletedTasks.length === 0 ? (
              <p className="text-center py-10 text-muted-foreground">垃圾桶空空如也，沒有被刪除的任務。</p>
            ) : (
              deletedTasks.map((task) => (
                <Card key={task.id} className="border-border/40 bg-card/50">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-muted-foreground" />
                      <span className="line-through text-muted-foreground">{task.title}</span>
                    </div>
                    <Button variant="ghost" size="sm" className="hover:text-primary transition-colors" onClick={() => handleRestore("tasks", task.id)}>
                      <RefreshCcw className="h-4 w-4 mr-2" /> 復原
                    </Button>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* Diaries 資源回收區 */}
        <TabsContent value="diaries" className="mt-4">
          <div className="grid gap-3">
            {loading ? (
              <p className="text-center py-10 text-muted-foreground">載入中...</p>
            ) : deletedDiaries.length === 0 ? (
              <p className="text-center py-10 text-muted-foreground">垃圾桶空空如也，沒有被刪除的日記。</p>
            ) : (
              deletedDiaries.map((diary) => (
                <Card key={diary.id} className="border-border/40 bg-card/50">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                      {/* 🎯 顯示 diaries 表裡的 content 欄位內容 */}
                      <span className="line-through text-muted-foreground truncate max-w-[200px] sm:max-w-[400px]">
                        {diary.content || "無內文日記"}
                      </span>
                    </div>
                    {/* 🎯 傳入正確的 "diaries" 表名稱 */}
                    <Button variant="ghost" size="sm" className="hover:text-primary transition-colors" onClick={() => handleRestore("diaries", diary.id)}>
                      <RefreshCcw className="h-4 w-4 mr-2" /> 復原
                    </Button>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}