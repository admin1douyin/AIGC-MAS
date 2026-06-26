# AIGC-MAS 部署指南

## 🎯 部署概览

AIGC-MAS 平台采用现代化的 BaaS + Serverless 架构：
- **前端**: React 18 + Vite，部署到 Vercel
- **后端**: Node.js + Express，部署到 Vercel Serverless Functions
- **数据库**: PostgreSQL，托管于 Supabase
- **认证**: Supabase Auth
- **存储**: Supabase Storage

## 📋 前置准备

### 1. Supabase 项目设置

1. 登录 [Supabase Dashboard](https://supabase.com)
2. 创建新项目或使用现有项目：`tuutaixcohouimlzuivg`
3. 获取数据库密码（Project Settings > Database）
4. 获取 API Keys（Project Settings > API）:
   - `SUPABASE_URL`: 项目 URL
   - `SUPABASE_ANON_KEY`: 公开密钥
   - `SUPABASE_SERVICE_ROLE_KEY`: 服务端密钥

### 2. Vercel 项目设置

1. 登录 [Vercel Dashboard](https://vercel.com)
2. 创建新项目并连接 GitHub 仓库
3. 获取项目 ID（Project Settings > General）
4. 获取团队 ID（团队设置页面）

### 3. GitHub Secrets 配置

在 GitHub 仓库的 Settings > Secrets and variables > Actions 中配置以下变量：

```bash
# Database
DATABASE_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres"
DIRECT_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres"

# Supabase
SUPABASE_URL="https://[PROJECT-REF].supabase.co"
SUPABASE_SERVICE_ROLE_KEY="[SERVICE-ROLE-KEY]"
SUPABASE_ANON_KEY="[ANON-KEY]"

# Vercel
VERCEL_TOKEN="[VERCEL-TOKEN]"
VERCEL_ORG_ID="[ORG-ID]"
VERCEL_PROJECT_ID="[PROJECT-ID]"
```

## 🚀 部署步骤

### 方法一：自动化部署（推荐）

推送代码到 GitHub，GitHub Actions 会自动触发部署：

```bash
git add .
git commit -m "Deploy AIGC-MAS production"
git push origin master
```

### 方法二：手动部署

#### 1. 安装依赖

```bash
npm install
```

#### 2. 配置环境变量

创建 `.env.production` 文件：

```bash
cp packages/server/.env.example packages/server/.env.production
```

填入实际的 Supabase 配置。

#### 3. 初始化数据库

```bash
# 生成 Prisma Client
npm run db:generate

# 应用数据库迁移
npm run db:migrate:prod

# （可选）填充种子数据
npm run db:seed
```

#### 4. 构建前端

```bash
npm run build:client
```

#### 5. 部署到 Vercel

```bash
vercel --prod
```

## 🔧 Vercel 环境变量配置

在 Vercel 项目设置中添加以下环境变量：

| 变量名 | 说明 | 来源 |
|--------|------|------|
| `DATABASE_URL` | 数据库连接池 URL | Supabase Dashboard |
| `DIRECT_URL` | 数据库直连 URL | Supabase Dashboard |
| `SUPABASE_URL` | Supabase 项目 URL | Supabase Dashboard |
| `SUPABASE_SERVICE_ROLE_KEY` | 服务端密钥 | Supabase Dashboard |
| `SUPABASE_ANON_KEY` | 公开密钥 | Supabase Dashboard |
| `VITE_SUPABASE_URL` | 前端 Supabase URL | 同 SUPABASE_URL |
| `VITE_SUPABASE_ANON_KEY` | 前端密钥 | 同 SUPABASE_ANON_KEY |

## ✅ 部署验证

### 1. 健康检查

访问 `/api/health` 端点验证部署：

```bash
curl https://your-app.vercel.app/api/health
```

预期响应：

```json
{
  "success": true,
  "data": {
    "status": "ok",
    "timestamp": "2026-06-26T...",
    "version": "1.0.0"
  }
}
```

### 2. 前端验证

访问主页，检查以下功能：
- ✅ 登录注册页面加载正常
- ✅ Supabase Auth 可以正常调用
- ✅ 用户可以注册新账号
- ✅ 用户可以登录

### 3. API 验证

测试关键 API 端点：

```bash
# 获取项目列表（需要认证）
curl -H "Authorization: Bearer [TOKEN]" \
  https://your-app.vercel.app/api/projects

# 获取智能体列表
curl https://your-app.vercel.app/api/agents
```

## 🔒 安全加固

### 1. Supabase RLS (Row Level Security)

在 Supabase SQL Editor 中执行：

```sql
-- 启用 RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- 创建安全策略
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = userId);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = userId);

CREATE POLICY "Users can view own projects" ON projects
  FOR SELECT USING (auth.uid() = ownerId);

CREATE POLICY "Users can create projects" ON projects
  FOR INSERT WITH CHECK (auth.uid() = ownerId);
```

### 2. API 路径保护

在 Supabase Dashboard > API Settings 中：
- 配置 `/api/*` 路径需要认证（可选）
- 设置 JWT 过期时间
- 配置 CORS 白名单

### 3. 内容审核

配置 Supabase Edge Functions 进行内容安全审核：
- 检测敏感内容（涉黄、涉暴、涉政）
- 审核用户上传内容
- 记录审核日志

## 📊 监控与维护

### 1. Vercel Analytics

启用 Vercel Analytics 监控：
- 页面访问量
- API 响应时间
- 错误率统计

### 2. Supabase Dashboard

定期检查：
- 数据库连接数
- API 调用量
- 存储使用量

### 3. 日志管理

在 Vercel Dashboard > Logs 中查看：
- Serverless Function 日志
- 错误堆栈信息
- 性能指标

## 🐛 常见问题

### 问题 1: 数据库连接失败

**症状**: `P1001: Can't reach database server`

**解决方案**:
1. 检查 `DATABASE_URL` 和 `DIRECT_URL` 格式是否正确
2. 确认 Supabase 项目状态为 Active
3. 检查数据库密码是否正确

### 问题 2: 认证失败

**症状**: `401 Unauthorized`

**解决方案**:
1. 检查 `SUPABASE_SERVICE_ROLE_KEY` 是否正确
2. 确认 JWT token 未过期
3. 检查 Supabase Auth 设置

### 问题 3: Prisma Client 未生成

**症状**: `Cannot find module '@prisma/client'`

**解决方案**:
```bash
npm run db:generate
npm install
```

### 问题 4: 前端无法访问 API

**症状**: CORS 错误

**解决方案**:
1. 检查 Vercel 环境变量配置
2. 确认 `VITE_SUPABASE_URL` 和 `VITE_SUPABASE_ANON_KEY` 已设置
3. 检查 Supabase CORS 配置

## 📚 参考资料

- [Supabase 文档](https://supabase.com/docs)
- [Vercel 文档](https://vercel.com/docs)
- [Prisma 文档](https://www.prisma.io/docs)
- [AIGC-MAS PRD](./PRD.md)

## 🆘 技术支持

遇到部署问题，请：
1. 查看本文档的常见问题章节
2. 检查 GitHub Actions 日志
3. 查看 Vercel Function Logs
4. 提交 GitHub Issue