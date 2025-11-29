import { BrowserWindow, globalShortcut } from 'electron'

export function registerGlobalShortcuts(getWindow: () => BrowserWindow | null) {
  const registerMany = (accels: string[], handler: () => void) => {
    for (const a of accels) {
      try {
        globalShortcut.register(a, handler)
      } catch (e) {
        console.warn(`[globalShortcut] error registering ${a}`, e)
      }
    }
  }
  const getWin = () => getWindow() || BrowserWindow.getAllWindows()[0] || null
  registerMany(['CommandOrControl+N','CmdOrCtrl+N','Ctrl+N'], () => {
    const win = getWin(); if (win) win.webContents.send('menu:new-conversation')
  })
  registerMany([
    'CommandOrControl+,','CmdOrCtrl+,'
  ], () => {
    const win = getWin(); if (win) win.webContents.send('menu:open-settings')
  })
}

export function unregisterGlobalShortcuts() {
  const keys = [
    'CommandOrControl+N','CmdOrCtrl+N','Ctrl+N',
    'CommandOrControl+,','CmdOrCtrl+,'
  ]
  for (const k of keys) {
    try { globalShortcut.unregister(k) } catch {}
  }
}
