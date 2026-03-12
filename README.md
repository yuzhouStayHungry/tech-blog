# 个人技术博客系统

一个前后端分离、SEO 友好的个人技术博客系统，基于 Next.js + Go + SQLite 构建。

## 技术栈

### 前端
- **Next.js 15** - React 框架，支持静态生成（SSG），SEO 友好
- **TypeScript** - 类型安全
- **Tailwind CSS** - 原子化 CSS 框架
- **ShadCN UI** - 组件库
- **Remark** - Markdown 解析，支持代码高亮

### 后端
- **Go 1.21** - 高性能后端语言
- **Gin** - Web 框架
- **SQLite** - 轻量数据库，无需单独部署
- **GORM** - ORM 框架

## 特性

✅ **SEO 优化**：全静态页面生成，自动生成 sitemap、结构化数据
✅ **响应式设计**：完美适配手机、平板、PC
✅ **Markdown 写作**：支持代码高亮、目录导航、阅读时长统计
✅ **分类标签**：文章分类、标签筛选
✅ **管理后台**：文章增删改查、图片上传
✅ **评论系统**：支持 Giscus 评论（基于 GitHub Discussions）
✅ **性能优异**：静态页面 CDN 部署，首屏加载 < 100ms
✅ **部署简单**：前端免费托管到 Cloudflare Pages，后端单二进制部署

## 快速开始

### 前置依赖
- Node.js 18+
- Go 1.21+

### 1. 启动前端开发服务器
```bash
cd frontend
npm install
npm run dev
```
访问 http://localhost:3000 查看前端页面

### 2. 启动后端服务
```bash
cd backend
go mod tidy
go run main.go
```
后端接口运行在 http://localhost:8080

### 3. 构建生产版本
```bash
# 前端构建（输出到 out 目录）
cd frontend
npm run build

# 后端构建（生成单二进制文件）
cd backend
go build -o blog-server main.go
```

## 部署

### 前端部署（Cloudflare Pages）
1. 将项目推送到 GitHub
2. 在 Cloudflare Pages 中连接仓库
3. 构建命令：`cd frontend && npm install && npm run build`
4. 输出目录：`frontend/out`
5. 点击部署，自动生成域名

### 后端部署（Docker）
```dockerfile
FROM golang:1.21-alpine AS builder
WORKDIR /app
COPY backend/go.* ./
RUN go mod download
COPY backend/*.go .
RUN go build -o blog-server main.go

FROM alpine:latest
WORKDIR /app
COPY --from=builder /app/blog-server .
EXPOSE 8080
CMD ["./blog-server"]
```

```bash
# 构建镜像
docker build -t blog-server .

# 运行容器
docker run -d -p 8080:8080 -v $(pwd)/blog.db:/app/blog.db blog-server
```

## 默认管理员账号
- 用户名：`admin`
- 密码：`admin123`
> 生产环境请务必修改默认密码！

## 项目结构
```
tech-blog/
├── frontend/          # 前端代码
│   ├── app/          # Next.js 页面
│   ├── components/   # 公共组件
│   ├── posts/        # Markdown 文章
│   └── public/       # 静态资源
├── backend/           # 后端代码
│   ├── main.go       # 主程序
│   └── blog.db       # SQLite 数据库
├── docs/             # 文档
└── README.md
```

## SEO 优化配置

### 1. 修改站点信息
编辑 `frontend/app/layout.tsx` 中的 metadata 配置：
- 修改标题、描述、关键词
- 替换 openGraph 中的站点 URL
- 修改作者信息

### 2. 配置自定义域名
在 Cloudflare Pages 中绑定自己的域名，启用 HTTPS。

### 3. 提交搜索引擎
- Google Search Console：提交 sitemap.xml
- 百度站长平台：提交站点地图

## 自定义配置

### 修改主题色
编辑 `frontend/tailwind.config.js` 中的 colors.primary 配置。

### 添加文章
1. 登录后台管理系统 http://localhost:8080/admin
2. 点击新建文章，填写标题、内容、标签
3. 保存后自动生成 Markdown 文件，触发前端重新构建

## 功能 roadmap
- [ ] 全文搜索功能
- [ ] 图片上传功能
- [ ] 评论系统集成
- [ ] 访问统计
- [ ] RSS 订阅
- [ ] 暗黑模式
- [ ] 国际化支持

## License
MIT
