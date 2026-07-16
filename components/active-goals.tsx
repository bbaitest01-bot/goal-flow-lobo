"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog"
import { ArrowRight, Plus, Loader2 } from "lucide-react"
import Link from "next/link"

export function ActiveGoals() {
  const [goals, setGoals] = useState<any[]>([])
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [newGoal, setNewGoal] = useState({ title: "", target_date: "" })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const fetchGoals = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    
    // 撈取資料
    const { data, error } = await supabase
      .from("goals")
      .select("*")
      .eq("user_id", user.id)
    
    if (error) {
      console.error("目標撈取失敗:", error)
    } else if (data) {
      // 🌟 轉換資料：把資料庫的 'name' 映射給前端使用的 'title'
      const formattedGoals = data.map(g => ({
        ...g,
        title: g.name, // 這裡讓前端顯示時讀得到名稱
        progress_percent: g.progress_percent || 0
      }))
      setGoals(formattedGoals.filter(g => g.progress_percent < 100))
    }
  }

  const handleCreateGoal = async () => {
    if (!newGoal.title.trim()) return
    setIsSubmitting(true)
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setIsSubmitting(false)
      return
    }

    // 🌟 修正點：資料庫欄位是 name，不是 title
    const payload = { 
      name: newGoal.title, 
      user_id: user.id, 
      target_date: newGoal.target_date || null,
      progress_percent: 0
    }

    const { error } = await supabase.from("goals").insert([payload])

    if (error) {
      console.error("【寫入目標錯誤】:", error)
      alert(`新增失敗: ${error.message}`)
    } else {
      setIsSubmitting(false)
      setIsCreateOpen(false)
      setNewGoal({ title: "", target_date: "" })
      fetchGoals()
    }
    setIsSubmitting(false)
  }

  useEffect(() => { fetchGoals() }, [])

  return (
    <Card className="border-border/40 flex flex-col h-[320px]">
      <CardHeader className="flex flex-row items-center justify-between pb-2 shrink-0">
        <CardTitle className="text-lg font-semibold">進行中目標</CardTitle>
        <Link href="/goals">
          <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground">
            查看全部 <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </CardHeader>
      
      <CardContent className="flex flex-col gap-3 flex-1 overflow-hidden">
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full gap-2">
              <Plus className="h-4 w-4" />新增目標
            </Button>
          </DialogTrigger>
          <DialogContent className="border-border/40 bg-card">
            <DialogHeader><DialogTitle>新增目標</DialogTitle></DialogHeader>
            <div className="flex flex-col gap-4 pt-4">
              <Input 
                placeholder="目標名稱" 
                value={newGoal.title} 
                onChange={(e) => setNewGoal({...newGoal, title: e.target.value})} 
              />
              <Input 
                type="date" 
                value={newGoal.target_date} 
                onChange={(e) => setNewGoal({...newGoal, target_date: e.target.value})} 
              />
              <Button onClick={handleCreateGoal} disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="animate-spin" /> : "確認新增"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
        
        <div className="flex-1 overflow-y-auto pr-2 space-y-3 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
          {goals.length === 0 ? (
            <p className="text-muted-foreground text-sm py-4 text-center">目前尚無進行中的目標</p>
          ) : (
            goals.map((goal) => (
              <div key={goal.id} className="group rounded-lg border border-border/40 p-4 bg-muted/20">
                <div className="mb-2 flex items-start justify-between">
                  <h3 className="font-medium text-sm">{goal.title}</h3>
                  {goal.target_date && <Badge variant="outline" className="text-xs">{goal.target_date}</Badge>}
                </div>
                <div className="flex items-center gap-3">
                  <Progress value={goal.progress_percent} className="h-2 flex-1" />
                  <span className="text-xs font-medium">{goal.progress_percent}%</span>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}