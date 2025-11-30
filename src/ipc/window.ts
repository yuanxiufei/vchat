import { app, BrowserWindow, ipcMain, protocol, shell, net } from 'electron'
import path from 'node:path'
import url from 'url'
import { buildAppMenu } from '../menu/appMenu'
import { registerGlobalShortcuts } from '../menu/globalShortcuts'
import { CreateProvider } from '../providers/CreateProvider'
import { readCfg, writeCfg, AppCfg } from './config'
import { CreateChatProps, updatedStreamData } from '../types/appType'
import { isModelSupported, pickFallbackModel, hasImage, supportsImage } from './support'

export const createWindow = async () => {
  const mainWindow = new BrowserWindow({
    width: 1024,
    height: 768,
    minWidth: 1024,
    minHeight: 700,
    useContentSize: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  })

  const initialCfg = await readCfg()
  buildAppMenu(mainWindow, initialCfg.language as any)
  registerGlobalShortcuts(() => (mainWindow?.isDestroyed() ? null : mainWindow))

  mainWindow.webContents.on('before-input-event', (event, input) => {
    const isCmdCtrl = !!input.control || !!input.meta
    if (isCmdCtrl && input.key && input.key.toLowerCase() === 'n') {
      mainWindow.webContents.send('menu:new-conversation')
      event.preventDefault()
    }
    if (isCmdCtrl && (input.key === ',' || input.code === 'Comma')) {
      mainWindow.webContents.send('menu:open-settings')
      event.preventDefault()
    }
  })

  mainWindow.webContents.on('did-fail-load', (_e, errorCode, errorDescription, validatedURL) => {
    console.error('[did-fail-load]', { errorCode, errorDescription, validatedURL })
  })
  mainWindow.webContents.on('render-process-gone', (_e, details) => {
    console.error('[render-process-gone]', details)
  })
  mainWindow.on('unresponsive', () => {
    console.error('[window-unresponsive]')
  })

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

  ipcMain.handle('image:fetch-data-url', async (_e, urlStr: string) => {
    const res = await fetch(urlStr)
    if (!res.ok) throw new Error(`Fetch failed: ${res.status}`)
    const buf = Buffer.from(await res.arrayBuffer())
    const ct = res.headers.get('content-type') || 'image/png'
    return `data:${ct};base64,${buf.toString('base64')}`
  })

  ipcMain.handle('config:get', async () => {
    return await readCfg()
  })
  ipcMain.handle('config:set', async (_e, patch: Partial<AppCfg>) => {
    const cur = await readCfg()
    const next: AppCfg = {
      language: patch.language ?? cur.language,
      fontSize: Number(patch.fontSize ?? cur.fontSize),
      providers: (patch.providers !== undefined ? (patch.providers as any) : cur.providers) as any,
    }
    await writeCfg(next)
    buildAppMenu(mainWindow, next.language as any)
    mainWindow.webContents.send('config:updated', next)
    return next
  })

  ipcMain.handle('open-external', async (_e, urlStr: string) => {
    await shell.openExternal(urlStr)
    return true
  })

  try {
    const handled = protocol.isProtocolHandled('safe-file')
    if (!handled) {
      protocol.handle('safe-file', async (request) => {
        const filePath = decodeURIComponent(request.url.replace(/^safe-file:\/\//, ''))
        const newFilePath = url.pathToFileURL(filePath).toString()
        return net.fetch(newFilePath)
      })
    }
  } catch (e) {
    console.error('safe-file protocol registration failed', e)
  }

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

  ipcMain.handle('copy-image-to-user-dir', async (_event, imagePath: string) => {
    const userDir = app.getPath('userData')
    const imagesDir = path.join(userDir, 'images')
    await fs.mkdir(imagesDir, { recursive: true })
    if (imagePath.startsWith('file://')) imagePath = imagePath.replace(/^file:\/\//, '')
    const dataIdx = imagePath.indexOf('data:')
    if (dataIdx >= 0) {
      const dataUrl = imagePath.slice(dataIdx)
      const match = dataUrl.match(/^data:(.+?);base64,(.*)$/)
      if (!match) throw new Error('Invalid data URL')
      const mime = match[1]
      const base64 = match[2]
      let ext = (mime.split('/')[1] || 'png').toLowerCase()
      // 规范化常见 MIME 到文件扩展名，避免生成 .x-icon 等无法识别的扩展
      if (mime === 'image/x-icon' || mime === 'image/vnd.microsoft.icon') ext = 'ico'
      else if (mime === 'image/jpeg') ext = 'jpg'
      else if (mime === 'image/png') ext = 'png'
      else if (mime === 'image/webp') ext = 'webp'
      const fileName = `img_${Date.now()}.${ext}`
      const destPath = path.join(imagesDir, fileName)
      await fs.writeFile(destPath, Buffer.from(base64, 'base64'))
      return destPath
    }
    const fileName = path.basename(imagePath)
    const destPath = path.join(imagesDir, fileName)
    await fs.copyFile(imagePath, destPath)
    return destPath
  })

  ipcMain.on('start-chat', async (_event, data: CreateChatProps) => {
    const { providerName, messages, messageId, selectedModel } = data
    try {
      const cfg = await readCfg()
      const opts = (cfg.providers as any)?.[providerName] || {}
      let model = selectedModel
      let preNote = ''
      if (!isModelSupported(cfg, providerName, selectedModel)) {
        const fb = pickFallbackModel(cfg, providerName)
        if (fb) {
          model = fb
          preNote = `当前模型不受支持，已切换为 ${fb}。\n`
        } else {
          const content: updatedStreamData = { messageId, data: { is_end: true, result: '当前提供器未配置可用模型' } };
          mainWindow.webContents.send('update-message', content)
          return
        }
      }
      if (hasImage(messages) && !supportsImage(providerName, model)) {
        const content: updatedStreamData = { messageId, data: { is_end: true, result: '当前模型不支持图片解析' } };
        mainWindow.webContents.send('update-message', content)
        return
      }
      const provider = CreateProvider(providerName, opts)
      const stream = await provider.chat(messages, model)
      if (preNote) {
        const content: updatedStreamData = { messageId, data: { is_end: false, result: preNote } };
        mainWindow.webContents.send('update-message', content)
      }
      for await (const chunk of stream as any) {
        const content: updatedStreamData = { messageId, data: chunk }
        mainWindow.webContents.send('update-message', content)
      }
    } catch (err: any) {
      const content: updatedStreamData = { messageId, data: { is_end: true, result: String(err?.message || err) } }
      mainWindow.webContents.send('update-message', content)
    }
  })

  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL)
  } else {
    mainWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`))
  }

  if (!app.isPackaged) {
    mainWindow.webContents.openDevTools()
  }
}

import fs from 'fs/promises'
