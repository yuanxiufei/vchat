// Dexie 数据库：存储 Provider、Conversation、Message，便于离线持久化与列表展示
import { default as Dexie, type EntityTable } from 'dexie'
import { ProviderProps, ConversationProps, MessageProps } from '../types/appType'
// 定义数据库
export const db = new Dexie('SmartChatDatabse') as Dexie & {
  providers: EntityTable<ProviderProps, 'id'>;
  conversations: EntityTable<ConversationProps, 'id'>;
  messages: EntityTable<MessageProps, 'id'>;
}


// 定义数据库版本1  初始化providers表: 主键id, 名称name
// 基础索引：提升查询效率（按名称/关联外键）
db.version(1).stores({
  providers: '++id, name',
  conversations: '++id, providerId',
  messages: '++id, conversationId',
})

// 初始化providers表
// 初始化 Provider 表：根据配置生成基础与别名条目
export const initProviders = async()=> {
  const count = await db.providers.count()
  if(count !== 0) return
  try{
    const cfg:any = await (window as any).electronAPI.getConfig()
    const pv = cfg?.providers || {}
    // 生成稳定的本地 id（基础类型使用固定值，别名使用哈希）
    function sid(name:string){
      if(name==='qianfan') return 1
      if(name==='dashscope') return 2
      if(name==='deepseek') return 3
      if(name==='openai') return 4
      if(name==='claude') return 5
      let h = 0
      for(let i=0;i<name.length;i++){ h = (h*31 + name.charCodeAt(i)) >>> 0 }
      return 100000 + (h % 900000000)
    }
    const now = new Date().toISOString()
    const list:ProviderProps[] = []
    ;['qianfan','dashscope','deepseek','openai','claude'].forEach((name)=>{
      const cur:any = (pv as any)[name] || {}
      const models = Array.isArray(cur.models)? cur.models: []
      list.push({ id: sid(name), name, title: cur.title || name, desc: cur.desc || name, avatar: cur.avatar || '', models, createdAt: now, updatedAt: now })
    })
    Object.keys(pv).forEach((key)=>{
      if(/^openai_|^dashscope_|^deepseek_|^qianfan_|^claude_/.test(key)){
        const v:any = (pv as any)[key] || {}
        const models = Array.isArray(v.models)? v.models: []
        list.push({ id: sid(key), name: key, title: v.title || key, desc: v.desc || key, avatar: v.avatar || '', models, createdAt: now, updatedAt: now })
      }
    })
    if(list.length){ await db.providers.bulkAdd(list) }
  }catch{}
}
