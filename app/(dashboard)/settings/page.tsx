"use client"

import { useState, useEffect } from "react"
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

import { useRouter } from "next/navigation" 
import { supabase } from "@/lib/supabase" 

export default function SettingsPage() {
  const router = useRouter();

  // ==================== 【主題狀態管理】 ====================
  const [currentTheme, setCurrentTheme] = useState<string>("dark")

  useEffect(() => {
    const root = document.documentElement;
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      setCurrentTheme(savedTheme);
    } else {
      const isDarkNow = root.classList.contains("dark");
      setCurrentTheme(isDarkNow ? "dark" : "light");
    }
  }, []);

  const handleThemeChange = (value: string) => {
    const root = document.documentElement;
    setCurrentTheme(value);
    localStorage.setItem("theme", value);
    
    if (value === "dark") {
      root.classList.add("dark");
    } else if (value === "light") {
      root.classList.remove("dark");
    } else if (value === "system") {
      const systemIsDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      if (systemIsDark) {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }
    }
    window.location.reload();
  };

  // ==================== 【沛涵 暑假修正：抓取 Google 資料與安全氣囊防護】 ====================
  const [userInfo, setUserInfo] = useState<{
    name: string;
    email: string;
    avatarUrl: string;
  }>({
    name: "Loading...",
    email: "Loading...",
    avatarUrl: ""
  });

  useEffect(() => {
    async function fetchUser() {
      try {
        // 溫和檢查 Session 狀態，若沒登入不會直接噴紅字崩潰
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError || !session?.user) {
          console.log("使用者目前未登入或 Session 已過期。");
          setUserInfo({
            name: "未登入使用者",
            email: "none@goalflow.com",
            avatarUrl: ""
          });
          return;
        }

        const user = session.user;
        const googleMetadata = user.user_metadata;
        
        setUserInfo({
          name: googleMetadata?.full_name || user.email?.split('@')[0] || "GoalFlow 使用者",
          email: user.email || "",
          avatarUrl: googleMetadata?.avatar_url || "" 
        });
      } catch (err) {
        console.error("抓取使用者資料時發生未預期異常:", err);
      }
    }

    fetchUser();
  }, [router]);
  // ===================================================================================

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("登出發生錯誤：", error.message);
        alert("登出失敗，請再試一次！");
        return;
      }
      router.push("/login"); 
    } catch (err) {
      console.error("系統異常：", err);
    }
  };

  // 取得姓名首字當作頭貼備用文字（Fallback）
  const userInitials = userInfo.name.substring(0, 2).toUpperCase();

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
            {/* ==================== 【動態綁定 Google 大頭貼】 ==================== */}
            <Avatar className="h-20 w-20">
              <AvatarImage src={userInfo.avatarUrl} alt={userInfo.name} />
              <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-2xl text-primary-foreground">
                {userInitials}
              </AvatarFallback>
            </Avatar>
            {/* ==================================================================== */}
            <div>
              <Button variant="outline" size="sm" disabled>Google Account Managed</Button>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {/* ==================== 【動態綁定 姓名與 Email】 ==================== */}
            <div>
              <label className="mb-2 block text-sm font-medium">Name</label>
              <Input value={userInfo.name} readOnly className="border-border/60 bg-muted/30 cursor-not-allowed text-muted-foreground" />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Email</label>
              <Input value={userInfo.email} disabled className="border-border/60 bg-muted/30" />
            </div>
            {/* ==================================================================== */}
          </div>
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
            <Select value={currentTheme} onValueChange={handleThemeChange}>
              <SelectTrigger className="w-36 border-border/60 bg-muted/30">
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
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-2 text-destructive hover:bg-destructive/10"
              onClick={handleSignOut}
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}