// DeepSeek OpenAI 兼容接口封装：沿用 OpenAI Chat Completions 协议
import OpenAI from 'openai'
import { BaseProvider } from './BaseProviders'
import { ChatMessageProps, UniversalChunkProps } from '@/types/appType'
import { convertMessages } from '../utils/helper'
/**
 * DeepSeek提供器
 */
export class DeepSeekProvider extends BaseProvider {
    private client: OpenAI // OpenAI客户端
    /**
     * 构造函数
     * @param apiKey API密钥
     */
    // 初始化 OpenAI 兼容客户端
    constructor(apiKey: string, baseURL?: string) {
        super()
        this.client = new OpenAI({
            apiKey,
            baseURL,
        })
    }
    /**
     * 聊天
     * @param message 消息
     * @param modelName 模型名称
     * @returns 流
     */
    // 返回流式对话的异步迭代器
    async chat(message: ChatMessageProps[], modelName: string) {
        const convertedMessages = await convertMessages(message)
        // 转换消息格式
        // 调用兼容的 chat.completions 接口，开启 stream
        const stream = await this.client.chat.completions.create({
            model: modelName,
            messages: convertedMessages as any,
            stream: true,
        })
        // 绑定this
        const  self = this
        // 异步范围迭代器循环数据,转换响应
        return {
            async *[Symbol.asyncIterator]() {
                for await (const chunk of stream) {
                    yield self.transformResponse(chunk)
                }
            }
        }
    }
    /**
     * 转换响应
     * @param chunk 数据块
     * @returns 通用数据块
     */
    // 转换增量响应为通用结构
    protected transformResponse(chunk:OpenAI.Chat.Completions.ChatCompletionChunk): UniversalChunkProps {
       const choice = chunk.choices[0]
       return {
        is_end: choice.finish_reason === 'stop',
        result: choice.delta.content || '',
       }
    }
}
