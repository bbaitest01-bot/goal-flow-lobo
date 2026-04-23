"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  User,
  Bell,
  Zap,
  Brain,
  Palette,
  Shield,
  LogOut
} from "lucide-react"

export default function SettingsPage() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your account and preferences</p>
      </div>

      {/* Profile Section */}
      <Card className="border-border/40">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Profile
          </CardTitle>
          <CardDescription>Your personal information</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src="/avatar.png" />
              <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-2xl text-primary-foreground">
                JD
              </AvatarFallback>
            </Avatar>
            <div>
              <Button variant="outline" size="sm">Change Avatar</Button>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium">Name</label>
              <Input defaultValue="John Doe" className="border-border/60 bg-muted/30" />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Email</label>
              <Input defaultValue="john@example.com" disabled className="border-border/60 bg-muted/30" />
            </div>
          </div>
          <Button className="w-fit bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90">
            Save Changes
          </Button>
        </CardContent>
      </Card>

      {/* Energy Settings */}
      <Card className="border-border/40">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Energy Settings
          </CardTitle>
          <CardDescription>Customize your daily energy capacity</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <div>
            <div className="mb-4 flex items-center justify-between">
              <label className="text-sm font-medium">Daily Energy Limit</label>
              <span className="text-sm text-muted-foreground">100 points</span>
            </div>
            <Slider defaultValue={[100]} min={50} max={150} step={10} className="py-2" />
            <div className="mt-2 flex justify-between text-xs text-muted-foreground">
              <span>50 (Low capacity)</span>
              <span>100 (Normal)</span>
              <span>150 (High capacity)</span>
            </div>
          </div>
          <Separator className="bg-border/40" />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Low Energy Warnings</p>
              <p className="text-sm text-muted-foreground">Get notified when energy drops below 30%</p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Energy Reset Time</p>
              <p className="text-sm text-muted-foreground">When your daily energy resets</p>
            </div>
            <Select defaultValue="midnight">
              <SelectTrigger className="w-32 border-border/60 bg-muted/30">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-border/60 bg-card">
                <SelectItem value="midnight">Midnight</SelectItem>
                <SelectItem value="6am">6:00 AM</SelectItem>
                <SelectItem value="wake">Wake Time</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* AI Coach Settings */}
      <Card className="border-border/40">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI Coach
          </CardTitle>
          <CardDescription>Customize your AI coach experience</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Coach Personality</p>
              <p className="text-sm text-muted-foreground">How your AI coach communicates</p>
            </div>
            <Select defaultValue="sarcastic">
              <SelectTrigger className="w-40 border-border/60 bg-muted/30">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-border/60 bg-card">
                <SelectItem value="sarcastic">Sarcastic</SelectItem>
                <SelectItem value="supportive">Supportive</SelectItem>
                <SelectItem value="strict">Strict</SelectItem>
                <SelectItem value="balanced">Balanced</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Separator className="bg-border/40" />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Proactive Suggestions</p>
              <p className="text-sm text-muted-foreground">Coach offers tips without being asked</p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Deadline Reminders</p>
              <p className="text-sm text-muted-foreground">Get notified about upcoming deadlines</p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card className="border-border/40">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
          </CardTitle>
          <CardDescription>Manage how you receive updates</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Email Notifications</p>
              <p className="text-sm text-muted-foreground">Daily summary and important updates</p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Push Notifications</p>
              <p className="text-sm text-muted-foreground">Real-time task and goal reminders</p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Weekly Reports</p>
              <p className="text-sm text-muted-foreground">Summary of your weekly progress</p>
            </div>
            <Switch />
          </div>
        </CardContent>
      </Card>

      {/* Appearance */}
      <Card className="border-border/40">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Appearance
          </CardTitle>
          <CardDescription>Customize the look and feel</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Theme</p>
              <p className="text-sm text-muted-foreground">Choose your preferred theme</p>
            </div>
            <Select defaultValue="dark">
              <SelectTrigger className="w-32 border-border/60 bg-muted/30">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-border/60 bg-card">
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Compact Mode</p>
              <p className="text-sm text-muted-foreground">Reduce spacing and padding</p>
            </div>
            <Switch />
          </div>
        </CardContent>
      </Card>

      {/* Account */}
      <Card className="border-border/40">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Account
          </CardTitle>
          <CardDescription>Account management options</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Export Data</p>
              <p className="text-sm text-muted-foreground">Download all your data</p>
            </div>
            <Button variant="outline" size="sm">Export</Button>
          </div>
          <Separator className="bg-border/40" />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-destructive">Sign Out</p>
              <p className="text-sm text-muted-foreground">Sign out of your account</p>
            </div>
            <Button variant="outline" size="sm" className="gap-2 text-destructive hover:bg-destructive/10">
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
