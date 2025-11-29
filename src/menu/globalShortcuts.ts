import { BrowserWindow, globalShortcut } from 'electron'

export function registerGlobalShortcuts(getWindow: () => BrowserWindow | null) {
  const registerMany = (accels: string[], handler: () => void) => {
    for (const a of accels) {
      try {
        const ok = globalShortcut.register(a, handler)
        if (!ok) console.warn(`[globalShortcut] register failed: ${a}`)
      } catch (e) {
        console.warn(`[globalShortcut] error registering ${a}`, e)
      }
    }
  }
  const getWin = () => getWindow() || BrowserWindow.getAllWindows()[0] || null
  registerMany(['CommandOrControl+N','CmdOrCtrl+N','Control+N','Ctrl+N','Cmd+N'], () => {
    const win = getWin(); if (win) win.webContents.send('menu:new-conversation')
  })
  registerMany([
    'CommandOrControl+Comma','CmdOrCtrl+Comma','Control+Comma','Ctrl+Comma','Cmd+Comma',
    'CommandOrControl+,','CmdOrCtrl+,','Control+,','Ctrl+,',
    'CommandOrControl+Shift+Comma','CmdOrCtrl+Shift+Comma','Control+Shift+Comma','Ctrl+Shift+Comma'
  ], () => {
    const win = getWin(); if (win) win.webContents.send('menu:open-settings')
  })
}

export function unregisterGlobalShortcuts() {
  const keys = [
    'CommandOrControl+N','CmdOrCtrl+N','Control+N','Ctrl+N','Cmd+N',
    'CommandOrControl+Comma','CmdOrCtrl+Comma','Control+Comma','Ctrl+Comma','Cmd+Comma',
    'CommandOrControl+,','CmdOrCtrl+,','Control+,','Ctrl+,',
    'CommandOrControl+Shift+Comma','CmdOrCtrl+Shift+Comma','Control+Shift+Comma','Ctrl+Shift+Comma'
  ]
  for (const k of keys) {
    try { globalShortcut.unregister(k) } catch {}
  }
}
