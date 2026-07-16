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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger, 
} from "@/components/ui/dialog"
import {
  Search,
  MoreHorizontal,
  Clock,
  Zap,
  Trash2,
  CheckSquare,
  Target,
  Loader2,      
  XCircle,      
  CheckCircle2, 
  Plus,         
  Edit          // 🏆 新增：編輯任務的圖示
} from "lucide-react"

// 取得今日日期的 Helper Function
const getTodayDateString = () => {
  const d = new Date()
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState<"all" | "today" | "upcoming" | "done">("all")

  // 刪除確認彈窗的專屬狀態管理
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [taskToDelete, setTaskToDelete] = useState<any | null>(null)
  const [isDeleting, setIsDeleting] = useState(false) 

  // 新增任務的狀態管理
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [newTask, setNewTask] = useState({
    title: "",
    rpe_score: 5,
    target_date: getTodayDateString()
  })

  // 🏆 編輯任務的狀態管理
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<any | null>(null)

  // 提示狀態
  const [toastMsg, setToastMsg] = useState<{ show: boolean, message: string, type: 'success' | 'error' }>({ 
    show: false, message: "", type: "success" 
  })

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
        done: t.is_completed, 
        rpe: t.rpe_score || 5,
        energyCost: t.energy_cost || 0, 
        dueDate: t.target_date || "No Date",
        goalTitle: "GoalFlow Project", 
        status: t.is_completed ? "done" : "todo" 
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

  // 呼叫提示的小幫手函式 (3秒後自動消失)
  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToastMsg({ show: true, message, type })
    setTimeout(() => {
      setToastMsg(prev => ({ ...prev, show: false }))
    }, 3000)
  }

  // 處理新增任務
  const handleCreateTask = async () => {
    if (!newTask.title) {
      showToast("請輸入任務標題！", "error")
      return
    }

    setIsSubmitting(true)
    const { data: { user } } = await supabase.auth.getUser()

    const taskData = {
      user_id: user?.id,
      title: newTask.title,
      rpe_score: newTask.rpe_score,
      energy_cost: newTask.rpe_score * 3, 
      target_date: newTask.target_date,
      is_completed: false,
      is_deleted: false
    }

    const { data, error } = await supabase
      .from("tasks")
      .insert([taskData])
      .select()

    if (!error && data) {
      const t = data[0]
      setTasks([...tasks, {
        ...t,
        id: t.id,
        title: t.title,
        done: t.is_completed,
        rpe: t.rpe_score,
        energyCost: t.energy_cost,
        dueDate: t.target_date,
        goalTitle: "GoalFlow Project",
        status: "todo"
      }])
      setIsCreateOpen(false)
      setNewTask({ title: "", rpe_score: 5, target_date: getTodayDateString() })
      showToast("任務新增成功！🎉", "success")
    } else {
      console.error("新增失敗:", error?.message)
      showToast("新增失敗，請稍後再試", "error")
    }
    setIsSubmitting(false)
  }

  // 🏆 處理修改任務 (手動編輯)
  const handleUpdateTask = async () => {
    if (!editingTask || !editingTask.title) {
      showToast("任務標題不能為空！", "error")
      return
    }

    setIsSubmitting(true)
    const newEnergy = editingTask.rpe_score * 3

    const { error } = await supabase
      .from("tasks")
      .update({
        title: editingTask.title,
        rpe_score: editingTask.rpe_score,
        energy_cost: newEnergy,
        target_date: editingTask.target_date
      })
      .eq("id", editingTask.id)

    if (!error) {
      setTasks(tasks.map(t => t.id === editingTask.id ? {
        ...t,
        title: editingTask.title,
        rpe: editingTask.rpe_score,
        energyCost: newEnergy,
        dueDate: editingTask.target_date
      } : t))
      setIsEditOpen(false)
      setEditingTask(null)
      showToast("任務修改成功！🎉", "success")
    } else {
      console.error("修改失敗:", error.message)
      showToast("修改失敗，請稍後再試", "error")
    }
    setIsSubmitting(false)
  }

  // 更新 RPE 分數與能量值
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
      showToast("RPE 更新成功！", "success") 
    } else {
      console.error("Supabase 更新失敗:", error.message)
      showToast("RPE 更新失敗", "error") 
    }
  }

  // 🌟 修正後的打勾功能：拔除成功 Toast，只保留異常警告
  const handleToggleTask = async (id: any, currentDone: boolean) => {
    const newStatus = !currentDone
    const completedDate = newStatus ? getTodayDateString() : null

    // 搶先更新前端狀態（讓使用者操作不卡頓）
    setTasks(tasks.map(t => 
      t.id === id ? { ...t, done: newStatus, status: newStatus ? "done" : "todo" } : t
    ))

    const { error } = await supabase
      .from("tasks")
      .update({ 
        is_completed: newStatus,
        completed_at: completedDate 
      }) 
      .eq("id", id)

    if (error) {
      console.error("打勾同步失敗:", error.message)
      // 失敗時倒滾狀態回來
      setTasks(tasks.map(t => 
        t.id === id ? { ...t, done: currentDone, status: currentDone ? "done" : "todo" } : t
      ))
      // 只有連線失敗時才干擾使用者
      showToast("狀態更新失敗，請檢查網路連線", "error") 
    }
  }

  // 攔截刪除動作
  const handleDeleteTask = (id: string) => {
    const target = tasks.find(t => t.id === id)
    if (target) {
      setTaskToDelete(target)
      setIsDeleteOpen(true)
    }
  }

  // 真正執行資料庫刪除
  const executeDeleteTask = async () => {
    if (!taskToDelete) return
    
    setIsDeleting(true) 
    
    const { error } = await supabase
      .from("tasks")
      .update({ is_deleted: true }) 
      .eq("id", taskToDelete.id)

    if (!error) {
      setTasks(tasks.filter(t => t.id !== taskToDelete.id))
      setIsDeleteOpen(false) 
      setTaskToDelete(null)
      showToast("已丟入垃圾桶", "success") 
    } else {
      console.error("刪除任務失敗:", error.message)
      showToast("刪除失敗，請稍後再試", "error")
    }
    
    setIsDeleting(false) 
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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">All Tasks</h1>
          <p className="text-muted-foreground">View and manage tasks across all your goals</p>
        </div>

        {/* 新增任務對話框 */}
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90">
              <Plus className="h-4 w-4" />
              新增任務
            </Button>
          </DialogTrigger>
          <DialogContent className="border-border/40 bg-card">
            <DialogHeader>
              <DialogTitle>新增任務</DialogTitle>
              <DialogDescription>建立一個新的任務，推動您的專案進度</DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-4 pt-4">
              <div>
                <label className="mb-2 block text-sm font-medium">任務標題</label>
                <Input 
                  placeholder="例如：完成首頁 UI 設計"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  className="border-border/60 bg-muted/30"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">RPE (疲勞度 1-10)</label>
                <Input 
                  type="number"
                  min="1"
                  max="10"
                  value={newTask.rpe_score}
                  onChange={(e) => setNewTask({ ...newTask, rpe_score: Number(e.target.value) })}
                  className="border-border/60 bg-muted/30"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">截止日期</label>
                <Input 
                  type="date"
                  value={newTask.target_date}
                  onChange={(e) => setNewTask({ ...newTask, target_date: e.target.value })}
                  className="border-border/60 bg-muted/30"
                />
              </div>
              <Button 
                onClick={handleCreateTask} 
                disabled={isSubmitting}
                className="mt-2 bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90 transition-all"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    處理中...
                  </>
                ) : (
                  '確認新增'
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
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
                  
                  {/* 🏆 修改：操作選單加入「Edit 編輯」功能 */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-card">
                      <DropdownMenuItem 
                        className="gap-2" 
                        onClick={() => {
                          setEditingTask({
                            id: task.id,
                            title: task.title,
                            rpe_score: task.rpe,
                            target_date: task.dueDate === "No Date" ? getTodayDateString() : task.dueDate
                          })
                          setIsEditOpen(true)
                        }}
                      >
                        <Edit className="h-4 w-4" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem className="gap-2 text-destructive" onClick={() => handleDeleteTask(task.id)}>
                        <Trash2 className="h-4 w-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 🏆 新增：編輯任務的專屬對話框 */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="border-border/40 bg-card">
          <DialogHeader>
            <DialogTitle>編輯任務</DialogTitle>
            <DialogDescription>修改您的任務標題、RPE 或截止日期</DialogDescription>
          </DialogHeader>
          {editingTask && (
            <div className="flex flex-col gap-4 pt-4">
              <div>
                <label className="mb-2 block text-sm font-medium">任務標題</label>
                <Input 
                  value={editingTask.title}
                  onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
                  className="border-border/60 bg-muted/30"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">RPE (疲勞度 1-10)</label>
                <Input 
                  type="number"
                  min="1"
                  max="10"
                  value={editingTask.rpe_score}
                  onChange={(e) => setEditingTask({ ...editingTask, rpe_score: Number(e.target.value) })}
                  className="border-border/60 bg-muted/30"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">截止日期</label>
                <Input 
                  type="date"
                  value={editingTask.target_date}
                  onChange={(e) => setEditingTask({ ...editingTask, target_date: e.target.value })}
                  className="border-border/60 bg-muted/30"
                />
              </div>
              <Button 
                onClick={handleUpdateTask} 
                disabled={isSubmitting}
                className="mt-2 bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90 transition-all"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    儲存中...
                  </>
                ) : (
                  '確認修改'
                )}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* 正中間跳出的優雅「刪除確認對話框」 */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="border-border/40 bg-card max-w-[400px]">
          <DialogHeader>
            <DialogTitle>確定要刪除嗎？</DialogTitle>
            <DialogDescription>
              您正準備刪除任務：「{taskToDelete?.title}」。<br />
              此動作會將其移至垃圾桶，您之後可以在垃圾桶中復原。
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 pt-4">
            <Button 
              variant="ghost" 
              onClick={() => {
                setIsDeleteOpen(false);
                setTaskToDelete(null);
              }}
              disabled={isDeleting}
            >
              取消
            </Button>
            <Button 
              onClick={executeDeleteTask} 
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-all"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  刪除中...
                </>
              ) : (
                '確認刪除'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* 左下角 bottom-24 的 Toast 提示元件 */}
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