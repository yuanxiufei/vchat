import { BrowserWindow, Menu, shell } from 'electron'

function dict(lang: string) {
  const zh = {
    file: '文件', newConv: '新建对话', settings: '设置', exit: '退出',
    edit: '编辑', undo: '撤销', redo: '重做', cut: '剪切', copy: '复制', paste: '粘贴', selectAll: '全选',
    view: '视图', reload: '重新加载', devtools: '切换开发者工具', fullscreen: '全屏',
    window: '窗口', minimize: '最小化', close: '关闭',
    help: '帮助', website: '官方网站'
  }
  const en = {
    file: 'File', newConv: 'New Conversation', settings: 'Settings', exit: 'Quit',
    edit: 'Edit', undo: 'Undo', redo: 'Redo', cut: 'Cut', copy: 'Copy', paste: 'Paste', selectAll: 'Select All',
    view: 'View', reload: 'Reload', devtools: 'Toggle Developer Tools', fullscreen: 'Fullscreen',
    window: 'Window', minimize: 'Minimize', close: 'Close',
    help: 'Help', website: 'Website'
  }
  return lang === 'zh-CN' ? zh : en
}

export function buildAppMenu(win: BrowserWindow, lang: string) {
  const L = dict(lang)
  const template: Electron.MenuItemConstructorOptions[] = [
    {
      label: L.file,
      submenu: [
        {
          label: L.newConv,
          accelerator: 'CmdOrCtrl+N',
          click: () => win.webContents.send('menu:new-conversation'),
        },
        {
          label: L.settings,
          accelerator: 'CmdOrCtrl+Comma',
          click: () => win.webContents.send('menu:open-settings'),
        },
        { type: 'separator' },
        { label: L.exit, role: 'quit' },
      ],
    },
    {
      label: L.edit,
      submenu: [
        { role: 'undo', label: L.undo },
        { role: 'redo', label: L.redo },
        { type: 'separator' },
        { role: 'cut', label: L.cut },
        { role: 'copy', label: L.copy },
        { role: 'paste', label: L.paste },
        { role: 'selectAll', label: L.selectAll },
      ],
    },
    {
      label: L.view,
      submenu: [
        { role: 'reload', label: L.reload },
        { role: 'toggleDevTools', label: L.devtools },
        { type: 'separator' },
        { role: 'togglefullscreen', label: L.fullscreen },
      ],
    },
    {
      label: L.window,
      submenu: [
        { role: 'minimize', label: L.minimize },
        { role: 'close', label: L.close },
      ],
    },
    {
      label: L.help,
      submenu: [
        { label: L.website, click: () => shell.openExternal('https://electronjs.org') },
      ],
    },
  ]
  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
}
