"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  Brain,
  Calendar,
  ChevronDown,
  Save,
  Sparkles,
  Trash2,
  Plus,
  X
} from "lucide-react"

// --- 型別定義 ---
interface MoodPreset {
  id: string
  mood_text: string
  mood_color: string
}

interface DiaryEntry {
  id: string
  target_date: string
  mood_tag: string
  mood_color: string 
  energy_level: number
  content: string
}

const aiReflections = [
  "這禮拜你似乎常在晚上感到焦慮，試著在睡前放下手機，做點簡單的拉筋吧。",
  "你的能量值跟睡眠品質高度相關，為了明天的進度，今晚早點休息！",
  "持續記錄是很好的習慣！這些自我覺察會幫助你更了解自己的極限。",
]

export default function DiaryPage() {
  // --- 狀態管理 ---
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [entries, setEntries] = useState<DiaryEntry[]>([])
  const [presets, setPresets] = useState<MoodPreset[]>([])
  
  const [todayEntry, setTodayEntry] = useState({
    mood: "",
    moodColor: "", 
    energyFeeling: 5,
    content: ""
  })
  
  const [expandedEntry, setExpandedEntry] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // 新增標籤的狀態
  const [isAddingPreset, setIsAddingPreset] = useState(false)
  const [newMoodText, setNewMoodText] = useState("")
  const [newMoodColor, setNewMoodColor] = useState("#8B5CF6") 

  const today = new Date().toLocaleDateString('zh-TW', { 
    month: 'long', 
    day: 'numeric', 
    year: 'numeric' 
  })

  // --- 1. 認人抓取資料 (Fetch Data with user_id) ---
  const fetchData = async () => {
    // 🚀 先向門衛請求「目前登入的使用者身分證明」
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      console.error("未找到登入的使用者資訊，請重新登入:", authError?.message)
      return
    }

    // 🎯 抓取「僅屬於目前登入者」的日記
    const { data: diariesData, error: diaryError } = await supabase
      .from("diaries")
      .select("*")
      .eq("user_id", user.id)   // 🌟 核心：只撈符合自己 user_id 的日記
      .eq("is_deleted", false) 
      .order("created_at", { ascending: false })
    
    if (diaryError) console.error("日記抓取失敗:", diaryError.message)
    else if (diariesData) setEntries(diariesData)

    // 🎯 抓取「僅屬於目前登入者」的自訂心情標籤
    const { data: presetsData, error: presetError } = await supabase
      .from("user_mood_presets")
      .select("*")
      .eq("user_id", user.id)   // 🌟 核心：心情標籤也認人！沛涵建的蘿蔔組長看不到
      .order("created_at", { ascending: true })

    if (presetError) console.error("標籤抓取失敗:", presetError.message)
    else if (presetsData) setPresets(presetsData)
  }

  // --- 2. 標籤管理 (Presets) ---
  const handleAddPreset = async () => {
    if (!newMoodText.trim()) return

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase
      .from("user_mood_presets")
      .insert([{
        mood_text: newMoodText.trim(),
        mood_color: newMoodColor,
        user_id: user.id // 🌟 核心：新增心情時綁定當前 user_id
      }])

    if (!error) {
      setNewMoodText("")
      setIsAddingPreset(false)
      fetchData() 
    }
  }

  const handleDeletePreset = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation() 
    const { error } = await supabase
      .from("user_mood_presets")
      .update({ is_deleted: true }) 
      .eq("id", id)

    if (!error) {
      setPresets(presets.filter(p => p.id !== id))
      if (todayEntry.mood === presets.find(p => p.id === id)?.mood_text) {
        setTodayEntry(prev => ({ ...prev, mood: "", moodColor: "" }))
      }
    }
  }

  // --- 3. 日記管理 (Entries) ---
  const handleSaveEntry = async () => {
    if (!todayEntry.mood || !todayEntry.content) return
    setIsSubmitting(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setIsSubmitting(false)
      return
    }

    const todayISO = new Date().toISOString().split('T')[0]

    const { error } = await supabase
      .from("diaries")
      .insert([{
        content: todayEntry.content,
        mood_tag: todayEntry.mood,
        mood_color: todayEntry.moodColor, 
        target_date: todayISO,
        energy_level: todayEntry.energyFeeling,
        user_id: user.id // 🌟 核心：儲存日記時綁定當前 user_id
      }])

    if (!error) {
      setTodayEntry({ mood: "", moodColor: "", energyFeeling: 5, content: "" })
      fetchData()
    }
    setIsSubmitting(false)
  }

  const handleUpdateEntry = async (id: string) => {
    const { error } = await supabase
      .from("diaries")
      .update({ content: editContent })
      .eq("id", id);

    if (!error) {
      setEditingId(null); 
      fetchData();        
    } else {
      console.error("更新失敗:", error.message);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDeleteEntry = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();

    if (!confirm("確定要將此日記移至垃圾桶嗎？")) return;

    const { error } = await supabase
      .from("diaries")
      .update({ 
        is_deleted: true, 
        deleted_at: new Date().toISOString() 
      })
      .eq("id", id);

    if (error) {
      console.error("刪除失敗:", error.message);
      alert("刪除失敗，請稍後再試");
    } else {
      fetchData();
      alert("已移至垃圾桶");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* 標題區塊 */}
      <div>
        <h1 className="text-2xl font-bold">心情日記</h1>
        <p className="text-muted-foreground">
          記錄每天的狀態，讓 AI 教練更精準地為你安排目標與任務。
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* 左側主內容 */}
        <div className="flex flex-col gap-6 lg:col-span-2">
          
          {/* 今日紀錄表單 */}
          <Card className="border-border/40 bg-gradient-to-br from-card via-card to-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                今日紀錄
                <Badge variant="outline" className="ml-auto">{today}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-6">
              
              {/* 心情選擇與自訂滑軌 */}
              <div>
                <label className="mb-3 block text-sm font-medium">現在感覺如何？</label>
                
                {/* 橫向滑軌區塊 (Excel 樣式) */}
                <div className="flex overflow-x-auto pb-4 gap-2 [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-track]:bg-zinc-800/30 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-thumb]:bg-zinc-700 hover:[&::-webkit-scrollbar-thumb]:bg-zinc-600 [&::-webkit-scrollbar-thumb]:rounded-full">
                  
                  {/* 新增心情的按鈕與輸入框 */}
                  {isAddingPreset ? (
                    <div className="flex items-center gap-2 bg-muted/30 p-1 rounded-full border border-border/60 shrink-0">
                      <Input 
                        value={newMoodText}
                        onChange={(e) => setNewMoodText(e.target.value)}
                        placeholder="輸入心情..."
                        className="h-8 w-24 bg-transparent border-none focus-visible:ring-0 text-sm"
                        autoFocus
                      />
                      <input 
                        type="color" 
                        value={newMoodColor}
                        onChange={(e) => setNewMoodColor(e.target.value)}
                        className="h-6 w-6 rounded cursor-pointer border-0 bg-transparent p-0"
                      />
                      <Button size="icon" variant="ghost" className="h-6 w-6 rounded-full hover:text-green-500" onClick={handleAddPreset}>
                        <Save className="h-3 w-3" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-6 w-6 rounded-full hover:text-destructive" onClick={() => setIsAddingPreset(false)}>
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <Button 
                      variant="outline" 
                      onClick={() => setIsAddingPreset(true)}
                      className="shrink-0 rounded-full border-dashed h-10 gap-1 text-muted-foreground"
                    >
                      <Plus className="h-4 w-4" /> 自訂
                    </Button>
                  )}

                  {/* 渲染資料庫裡的自訂標籤 */}
                  {presets.map((preset) => {
                    const isSelected = todayEntry.mood === preset.mood_text
                    return (
                      <div key={preset.id} className="relative group shrink-0">
                        <button
                          onClick={() => setTodayEntry({ ...todayEntry, mood: preset.mood_text, moodColor: preset.mood_color })}
                          className="rounded-full px-4 py-2 text-sm font-medium transition-all"
                          style={{
                            backgroundColor: isSelected ? preset.mood_color : "transparent",
                            color: isSelected ? "#fff" : preset.mood_color,
                            border: `1px solid ${preset.mood_color}`,
                            opacity: isSelected ? 1 : 0.8
                          }}
                        >
                          {preset.mood_text}
                        </button>
                        <button
                          onClick={(e) => handleDeletePreset(preset.id, e)}
                          className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-background border border-border flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive hover:text-white"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    )
                  })}
                  {presets.length === 0 && !isAddingPreset && (
                    <p className="text-sm text-muted-foreground flex items-center px-2">尚未建立專屬心情標籤</p>
                  )}
                </div>
              </div>

              {/* 能量滑桿 */}
              <div>
                <label className="mb-3 block text-sm font-medium">
                  當下心力值: {todayEntry.energyFeeling}/10
                </label>
                <Slider
                  value={[todayEntry.energyFeeling]}
                  onValueChange={(v) => setTodayEntry({ ...todayEntry, energyFeeling: v[0] })}
                  min={1}
                  max={10}
                  step={1}
                  className="py-4"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>精疲力盡</span>
                  <span>狀態平穩</span>
                  <span>活力充沛</span>
                </div>
              </div>

              {/* 日記內文 */}
              <div>
                <label className="mb-3 block text-sm font-medium">
                  寫下你的思緒...
                </label>
                <Textarea
                  placeholder="紀錄今天的進度、遇到的困難，或是單純的碎碎念..."
                  value={todayEntry.content}
                  onChange={(e) => setTodayEntry({ ...todayEntry, content: e.target.value })}
                  className="min-h-[150px] border-border/60 bg-muted/30"
                />
              </div>

              {/* 儲存按鈕 */}
              <Button 
                onClick={handleSaveEntry}
                disabled={!todayEntry.mood || !todayEntry.content || isSubmitting}
                className="gap-2 bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90"
              >
                <Save className="h-4 w-4" />
                {isSubmitting ? "儲存中..." : "儲存紀錄"}
              </Button>
            </CardContent>
          </Card>

          {/* 過往紀錄列表 */}
          <Card className="border-border/40">
            <CardHeader>
              <CardTitle>歷史紀錄</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {entries.length === 0 ? (
                <p className="text-muted-foreground text-sm py-4 text-center">還沒有日記紀錄，快寫下第一篇吧！</p>
              ) : (
                entries.map((entry) => (
                  <Collapsible
                    key={entry.id}
                    open={expandedEntry === entry.id}
                    onOpenChange={(open) => setExpandedEntry(open ? entry.id : null)}
                  >
                    <div className="rounded-lg border border-border/40 bg-muted/20 transition-colors hover:bg-muted/30">
                      <div className="flex items-center pr-2">
                        <CollapsibleTrigger className="flex flex-1 items-center gap-4 p-4">
                          <div className="flex-1 text-left">
                            <div className="flex items-center gap-3">
                              <span className="font-medium text-sm">{entry.target_date}</span>
                              <Badge 
                                variant="outline"
                                style={{ 
                                  borderColor: entry.mood_color || '#888', 
                                  color: entry.mood_color || '#888',
                                  backgroundColor: `${entry.mood_color || '#888'}15`
                                }}
                              >
                                {entry.mood_tag}
                              </Badge>
                              <Badge variant="outline" className="gap-1">
                                心力: {entry.energy_level}/10
                              </Badge>
                            </div>
                            <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">
                              {entry.content}
                            </p>
                          </div>
                          <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform ${expandedEntry === entry.id ? "rotate-180" : ""}`} />
                        </CollapsibleTrigger>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={(e) => handleDeleteEntry(entry.id, e)}
                          className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <CollapsibleContent>
                        <div className="border-t border-border/40 p-4">
                          <div className="mt-2 text-slate-300">
                            {editingId === entry.id ? (
                              <div className="space-y-2">
                                <textarea
                                  className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white"
                                  value={editContent}
                                  onChange={(e) => setEditContent(e.target.value)}
                                />
                                <div className="flex gap-2">
                                  <button onClick={() => handleUpdateEntry(entry.id)} className="text-xs bg-blue-600 px-2 py-1 rounded">儲存</button>
                                  <button onClick={() => setEditingId(null)} className="text-xs bg-slate-700 px-2 py-1 rounded">取消</button>
                                </div>
                              </div>
                              ) : (
                              <p onClick={() => { setEditingId(entry.id); setEditContent(entry.content); }} className="cursor-pointer hover:bg-slate-800/50 p-2 rounded transition-colors">
                                {entry.content}
                              </p>
                            )}
                          </div>
                        </div>
                      </CollapsibleContent>
                    </div>
                  </Collapsible>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* 右側 AI 區塊 */}
        <div className="flex flex-col gap-6">
          <Card className="border-accent/30 bg-gradient-to-br from-accent/10 to-pink-500/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-accent" />
                AI 洞察與反思
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {aiReflections.map((reflection, i) => (
                <div key={i} className="rounded-lg bg-card/50 p-3 shadow-sm border border-border/40">
                  <p className="text-sm text-muted-foreground leading-relaxed">{reflection}</p>
                </div>
              ))}
              <div className="flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/10 p-3 mt-2">
                <Sparkles className="h-4 w-4 text-primary shrink-0" />
                <p className="text-sm text-primary font-medium">
                  持續記錄以解鎖專屬於你的進階洞察報告！
                </p>
              </div>
            </CardContent>
          </Card>

          {/* 數據統計 */}
          <Card className="border-border/40">
            <CardHeader>
              <CardTitle className="text-base">本週概況</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">紀錄天數</span>
                <span className="font-bold text-lg">{entries.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">平均心力值</span>
                <span className="font-bold text-lg text-primary">
                  {entries.length > 0 
                    ? (entries.reduce((sum, e) => sum + (e.energy_level || 0), 0) / entries.length).toFixed(1)
                    : "0.0"}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}