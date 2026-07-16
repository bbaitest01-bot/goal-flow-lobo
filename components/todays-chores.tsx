"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
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

const getTodayDateString = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function TodaysChores({ onToggle }: { onToggle?: () => void }) {
  const [chores, setChores] = useState<any[]>([])
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [newChore, setNewChore] = useState({ title: "", description: "", rpe_score: 2 })

  const fetchChores = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data, error } = await supabase
      .from("chores")
      .select("*")
      .eq("user_id", user.id)
      .eq("target_date", getTodayDateString())
      .order("is_completed", { ascending: true })

    if (error) console.error("瑣事撈取失敗:", error)
    else if (data) setChores(data)
  }

  useEffect(() => { fetchChores() }, [])

  const handleToggle = async (id: string, currentStatus: boolean) => {
    const newStatus = !currentStatus
    setChores(prev => prev.map(c => c.id === id ? { ...c, is_completed: newStatus } : c))
    
    await supabase
      .from("chores")
      .update({ 
        is_completed: newStatus,
        // 🌟 重點修復：將 new Date().toISOString() 改為 getTodayDateString()
        completed_at: newStatus ? getTodayDateString() : null 
      })
      .eq("id", id)

    // 通知父元件資料已更新！
    if (onToggle) onToggle()
  }

  const handleAdd = async () => {
    if (!newChore.title.trim()) return
    setIsSubmitting(true)
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setIsSubmitting(false)
      return
    }

    const { error } = await supabase.from("chores").insert([{ 
      title: newChore.title,
      description: newChore.description || null,
      rpe_score: Number(newChore.rpe_score),
      energy_cost: Number(newChore.rpe_score) * 3,
      user_id: user.id,
      target_date: getTodayDateString(),
      is_completed: false
    }])

    if (error) {
      console.error("寫入錯誤:", error)
      alert("寫入失敗，請檢查 Console 的錯誤詳情")
    } else {
      setIsCreateOpen(false)
      setNewChore({ title: "", description: "", rpe_score: 2 })
      fetchChores()
    }
    setIsSubmitting(false)
  }

  return (
    <Card className="border-border/40 flex flex-col h-[320px]">
      <CardHeader className="flex flex-row items-center justify-between pb-2 shrink-0">
        <CardTitle className="text-lg font-semibold">今日瑣事</CardTitle>
        <Link href="/chores">
          <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground">
            查看全部 <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </CardHeader>
      
      <CardContent className="flex flex-col gap-2 flex-1 overflow-hidden">
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="w-full gap-2 mb-2" variant="outline">
              <Plus className="h-4 w-4" /> 新增瑣事
            </Button>
          </DialogTrigger>
          <DialogContent className="border-border/40 bg-card">
            <DialogHeader><DialogTitle>新增今日瑣事</DialogTitle></DialogHeader>
            <div className="flex flex-col gap-4 pt-4">
              <Input placeholder="瑣事標題" value={newChore.title} onChange={(e) => setNewChore({...newChore, title: e.target.value})} />
              <Textarea placeholder="描述（選填）" value={newChore.description} onChange={(e) => setNewChore({...newChore, description: e.target.value})} />
              
              <Input 
                type="number" 
                min={1} 
                max={10} 
                placeholder="RPE 分數 (1-10)" 
                value={newChore.rpe_score} 
                onChange={(e) => {
                  let val = Number(e.target.value)
                  if (val > 10) val = 10
                  if (val < 1) val = 1
                  setNewChore({...newChore, rpe_score: val})
                }} 
              />

              <Button onClick={handleAdd} disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="animate-spin h-4 w-4" /> : "確認新增"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <div className="flex-1 overflow-y-auto pr-2 space-y-2 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
          {chores.length === 0 ? (
            <p className="text-muted-foreground text-sm py-4 text-center">今日尚無瑣事</p>
          ) : (
            chores.map((chore) => (
              <div key={chore.id} className="flex items-center gap-3 rounded-lg bg-muted/20 p-3">
                <Checkbox checked={chore.is_completed} onCheckedChange={() => handleToggle(chore.id, chore.is_completed)} />
                <div className="flex-1 overflow-hidden">
                  <p className={`text-sm ${chore.is_completed ? "line-through text-muted-foreground" : "font-medium"}`}>
                    {chore.title}
                  </p>
                  {chore.description && <p className="text-xs text-muted-foreground truncate">{chore.description}</p>}
                </div>
                <Badge variant="secondary" className="text-xs shrink-0">RPE {chore.rpe_score}</Badge>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}