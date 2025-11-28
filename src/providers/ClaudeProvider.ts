// Anthropic Claude 提供器：使用 SDK 的 messages.stream 获取流式事件
import { BaseProvider } from './BaseProviders'
import { ChatMessageProps, UniversalChunkProps } from '@/types/appType'
import fs from 'fs/promises'
import { lookup } from 'mime-types'
import Anthropic from '@anthropic-ai/sdk'
import { convertMessagesAnthropic } from '../utils/helper'

export class ClaudeProvider extends BaseProvider {
  private client: Anthropic
  // 初始化 Anthropic 客户端，可自定义 baseURL（默认官方）
  constructor(apiKey: string, baseURL?: string){
    super()
    this.client = new Anthropic({ apiKey, baseURL: baseURL || 'https://api.anthropic.com' })
  }

  // 以流式事件驱动的方式输出增量文本
  async chat(message: ChatMessageProps[], modelName: string){
    const messages = await convertMessagesAnthropic(message)
    const stream = this.client.messages.stream({ model: modelName, messages, max_tokens: 1024 })
    const self = this
    return {
      async *[Symbol.asyncIterator](){
        for await (const ev of stream){
          if(ev.type === 'content_block_delta' && ev.delta && 'text' in ev.delta && typeof ev.delta.text === 'string'){
            yield self.transformResponse({ text: ev.delta.text })
          }
          // 流结束事件，标记 is_end
          if(ev.type === 'message_stop'){
            yield self.transformResponse({ text: '' }, true)
          }
        }
      }
    }
  }

  // 统一流式增量为通用结构
  protected transformResponse(chunk:{ text:string }, end=false): UniversalChunkProps {
    return { is_end: end, result: chunk.text || '' }
  }

  
}
