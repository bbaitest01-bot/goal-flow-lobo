"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useTranslation } from "react-i18next"
import myI18n from "@/lib/i18n";
import {
  LayoutDashboard,
  Target,
  CheckSquare,
  ClipboardList,
  BookHeart,
  Trophy,
  Settings,
  Sparkles,
  Bell,
  Menu,
  Brain,
  Send,
  Trash2
} from "lucide-react"
import { useState, useEffect } from "react"

// ==================== 【引入 Shadcn UI Avatar 元件】 ====================
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
// =========================================================================

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation();
  const pathname = usePathname();
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [coachInput, setCoachInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState([
    { role: "coach", content: "您好！我是 GoalFlow 管家。今天打算浪費時間，還是要做點正事？說來聽聽。" }
  ]);

  // ==================== 【沛涵 暑假新增：右上角動態頭貼狀態與加載判定】 ====================
  const [avatarInfo, setAvatarInfo] = useState<{ url: string; fallbackText: string }>({
    url: "",
    fallbackText: "GF"
  });
  const [isAvatarLoading, setIsAvatarLoading] = useState(true); // 控制微光呼吸的開關

  useEffect(() => {
    async function fetchUserAvatar() {
      try {
        const { supabase } = require("@/lib/supabase");
        // 採用安全氣囊版的 getSession，防呆不噴錯
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError || !session?.user) {
          console.log("Layout 偵測到使用者未登入");
          setIsAvatarLoading(false);
          return;
        }

        const user = session.user;
        const googleMetadata = user.user_metadata;
        const name = googleMetadata?.full_name || user.email?.split('@')[0] || "GF";
        
        setAvatarInfo({
          url: googleMetadata?.avatar_url || "",
          fallbackText: name.substring(0, 2).toUpperCase()
        });
      } catch (err) {
        console.error("Layout 獲取大頭貼失敗:", err);
      } finally {
        setIsAvatarLoading(false); // 撈完資料（無論成敗）關閉 loading 狀態
      }
    }
    fetchUserAvatar();
  }, []);
  // ===================================================================================

  const toggleLanguage = () => {
    const currentLang = myI18n.language || 'en';
    const newLang = currentLang === 'zh' ? 'en' : 'zh';
    myI18n.changeLanguage(newLang);
  };

  const handleSendMessage = async () => {
    if (!coachInput.trim() || isLoading) return;

    const userMessage = coachInput;
    setCoachInput(""); 

    const updatedMessages = [...messages, { role: "user", content: userMessage }];
    setMessages(updatedMessages);
    setIsLoading(true);

    try {
      const { supabase } = require("@/lib/supabase");
      const { data: { user } } = await supabase.auth.getUser();
      const currentUserId = user ? user.id : 'dobby-test';
      const N8N_WEBHOOK_URL = 'https://n8n.goalflow.ccwu.cc/webhook/9dd7f055-07d0-4f3e-a572-f9ee62b60b31';

      const response = await fetch(N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          chatInput: userMessage,
          user_id: currentUserId
        })
      });

      const data = await response.json();
      const botReply = data.output || "已收到回應，但無法解析文字欄位。";
      setMessages([...updatedMessages, { role: "coach", content: botReply }]);

    } catch (error) {
      console.error("N8N 連線失敗:", error);
      setMessages([...updatedMessages, { role: "coach", content: "❌ 嘖，伺服器斷線了。快去檢查 N8N！" }]);
    } finally {
      setIsLoading(false);
    }
  };

  const sidebarItems = [
    { icon: LayoutDashboard, label: t('sidebar.dashboard'), href: "/dashboard" },
    { icon: Target, label: t('sidebar.goals'), href: "/goals" },
    { icon: CheckSquare, label: t('sidebar.tasks'), href: "/tasks" },
    { icon: ClipboardList, label: t('sidebar.chores'), href: "/chores" },
    { icon: BookHeart, label: t('sidebar.diaries'), href: "/diary" },
    { icon: Trophy, label: t('sidebar.hall_of_fame'), href: "/hall-of-fame" },
    { icon: Trash2, label: t('sidebar.trash'), href: "/trash" },
    { icon: Settings, label: t('sidebar.settings'), href: "/settings" },
  ];

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden font-sans">
      
      {/* 1. 左側選單 */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 border-r border-border/40 bg-card/80 backdrop-blur-2xl lg:static lg:block flex-shrink-0 shadow-[4px_0_24px_-12px_rgba(0,0,0,0.1)]",
        mobileMenuOpen ? "block" : "hidden"
      )}>
        <div className="flex h-full flex-col">
          <div className="flex h-16 items-center px-6 border-b border-border/40">
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent shadow-sm">
                <Sparkles className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold">GoalFlow</span>
            </Link>
          </div>
          
          <div className="flex-1 overflow-y-auto px-3 py-4 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-muted-foreground/30">
            <nav className="space-y-1">
              {sidebarItems.map((item) => (
                <Link key={item.href} href={item.href} className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
                  pathname === item.href 
                    ? "bg-primary/10 text-primary border-l-2 border-primary" 
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                )}>
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="px-3 py-4 mt-auto border-t border-border/40">
            <Button onClick={toggleLanguage} variant="ghost" className="w-full text-xs hover:bg-primary/10 hover:text-primary gap-2 transition-colors">
              🌐 {myI18n.language === 'zh' ? 'Switch to English' : '切換為繁體中文'}
            </Button>
          </div>
        </div>
      </aside>

      {/* 2. 右側主要顯示區 */}
      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
        
        {/* 頂欄 */}
        <header className="h-16 border-b border-border/40 bg-background/60 px-6 flex items-center justify-between backdrop-blur-xl flex-shrink-0 relative z-10">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMobileMenuOpen(true)}>
              <Menu className="h-5 w-5" />
            </Button>
            <h1 className="font-semibold text-lg capitalize tracking-tight">
              {pathname === "/dashboard" ? "Dashboard" : pathname.split('/').pop()?.replace(/-/g, " ")}
            </h1>
          </div>
          <div className="flex items-center gap-4">
             <div className="relative cursor-pointer hover:bg-muted/50 p-2 rounded-full transition-colors">
               <Bell className="h-5 w-5 text-muted-foreground" />
             </div>
             
             {/* ==================== 【沛涵 修正：動態漸進式頭貼】 ==================== */}
             {/* 利用 animate-pulse 做出微光加載效果，資料到了一秒絲滑淡入切換 */}
             <Avatar className={cn(
               "h-8 w-8 shadow-sm ring-2 ring-background cursor-pointer transition-all duration-300 hover:scale-105",
               isAvatarLoading ? "animate-pulse bg-gradient-to-tr from-primary/40 to-accent/40" : ""
             )}>
               <AvatarImage 
                 src={avatarInfo.url} 
                 alt="User Avatar" 
                 className={cn("transition-opacity duration-300", isAvatarLoading ? "opacity-0" : "opacity-100")} 
               />
               <AvatarFallback className="bg-gradient-to-tr from-primary to-accent text-[10px] font-bold text-primary-foreground">
                 {avatarInfo.fallbackText}
               </AvatarFallback>
             </Avatar>
             {/* ===================================================================== */}
          </div>
        </header>

        <div className="flex flex-1 overflow-hidden">
          
          {/* 中間頁面內容 */}
          <main className="flex-1 overflow-y-auto p-6 bg-gradient-to-br from-background via-background to-primary/5 relative [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-muted-foreground/20 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-muted-foreground/40">
            {children}
          </main>

          {/* 3. 右側 AI 教練面板 */}
          <aside className="hidden w-80 border-l border-accent/20 bg-gradient-to-br from-accent/10 to-pink-500/10 xl:flex flex-col flex-shrink-0">
            
            <div className="p-4 border-b border-border/40 flex items-center gap-3 flex-shrink-0 bg-background/30 backdrop-blur-sm">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-accent to-pink-500 flex items-center justify-center text-white shadow-md">
                <Brain className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-sm">Toxic Coach</h3>
                <p className="text-[10px] text-pink-500 flex items-center gap-1.5 font-bold tracking-wide">
                   <span className="h-1.5 w-1.5 rounded-full bg-pink-500 animate-pulse" /> ONLINE
                </p>
              </div>
            </div>

            {/* 教練對話區域 */}
            <div className="flex-1 overflow-y-auto min-h-0 p-4 space-y-4 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-muted-foreground/30">
              {messages.map((msg, i) => (
                <div key={i} className={cn(
                  "max-w-[85%] rounded-2xl p-3 text-sm shadow-sm transition-all duration-300",
                  msg.role === "coach" 
                    ? "bg-card text-card-foreground self-start rounded-tl-sm border border-border/60" 
                    : "ml-auto bg-gradient-to-r from-primary to-accent text-white rounded-tr-sm shadow-md"
                )}>
                  {msg.content}
                </div>
              ))}
              {isLoading && (
                <div className="text-[10px] text-muted-foreground animate-pulse flex items-center gap-1.5 bg-card/50 self-start p-2 rounded-lg w-fit border border-border/30">
                  <Brain className="h-3 w-3 text-accent" /> 教練打字中...
                </div>
              )}
            </div>

            {/* 輸入框區域 */}
            <div className="p-4 border-t border-border/40 bg-background/40 backdrop-blur-md flex-shrink-0">
              <div className="flex gap-2 relative">
                <input
                  type="text"
                  value={coachInput}
                  onChange={(e) => setCoachInput(e.target.value)}
                  onKeyDown={(e) => { if(e.key === 'Enter') handleSendMessage(); }}
                  placeholder="Ask Toxic Coach..."
                  className="flex-1 h-10 rounded-full border border-border/60 bg-card/80 px-4 text-xs focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-transparent transition-all placeholder:text-muted-foreground"
                  disabled={isLoading}
                />
                <Button 
                  size="icon" 
                  onClick={handleSendMessage} 
                  disabled={isLoading}
                  className="h-10 w-10 rounded-full bg-gradient-to-br from-accent to-pink-500 shadow-md hover:opacity-90 transition-opacity"
                >
                  <Send className="h-4 w-4 text-white" />
                </Button>
              </div>
            </div>

          </aside>
        </div>
      </div>
    </div>
  )
}