"use client"

import { useState } from "react"
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
  CheckCircle2
} from "lucide-react"

interface Chore {
  id: number
  title: string
  description: string
  rpe: number
  energyCost: number
  dueDate: string
  done: boolean
}

const initialChores: Chore[] = [
  { 
    id: 1, 
    title: "Reply to emails", 
    description: "Respond to pending work and personal emails",
    rpe: 2, 
    energyCost: 6, 
    dueDate: "Today",
    done: true 
  },
  { 
    id: 2, 
    title: "Organize desktop files", 
    description: "Clean up downloads folder and organize documents",
    rpe: 2, 
    energyCost: 6, 
    dueDate: "Today",
    done: false 
  },
  { 
    id: 3, 
    title: "Schedule meeting with advisor", 
    description: "Book a slot for project discussion",
    rpe: 1, 
    energyCost: 3, 
    dueDate: "Today",
    done: false 
  },
  { 
    id: 4, 
    title: "Pay utility bills", 
    description: "Pay electricity and internet bills",
    rpe: 1, 
    energyCost: 3, 
    dueDate: "Mar 28",
    done: false 
  },
  { 
    id: 5, 
    title: "Buy groceries", 
    description: "Weekly grocery shopping",
    rpe: 3, 
    energyCost: 9, 
    dueDate: "Mar 29",
    done: false 
  },
  { 
    id: 6, 
    title: "Clean workspace", 
    description: "Tidy up desk and organize supplies",
    rpe: 2, 
    energyCost: 6, 
    dueDate: "Mar 30",
    done: false 
  },
]

const rpeToEnergy = (rpe: number) => rpe * 3

export default function ChoresPage() {
  const [chores, setChores] = useState(initialChores)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [newChore, setNewChore] = useState({
    title: "",
    description: "",
    rpe: 2,
    dueDate: ""
  })

  const completedToday = chores.filter(c => c.done && c.dueDate === "Today").length
  const totalToday = chores.filter(c => c.dueDate === "Today").length
  const energyUsedByChores = chores.filter(c => c.done).reduce((sum, c) => sum + c.energyCost, 0)
  const totalChoreEnergy = chores.reduce((sum, c) => sum + c.energyCost, 0)

  const handleToggleChore = (id: number) => {
    setChores(chores.map(c => 
      c.id === id ? { ...c, done: !c.done } : c
    ))
  }

  const handleCreateChore = () => {
    if (!newChore.title) return
    
    const chore: Chore = {
      id: chores.length + 1,
      title: newChore.title,
      description: newChore.description,
      rpe: newChore.rpe,
      energyCost: rpeToEnergy(newChore.rpe),
      dueDate: newChore.dueDate || "Today",
      done: false
    }
    
    setChores([...chores, chore])
    setNewChore({ title: "", description: "", rpe: 2, dueDate: "" })
    setIsCreateOpen(false)
  }

  const handleDeleteChore = (id: number) => {
    setChores(chores.filter(c => c.id !== id))
  }

  const getRpeBadgeColor = (rpe: number) => {
    if (rpe >= 5) return "bg-amber-500/20 text-amber-400"
    if (rpe >= 3) return "bg-yellow-500/20 text-yellow-400"
    return "bg-green-500/20 text-green-400"
  }

  const todayChores = chores.filter(c => c.dueDate === "Today")
  const upcomingChores = chores.filter(c => c.dueDate !== "Today")

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Chores</h1>
          <p className="text-muted-foreground">
            Standalone tasks that consume energy but don&apos;t affect goal progress
          </p>
        </div>
        
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90">
              <Plus className="h-4 w-4" />
              Add Chore
            </Button>
          </DialogTrigger>
          <DialogContent className="border-border/40 bg-card">
            <DialogHeader>
              <DialogTitle>Add New Chore</DialogTitle>
              <DialogDescription>
                Add a task that needs to be done but isn&apos;t part of a goal
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-4 pt-4">
              <div>
                <label className="mb-2 block text-sm font-medium">Title</label>
                <Input 
                  placeholder="e.g., Reply to emails"
                  value={newChore.title}
                  onChange={(e) => setNewChore({ ...newChore, title: e.target.value })}
                  className="border-border/60 bg-muted/30"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">Description</label>
                <Textarea 
                  placeholder="Optional details..."
                  value={newChore.description}
                  onChange={(e) => setNewChore({ ...newChore, description: e.target.value })}
                  className="border-border/60 bg-muted/30"
                  rows={2}
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">
                  RPE (Difficulty): {newChore.rpe} - Energy Cost: {rpeToEnergy(newChore.rpe)}
                </label>
                <Slider
                  value={[newChore.rpe]}
                  onValueChange={(v) => setNewChore({ ...newChore, rpe: v[0] })}
                  min={1}
                  max={10}
                  step={1}
                  className="py-4"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>1 (Quick)</span>
                  <span>5 (Medium)</span>
                  <span>10 (Exhausting)</span>
                </div>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">Due Date</label>
                <Input 
                  type="date"
                  value={newChore.dueDate}
                  onChange={(e) => setNewChore({ ...newChore, dueDate: e.target.value })}
                  className="border-border/60 bg-muted/30"
                />
              </div>
              <Button 
                onClick={handleCreateChore}
                className="mt-2 bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90"
              >
                Add Chore
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="border-border/40">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/20">
                <CheckCircle2 className="h-5 w-5 text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{completedToday}/{totalToday}</p>
                <p className="text-sm text-muted-foreground">Completed Today</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/40">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20">
                <Zap className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{energyUsedByChores}</p>
                <p className="text-sm text-muted-foreground">Energy Used</p>
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
                <p className="text-sm text-muted-foreground">Total Chores</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Today's Chores */}
      <Card className="border-border/40">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>Today&apos;s Chores</span>
            <Badge variant="secondary">{todayChores.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {todayChores.length === 0 ? (
            <Empty className="py-8">
              <ClipboardList className="h-10 w-10" />
              <EmptyTitle>No chores for today</EmptyTitle>
              <EmptyDescription>You&apos;re all caught up! Add a chore if needed.</EmptyDescription>
            </Empty>
          ) : (
            <div className="flex flex-col gap-2">
              {todayChores.map((chore) => (
                <ChoreItem 
                  key={chore.id}
                  chore={chore}
                  onToggle={handleToggleChore}
                  onDelete={handleDeleteChore}
                  getRpeBadgeColor={getRpeBadgeColor}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upcoming Chores */}
      {upcomingChores.length > 0 && (
        <Card className="border-border/40">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>Upcoming</span>
              <Badge variant="secondary">{upcomingChores.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-2">
              {upcomingChores.map((chore) => (
                <ChoreItem 
                  key={chore.id}
                  chore={chore}
                  onToggle={handleToggleChore}
                  onDelete={handleDeleteChore}
                  getRpeBadgeColor={getRpeBadgeColor}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function ChoreItem({ 
  chore, 
  onToggle, 
  onDelete,
  getRpeBadgeColor 
}: { 
  chore: Chore
  onToggle: (id: number) => void
  onDelete: (id: number) => void
  getRpeBadgeColor: (rpe: number) => string
}) {
  return (
    <div 
      className="group flex items-center gap-4 rounded-lg border border-border/40 bg-muted/20 p-4 transition-colors hover:bg-muted/40"
    >
      <Checkbox 
        checked={chore.done} 
        onCheckedChange={() => onToggle(chore.id)}
      />
      <div className="flex-1">
        <p className={`font-medium ${chore.done ? "line-through text-muted-foreground" : ""}`}>
          {chore.title}
        </p>
        {chore.description && (
          <p className="mt-1 text-sm text-muted-foreground">{chore.description}</p>
        )}
      </div>
      <div className="flex items-center gap-3">
        <Badge className={getRpeBadgeColor(chore.rpe)}>
          RPE {chore.rpe}
        </Badge>
        <Badge variant="outline" className="gap-1">
          <Zap className="h-3 w-3" />
          {chore.energyCost}
        </Badge>
        <span className="flex items-center gap-1 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          {chore.dueDate}
        </span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="border-border/60 bg-card">
            <DropdownMenuItem className="gap-2">
              <Edit className="h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem 
              className="gap-2 text-destructive"
              onClick={() => onDelete(chore.id)}
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
