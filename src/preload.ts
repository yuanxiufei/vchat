// 预加载脚本：在隔离上下文中将允许的主进程能力暴露给渲染进程
// 参考：https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
import { contextBridge } from 'electron'
import { electronAPI } from './preload/api'

// 仅暴露白名单接口，避免渲染端任意访问主进程 API
contextBridge.exposeInMainWorld('electronAPI', electronAPI)
