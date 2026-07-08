"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RefreshCcw, Trash2, FileText, CheckCircle2, ClipboardList, XCircle } from "lucide-react"

export default function TrashPage() {
  const [deletedTasks, setDeletedTasks] = useState<any[]>([])
  const [deletedDiaries, setDeletedDiaries] = useState<any[]>([])
  // 🏆 1. 新增被刪除的 chores 狀態
  const [deletedChores, setDeletedChores] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // 🏆 保持全站一致的優雅 Toast 提示狀態
  const [toastMsg, setToastMsg] = useState<{ show: boolean, message: string, type: 'success' | 'error' }>({ 
    show: false, message: "", type: "success" 
  })

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToastMsg({ show: true, message, type })
    setTimeout(() => {
      setToastMsg(prev => ({ ...prev, show: false }))
    }, 3000)
  }

  // 抓取垃圾桶資料
  const fetchTrash = async () => {
    setLoading(true)
    
    // 1. 抓被刪除的任務
    const { data: tasks } = await supabase
      .from("tasks")
      .select("*")
      .eq("is_deleted", true)

    // 2. 抓被刪除的日記
    const { data: diaries } = await supabase
      .from("diaries")
      .select("*")
      .eq("is_deleted", true)

    // 🏆 3. 抓取被刪除的日常瑣事 (chores)
    const { data: chores } = await supabase
      .from("chores")
      .select("*")
      .eq("is_deleted", true)

    if (tasks) setDeletedTasks(tasks)
    if (diaries) setDeletedDiaries(diaries)
    if (chores) setDeletedChores(chores) // 更新 chores 陣列
    setLoading(false)
  }

  useEffect(() => {
    fetchTrash()
  }, [])

  // 復原邏輯
  const handleRestore = async (table: string, id: string | number) => {
    const { error } = await supabase
      .from(table)
      .update({ is_deleted: false })
      .eq("id", id)

    if (!error) {
      fetchTrash() // 重新刷新列表
      showToast("資料已成功復原！🎉", "success") // 🏆 復原成功給予優雅提示
    } else {
      console.error(`復原 ${table} 失敗:`, error)
      showToast("復原失敗，請稍後再試", "error")
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
          {/* 🏆 4. 新增 Chores 分頁標籤 */}
          <TabsTrigger value="chores">Chores ({deletedChores.length})</TabsTrigger>
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
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <span className="line-through text-muted-foreground truncate max-w-[200px] sm:max-w-[400px]">
                      {diary.content}
                    </span>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => handleRestore("diaries", diary.id)}>
                    <RefreshCcw className="h-4 w-4 mr-2" /> 復原
                  </Button>
                </CardContent>
              </Card>
            ))}
            {deletedDiaries.length === 0 && <p className="text-center py-10 text-muted-foreground">垃圾桶空空如也，沒有被刪除的日記。</p>}
          </div>
        </TabsContent>

        {/* 🏆 5. 新增 Chores 的內容區塊 */}
        <TabsContent value="chores" className="mt-4">
          <div className="grid gap-3">
            {deletedChores.map((chore) => (
              <Card key={chore.id} className="border-border/40 bg-card/50">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <ClipboardList className="h-5 w-5 text-muted-foreground" />
                    <span className="line-through text-muted-foreground">{chore.title}</span>
                    {/* 這裡也可以依需求顯示日期或RPE，目前先保持跟其他分頁一致的簡潔感 */}
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => handleRestore("chores", chore.id)}>
                    <RefreshCcw className="h-4 w-4 mr-2" /> 復原
                  </Button>
                </CardContent>
              </Card>
            ))}
            {deletedChores.length === 0 && <p className="text-center py-10 text-muted-foreground">垃圾桶空空如也，沒有被刪除的瑣事。</p>}
          </div>
        </TabsContent>
      </Tabs>

      {/* 🏆 左下角 Toast 提示元件 */}
      {toastMsg.show && (
        <div className={`fixed bottom-24 left-6 z-50 flex items-center gap-3 rounded-lg border px-4 py-3 shadow-lg transition-all animate-in slide-in-from-bottom-5 fade-in duration-300 ${
          toastMsg.type === 'success' 
            ? 'bg-green-500/10 border-green-500/20 text-green-500' 
            : 'bg-red-500/10 border-red-500/20 text-red-500'
        }`}>
          {toastMsg.type === 'success' ? <CheckCircle2 className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
          <span className="text-sm font-medium">{toastMsg.message}</span>
        </div>
      )}
    </div>
  )
}