"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
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
  Sparkles
} from "lucide-react"

type MoodTag = "great" | "good" | "okay" | "tired" | "stressed" | "anxious"

interface DiaryEntry {
  id: number
  date: string
  mood: MoodTag
  energyFeeling: number
  content: string
}

const moodOptions: { value: MoodTag; label: string; color: string }[] = [
  { value: "great", label: "Great", color: "bg-green-500/20 text-green-400 border-green-500/40" },
  { value: "good", label: "Good", color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/40" },
  { value: "okay", label: "Okay", color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/40" },
  { value: "tired", label: "Tired", color: "bg-orange-500/20 text-orange-400 border-orange-500/40" },
  { value: "stressed", label: "Stressed", color: "bg-red-500/20 text-red-400 border-red-500/40" },
  { value: "anxious", label: "Anxious", color: "bg-purple-500/20 text-purple-400 border-purple-500/40" },
]

const initialEntries: DiaryEntry[] = [
  {
    id: 1,
    date: "March 25, 2024",
    mood: "good",
    energyFeeling: 7,
    content: "Had a productive day working on the graduation project. Finished the introduction chapter and felt accomplished. The AI coach was right about taking breaks - I should listen more often."
  },
  {
    id: 2,
    date: "March 24, 2024",
    mood: "tired",
    energyFeeling: 4,
    content: "Overcommitted yesterday and paid for it today. Struggled to focus on anything. Need to be more realistic about what I can handle in a single day."
  },
  {
    id: 3,
    date: "March 23, 2024",
    mood: "great",
    energyFeeling: 9,
    content: "Weekend vibes! Caught up on sleep and feeling refreshed. Did some light reading and planning for the week ahead. Ready to tackle Monday."
  },
  {
    id: 4,
    date: "March 22, 2024",
    mood: "stressed",
    energyFeeling: 3,
    content: "Deadline pressure is getting to me. Had three high-RPE tasks back to back and I'm exhausted. Need to learn to say no and space things out better."
  },
]

const aiReflections = [
  "Based on your recent entries, you tend to overcommit on Mondays. Consider starting the week with lighter tasks.",
  "Your energy levels correlate strongly with sleep quality. Prioritize rest for better productivity.",
  "You've been consistent with journaling - great habit! This self-awareness will help you manage energy better.",
]

export default function DiaryPage() {
  const [entries, setEntries] = useState(initialEntries)
  const [todayEntry, setTodayEntry] = useState({
    mood: "" as MoodTag | "",
    energyFeeling: 5,
    content: ""
  })
  const [expandedEntry, setExpandedEntry] = useState<number | null>(null)

  const today = new Date().toLocaleDateString('en-US', { 
    month: 'long', 
    day: 'numeric', 
    year: 'numeric' 
  })

  const handleSaveEntry = () => {
    if (!todayEntry.mood || !todayEntry.content) return

    const newEntry: DiaryEntry = {
      id: entries.length + 1,
      date: today,
      mood: todayEntry.mood as MoodTag,
      energyFeeling: todayEntry.energyFeeling,
      content: todayEntry.content
    }

    setEntries([newEntry, ...entries])
    setTodayEntry({ mood: "", energyFeeling: 5, content: "" })
  }

  const getMoodStyle = (mood: MoodTag) => {
    return moodOptions.find(m => m.value === mood)?.color || ""
  }

  const getEnergyLabel = (value: number) => {
    if (value >= 8) return "Energized"
    if (value >= 6) return "Good"
    if (value >= 4) return "Moderate"
    if (value >= 2) return "Low"
    return "Exhausted"
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Mood Diary</h1>
        <p className="text-muted-foreground">
          Track your daily mood and energy to help your AI coach understand you better
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="flex flex-col gap-6 lg:col-span-2">
          {/* Today's Entry Form */}
          <Card className="border-border/40 bg-gradient-to-br from-card via-card to-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Today&apos;s Entry
                <Badge variant="outline" className="ml-auto">{today}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-6">
              {/* Mood Selection */}
              <div>
                <label className="mb-3 block text-sm font-medium">How are you feeling?</label>
                <div className="flex flex-wrap gap-2">
                  {moodOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setTodayEntry({ ...todayEntry, mood: option.value })}
                      className={`rounded-full border px-4 py-2 text-sm font-medium transition-all ${
                        todayEntry.mood === option.value 
                          ? option.color + " ring-2 ring-offset-2 ring-offset-background" 
                          : "border-border/60 bg-muted/30 text-muted-foreground hover:bg-muted/50"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Energy Feeling Slider */}
              <div>
                <label className="mb-3 block text-sm font-medium">
                  Energy Level: {todayEntry.energyFeeling}/10 - {getEnergyLabel(todayEntry.energyFeeling)}
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
                  <span>Exhausted</span>
                  <span>Moderate</span>
                  <span>Energized</span>
                </div>
              </div>

              {/* Journal Content */}
              <div>
                <label className="mb-3 block text-sm font-medium">
                  What&apos;s on your mind?
                </label>
                <Textarea
                  placeholder="Write about your day, progress, challenges, or anything you want to reflect on..."
                  value={todayEntry.content}
                  onChange={(e) => setTodayEntry({ ...todayEntry, content: e.target.value })}
                  className="min-h-[150px] border-border/60 bg-muted/30"
                />
              </div>

              {/* Save Button */}
              <Button 
                onClick={handleSaveEntry}
                disabled={!todayEntry.mood || !todayEntry.content}
                className="gap-2 bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90"
              >
                <Save className="h-4 w-4" />
                Save Entry
              </Button>
            </CardContent>
          </Card>

          {/* Entry History */}
          <Card className="border-border/40">
            <CardHeader>
              <CardTitle>Previous Entries</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {entries.map((entry) => (
                <Collapsible
                  key={entry.id}
                  open={expandedEntry === entry.id}
                  onOpenChange={(open) => setExpandedEntry(open ? entry.id : null)}
                >
                  <div className="rounded-lg border border-border/40 bg-muted/20 transition-colors hover:bg-muted/30">
                    <CollapsibleTrigger className="flex w-full items-center gap-4 p-4">
                      <div className="flex-1 text-left">
                        <div className="flex items-center gap-3">
                          <span className="font-medium">{entry.date}</span>
                          <Badge className={getMoodStyle(entry.mood)}>
                            {moodOptions.find(m => m.value === entry.mood)?.label}
                          </Badge>
                          <Badge variant="outline" className="gap-1">
                            Energy: {entry.energyFeeling}/10
                          </Badge>
                        </div>
                        <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">
                          {entry.content}
                        </p>
                      </div>
                      <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform ${expandedEntry === entry.id ? "rotate-180" : ""}`} />
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="border-t border-border/40 p-4">
                        <p className="text-sm leading-relaxed">{entry.content}</p>
                      </div>
                    </CollapsibleContent>
                  </div>
                </Collapsible>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* AI Reflection Sidebar */}
        <div className="flex flex-col gap-6">
          <Card className="border-accent/30 bg-gradient-to-br from-accent/10 to-pink-500/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-accent" />
                AI Reflection
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {aiReflections.map((reflection, i) => (
                <div key={i} className="rounded-lg bg-card/50 p-3">
                  <p className="text-sm text-muted-foreground leading-relaxed">{reflection}</p>
                </div>
              ))}
              <div className="flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/10 p-3">
                <Sparkles className="h-4 w-4 text-primary" />
                <p className="text-sm text-primary">
                  Keep journaling to unlock more personalized insights!
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card className="border-border/40">
            <CardHeader>
              <CardTitle className="text-base">This Week</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Entries</span>
                <span className="font-medium">{entries.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Avg Energy</span>
                <span className="font-medium">
                  {(entries.reduce((sum, e) => sum + e.energyFeeling, 0) / entries.length).toFixed(1)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Most Common Mood</span>
                <Badge className={getMoodStyle("good")}>Good</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
