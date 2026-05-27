import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// 🎯 升級為 Browser 專用客戶端，它會自動將登入狀態（Session）同步寫入 Cookies 中！
export const supabase = createBrowserClient(supabaseUrl, supabaseKey)