import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { GoogleGenAI } from '@google/genai'; // 最新官方 SDK

// 1. 初始化 Gemini 客戶端
// 🎯 最新 SDK 規範：如果 apiKey 留空，它會自動去抓 process.env.GEMINI_API_KEY
const ai = new GoogleGenAI({}); 

export async function POST(req: Request) {
  try {
    const { message } = await req.json(); // 接收前端訊息
    
    // 2. 初始化最新版 @supabase/ssr 
    const cookieStore = await cookies(); 
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {
              // 這裡在 Route Handler 中即使失敗也可以安全忽略
            }
          },
        },
      }
    );
    
    // 3. 檢查登入狀態
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: '請先登入系統' }, { status: 401 });
    }

    // ==========================================
    // 🏃‍♂️ 步驟 A：【聊天前】去 Supabase 撈歷史紀錄當作記憶
    // ==========================================
    const { data: historyLogs, error: fetchError } = await supabase
      .from('chat_logs')
      .select('role, content')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }) 
      .limit(50);                               

    if (fetchError) {
      console.error('撈取聊天紀錄失敗:', fetchError);
    }

    // 格式化歷史記憶：完美符合最新版 Content 結構
    const formattedHistory: any[] = (historyLogs || [])
      .reverse()
      .map((log: any) => ({
        role: log.role === 'coach' ? 'model' : 'user',
        parts: [{ text: log.content }], 
      }));

    // ==========================================
    // 🏃‍♂️ 步驟 B：【聊天前】把使用者新話存入 chat_logs 表格
    // ==========================================
    await supabase.from('chat_logs').insert({
      user_id: user.id,
      role: 'user',
      content: message,
    });

    // ==========================================
    // 🏃‍♂️ 步驟 C：打包送給 Gemini 2.5 Flash 大腦
    // ==========================================
    const systemInstruction = '妳是 GoalFlow 的 Toxic Coach（毒舌教練）。妳講話極度尖銳、一針見血、愛吐槽使用者，但非常有建設性，目標是強迫使用者認真完成他們的任務與目標！';

    // 🎯 完美對齊最新 @google/genai 的 generateContent 語法規格
    const aiResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        ...formattedHistory,    
        { role: 'user', parts: [{ text: message }] } 
      ],
      config: {
        systemInstruction: systemInstruction, 
        temperature: 0.7,
      }
    });

    const aiReply = aiResponse.text || '我現在不想理妳。';

    // ==========================================
    // 🏃‍♂️ 步驟 D：【聊天後】把 AI 的毒舌吐槽存入 chat_logs 表格
    // ==========================================
    await supabase.from('chat_logs').insert({
      user_id: user.id,
      role: 'coach',
      content: aiReply,
    });

    // 5. 回傳給前端網頁
    return NextResponse.json({ reply: aiReply });

  } catch (error) {
    console.error('Gemini 聊天 API 發生錯誤:', error);
    return NextResponse.json({ error: '伺服器內部錯誤' }, { status: 500 });
  }
}