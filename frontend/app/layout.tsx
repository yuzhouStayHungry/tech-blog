import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: '我的技术博客',
    template: '%s - 我的技术博客',
  },
  description: '分享技术干货，记录成长历程',
  keywords: ['技术博客', '前端开发', '后端开发', '架构设计', 'AI', '编程'],
  authors: [{ name: '博主' }],
  creator: '博主',
  openGraph: {
    type: 'website',
    locale: 'zh_CN',
    url: 'https://your-blog-domain.com',
    siteName: '我的技术博客',
    title: '我的技术博客',
    description: '分享技术干货，记录成长历程',
  },
  twitter: {
    card: 'summary_large_image',
    title: '我的技术博客',
    description: '分享技术干货，记录成长历程',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body className={`${inter.className} bg-gray-50 min-h-screen`}>
        {children}
      </body>
    </html>
  )
}
