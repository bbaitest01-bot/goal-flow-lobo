"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"  
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  Zap,
  Target,
  CheckCircle2,
  Clock,
  Flame,
  TrendingUp,
  ArrowRight,
  AlertTriangle
} from "lucide-react"
import Link from "next/link"

// 引入三大獨立元件
import { TodaysTasks } from "@/components/todays-tasks"
import { ActiveGoals } from "@/components/active-goals"
import { TodaysChores } from "@/components/todays-chores"

const weeklyActivity = [
  [2, 4, 3, 5, 2, 1, 1],
  [3, 5, 4, 6, 3, 2, 1],
  [4, 3, 5, 4, 5, 3, 2],
  [5, 6, 4, 7, 4, 2, 1],
]

// 取得今日日期的 Helper Function
const getTodayDateString = () => {
  const d = new Date()
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// 取得過去第 N 天日期的 Helper Function
const getPastDateString = (daysAgo: number) => {
  const d = new Date()
  d.setDate(d.getDate() - daysAgo)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export default function DashboardPage() {
  const [energyUsed, setEnergyUsed] = useState(0)  
  const totalEnergy = 100

  // 統計數據狀態
  const [streak, setStreak] = useState(0)
  const [streakTrend, setStreakTrend] = useState({ text: "計算中...", isUp: true })
  const [weeklyTasks, setWeeklyTasks] = useState(0)
  const [weeklyTasksTrend, setWeeklyTasksTrend] = useState({ text: "計算中...", isUp: true })
  
  // 修改後：目標統計狀態
  const [activeGoalCount, setActiveGoalCount] = useState(0)
  const [goalTrendText, setGoalTrendText] = useState("計算中...")
  
  const [prodScore, setProdScore] = useState(0)
  const [prodTrend, setProdTrend] = useState({ text: "計算中...", isUp: true })

  // 1. 計算目標統計 (進行中數量 + 平均進度)
  const fetchGoalsStats = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data, error } = await supabase.from("goals").select("*").eq("user_id", user.id)
    if (data) {
      const activeGoals = data.filter((g: any) => (g.progress_percent || 0) < 100)
      setActiveGoalCount(activeGoals.length)
      
      const totalProgress = activeGoals.reduce((sum, g) => sum + (g.progress_percent || 0), 0)
      const avg = activeGoals.length > 0 ? Math.round(totalProgress / activeGoals.length) : 0
      setGoalTrendText(`平均進度 ${avg}%`)
    }
  }

  // 2. 計算今日消耗精力
  const fetchTodayEnergy = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const todayStr = getTodayDateString()
    let totalUsed = 0
    try {
      const { data: choresData } = await supabase.from("chores").select("energy_cost").eq("user_id", user.id).eq("is_completed", true).eq("completed_at", todayStr)
      if (choresData) totalUsed += choresData.reduce((sum, item) => sum + (item.energy_cost || 0), 0)

      const { data: tasksData } = await supabase.from("tasks").select("energy_cost").eq("user_id", user.id).eq("is_completed", true).eq("completed_at", todayStr)
      if (tasksData) totalUsed += tasksData.reduce((sum, item) => sum + (item.energy_cost || 0), 0)

      setEnergyUsed(totalUsed)
    } catch (error) {
      console.error("精力計算發生錯誤:", error)
    }
  }

  // 3. 計算進階數據 (連續天數、本週完成、生產力)
  const fetchAdvancedStats = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    try {
      const { data: tasksData } = await supabase.from("tasks").select("target_date, completed_at, is_completed").eq("user_id", user.id).eq("is_deleted", false)
      const { data: choresData } = await supabase.from("chores").select("target_date, completed_at, is_completed").eq("user_id", user.id)

      const allItems = [...(tasksData || []), ...(choresData || [])]

      // --- 計算連續達成天數 (Streak) ---
      const completedDates = new Set(
        allItems.filter(item => item.is_completed && item.completed_at).map(item => item.completed_at)
      )

      const calculateStreakFrom = (startOffset: number) => {
        let currentStreak = 0
        let offset = startOffset
        if (completedDates.has(getPastDateString(offset))) {
          currentStreak++
          offset++
        } else if (startOffset === 0 && completedDates.has(getPastDateString(1))) {
          offset = 1
          currentStreak++
          offset++
        } else {
          return 0
        }
        while (completedDates.has(getPastDateString(offset))) {
          currentStreak++
          offset++
        }
        return currentStreak
      }

      const currentStreak = calculateStreakFrom(0)
      const lastWeekStreak = calculateStreakFrom(7)
      
      setStreak(currentStreak)
      const streakDiff = currentStreak - lastWeekStreak
      setStreakTrend({
        text: streakDiff >= 0 ? `較上週多 ${streakDiff} 天` : `較上週少 ${Math.abs(streakDiff)} 天`,
        isUp: streakDiff >= 0
      })

      // --- 計算本週完成數 ---
      const isDateInRange = (dateStr: string, startDaysAgo: number, endDaysAgo: number) => {
        if (!dateStr) return false
        const endStr = getPastDateString(startDaysAgo) 
        const startStr = getPastDateString(endDaysAgo) 
        return dateStr >= startStr && dateStr <= endStr
      }

      const currScheduled = allItems.filter(i => isDateInRange(i.target_date, 0, 6)).length
      const currCompleted = allItems.filter(i => isDateInRange(i.completed_at, 0, 6)).length
      const prevScheduled = allItems.filter(i => isDateInRange(i.target_date, 7, 13)).length
      const prevCompleted = allItems.filter(i => isDateInRange(i.completed_at, 7, 13)).length

      setWeeklyTasks(currCompleted)
      const tasksDiff = currCompleted - prevCompleted
      setWeeklyTasksTrend({
        text: tasksDiff >= 0 ? `較上週多 ${tasksDiff} 件` : `較上週少 ${Math.abs(tasksDiff)} 件`,
        isUp: tasksDiff >= 0
      })

      // --- 計算生產力分數 ---
      const rawCurrScore = currScheduled === 0 ? (currCompleted > 0 ? 100 : 0) : Math.round((currCompleted / currScheduled) * 100)
      const currScore = Math.min(rawCurrScore, 100)
      const rawPrevScore = prevScheduled === 0 ? (prevCompleted > 0 ? 100 : 0) : Math.round((prevCompleted / prevScheduled) * 100)
      const prevScore = Math.min(rawPrevScore, 100)

      setProdScore(currScore)

      let trendText = ""
      let isTrendUp = true

      if (rawCurrScore > 100) {
        trendText = `超額完成 ${rawCurrScore - 100}%！🔥`
        isTrendUp = true
      } else {
        const prodDiff = currScore - prevScore
        if (prodDiff > 0) {
          trendText = `提升 ${prodDiff}%`
          isTrendUp = true
        } else if (prodDiff < 0) {
          trendText = `下降 ${Math.abs(prodDiff)}%`
          isTrendUp = false
        } else {
          trendText = currScore === 100 ? "完美持平 💯" : "與上週持平"
          isTrendUp = true
        }
      }
      setProdTrend({ text: trendText, isUp: isTrendUp })

    } catch (error) {
      console.error("進階數據計算發生錯誤:", error)
    }
  }

  useEffect(() => {
    fetchGoalsStats()
    fetchTodayEnergy() 
    fetchAdvancedStats() 
  }, [])

  // 🌟 重點修改：建立一個統一的更新函數，讓對講機可以同時刷新精力與統計
  const handleDataRefresh = () => {
    fetchTodayEnergy()
    fetchAdvancedStats()
  }

  return (
    <div className="flex flex-col gap-6">
      {/* ⚡ Energy Card */}
      <Card className={`transition-all duration-300 ${energyUsed >= totalEnergy ? "border-orange-500/50 bg-orange-500/5 animate-pulse" : "border-border/40 bg-gradient-to-br from-card via-card to-primary/5"}`}>
        <CardContent className="p-6">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex-1">
              <div className="mb-2 flex items-center gap-2">
                <Zap className={`h-6 w-6 ${energyUsed >= totalEnergy ? "text-orange-400" : "text-primary"}`} />
                <h2 className="text-xl font-semibold">今日精力</h2>
              </div>
              <p className="mb-4 text-muted-foreground">掌握精力狀況，保持高效不倦怠</p>
              <div className="flex items-baseline gap-2">
                <span className={`text-4xl font-bold ${energyUsed >= totalEnergy ? "text-orange-400" : ""}`}>{energyUsed}</span>
                <span className="text-xl text-muted-foreground">/ {totalEnergy}</span>
                <span className="text-sm text-muted-foreground">今日已消耗精力</span>
              </div>
            </div>
            
            <div className="w-full lg:w-64">
              <div className="mb-2 h-4 overflow-hidden rounded-full bg-muted">
                <div 
                  className={`h-full rounded-full transition-all ${energyUsed >= totalEnergy ? "bg-orange-500" : "bg-gradient-to-r from-primary to-accent"}`}
                  style={{ width: `${Math.min((energyUsed / totalEnergy) * 100, 100)}%` }} 
                />
              </div>
              {energyUsed >= totalEnergy && (
                <div className="flex items-center gap-2 text-orange-500 mt-2 font-medium">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="text-sm">精力破百！請適當休息</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Flame} label="連續達成天數" value={`${streak} 天`} trend={streakTrend.text} trendUp={streakTrend.isUp} />
        <StatCard icon={CheckCircle2} label="本週完成任務" value={`${weeklyTasks} 件`} trend={weeklyTasksTrend.text} trendUp={weeklyTasksTrend.isUp} />
        <StatCard icon={Target} label="進行中目標" value={`${activeGoalCount} 個`} trend={goalTrendText} trendUp={true} />
        <StatCard icon={TrendingUp} label="生產力分數" value={`${prodScore}%`}  trend={prodTrend.text} trendUp={prodTrend.isUp} />
      </div>

      {/* Main Grid: 包含三大元件與活躍度圖表 */}
      <div className="grid gap-6 lg:grid-cols-2">
        <ActiveGoals />
        {/* 🌟 重點修改：將統一更新函數傳給兩個子元件 */}
        <TodaysTasks onToggle={handleDataRefresh} />
        <TodaysChores onToggle={handleDataRefresh} />
        
        {/* 本週活躍度 */}
        <Card className="border-border/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold">本週活躍度</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-1">
              {weeklyActivity.map((week, weekIndex) => (
                <div key={weekIndex} className="flex gap-1">
                  {week.map((value, dayIndex) => (
                    <div
                      key={dayIndex}
                      className="h-8 flex-1 rounded"
                      style={{
                        backgroundColor: value === 0 
                          ? 'hsl(var(--muted))' 
                          : `oklch(0.65 0.25 290 / ${Math.min(value * 15, 100)}%)`
                      }}
                      title={`已完成 ${value} 件任務`}
                    />
                  ))}
                </div>
              ))}
              <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                <span>一</span><span>二</span><span>三</span><span>四</span><span>五</span><span>六</span><span>日</span>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-end gap-2 text-xs text-muted-foreground">
              <span>少</span>
              <div className="flex gap-1">
                {[0, 2, 4, 6].map((v) => (
                  <div key={v} className="h-3 w-3 rounded" style={{ backgroundColor: v === 0 ? 'hsl(var(--muted))' : `oklch(0.65 0.25 290 / ${Math.min(v * 15, 100)}%)` }} />
                ))}
              </div>
              <span>多</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function StatCard({ icon: Icon, label, value, trend, trendUp }: any) {
  return (
    <Card className="border-border/40">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <Icon className="h-5 w-5 text-primary" />
          {trend && (
            <span className={`text-xs ${trendUp ? 'text-green-400' : 'text-red-400'}`}>
              {trend}
            </span>
          )}
        </div>
        <div className="mt-3">
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-sm text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  )
}