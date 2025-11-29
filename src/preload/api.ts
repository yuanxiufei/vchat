import { ipcRenderer } from 'electron'
import { CreateChatProps, onUpdateCallback } from '../types/appType'

export const electronAPI = {
  startChat: (data: CreateChatProps) => ipcRenderer.send('start-chat', data),
  onUpdateMessage: (callback: onUpdateCallback) => {
    const handler = (_event: any, data: any) => callback(data)
    ipcRenderer.on('update-message', handler)
    return () => ipcRenderer.off('update-message', handler)
  },
  copyImageToUserDir: (imagePath: string) => ipcRenderer.invoke('copy-image-to-user-dir', imagePath),
  setFullScreen: (flag: boolean) => ipcRenderer.invoke('window:set-fullscreen', flag),
  isFullScreen: () => ipcRenderer.invoke('window:is-fullscreen'),
  toggleFullScreen: () => ipcRenderer.invoke('window:toggle-fullscreen'),
  onWindowFullScreen: (callback: (state: boolean) => void) => ipcRenderer.on('window:fullscreen', (_e, state) => callback(state)),
  fetchImageAsDataUrl: (url: string) => ipcRenderer.invoke('image:fetch-data-url', url),
  getConfig: () => ipcRenderer.invoke('config:get'),
  setConfig: (patch: any) => ipcRenderer.invoke('config:set', patch),
  onConfigUpdated: (cb: (cfg: any) => void) => ipcRenderer.on('config:updated', (_e, cfg) => cb(cfg)),
  openExternal: (url: string) => ipcRenderer.invoke('open-external', url),
  onMenuNewConversation: (cb: () => void) => ipcRenderer.on('menu:new-conversation', () => cb()),
  onMenuOpenSettings: (cb: () => void) => ipcRenderer.on('menu:open-settings', () => cb()),
}
