## Vue3.5+Electron+大模型 跨平台AI桌面聊天应用 

本软件名称：智聊（跨平台 AI 桌面聊天应用）

### 技术栈

**渲染进程**
- Vue3.5
- Vite
- Pinia
- Vue Router
- TypeScript
- Tailwind CSS
- Radix Vue
- VueI18n
- Deixe.js



**主进程**
- Electron 30+
- Electron Forge

**大模型**
- OpenAI 标准
- DeepSeek
- 文心一言
- 通义千问

**安装依赖**
- pnpm install
- pnpm install electron --force  如果electron有问题请用此命令



## 运行环境版本

- Node：20.10.x（已在 `.nvmrc` / `.node-version` 指定，`package.json` engines 为 `>=20.10 <21`）
- pnpm：9.x（`package.json` `packageManager` 指定为 `pnpm@9.12.3`）
- 使用 nvm 切换版本：
  - `nvm install 20.10.0`
  - `nvm use 20.10.0`
- 校验版本匹配：
  - `node -v` → v20.10.0
  - `pnpm -v` → 9.x
## Electron 安装与启动问题排查

如果启动项目时提示 Electron 未正确安装，请按以下步骤操作：

1. 使用 PowerShell 删除 electron 文件夹并重新安装 electron：

```powershell
Remove-Item -Recurse -Force node_modules\electron; npm install electron --save-dev
```

2. 重新启动项目：

```powershell
npm run start
```

3. 启动日志如未出现 Electron 报错且本地开发服务器已启动，可通过 http://localhost:5173/ 访问预览页面。

4. 若终端日志仅有 devtools Autofill 相关警告，无需处理，不影响主应用功能。

## 项目结构与作用

- `src/` 主代码目录
- `src/main.ts` Electron 主进程入口，窗口/菜单/IPC、配置读写、协议注册
- `src/preload.ts` 预加载脚本，暴露 `electronAPI` 给渲染进程
- `src/renderer.ts` 渲染进程入口
- `src/App.vue` 应用根组件
- `src/views/` 页面组件：`Home.vue`、`Settings.vue`、`Conversation.vue`
- `src/components/` 通用组件：输入框、消息列表、模型选择等
- `src/router/` 路由配置
- `src/stores/` Pinia 状态：对话与消息
- `src/providers/` 模型提供器封装：`OpenAIProvider`、`DeepSeekProvider`、`ClaudeProvider`、`QianfanProvider`，以及 `CreateProvider` 工厂
- `src/data/` 示例与数据库代码（如 `demo.ts`、`db.ts`）
- `src/utils/config.json` 配置模板（脱敏），用户真实配置写入系统用户目录
- `src/locales/` 多语言文案（`zh-CN.json`、`en-US.json`）
- `src/styles/` 全局样式与 Tailwind 入口
- `vite.*.config.ts` 多入口构建配置（主进程/预加载/渲染）
- `forge.config.ts` Electron Forge 配置
- `tailwind.config.js` Tailwind 配置
- `.gitignore` Git 忽略规则
- `.env.example` 环境变量示例，占位所有模型密钥

## 密钥管理与安全

- 建议通过环境变量或设置页管理各模型密钥，避免将密钥写入仓库。
- 环境变量方式：复制 `.env.example` 为 `.env.local` 并填写相应值；主进程已启用 `dotenv` 自动加载。
- 支持变量：`OPENAI_API_KEY`、`OPENAI_API_BASE_URL`、`DEEPSEEK_API_KEY`、`DEEPSEEK_API_BASE_URL`、`CLAUDE_API_KEY`、`CLAUDE_API_BASE_URL`、`QIANFAN_ACCESS_KEY`、`QIANFAN_SECRET_KEY`、`ALI_API_KEY`、`ALI_API_BASE_URL`。
- 设置页方式：密钥保存在系统用户目录 `config.json`，模板 `src/utils/config.json` 始终脱敏。
- `.gitignore` 已忽略 `.env.local`/`.env.*.local` 等文件，避免敏感信息入库。

## 版权与许可

- 本仓库为专有软件，版权归属作者所有，保留所有权利。
- 未经作者书面授权，禁止复制、分发、公开传播、二次打包或商用使用。
- 未经作者书面授权，禁止修改本仓库代码并提交到公开或私有仓库。
- 如需获得授权或商业合作，请联系作者邮箱 `2496943860@qq.com` 或微信 `f7148715`。

## 贡献指南

- 本仓库不接受未经授权的贡献。未经书面许可的 PR/Issue 将被直接关闭。
- 获得授权后：
- 遵循代码风格与目录约定，避免泄露任何密钥或机密信息。
- 提交前需通过本地构建与基本自测，确保功能正常。

## 联系与加群

- 请扫码联系作者加入技术交流群：

<img src="src/styles/images/weixin/weixin.jpg" alt="微信二维码" width="200" />

## 密钥管理与安全

- 建议通过环境变量或设置页管理各模型的密钥，避免将密钥写入仓库。
- 环境变量方式：复制 `.env.example` 为 `.env.local` 并填写相应值；主进程已启用 `dotenv` 自动加载。
- 支持变量：`OPENAI_API_KEY`、`OPENAI_API_BASE_URL`、`DEEPSEEK_API_KEY`、`DEEPSEEK_API_BASE_URL`、`CLAUDE_API_KEY`、`CLAUDE_API_BASE_URL`、`QIANFAN_ACCESS_KEY`、`QIANFAN_SECRET_KEY`、`ALI_API_KEY`、`ALI_API_BASE_URL`。
- 设置页方式：密钥会保存在系统用户目录下的 `config.json`，并不会写入仓库；模板 `src/utils/config.json` 始终保持无敏感信息。
- 仓库已忽略 `.env.local`/`.env.*.local` 等文件，避免敏感信息入库。


