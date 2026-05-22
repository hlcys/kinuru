# Own Blog

这是一个基于 [Frosti](https://github.com/EveSunMaple/Frosti) 改造的 Astro 静态博客，用来记录自己学习与日常的思考。


## 技术栈

- Astro：静态站点生成
- Frosti：博客主题基础
- Tailwind CSS 与 daisyUI：页面样式和主题
- Pagefind：本地静态搜索
- MDX / Markdown：文章写作

## 常用命令

安装依赖：

```sh
npm install
```

启动开发服务：

```sh
npm run dev
```

构建生产版本：

```sh
npm run build
```

预览构建结果：

```sh
npm run preview
```

生成搜索索引并同步到开发环境：

```sh
npm run search:index
```

## 目录说明

```txt
src/pages/          页面入口，例如首页、关于页、博客列表页
src/content/blog/   博客文章内容
src/components/     页面组件
src/layouts/        页面布局
src/styles/         全局样式
public/             静态资源，例如头像、背景图、站点图标
frosti.config.yaml  站点名称、菜单、头像、社交链接和主题配置
```

## 常见修改位置

首页内容：

```txt
src/pages/index.astro
```

站点标题、菜单、语言、头像和社交链接：

```txt
frosti.config.yaml
```

首页背景图：

```txt
public/home-bg.png
```

头像：

```txt
public/avatar.png
```

博客文章：

```txt
src/content/blog/
```

## 新增文章

在 `src/content/blog/` 下新建一个 Markdown 文件，例如：

```txt
src/content/blog/my-new-post.md
```

文章头部可以参考下面的格式：

```md
---
title: "文章标题"
description: "文章摘要，用于列表页和 SEO。"
pubDate: "May 22 2026"
image: /image/image1.jpg
categories:
  - LLM
tags:
  - Prompt
  - Agent
badge: Pin
---

这里开始写正文。
```

常用字段说明：

| 字段 | 说明 | 是否必填 |
| --- | --- | --- |
| `title` | 文章标题 | 是 |
| `description` | 文章摘要 | 是 |
| `pubDate` | 发布时间 | 是 |
| `image` | 文章封面图 | 否 |
| `categories` | 分类 | 否 |
| `tags` | 标签 | 否 |
| `badge` | 文章徽标，例如 `Pin` | 否 |
| `draft` | 草稿状态，设为 `true` 后不会出现在列表中 | 否 |

## 个性化配置

主要配置都在 `frosti.config.yaml` 中：

```yaml
site:
  tab: Kinuru Blog
  title: Kinuru Blog
  description: 记录 LLM、C/C++、AI infra、Agent、课题研究与日常思考的个人博客。
  language: zh

user:
  name: Kinuru
  avatar: /avatar.png
```

## 构建与发布

运行构建命令后，生成的静态文件会输出到：

```txt
dist/
```

部署时使用 `dist` 目录即可。常见平台包括 Vercel、Netlify、Cloudflare Pages、GitHub Pages 或任意静态网站服务器。

## 主题来源

本项目基于 Frosti 主题改造，保留了响应式布局、明暗主题、博客归档、标签分类、RSS、搜索和 OG 图片生成等能力。

Frosti 原项目地址：

```txt
https://github.com/EveSunMaple/Frosti
```
