## Vue3.5+Electron+大模型 跨平台AI桌面聊天应用实战 

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


