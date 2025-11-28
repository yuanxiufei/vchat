import { CreateChatProps, onUpdateCallback } from '@/types/appType'

export interface IElectronAPI {
   startChat:(data:CreateChatProps)=>void; // 开始对话
   onUpdateMessage:(callback:onUpdateCallback)=>()=>void; // 监听更新流数据事件
   copyImageToUserDir:(imagePath:string)=>Promise<string>; // 复制图片到用户目录
}
declare global {
    interface Window {
        electronAPI: IElectronAPI;
    }
}