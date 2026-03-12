package main

import (
	"net/http"
	"os"
	"path/filepath"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

// 模型定义
type Post struct {
	gorm.Model
	Title     string    `json:"title" gorm:"not null"`
	Slug      string    `json:"slug" gorm:"unique;not null"`
	Content   string    `json:"content" gorm:"not null"`
	Excerpt   string    `json:"excerpt"`
	Tags      string    `json:"tags"` // 逗号分隔的标签
	Published bool      `json:"published" gorm:"default:true"`
	PubDate   time.Time `json:"pub_date"`
}

type User struct {
	gorm.Model
	Username string `json:"username" gorm:"unique;not null"`
	Password string `json:"password" gorm:"not null"`
	Email    string `json:"email"`
}

var db *gorm.DB

func initDB() {
	var err error
	db, err = gorm.Open(sqlite.Open("blog.db"), &gorm.Config{})
	if err != nil {
		panic("failed to connect database")
	}

	// 自动迁移表结构
	db.AutoMigrate(&Post{}, &User{})

	// 创建默认管理员用户
	var count int64
	db.Model(&User{}).Count(&count)
	if count == 0 {
		db.Create(&User{
			Username: "admin",
			Password: "admin123", // 生产环境请修改！
			Email:    "admin@example.com",
		})
	}
}

// 中间件：CORS
func CORSMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	}
}

// 文章列表接口
func getPosts(c *gin.Context) {
	var posts []Post
	db.Order("pub_date desc").Find(&posts)
	c.JSON(http.StatusOK, gin.H{"data": posts})
}

// 单篇文章接口
func getPost(c *gin.Context) {
	slug := c.Param("slug")
	var post Post
	if err := db.Where("slug = ?", slug).First(&post).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Post not found"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": post})
}

// 创建文章接口
func createPost(c *gin.Context) {
	var post Post
	if err := c.ShouldBindJSON(&post); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if post.PubDate.IsZero() {
		post.PubDate = time.Now()
	}

	if err := db.Create(&post).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// 生成 Markdown 文件用于静态站点生成
	generatePostMD(post)

	c.JSON(http.StatusCreated, gin.H{"data": post})
}

// 更新文章接口
func updatePost(c *gin.Context) {
	id := c.Param("id")
	var post Post
	if err := db.Where("id = ?", id).First(&post).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Post not found"})
		return
	}

	if err := c.ShouldBindJSON(&post); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := db.Save(&post).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// 更新 Markdown 文件
	generatePostMD(post)

	c.JSON(http.StatusOK, gin.H{"data": post})
}

// 删除文章接口
func deletePost(c *gin.Context) {
	id := c.Param("id")
	var post Post
	if err := db.Where("id = ?", id).First(&post).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Post not found"})
		return
	}

	if err := db.Delete(&post).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// 删除 Markdown 文件
	removePostMD(post.Slug)

	c.JSON(http.StatusOK, gin.H{"message": "Post deleted successfully"})
}

// 生成 Markdown 文件到前端 posts 目录
func generatePostMD(post Post) {
	frontmatter := `---
title: "` + post.Title + `"
date: "` + post.PubDate.Format("2006-01-02") + `"
excerpt: "` + post.Excerpt + `"
tags: [` + post.Tags + `]
---

` + post.Content

	// 确保 posts 目录存在
	postsDir := filepath.Join("..", "frontend", "posts")
	os.MkdirAll(postsDir, 0755)

	// 写入文件
	err := os.WriteFile(filepath.Join(postsDir, post.Slug+".md"), []byte(frontmatter), 0644)
	if err != nil {
		println("Error generating markdown file:", err.Error())
	}
}

// 删除 Markdown 文件
func removePostMD(slug string) {
	path := filepath.Join("..", "frontend", "posts", slug+".md")
	os.Remove(path)
}

// 登录接口
func login(c *gin.Context) {
	var loginData struct {
		Username string `json:"username" binding:"required"`
		Password string `json:"password" binding:"required"`
	}

	if err := c.ShouldBindJSON(&loginData); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var user User
	if err := db.Where("username = ? AND password = ?", loginData.Username, loginData.Password).First(&user).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		return
	}

	// 简单的 token 生成，生产环境请使用 JWT
	token := "dummy-token-" + time.Now().String()
	c.JSON(http.StatusOK, gin.H{"token": token, "user": user})
}

func main() {
	initDB()

	r := gin.Default()
	r.Use(CORSMiddleware())

	// 公开接口
	r.GET("/api/posts", getPosts)
	r.GET("/api/posts/:slug", getPost)
	r.POST("/api/login", login)

	// 管理接口（实际应用中需要加认证中间件）
	admin := r.Group("/api/admin")
	{
		admin.POST("/posts", createPost)
		admin.PUT("/posts/:id", updatePost)
		admin.DELETE("/posts/:id", deletePost)
	}

	// 静态文件服务（管理后台）
	r.Static("/admin", "./admin")

	println("Server starting on :8080")
	r.Run(":8080")
}
