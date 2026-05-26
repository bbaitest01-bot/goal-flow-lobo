import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { GoogleGenAI } from '@google/genai'; 

const ai = new GoogleGenAI({}); 

// 🎯 已經換成蘿蔔提供的正式 n8n 監聽網址
const N8N_PRODUCTION_WEBHOOK = 'https://n8n.goalflow.ccwu.cc/webhook/9dd7f055-07d0-4f3e-a572-f9ee62b60b31';

export async function POST(req: Request) {
  try {
    const { message } = await req.json(); 
    
    const cookieStore = await cookies(); 
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll(); },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {}
          },
        },
      }
    );
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: '請先登入系統' }, { status: 401 });
    }

    // ==========================================
    // 🏃‍♂️ 步驟 A：去 Supabase 撈歷史紀錄
    // ==========================================
    const { data: historyLogs, error: fetchError } = await supabase
      .from('chat_logs')
      .select('role, content')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }) 
      .limit(15);                                

    if (fetchError) {
      console.error('撈取聊天紀錄失敗:', fetchError);
    }

    const formattedHistory: any[] = (historyLogs || [])
      .reverse()
      .map((log: any) => ({
        role: log.role === 'coach' ? 'model' : 'user',
        parts: [{ text: log.content }], 
      }));

    // ==========================================
    // 🎯 結構化分流調度提示詞
    // ==========================================
    const systemInstruction = `
# 角色設定
妳是 GoalFlow 的 Toxic Coach（毒舌教練）。妳講話極度尖銳、抗拒溫情、一針見血。妳的目標是強迫使用者面對現實。
【絕對禁令】：絕對禁止使用「您好」、「很高興為您服務」或「專屬管家」等委婉詞彙。

# 核心任務：意圖辨識與分流調度
請分析使用者最新輸入的這句話，判斷他是「純聊天廢話」還是「明確的執行指令（涉及行程、任務的操作、查詢或動手做事）」。
妳必須且只能回傳標準的 JSON 格式，嚴禁輸出任何 JSON 之外的廢話、標籤或程式碼符號。

## 意圖判定規則
1. 歸類為 "CHAT" (純聊天/抱怨/回答)：
   - 使用者單純在打招呼、抱怨、討拍、說累了、想睡覺，或只是在回答妳的嘲諷。
   - 處理方式：請在 JSON 的 reply 欄位給出一句符合【直拳吐槽原則】的毒舌短語。

2. 歸類為 "ACTION" (執行指令/正事)：
   - 當使用者明確提到要「新增」、「修改」、「刪除」、「查詢」任何任務、目標或備忘錄。
   - 當使用者提到「時間+事件」（如：我明天要跑步）或詢問行程與任務狀況。
   - 處理方式：這屬於明確的執行指令，請將 JSON 的 reply 欄位直接留空字串 ""。

## 【直拳吐槽原則】
不准寒暄、直接點出使用者的軟弱與拖延，一句話見血。完成吐槽後立刻閉嘴，禁止延伸任何無關的日程規劃、說教或子任務建議。

## 輸出 JSON 格式規範（嚴格限制）
{
  "category": "CHAT" 或 "ACTION",
  "reply": "毒舌內容（若為 ACTION 則為 \"\"）"
}
`;

    // 🏃‍♂️ 步驟 C：打包送給 Gemini 大腦
    const aiResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        ...formattedHistory,    
        { role: 'user', parts: [{ text: message }] } 
      ],
      config: {
        systemInstruction: systemInstruction, 
        temperature: 0.3, // 再次降低溫度，確保絕不亂吐格式
        responseMimeType: "application/json", 
      }
    });

    // 🎯 安全性解析防護：防止 AI 萬一吐出殘缺的 JSON 導致崩潰
    let decision = { category: 'CHAT', reply: '還在浪費時間？有話快說，要幹嘛？' };
    try {
      if (aiResponse.text) {
        decision = JSON.parse(aiResponse.text);
      }
    } catch (e) {
      console.error("JSON 解析失敗，啟用安全備用方案", e);
    }

    // ==========================================
    // 🎯 分流核心
    // ==========================================
    if (decision.category === 'ACTION') {
      console.log('--- 🎯 偵測到 ACTION 指令，轉寄給 n8n ---');
      
      try {
        const n8nResponse = await fetch(N8N_PRODUCTION_WEBHOOK, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: message,
            user_id: user.id,
            session_id: user.id
          })
        });

        const n8nData = await n8nResponse.json();
        const n8nReply = n8nData.output || n8nData.reply || '正事搞定了，別再偷懶！';

        // 🎯 傳統單筆寫入，100% 安全不噴錯
        await supabase.from('chat_logs').insert({ user_id: user.id, role: 'user', content: message });
        await supabase.from('chat_logs').insert({ user_id: user.id, role: 'coach', content: n8nReply });

        return NextResponse.json({ reply: n8nReply });
      } catch (n8nErr) {
        console.error("n8n 轉寄或解析失敗:", n8nErr);
        return NextResponse.json({ reply: "❌ 嘖，後台正事通道斷線了，叫妳同學檢查 n8n！" });
      }

    } else {
      // 💬 【分支 1：純聊天廢話】
      const aiReply = decision.reply || '還在浪費時間？有話快說，要幹嘛？';

      // 🎯 傳統單筆寫入，100% 安全不噴錯
      await supabase.from('chat_logs').insert({ user_id: user.id, role: 'user', content: message });
      await supabase.from('chat_logs').insert({ user_id: user.id, role: 'coach', content: aiReply });

      return NextResponse.json({ reply: aiReply });
    }

  } catch (error) {
    console.error('Gemini 聊天 API 發生嚴重錯誤:', error);
    return NextResponse.json({ error: '伺服器內部錯誤' }, { status: 500 });
  }
}