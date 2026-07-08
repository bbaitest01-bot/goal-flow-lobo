"use client"

import { createBrowserClient } from '@supabase/ssr'
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Empty, EmptyDescription, EmptyTitle } from "@/components/ui/empty"
import {
  Plus,
  MoreHorizontal,
  Clock,
  Zap,
  Edit,
  Trash2,
  ClipboardList,
  CheckCircle2,
  Loader2,
  XCircle,
  AlertCircle,  
  ChevronDown,  
  ChevronUp     
} from "lucide-react"

interface Chore {
  id: number
  title: string
  description: string
  rpe_score: number
  energy_cost: number
  target_date: string
  is_completed: boolean
  completed_at?: string | null // 🏆 關鍵 1：新增這個屬性來接資料庫的新欄位
}

const rpeToEnergy = (rpe: number) => rpe * 3

const getTodayDateString = () => {
  const d = new Date()
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export default function ChoresPage() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const [chores, setChores] = useState<Chore[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editingChore, setEditingChore] = useState<Chore | null>(null)
  
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [choreToDelete, setChoreToDelete] = useState<Chore | null>(null)
  const [isDeleting, setIsDeleting] = useState(false) 
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const [showCompleted, setShowCompleted] = useState(false)

  const [toastMsg, setToastMsg] = useState<{ show: boolean, message: string, type: 'success' | 'error' }>({ 
    show: false, message: "", type: "success" 
  })

  const [newChore, setNewChore] = useState({
    title: "",
    description: "",
    rpe_score: 2,
    target_date: getTodayDateString() 
  })

  useEffect(() => {
    fetchChores()
  }, [])

  const fetchChores = async () => {
    try {
      const res = await fetch('/api/chores', { credentials: 'include' })
      if (res.ok) {
        const data = await res.json()
        setChores(data)
      }
    } catch (error) {
      console.error('獲取瑣事失敗:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToastMsg({ show: true, message, type })
    setTimeout(() => {
      setToastMsg(prev => ({ ...prev, show: false }))
    }, 3000)
  }

  const handleToggleChore = async (id: number, currentStatus: boolean) => {
    // 🏆 關鍵 2：打勾時記錄今天的日期，取消打勾時清空
    const newStatus = !currentStatus;
    const completedDate = newStatus ? getTodayDateString() : null;

    try {
      setChores(chores.map(c => 
        c.id === id ? { ...c, is_completed: newStatus, completed_at: completedDate } : c
      ))
      await fetch('/api/chores', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ id, is_completed: newStatus, completed_at: completedDate }) // 傳送完成時間給 API
      })
    } catch (error) {
      console.error('更新狀態失敗:', error)
      fetchChores() 
    }
  }

  const handleCreateChore = async () => {
    if (!newChore.title) {
      showToast("請輸入標題！", "error");
      return;
    }
    
    setIsSubmitting(true);

    const choreData = {
      title: newChore.title,
      description: newChore.description || "", 
      rpe_score: newChore.rpe_score,
      energy_cost: rpeToEnergy(newChore.rpe_score),
      target_date: newChore.target_date || getTodayDateString(),
    }
    
    try {
      const res = await fetch('/api/chores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', 
        body: JSON.stringify(choreData)
      })

      if (res.ok) {
        const savedChore = await res.json()
        setChores([...chores, savedChore])
        setNewChore({ title: "", description: "", rpe_score: 2, target_date: getTodayDateString() })
        setIsCreateOpen(false)
        showToast("日常瑣事新增成功！🎉", "success");
      } else {
        const errorData = await res.json();
        console.error("API 回傳錯誤:", errorData);
        showToast(`新增失敗：${errorData.error || '未知錯誤'}`, "error");
      }
    } catch (error) {
      console.error('新增瑣事失敗:', error)
      showToast("網路連線發生錯誤", "error");
    } finally {
      setIsSubmitting(false);
    }
  } 

  const handleOpenEditDialog = (chore: Chore) => {
    setEditingChore(chore)
    setIsEditOpen(true)
  }

  const handleUpdateChore = async () => {
    if (!editingChore || !editingChore.title) {
      showToast("標題不能為空！", "error");
      return;
    }

    setIsSubmitting(true);

    const updatedData = {
      id: editingChore.id,
      title: editingChore.title,
      description: editingChore.description || "",
      rpe_score: editingChore.rpe_score,
      energy_cost: rpeToEnergy(editingChore.rpe_score),
      target_date: editingChore.target_date
    }

    try {
      const res = await fetch('/api/chores', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(updatedData)
      })

      if (res.ok) {
        const savedChore = await res.json()
        setChores(chores.map(c => c.id === savedChore.id ? savedChore : c))
        setIsEditOpen(false)
        showToast("日常瑣事修改成功！🎉", "success");
      } else {
        const errorData = await res.json()
        showToast(`修改失敗：${errorData.error || '未知錯誤'}`, "error")
      }
    } catch (error) {
      console.error('更新瑣事失敗:', error)
      showToast("網路連線發生錯誤", "error")
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleDeleteChore = (id: number) => {
    const target = chores.find(c => c.id === id)
    if (target) {
      setChoreToDelete(target)
      setIsDeleteOpen(true)
    }
  }

  const executeDeleteChore = async () => {
    if (!choreToDelete) return
    
    setIsDeleting(true) 
    try {
      setChores(chores.filter(c => c.id !== choreToDelete.id))
      await fetch(`/api/chores?id=${choreToDelete.id}`, {
        method: 'DELETE',
        credentials: 'include'
      })
      setIsDeleteOpen(false) 
      setChoreToDelete(null)
      showToast("已丟入垃圾桶", "success") 
    } catch (error) {
      console.error('刪除瑣事失敗:', error)
      fetchChores()
      showToast("刪除失敗，請稍後再試", "error")
    } finally {
      setIsDeleting(false) 
    }
  }

  const getRpeBadgeColor = (rpe: number) => {
    if (rpe >= 5) return "bg-amber-500/20 text-amber-400"
    if (rpe >= 3) return "bg-yellow-500/20 text-yellow-400"
    return "bg-green-500/20 text-green-400"
  }

  const todayStr = getTodayDateString();
  const isToday = (dateStr: string) => dateStr === "Today" || dateStr === todayStr;
  const isOverdue = (dateStr: string) => dateStr !== "Today" && dateStr !== "" && dateStr < todayStr;

  // 🏆 關鍵 3：精準計算！只加總「完成時間 (completed_at) 是今天」的任務
  const completedToday = chores.filter(c => c.is_completed && c.completed_at === todayStr).length
  const totalToday = chores.filter(c => isToday(c.target_date)).length
  const energyUsedByChores = chores
    .filter(c => c.is_completed && c.completed_at === todayStr)
    .reduce((sum, c) => sum + c.energy_cost, 0)

  // 今日與待辦 = 未完成的今天任務 + 未完成的過期任務
  const todayChores = chores.filter(c => !c.is_completed && (isToday(c.target_date) || isOverdue(c.target_date)));
  // 即將到來 = 未完成的未來任務
  const upcomingChores = chores.filter(c => !c.is_completed && !isToday(c.target_date) && !isOverdue(c.target_date));
  // 已完成折疊面板 = 所有已完成的任務
  const completedChores = chores.filter(c => c.is_completed)

  if (isLoading) return <div className="p-8 text-center text-muted-foreground">載入中...</div>

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">日常瑣事</h1>
          <p className="text-muted-foreground">會消耗精力，但不影響目標進度的獨立小任務</p>
        </div>
        
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90">
              <Plus className="h-4 w-4" />
              新增瑣事
            </Button>
          </DialogTrigger>
          <DialogContent className="border-border/40 bg-card">
            <DialogHeader>
              <DialogTitle>新增日常瑣事</DialogTitle>
              <DialogDescription>新增一個需要完成，但不屬於任何主要目標的任務</DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-4 pt-4">
              <div>
                <label className="mb-2 block text-sm font-medium">標題</label>
                <Input 
                  placeholder="例如：去超商繳水電費"
                  value={newChore.title}
                  onChange={(e) => setNewChore({ ...newChore, title: e.target.value })}
                  className="border-border/60 bg-muted/30"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">描述 (選填)</label>
                <Textarea 
                  placeholder="詳細內容備註..."
                  value={newChore.description}
                  onChange={(e) => setNewChore({ ...newChore, description: e.target.value })}
                  className="border-border/60 bg-muted/30"
                  rows={2}
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">
                  RPE (疲勞度): {newChore.rpe_score} - 預估精力消耗: {rpeToEnergy(newChore.rpe_score)}
                </label>
                <Slider
                  value={[newChore.rpe_score]}
                  onValueChange={(v) => setNewChore({ ...newChore, rpe_score: v[0] })}
                  min={1}
                  max={10}
                  step={1}
                  className="py-4"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">截止日期</label>
                <Input 
                  type="date"
                  value={newChore.target_date}
                  onChange={(e) => setNewChore({ ...newChore, target_date: e.target.value })}
                  className="border-border/60 bg-muted/30"
                />
              </div>
              <Button 
                onClick={handleCreateChore} 
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

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="border-border/40 bg-card">
          <DialogHeader>
            <DialogTitle>編輯日常瑣事</DialogTitle>
            <DialogDescription>修改此筆瑣事的詳細內容</DialogDescription>
          </DialogHeader>
          {editingChore && (
            <div className="flex flex-col gap-4 pt-4">
              <div>
                <label className="mb-2 block text-sm font-medium">標題</label>
                <Input 
                  value={editingChore.title}
                  onChange={(e) => setEditingChore({ ...editingChore, title: e.target.value })}
                  className="border-border/60 bg-muted/30"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">描述 (選填)</label>
                <Textarea 
                  value={editingChore.description}
                  onChange={(e) => setEditingChore({ ...editingChore, description: e.target.value })}
                  className="border-border/60 bg-muted/30"
                  rows={2}
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">
                  RPE (疲勞度): {editingChore.rpe_score} - 預估精力消耗: {rpeToEnergy(editingChore.rpe_score)}
                </label>
                <Slider
                  value={[editingChore.rpe_score]}
                  onValueChange={(v) => setEditingChore({ ...editingChore, rpe_score: v[0] })}
                  min={1}
                  max={10}
                  step={1}
                  className="py-4"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">截止日期</label>
                <Input 
                  type="date"
                  value={editingChore.target_date === "Today" ? getTodayDateString() : editingChore.target_date}
                  onChange={(e) => setEditingChore({ ...editingChore, target_date: e.target.value })}
                  className="border-border/60 bg-muted/30"
                />
              </div>
              <Button 
                onClick={handleUpdateChore} 
                disabled={isSubmitting}
                className="mt-2 bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90 transition-all"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    儲存中...
                  </>
                ) : (
                  '儲存'
                )}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="border-border/40 bg-card max-w-[400px]">
          <DialogHeader>
            <DialogTitle>確定要刪除嗎？</DialogTitle>
            <DialogDescription>
              您正準備刪除瑣事：「{choreToDelete?.title}」。<br />
              此動作會將其移至垃圾桶，您之後可以在垃圾桶中復原。
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 pt-4">
            <Button 
              variant="ghost" 
              onClick={() => {
                setIsDeleteOpen(false);
                setChoreToDelete(null);
              }}
              disabled={isDeleting}
            >
              取消
            </Button>
            <Button 
              onClick={executeDeleteChore} 
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

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="border-border/40">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/20">
                <CheckCircle2 className="h-5 w-5 text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{completedToday}/{totalToday}</p>
                <p className="text-sm text-muted-foreground">今日已完成</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={`transition-all duration-300 ${energyUsedByChores >= 100 ? "border-orange-500/50 bg-orange-500/5 animate-pulse" : "border-border/40 bg-card"}`}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${energyUsedByChores >= 100 ? "bg-orange-500/20" : "bg-primary/20"}`}>
                <Zap className={`h-5 w-5 ${energyUsedByChores >= 100 ? "text-orange-400" : "text-primary"}`} />
              </div>
              <div className="flex-1">
                <p className={`text-2xl font-bold ${energyUsedByChores >= 100 ? "text-orange-400" : ""}`}>{energyUsedByChores}</p>
                <p className="text-sm text-muted-foreground">
                  {energyUsedByChores >= 100 ? "⚠️ 精力破百！請適當休息" : "今日已消耗精力"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/40">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/20">
                <ClipboardList className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold">{chores.length}</p>
                <p className="text-sm text-muted-foreground">總瑣事數量</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/40">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>今日與待辦</span>
            <Badge variant="secondary">{todayChores.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {todayChores.length === 0 ? (
            <Empty className="py-8">
              <ClipboardList className="h-10 w-10" />
              <EmptyTitle>清單空空如也</EmptyTitle>
              <EmptyDescription>今天沒有待辦事項！如有需要可以點擊上方按鈕新增。</EmptyDescription>
            </Empty>
          ) : (
            <div className="flex flex-col gap-2">
              {todayChores.map((chore) => (
                <ChoreItem 
                  key={chore.id} 
                  chore={chore} 
                  isOverdue={isOverdue(chore.target_date)} 
                  onToggle={handleToggleChore} 
                  onEdit={handleOpenEditDialog} 
                  onDelete={handleDeleteChore} 
                  getRpeBadgeColor={getRpeBadgeColor} 
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {upcomingChores.length > 0 && (
        <Card className="border-border/40">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>即將到來</span>
              <Badge variant="secondary">{upcomingChores.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-2">
              {upcomingChores.map((chore) => (
                <ChoreItem 
                  key={chore.id} 
                  chore={chore} 
                  isOverdue={false} 
                  onToggle={handleToggleChore} 
                  onEdit={handleOpenEditDialog} 
                  onDelete={handleDeleteChore} 
                  getRpeBadgeColor={getRpeBadgeColor} 
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {completedChores.length > 0 && (
        <Card className="border-border/40">
          <CardHeader 
            className="py-4 cursor-pointer hover:bg-muted/20 transition-colors" 
            onClick={() => setShowCompleted(!showCompleted)}
          >
            <CardTitle className="flex items-center justify-between text-base">
              <div className="flex items-center gap-2 text-muted-foreground">
                <CheckCircle2 className="h-5 w-5 text-green-500/70" />
                <span>已完成瑣事</span>
                <Badge variant="secondary">{completedChores.length}</Badge>
              </div>
              {showCompleted ? <ChevronUp className="h-5 w-5 text-muted-foreground" /> : <ChevronDown className="h-5 w-5 text-muted-foreground" />}
            </CardTitle>
          </CardHeader>
          {showCompleted && (
            <CardContent className="pt-0">
              <div className="flex flex-col gap-2 mt-2 opacity-70">
                {completedChores.map((chore) => (
                  <ChoreItem 
                    key={chore.id} 
                    chore={chore} 
                    isOverdue={false} 
                    onToggle={handleToggleChore} 
                    onEdit={handleOpenEditDialog} 
                    onDelete={handleDeleteChore} 
                    getRpeBadgeColor={getRpeBadgeColor} 
                  />
                ))}
              </div>
            </CardContent>
          )}
        </Card>
      )}

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

function ChoreItem({ chore, onToggle, onEdit, onDelete, getRpeBadgeColor, isOverdue = false }: { chore: Chore; onToggle: (id: number, currentStatus: boolean) => void; onEdit: (chore: Chore) => void; onDelete: (id: number) => void; getRpeBadgeColor: (rpe: number) => string; isOverdue?: boolean }) {
  const isToday = chore.target_date === "Today" || chore.target_date === getTodayDateString();

  return (
    <div className="group flex items-center gap-4 rounded-lg border border-border/40 bg-muted/20 p-4 transition-colors hover:bg-muted/40">
      <Checkbox checked={chore.is_completed} onCheckedChange={() => onToggle(chore.id, chore.is_completed)} />
      <div className="flex-1">
        <p className={`font-medium ${chore.is_completed ? "line-through text-muted-foreground" : ""}`}>
          {chore.title}
        </p>
        {chore.description && <p className="mt-1 text-sm text-muted-foreground">{chore.description}</p>}
      </div>
      <div className="flex items-center gap-3">
        <Badge className={getRpeBadgeColor(chore.rpe_score)}>RPE {chore.rpe_score}</Badge>
        <Badge variant="outline" className="gap-1"><Zap className="h-3 w-3" />{chore.energy_cost}</Badge>
        
        <span className={`flex items-center gap-1 text-sm ${isOverdue ? "text-red-500 font-bold" : "text-muted-foreground"}`}>
          {isOverdue ? <AlertCircle className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
          {isToday ? "今天" : chore.target_date}
        </span>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100"><MoreHorizontal className="h-4 w-4" /></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="border-border/60 bg-card">
            <DropdownMenuItem className="gap-2" onClick={() => onEdit(chore)}><Edit className="h-4 w-4" />編輯</DropdownMenuItem>
            <DropdownMenuItem className="gap-2 text-destructive" onClick={() => onDelete(chore.id)}><Trash2 className="h-4 w-4" />刪除</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}