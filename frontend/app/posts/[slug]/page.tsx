import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { remark } from 'remark'
import html from 'remark-html'
import prism from 'remark-prism'
import { Calendar, Tag, Clock, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import 'prismjs/themes/prism-tomorrow.css'

interface Post {
  title: string
  date: string
  excerpt: string
  tags: string[]
  readTime: number
  content: string
}

async function getPost(slug: string): Promise<Post> {
  const postsDirectory = path.join(process.cwd(), 'posts')
  console.log('Reading post from:', path.join(postsDirectory, `${slug}.md`))
  const fullPath = path.join(postsDirectory, `${slug}.md`)
  const fileContents = fs.readFileSync(fullPath, 'utf8')
  const { data, content } = matter(fileContents)

  // 处理 Markdown 为 HTML
  const processedContent = await remark()
    .use(html, { sanitize: false })
    .use(prism)
    .process(content)
  const contentHtml = processedContent.toString()

  // 计算阅读时长
  const words = content.length
  const readTime = Math.ceil(words / 200)

  return {
    title: data.title,
    date: data.date,
    excerpt: data.excerpt,
    tags: data.tags || [],
    readTime,
    content: contentHtml,
  }
}

export async function generateStaticParams() {
  const postsDirectory = path.join(process.cwd(), 'posts')
  if (!fs.existsSync(postsDirectory)) {
    fs.mkdirSync(postsDirectory, { recursive: true })
    // 创建示例文件
    const samplePost = `---
title: "欢迎来到我的技术博客"
date: "2026-03-12"
excerpt: "这是我的第一篇技术文章，介绍一下这个博客的搭建过程。"
tags: ["技术", "博客"]
---

# 欢迎来到我的技术博客
`
    fs.writeFileSync(path.join(postsDirectory, 'welcome.md'), samplePost)
  }
  
  const filenames = fs.readdirSync(postsDirectory)
  return filenames
    .filter(filename => filename.endsWith('.md'))
    .map(filename => ({
      slug: filename.replace(/\.md$/, ''),
    }))
}

export default async function PostPage(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params
  const post = await getPost(params.slug)

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <nav className="mb-8">
        <Link 
          href="/" 
          className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors"
        >
          <ArrowLeft size={16} className="mr-2" />
          返回首页
        </Link>
      </nav>

      <article className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold mb-4 text-gray-900">{post.title}</h1>
          
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-4">
            <div className="flex items-center gap-1">
              <Calendar size={14} />
              <span>{post.date}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock size={14} />
              <span>{post.readTime} 分钟阅读</span>
            </div>
          </div>

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
        </header>

        <div 
          className="prose prose-blue max-w-none"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* 评论区 */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <h3 className="text-xl font-semibold mb-4">评论</h3>
          <div className="bg-gray-50 rounded-lg p-4 text-center text-gray-500">
            评论系统开发中，敬请期待...
          </div>
        </div>
      </article>
    </div>
  )
}

export async function generateMetadata(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params
  const post = await getPost(params.slug)
  return {
    title: `${post.title} - 我的技术博客`,
    description: post.excerpt,
    keywords: post.tags.join(', '),
  }
}
