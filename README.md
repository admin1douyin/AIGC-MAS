# AIGC-MAS 多智能体视频制作平台

> 深度垂直服务于视频制作场景的多智能体服务平台

## 项目简介

AIGC-MAS (AIGC Multi-Agent Service Platform) 是一个基于多智能体协同的视频制作平台，深度垂直服务于三大核心场景：

- **🎬 短剧生产/承制** - AI 驱动的短剧全流程制作，包括剧本创作、分镜设计、配音、剪辑等
- **🏢 企业视频宣传承制** - 企业宣传片、产品视频、营销视频一站式制作服务
- **🏞️ 地方文旅宣传承制** - 文旅宣传片、景点介绍、民俗文化视频制作

## 技术架构

### 技术栈

- **前端**: React 18 + TypeScript + Vite + Tailwind CSS + React Router
- **后端**: Node.js + Express + TypeScript
- **数据库**: SQLite + Prisma ORM
- **架构**: Monorepo (npm workspaces)

### 项目结构

```
AIGC-MAS/
├── packages/
│   ├── shared/          # 共享类型定义
│   ├── server/          # 后端服务
│   │   ├── src/
│   │   │   ├── agents/        # 多智能体引擎
│   │   │   ├── routes/        # API 路由
│   │   │   ├── middleware/    # 中间件
│   │   │   └── lib/           # 工具库
│   │   └── prisma/       # 数据库模型
│   └── client/          # 前端应用
│       └── src/
│           ├── pages/         # 页面组件
│           ├── components/    # 通用组件
│           └── services/      # API 服务
├── package.json
└── README.md
```

## 核心功能

### 多智能体系统

平台内置 10+ 专业角色智能体，协同完成视频制作全流程：

| 智能体角色 | 职责 |
|-----------|------|
| 项目经理 | 项目规划、任务分配、进度跟踪 |
| 编剧 | 剧本创作、角色设计、剧情编排 |
| 分镜师 | 分镜设计、视觉构图、镜头语言 |
| 配音演员 | 旁白配音、角色配音、语音合成 |
| 视频剪辑师 | 视频剪辑、特效制作、后期合成 |
| 营销策划师 | 营销策略、卖点提炼、传播规划 |
| 品牌分析师 | 品牌分析、定位、视觉规范 |
| 文化研究员 | 文化调研、地方特色挖掘 |
| 音乐设计师 | 配乐创作、音效设计 |
| 质量审核员 | 内容审核、质量验收 |

### 三大业务场景

#### 1. 短剧生产
- 智能剧本生成（支持多集数、多题材）
- 角色自动设定与人物弧光设计
- 分镜自动生成
- 配音与音效合成
- 智能剪辑与成片输出

#### 2. 企业视频营销
- 企业品牌深度分析
- 营销策略与卖点提炼
- 专业宣传片脚本撰写
- 企业风格视觉规范
- 多渠道适配输出

#### 3. 文旅宣传
- 地方文化调研与特色挖掘
- 景点亮点提炼与故事化呈现
- 民俗风情展现
- 沉浸式旅行体验营造
- 多季节/多主题版本

## 快速开始

### 环境要求

- Node.js >= 18.x
- npm >= 9.x

### 安装与启动

```bash
# 1. 克隆项目
git clone <repo-url>
cd AIGC-MAS

# 2. 安装依赖
npm install

# 3. 初始化数据库
npm run db:generate
npm run db:push
npm run db:seed

# 4. 启动开发服务器
npm run dev
```

启动后：
- 前端地址: http://localhost:3000
- 后端地址: http://localhost:3001
- API 文档: http://localhost:3001/api/health

### 其他命令

```bash
# 构建生产版本
npm run build

# 启动生产服务器
npm run start

# 数据库操作
npm run db:generate   # 生成 Prisma Client
npm run db:push       # 推送 schema 到数据库
npm run db:seed       # 填充示例数据
npm run db:studio     # 打开 Prisma Studio

# 仅启动后端
npm run dev:server

# 仅启动前端
npm run dev:client
```

## API 概览

### 项目管理
- `GET /api/projects` - 获取项目列表
- `GET /api/projects/:id` - 获取项目详情
- `POST /api/projects` - 创建项目
- `PUT /api/projects/:id` - 更新项目
- `DELETE /api/projects/:id` - 删除项目
- `POST /api/projects/:id/start` - 启动项目
- `POST /api/projects/:id/pause` - 暂停项目
- `POST /api/projects/:id/resume` - 继续项目

### 智能体
- `GET /api/agents` - 获取智能体列表
- `GET /api/agents/:id` - 获取智能体详情
- `GET /api/agents/:id/messages` - 获取智能体消息
- `GET /api/agents/registry/list` - 获取智能体角色列表

### 任务
- `GET /api/tasks` - 获取任务列表
- `GET /api/tasks/:id` - 获取任务详情
- `POST /api/tasks` - 创建任务
- `POST /api/tasks/:id/execute` - 执行任务

### 脚本
- `GET /api/scripts` - 获取脚本列表
- `GET /api/scripts/:id` - 获取脚本详情
- `POST /api/scripts` - 创建脚本
- `PUT /api/scripts/:id` - 更新脚本

### 短剧
- `GET /api/short-drama/:projectId` - 获取短剧详情
- `PUT /api/short-drama/:projectId` - 更新短剧信息
- `POST /api/short-drama/:projectId/generate-script` - 生成短剧脚本

### 企业视频
- `GET /api/corporate/:projectId` - 获取企业视频详情
- `PUT /api/corporate/:projectId` - 更新企业视频信息
- `POST /api/corporate/:projectId/generate-marketing-plan` - 生成营销方案
- `POST /api/corporate/:projectId/generate-script` - 生成企业视频脚本

### 文旅宣传
- `GET /api/tourism/:projectId` - 获取文旅项目详情
- `PUT /api/tourism/:projectId` - 更新文旅项目信息
- `POST /api/tourism/:projectId/generate-script` - 生成文旅宣传片脚本

### 统计数据
- `GET /api/stats/overview` - 获取总览统计
- `GET /api/stats/projects/trend` - 获取项目趋势

## 使用说明

### 创建第一个项目

1. 访问 http://localhost:3000
2. 点击"新建项目"或首页快速开始卡片
3. 选择项目类型（短剧/企业视频/文旅宣传）
4. 填写项目基本信息和详细需求
5. 点击"创建项目"
6. 在项目详情页点击"启动项目"，多智能体将自动开始工作

### 智能体协作流程

项目启动后，智能体将按照流水线依次执行：
1. 项目经理 - 制定项目计划
2. 品牌/文化分析 - 深度调研分析
3. 编剧 - 创作视频脚本
4. 分镜师 - 设计分镜画面
5. 配音演员 - 配音录制
6. 音乐设计 - 配乐音效
7. 视频剪辑 - 剪辑合成
8. 质量审核 - 最终验收

## 开发说明

### 目录规范

- 所有源代码使用 TypeScript 编写
- 遵循严格模式 (`strict: true`)
- 使用 ES 模块语法

### 代码风格

- 2 空格缩进
- 单引号字符串
- 无分号（前端）/ 有分号（后端）
- 组件使用函数式组件 + Hooks

## License

MIT
