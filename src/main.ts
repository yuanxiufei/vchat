// 主进程入口：窗口、菜单、IPC、配置管理、协议注册与图片处理
import { app, BrowserWindow, ipcMain, protocol, Menu, shell,net } from "electron";
import path from "node:path";
import started from "electron-squirrel-startup";
//  引入doenv自动加载env文件
// 加载 .env(.local) 环境变量，供各 Provider 回退读取密钥
import "dotenv/config";
import { runDemo } from "./data/demo";
import { CreateChatProps, updatedStreamData } from "./types/appType";
import fs from 'fs/promises'
import { CreateProvider } from "./providers/CreateProvider";
import url from 'url'
// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}

// 创建主窗口并绑定菜单、IPC 及自定义协议
const createWindow = async () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1024,
    height: 768,
    minWidth: 1024,
    minHeight: 700,
    useContentSize: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  // 应用菜单：常见文件/编辑/视图/窗口/帮助
  const menu = Menu.buildFromTemplate([
    {
      label: '文件',
      submenu: [
        { label: '新建对话', click: () => mainWindow.webContents.send('menu:new-conversation') },
        { type: 'separator' },
        { label: '退出', role: 'quit' },
      ]
    },
    {
      label: '编辑',
      submenu: [
        { label: '撤销', role: 'undo' },
        { label: '重做', role: 'redo' },
        { type: 'separator' },
        { label: '剪切', role: 'cut' },
        { label: '复制', role: 'copy' },
        { label: '粘贴', role: 'paste' },
        { label: '全选', role: 'selectAll' },
      ]
    },
    {
      label: '视图',
      submenu: [
        { label: '重新加载', role: 'reload' },
        { label: '切换开发者工具', role: 'toggleDevTools' },
        { type: 'separator' },
        { label: '全屏', role: 'togglefullscreen' },
      ]
    },
    {
      label: '窗口',
      submenu: [
        { label: '最小化', role: 'minimize' },
        { label: '关闭', role: 'close' },
      ]
    },
    {
      label: '帮助',
      submenu: [
        { label: '官方网站', click: () => shell.openExternal('https://electronjs.org') },
      ]
    },
  ])
  Menu.setApplicationMenu(menu)

  mainWindow.on('enter-full-screen', () => {
    mainWindow.webContents.send('window:fullscreen', true)
  })
  mainWindow.on('leave-full-screen', () => {
    mainWindow.webContents.send('window:fullscreen', false)
  })

  ipcMain.handle('window:set-fullscreen', (_e, flag: boolean) => {
    mainWindow.setFullScreen(!!flag)
    return mainWindow.isFullScreen()
  })
  ipcMain.handle('window:is-fullscreen', () => {
    return mainWindow.isFullScreen()
  })
  ipcMain.handle('window:toggle-fullscreen', () => {
    mainWindow.setFullScreen(!mainWindow.isFullScreen())
    return mainWindow.isFullScreen()
  })

  // 抓取远端图片并返回 data URL，供渲染端预览
  ipcMain.handle('image:fetch-data-url', async (_e, url: string) => {
    const res = await fetch(url)
    if (!res.ok) throw new Error(`Fetch failed: ${res.status}`)
    const buf = Buffer.from(await res.arrayBuffer())
    const ct = res.headers.get('content-type') || 'image/png'
    return `data:${ct};base64,${buf.toString('base64')}`
  })

  // 配置文件：模板位于仓库 src/utils/config.json；用户配置位于系统用户目录
  const appRoot = app.getAppPath()
  const cfgSrcPath = path.join(appRoot, 'src', 'utils', 'config.json')
  const cfgPath = path.join(app.getPath('userData'), 'config.json')
  type ProviderCfg = { apiKey?: string; baseUrl?: string; accessKey?: string; secretKey?: string }
  type AppCfg = { language: string; fontSize: number; providers: { dashscope?: ProviderCfg; qianfan?: ProviderCfg; openai?: ProviderCfg; deepseek?: ProviderCfg; claude?: ProviderCfg } }
  const defaults: AppCfg = { language: 'zh-CN', fontSize: 14, providers: {} }
  // 读取并合并模板配置与用户配置（用户优先）
  async function readCfg(): Promise<AppCfg> {
    let srcConf: Partial<AppCfg> = {}
    let userConf: Partial<AppCfg> = {}
    try {
      const buf = await fs.readFile(cfgSrcPath)
      const json = JSON.parse(buf.toString())
      srcConf = {
        language: json.language,
        fontSize: json.fontSize,
        providers: { ...(json.providers || {}) } as any,
      }
    } catch {}
    try {
      const buf = await fs.readFile(cfgPath)
      const json = JSON.parse(buf.toString())
      userConf = {
        language: json.language,
        fontSize: json.fontSize,
        providers: { ...(json.providers || {}) } as any,
      }
    } catch {}
    const srcProviders: any = (srcConf as any).providers || {}
    const userProviders: any = (userConf as any).providers || {}
    const mergedProviders: any = {}
    const keys = new Set<string>([...Object.keys(srcProviders), ...Object.keys(userProviders)])
    keys.forEach((k)=>{
      const u = userProviders[k]
      const s = srcProviders[k]
      if (u && typeof u === 'object' && Object.keys(u).length > 0) {
        mergedProviders[k] = u
      } else if (s && typeof s === 'object' && Object.keys(s).length > 0) {
        mergedProviders[k] = s
      }
    })
    const merged: AppCfg = {
      language: (userConf.language ?? srcConf.language ?? defaults.language) as any,
      fontSize: Number(userConf.fontSize ?? srcConf.fontSize ?? defaults.fontSize),
      providers: mergedProviders,
    }
    try {
      const needMigrate = (!userConf.providers || Object.keys(userConf.providers || {}).length === 0) && Object.keys(srcProviders || {}).length > 0
      if (needMigrate) {
        await fs.mkdir(path.dirname(cfgPath), { recursive: true })
        await fs.writeFile(cfgPath, Buffer.from(JSON.stringify(merged)))
      }
    } catch {}
    return merged
  }
  // 写入用户配置，并将模板中的敏感字段脱敏后写回（避免入库泄露）
  async function writeCfg(cfg: AppCfg) {
    await fs.mkdir(path.dirname(cfgPath), { recursive: true })
    await fs.writeFile(cfgPath, Buffer.from(JSON.stringify(cfg)))
    try {
      const safe: any = { ...cfg, providers: { ...(cfg.providers as any) } }
      Object.keys(safe.providers || {}).forEach((k) => {
        const v = safe.providers[k] || {}
        if (v && typeof v === 'object') {
          if ('accessKey' in v) v.accessKey = ''
          if ('secretKey' in v) v.secretKey = ''
          if ('apiKey' in v) v.apiKey = ''
        }
      })
      await fs.mkdir(path.dirname(cfgSrcPath), { recursive: true })
      await fs.writeFile(cfgSrcPath, Buffer.from(JSON.stringify(safe)))
    } catch {}
  }
  // 渲染端获取配置
  ipcMain.handle('config:get', async () => {
    return await readCfg()
  })
  // 渲染端更新配置并广播变更事件
  ipcMain.handle('config:set', async (_e, patch: Partial<AppCfg>) => {
    const cur = await readCfg()
    const next: AppCfg = {
      language: patch.language || cur.language,
      fontSize: Number(patch.fontSize ?? cur.fontSize),
      providers: { ...cur.providers, ...(patch.providers || {}) },
    }
    await writeCfg(next)
    mainWindow.webContents.send('config:updated', next)
    return next
  })

  ipcMain.handle('open-external', async (_e, url: string) => {
    await shell.openExternal(url)
    return true
  })

  // 注册自定义文件协议：用于让 <img src="safe-file://..."> 能直接读取本地文件。
  // 注意：<img> 等资源加载不会走 protocol.handle 的 Fetch 路径，必须使用 registerFileProtocol。
  // 同时在开发模式下主进程可能热重载，多次注册会报错，因此先检查是否已注册。
  // 注册 safe-file 协议：允许 <img src="safe-file://"> 读取本地文件
  try {
    const handled = protocol.isProtocolHandled('safe-file')
    if (!handled) {
      protocol.handle('safe-file', async (request) => {
        // request.url 形如 safe-file://C%3A%5CUsers%5C...
        // 去掉协议前缀并做 URL 解码，得到真实磁盘路径
        const filePath = decodeURIComponent(request.url.replace(/^safe-file:\/\//, ''))
        const newFilePath = url.pathToFileURL(filePath).toString()
        return net.fetch(newFilePath)
      })
    }
  } catch (e) {
    console.error('safe-file protocol registration failed', e)
  }

  // 注册 safe-image 协议：代理远端图片请求并返回二进制响应
  try {
    const handledImg = protocol.isProtocolHandled('safe-image')
    if (!handledImg) {
      protocol.handle('safe-image', async (request) => {
        const encoded = request.url.replace(/^safe-image:\/\//, '')
        const target = decodeURIComponent(encoded)
        const res = await fetch(target)
        const buf = Buffer.from(await res.arrayBuffer())
        return new Response(buf as BodyInit, {
          status: res.status,
          headers: { 'Content-Type': res.headers.get('content-type') || 'image/png' }
        })
      })
    }
  } catch (e) {
    console.error('safe-image protocol registration failed', e)
  }
  // 复制图片到用户目录（支持两种来源：本地路径 / data URL）
  // 复制图片到用户数据目录：支持 file://、data URL、本地文件路径
  ipcMain.handle('copy-image-to-user-dir', async (event, imagePath: string) => {
    const userDir = app.getPath('userData')
    const imagesDir = path.join(userDir, 'images')
    await fs.mkdir(imagesDir, { recursive: true })
    // 1) 清洗 file:// 前缀（渲染端可能传入 file 协议地址）
    if (imagePath.startsWith('file://')) imagePath = imagePath.replace(/^file:\/\//, '')
    // 2) 处理 data URL（有时字符串中夹杂非 URL 前缀，截到 data: 开始）
    const dataIdx = imagePath.indexOf('data:')
    if (dataIdx >= 0) {
      const dataUrl = imagePath.slice(dataIdx)
      const match = dataUrl.match(/^data:(.+?);base64,(.*)$/)
      if (!match) throw new Error('Invalid data URL')
      const mime = match[1]
      const base64 = match[2]
      const ext = (mime.split('/')[1] || 'png').toLowerCase()
      const fileName = `img_${Date.now()}.${ext}`
      const destPath = path.join(imagesDir, fileName)
      await fs.writeFile(destPath, Buffer.from(base64, 'base64'))
      return destPath
    }
    // 3) 普通文件路径：直接复制到用户目录
    const fileName = path.basename(imagePath)
    const destPath = path.join(imagesDir, fileName)
    await fs.copyFile(imagePath, destPath)
    return destPath
  })
  // 开始对话
  ipcMain.on("start-chat", async (event, data: CreateChatProps) => {
    const { providerName, messages, messageId, selectedModel } = data
    try {
      const cfg = await readCfg()
      const opts = (cfg.providers as any)?.[providerName] || {}
      const provider = CreateProvider(providerName, opts)
      const stream = await provider.chat(messages, selectedModel)
      for await (const chunk of stream as any) {
        const content: updatedStreamData = { messageId, data: chunk }
        mainWindow.webContents.send("update-message", content)
      }
    } catch (err: any) {
      const content: updatedStreamData = {
        messageId,
        data: { is_end: true, result: String(err?.message || err) }
      }
      mainWindow.webContents.send("update-message", content)
    }
  })
  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`)
    );
  }

  mainWindow.webContents.openDevTools();
  await runDemo();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
