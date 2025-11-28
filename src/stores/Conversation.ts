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
     this.items = items
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
          ...createdData        
        })
        return newCId
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
