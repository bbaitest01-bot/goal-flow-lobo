import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // 🎯 看看前端有沒有指定去哪，沒有的話，我們直接強制送去 /dashboard 
  const next = searchParams.get('next') ?? '/dashboard'

  // 🛡️ 【沛涵專屬防漂移保護】
  // 如果發現請求網址或參數裡帶有 localhost，代表我們是在本機開發測試
  // 我們就強行把 origin 修正回本機網址，絕對不給 Vercel 綁架的機會！
  let finalOrigin = origin
  if (request.url.includes('localhost') || searchParams.get('redirect_to')?.includes('localhost')) {
    finalOrigin = 'http://localhost:3000'
  }

  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {
              // 伺服器組件環境下可能無法直接寫入，此處安全忽略
            }
          },
        },
      }
    )

    // 🌟 最核心的動作：用 Google 給的 code 換取正式登入的 Session，並幫瀏覽器種下 Cookie
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // 🚀 換票成功！帶上密鑰，正式轉移（使用我們校正過後的 finalOrigin）
      return NextResponse.redirect(`${finalOrigin}${next}`)
    }
  }

  // 如果失敗或沒有 code，安全退回（使用我們校正過後的 finalOrigin）
  return NextResponse.redirect(`${finalOrigin}`)
}