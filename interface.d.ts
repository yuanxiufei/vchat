import { CreateChatProps, onUpdateCallback } from '@/types/appType'

export interface IElectronAPI {
   startChat:(data:CreateChatProps)=>void;
   onUpdateMessage:(callback:onUpdateCallback)=>()=>void;
   copyImageToUserDir:(imagePath:string)=>Promise<string>;
   getConfig:()=>Promise<any>;
   setConfig:(patch:any)=>Promise<any>;
   onConfigUpdated:(cb:(cfg:any)=>void)=>void;
   openExternal:(url:string)=>Promise<boolean>;
   checkForUpdates:()=>Promise<boolean>;
   installUpdate:()=>Promise<boolean>;
   cancelUpdate:()=>Promise<boolean>;
   onUpdateStatus:(cb:(payload:any)=>void)=>()=>void;
}
declare global {
    interface Window {
        electronAPI: IElectronAPI;
    }
}
