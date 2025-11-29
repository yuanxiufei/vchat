import { app, BrowserWindow } from "electron";
import { unregisterGlobalShortcuts } from './menu/globalShortcuts'
import { createWindow } from './ipc/window'
import started from "electron-squirrel-startup";
//  引入doenv自动加载env文件
// 加载 .env(.local) 环境变量，供各 Provider 回退读取密钥
import "dotenv/config";
// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}

// Dev-only: suppress Electron security warnings about CSP during development
if (!app.isPackaged) {
  process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = 'true'
}

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

app.on('will-quit', () => {
  unregisterGlobalShortcuts()
})

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
