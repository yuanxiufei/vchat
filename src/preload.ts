// 预加载脚本：在隔离上下文中将允许的主进程能力暴露给渲染进程
// 参考：https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
import  { ipcRenderer, contextBridge } from 'electron'
import { CreateChatProps,onUpdateCallback } from './types/appType'

// 仅暴露白名单接口，避免渲染端任意访问主进程 API
contextBridge.exposeInMainWorld('electronAPI', {
  // 开始模型对话（发送基础参数至主进程）
  startChat:(data:CreateChatProps)=>ipcRenderer.send('start-chat',data),
  // 监听主进程流式消息更新，用于增量渲染回复
  onUpdateMessage:(callback:onUpdateCallback)=>ipcRenderer.on('update-message',(_event,data)=>callback(data)),
  // 将图片复制到用户数据目录并返回目标路径
  copyImageToUserDir:(imagePath:string)=>ipcRenderer.invoke('copy-image-to-user-dir',imagePath),
  // 全屏控制与状态查询
  setFullScreen:(flag:boolean)=>ipcRenderer.invoke('window:set-fullscreen',flag),
  isFullScreen:()=>ipcRenderer.invoke('window:is-fullscreen'),
  toggleFullScreen:()=>ipcRenderer.invoke('window:toggle-fullscreen'),
  onWindowFullScreen:(callback:(state:boolean)=>void)=>ipcRenderer.on('window:fullscreen',(_e,state)=>callback(state)),
  // 将远端图片抓取为 data URL（用于预览）
  fetchImageAsDataUrl:(url:string)=>ipcRenderer.invoke('image:fetch-data-url',url),
  // 配置读写与订阅更新
  getConfig:()=>ipcRenderer.invoke('config:get'),
  setConfig:(patch:any)=>ipcRenderer.invoke('config:set',patch),
  onConfigUpdated:(cb:(cfg:any)=>void)=>ipcRenderer.on('config:updated',(_e,cfg)=>cb(cfg)),
  openExternal:(url:string)=>ipcRenderer.invoke('open-external',url),
})
