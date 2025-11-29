import { BrowserWindow, Menu, shell } from 'electron'

export function buildAppMenu(win: BrowserWindow) {
  const template: Electron.MenuItemConstructorOptions[] = [
    {
      label: '文件',
      submenu: [
        {
          label: '新建对话',
          accelerator: 'Ctrl+N',
          click: () => win.webContents.send('menu:new-conversation'),
        },
        {
          label: '设置',
          accelerator: 'CmdOrCtrl+Comma',
          click: () => win.webContents.send('menu:open-settings'),
        },
        { type: 'separator' },
        { label: '退出', role: 'quit' },
      ],
    },
    {
      label: '编辑',
      submenu: [
        { role: 'undo', label: '撤销' },
        { role: 'redo', label: '重做' },
        { type: 'separator' },
        { role: 'cut', label: '剪切' },
        { role: 'copy', label: '复制' },
        { role: 'paste', label: '粘贴' },
        { role: 'selectAll', label: '全选' },
      ],
    },
    {
      label: '视图',
      submenu: [
        { role: 'reload', label: '重新加载' },
        { role: 'toggleDevTools', label: '切换开发者工具' },
        { type: 'separator' },
        { role: 'togglefullscreen', label: '全屏' },
      ],
    },
    {
      label: '窗口',
      submenu: [
        { role: 'minimize', label: '最小化' },
        { role: 'close', label: '关闭' },
      ],
    },
    {
      label: '帮助',
      submenu: [
        { label: '官方网站', click: () => shell.openExternal('https://electronjs.org') },
      ],
    },
  ]
  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
}
