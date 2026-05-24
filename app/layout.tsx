import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
// 🔑 修正這行：用相對路徑直接走出去抓妳 components 資料夾裡的那顆主題水晶！
import { ThemeProvider } from "../components/theme-provider"
import './globals.css'
import "@/lib/i18n";

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'GoalFlow - AI-Powered Goal Management',
  description: 'Finish big goals without burning yourself out. AI-powered productivity with energy management and a sarcastic coach.',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    // 🌟 關鍵修正：強制關閉 Next.js 水合警告，預防黑白主題切換時時間差閃爍錯誤
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased">
        {/* 🎯 核心改造：用 ThemeProvider 完整包覆全站 children */}
        {/* attribute="class" 就是讓 HTML 亮起 class="light" 或 class="dark" 的神奇開關 */}
        {/* defaultTheme="dark" 確保沒設定過的人一進來維持妳們酷酷的極致暗黑風 */}
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          {children}
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}