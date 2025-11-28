// 消息 Store：管理消息的增删改查与流式更新状态
import { defineStore } from "pinia";
import {
  MessageProps,
  MessageStatus,
  updatedStreamData,
} from "@/types/appType";
import { db } from "@/data/db";

export interface MessageState {
  items: MessageProps[];
}

// 按会话维度查询与写入消息，保持内存与数据库一致
export const useMessageStore = defineStore("message", {
  state: (): MessageState => {
    return {
      items: [],
    };
  },
  actions: {
    /**
     * 根据对话id获取对话中的消息
     * @param conversationId
     */
    // 拉取指定会话的消息列表
    async fetchMessagesByConversationId(conversationId: number) {
      this.items = await db.messages.where({ conversationId }).toArray();
    },
    /**
     * 创建一条消息
     * @param createdData 
     * @returns 
     */
    // 创建消息并追加到内存列表
    async createMessage(createdData: Omit<MessageProps, "id">) {
      const newMessageId = await db.messages.add(createdData);
      this.items.push({
        id: newMessageId,
        ...createdData,
      });
      return newMessageId;
    },
    /**
     * 更新一条消息
     * @param streamData 
     */
    // 更新消息（数据库与内存同步）
    async updateMessage(messageId: number,updatedData: Partial<MessageProps>) {
        await db.messages.update(messageId, updatedData);
        const index = this.items.findIndex((item) => item.id === messageId);
        // 更新内存中的消息
        if (index !== -1) {
          this.items[index] = { ...this.items[index], ...updatedData };
        }
    },
  },
  getters: {
    /**
     * 获取对话中的最后一条问题消息
     * @param conversationId
     * @returns
     */
    // 获取会话中最后一条问题消息（用于补全上下文）
    getLastQuestion: (state) => (conversationId: number) => {
      return state.items.findLast(
        (item) =>
          item.conversationId === conversationId && item.type === "question"
      );
    },
    /**
     * 检查是否有消息正在加载或流式传输
     * @returns
     */
    // 是否存在正在生成的答案（loading/streaming）
    isMessageLoading: (state) => {
      return state.items.some(item=> (item.status === "loading" || item.status === "streaming") && item.type === "answer");
    }
  },
});
