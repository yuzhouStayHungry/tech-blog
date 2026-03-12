import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import Link from 'next/link'
import { Calendar, Tag, Clock } from 'lucide-react'

interface Post {
  slug: string
  title: string
  date: string
  excerpt: string
  tags: string[]
  readTime: number
}

async function getPosts(): Promise<Post[]> {
  const postsDirectory = path.join(process.cwd(), 'posts')
  if (!fs.existsSync(postsDirectory)) {
    fs.mkdirSync(postsDirectory, { recursive: true })
    
    // 创建示例文章
    const samplePost = `---
title: "欢迎来到我的技术博客"
date: "2026-03-12"
excerpt: "这是我的第一篇技术文章，介绍一下这个博客的搭建过程。"
tags: ["技术", "博客"]
---

# 欢迎来到我的技术博客

这是一个使用 Next.js 搭建的静态博客，支持 SEO，响应式设计，代码高亮等功能。

## 特性

- ✅ 前后端分离架构
- ✅ 静态生成，SEO 友好
- ✅ 响应式设计，适配各种设备
- ✅ Markdown 写作，代码高亮
- ✅ 分类、标签、搜索功能
- ✅ 评论系统集成

## 技术栈

- 前端：Next.js 15 + Tailwind CSS + TypeScript
- 后端：Go + Gin + SQLite
- 部署：Cloudflare Pages + Docker

希望能在这里分享更多技术干货，欢迎交流！
`
    fs.writeFileSync(path.join(postsDirectory, 'welcome.md'), samplePost)
  }

  const filenames = fs.readdirSync(postsDirectory)
  const posts = filenames
    .filter(filename => filename.endsWith('.md'))
    .map(filename => {
      const slug = filename.replace(/\.md$/, '')
      const fullPath = path.join(postsDirectory, filename)
      const fileContents = fs.readFileSync(fullPath, 'utf8')
      const { data } = matter(fileContents)
      
      // 计算阅读时长（每分钟200字）
      const content = fileContents.replace(/---[\s\S]*?---/, '').trim()
      const words = content.length
      const readTime = Math.ceil(words / 200)

      return {
        slug,
        title: data.title,
        date: data.date,
        excerpt: data.excerpt,
        tags: data.tags || [],
        readTime,
      }
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return posts
}

export default async function Home() {
  const posts = await getPosts()

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <header className="mb-12 text-center">
        <h1 className="text-4xl font-bold mb-4 text-gray-900">我的技术博客</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          分享技术干货，记录成长历程
        </p>
      </header>

      <div className="space-y-8">
        {posts.map(post => (
          <article 
            key={post.slug} 
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            <Link href={`/posts/${post.slug}`} className="block">
              <h2 className="text-2xl font-semibold mb-2 text-gray-900 hover:text-blue-600 transition-colors">
                {post.title}
              </h2>
            </Link>
            
            <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
              <div className="flex items-center gap-1">
                <Calendar size={14} />
                <span>{post.date}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock size={14} />
                <span>{post.readTime} 分钟阅读</span>
              </div>
            </div>

            <p className="text-gray-600 mb-4">{post.excerpt}</p>

            <div className="flex flex-wrap gap-2">
              {post.tags.map(tag => (
                <span 
                  key={tag}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                >
                  <Tag size={12} className="mr-1" />
                  {tag}
                </span>
              ))}
            </div>
          </article>
        ))}
      </div>

      <footer className="mt-16 text-center text-gray-500 text-sm">
        <p>© 2026 我的技术博客 | Powered by Next.js + Go</p>
      </footer>
    </div>
  )
}

export const metadata = {
  title: '我的技术博客 - 分享技术干货',
  description: '一个专注于技术分享的个人博客，涵盖前端、后端、架构、AI等领域',
  keywords: '技术博客,前端开发,后端开发,架构设计,AI,编程',
}
