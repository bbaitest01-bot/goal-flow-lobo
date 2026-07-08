import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  // 拿取 Google 傳回來的兌換碼
  const code = searchParams.get('code')
  // 確認登入後要去的目的地 (我們剛剛在 login 頁面傳了 ?next=/dashboard)
  const next = searchParams.get('next') ?? '/dashboard'

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
            } catch (error) {
              // 忽略這裡的錯誤
            }
          },
        },
      }
    )
    
    // 拿兌換碼向 Supabase 換取真正的 Cookie
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // 成功！把使用者送去 Dashboard
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // 失敗的話，導回首頁並附帶錯誤訊息
  return NextResponse.redirect(`${origin}/?error=auth-callback-failed`)
}