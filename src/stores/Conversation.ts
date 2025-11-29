// 对话列表 Store：管理对话项与选中状态，持久化使用 Dexie
import { defineStore } from 'pinia'
import { db } from '@/data/db'
import { ConversationProps } from '@/types/appType'


// 对话状态
export interface ConversationState {
  items: ConversationProps[];
  selectedId: number;
}
// 会话的增删查与选中逻辑
export const useConversationStore = defineStore('conversation', {
  state: (): ConversationState => {
    return {
      items: [],
      selectedId: -1
    }
  },
  actions:{
    /**
     * 查询所有对话并更新到对话列表方法对象中
     */
    // 从数据库拉取所有会话并刷新内存状态
    async fetchConversations(){
     const items = await db.conversations.toArray()
     this.items = items.sort((a,b)=>{
       const ap = a.pinned ? 1 : 0
       const bp = b.pinned ? 1 : 0
       if(bp !== ap) return bp - ap
       return (b.updatedAt || '').localeCompare(a.updatedAt || '')
     })
    },
    /**
     * 创建对话方法对象
     * @param createdData 对话数据
     */
    // 创建会话并追加到内存列表，返回新 ID
    async createConversation(createdData: Omit<ConversationProps,'id'>){
        const newCId = await db.conversations.add(createdData)
        this.items.push({
             id: newCId,
          pinned: false,
          ...createdData        
        })
        return newCId
    }
    ,
    async deleteConversation(id: number){
      await db.messages.where('conversationId').equals(id).delete()
      await db.conversations.where('id').equals(id).delete()
      this.items = this.items.filter(i=>i.id !== id)
      if(this.selectedId === id){
        this.selectedId = this.items.length ? this.items[0].id : -1
      }
    }
    ,
    async renameConversation(id:number, title:string){
      const now = new Date().toISOString()
      await db.conversations.update(id, { title, updatedAt: now })
      const it = this.items.find(i=>i.id===id)
      if(it){ it.title = title; it.updatedAt = now }
    }
    ,
    async togglePin(id:number){
      const now = new Date().toISOString()
      const it = this.items.find(i=>i.id===id)
      const pinned = !(it?.pinned)
      await db.conversations.update(id, { pinned, updatedAt: now })
      if(it){ it.pinned = pinned; it.updatedAt = now }
      this.items = this.items.sort((a,b)=>{
        const ap = a.pinned ? 1 : 0
        const bp = b.pinned ? 1 : 0
        if(bp !== ap) return bp - ap
        return (b.updatedAt || '').localeCompare(a.updatedAt || '')
      })
      this.selectedId = id
    }
  },
  getters: {
    /**
     * 获取所有对话数量方法对象
     */
    totalNumber: (state) => state.items.length,
    /**
     * 根据对话ID获取对话方法对象
     * @param id 对话ID
     */
    getConversationById: (state) => (id: number) => {
      return state.items.find((item) => item.id === id)
    }
  }
})
