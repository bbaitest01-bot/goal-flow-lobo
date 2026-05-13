"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { ArrowRight, Plus } from "lucide-react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"

const initialTasks = [
  { id: 1, title: "Write introduction chapter", rpe: 7, done: true, goal: "Graduation Project" },
  { id: 2, title: "Review literature notes", rpe: 4, done: false, goal: "Graduation Project" },
  { id: 3, title: "Complete React hooks tutorial", rpe: 5, done: false, goal: "Learn React Advanced" },
  { id: 4, title: "Update project timeline", rpe: 3, done: false, goal: "Graduation Project" },
]

export function TodaysTasks() {
  const [tasks, setTasks] = useState(initialTasks)
  const [newTaskTitle, setNewTaskTitle] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleAddTask = async () => {
    if (!newTaskTitle.trim()) return

    setIsLoading(true)

    const { data, error } = await supabase
      .from("tasks")
      .insert([
        {
          title: newTaskTitle.trim(),
          user_id: "12543ace-5b0e-4e98-bba0-450da3ba5cc9",
          goal_id: "d8865988-327f-47f2-a277-e41ba6dc7eb2",
          rpe_score: 5,
          energy_cost: 20,
          status: "todo",
          priority: "medium",
        },
      ])
      .select()

    setIsLoading(false)

    if (error) {
      alert("新增失敗：" + error.message)
    } else {
      // 新增到本地列表顯示
      const newTask = {
        id: Date.now(),
        title: newTaskTitle.trim(),
        rpe: 5,
        done: false,
        goal: "New Task",
      }
      setTasks([newTask, ...tasks])
      setNewTaskTitle("")
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleAddTask()
    }
  }

  return (
    <Card className="border-border/40">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-semibold">Today&apos;s Tasks</CardTitle>
        <Link href="/tasks">
          <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground">
            View all
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {/* Add Task Input */}
        <div className="flex items-center gap-2 mb-2">
          <Input
            placeholder="新增任務..."
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            className="flex-1"
          />
          <Button 
            onClick={handleAddTask} 
            disabled={isLoading || !newTaskTitle.trim()}
            size="sm"
            className="gap-1"
          >
            <Plus className="h-4 w-4" />
            新增
          </Button>
        </div>

        {/* Task List */}
        {tasks.map((task) => (
          <div 
            key={task.id} 
            className="flex items-center gap-3 rounded-lg bg-muted/20 p-3"
          >
            <Checkbox checked={task.done} />
            <div className="flex-1">
              <p className={task.done ? "line-through text-muted-foreground" : ""}>
                {task.title}
              </p>
              <p className="text-xs text-muted-foreground">{task.goal}</p>
            </div>
            <Badge 
              variant="secondary" 
              className={`text-xs ${task.rpe >= 7 ? 'bg-red-500/20 text-red-400' : task.rpe >= 5 ? 'bg-amber-500/20 text-amber-400' : 'bg-green-500/20 text-green-400'}`}
            >
              RPE {task.rpe}
            </Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
