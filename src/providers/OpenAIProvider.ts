// OpenAI 标准接口封装：支持 chat.completions 流式输出
import OpenAI from 'openai'
import { BaseProvider } from './BaseProviders'
import { ChatMessageProps, UniversalChunkProps } from '@/types/appType'
import { convertMessages } from '../utils/helper'
/**
 * OpenAI提供器
 */
export class OpenAIProvider extends BaseProvider {
    private client: OpenAI // OpenAI客户端
    /**
     * 构造函数
     * @param apiKey API密钥
     */
    /**
     * 使用提供的 `apiKey` 与可选 `baseURL` 初始化 SDK 客户端
     */
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
    /**
     * 以流式方式与模型对话，返回异步可迭代对象
     */
    async chat(message: ChatMessageProps[], modelName: string) {
        const convertedMessages = await convertMessages(message)
        // 转换消息格式
        // 请求 OpenAI Chat Completions，并开启 stream
        const stream = await this.client.chat.completions.create({
            model: modelName,
            messages: convertedMessages as any,
            stream: true,
        })
        // 绑定this
        const  self = this
        // 异步范围迭代器循环数据,转换响应
        // 返回异步迭代器，逐块转换为通用数据结构
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
    /**
     * 将 OpenAI 的增量响应转换为通用结构，便于界面统一处理
     */
    protected transformResponse(chunk:OpenAI.Chat.Completions.ChatCompletionChunk): UniversalChunkProps {
       const choice = chunk.choices[0]
       return {
        is_end: choice.finish_reason === 'stop',
        result: choice.delta.content || '',
       }
    }
}
